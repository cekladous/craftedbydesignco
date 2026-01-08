import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const BATCH_SIZE = 25; // Process rows in batches to prevent timeouts

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { csvContent } = await req.json();

    if (!csvContent || typeof csvContent !== 'string') {
      return Response.json({ error: 'No CSV content provided' }, { status: 400 });
    }

    console.log('=== CSV IMPORT STARTED ===');

    // Parse CSV with RFC 4180-compliant parser
    const rows = parseCSV(csvContent);
    
    if (rows.length < 2) {
      return Response.json({ 
        success: false, 
        error: 'CSV must contain headers and at least one data row' 
      }, { status: 400 });
    }

    // Validate headers
    const headers = rows[0].map(h => h.toUpperCase().trim());
    const requiredHeaders = ['TITLE', 'SKU'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      return Response.json({ 
        success: false, 
        error: `Missing required columns: ${missingHeaders.join(', ')}` 
      }, { status: 400 });
    }

    console.log(`Found ${rows.length - 1} data rows to process`);

    const results = {
      imported: 0,
      skipped: 0,
      failed: [],
      total: rows.length - 1
    };

    // Load existing items for SKU deduplication
    const existingItems = await base44.asServiceRole.entities.PortfolioItem.filter({});
    console.log(`Loaded ${existingItems.length} existing items`);
    
    const itemsBySku = new Map();
    for (const item of existingItems) {
      if (item.sku) {
        itemsBySku.set(item.sku.toLowerCase().trim(), item);
      }
    }

    let displayOrder = existingItems.length;

    // Process rows in batches
    for (let i = 1; i < rows.length; i++) {
      const rowNum = i + 1;
      
      try {
        const values = rows[i];
        const row = {};
        
        headers.forEach((header, idx) => {
          row[header] = values[idx] || '';
        });

        // Skip rows with empty title or SKU
        const title = row.TITLE?.trim() || '';
        const sku = row.SKU?.trim() || '';
        
        if (!title || !sku) {
          console.log(`Row ${rowNum}: Missing TITLE or SKU - skipping`);
          results.skipped++;
          continue;
        }

        // Check for duplicate SKU
        if (itemsBySku.has(sku.toLowerCase())) {
          console.log(`Row ${rowNum}: Duplicate SKU ${sku} - skipping`);
          results.skipped++;
          continue;
        }

        // Collect image URLs directly (no fetching/uploading)
        const imageUrls = [];
        for (let imgNum = 1; imgNum <= 10; imgNum++) {
          const imgField = `IMAGE${imgNum}`;
          const imgUrl = row[imgField]?.trim();
          if (imgUrl && imgUrl.startsWith('http')) {
            imageUrls.push(imgUrl);
          }
        }
        
        console.log(`Row ${rowNum}: Found ${imageUrls.length} image URLs`);

        // Parse materials (comma or pipe separated, handle quotes)
        const materials = row.MATERIALS 
          ? row.MATERIALS.split(/[,|]/).map(m => m.replace(/^["']|["']$/g, '').trim()).filter(m => m.length > 0)
          : [];

        // Parse tags (comma or pipe separated, handle quotes)
        const tags = row.TAGS 
          ? row.TAGS.split(/[,|]/).map(t => t.replace(/^["']|["']$/g, '').trim()).filter(t => t.length > 0)
          : [];

        // Auto-categorize based on title/tags
        const category = autoCategorizeListing(title, tags);

        // Build portfolio item data
        const portfolioData = {
          name: title,
          description: row.DESCRIPTION || '',
          materials: materials,
          tags: tags,
          sku: sku,
          images: imageUrls,
          category: category,
          featured: existingItem?.featured || false,
          visible: existingItem?.visible !== undefined ? existingItem.visible : true,
          display_order: existingItem?.display_order !== undefined ? existingItem.display_order : displayOrder++
        };

        // Preserve custom fields on update
        if (existingItem) {
          // Keep Etsy URL if it exists
          if (existingItem.etsy_url) {
            portfolioData.etsy_url = existingItem.etsy_url;
          }
          if (existingItem.customization_options) {
            portfolioData.customization_options = existingItem.customization_options;
          }
          if (existingItem.attachments) {
            portfolioData.attachments = existingItem.attachments;
          }
        }

        if (existingItem) {
          // SKU exists - skip to prevent duplicates
          results.skipped++;
          console.log(`Row ${rowNum}: Skipped duplicate SKU: ${sku}`);
        } else {
          // Create new item
          await base44.asServiceRole.entities.PortfolioItem.create(portfolioData);
          results.imported++;
          console.log(`Row ${rowNum}: Created new item: ${title}`);
          
          // Add to lookup maps to prevent intra-batch duplicates
          if (sku) {
            itemsBySku.set(sku.toLowerCase(), { sku });
          }
        }

      } catch (rowError) {
        console.error(`Row ${rowNum} error:`, rowError);
        results.failed.push({ 
          row: rowNum, 
          title: row?.TITLE || 'Unknown',
          reason: rowError.message 
        });
      }
    }

    console.log('Import complete:', results);

    return Response.json({
      success: true,
      results
    });

  } catch (error) {
    console.error('Import error:', error);
    return Response.json({ 
      success: false,
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});

// Parse entire CSV handling quoted fields and multiline values
function parseCSV(csvText) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;
  
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote within quoted field
        currentField += '"';
        i++;
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      // End of row (handle \r\n, \n, or \r)
      if (char === '\r' && nextChar === '\n') {
        i++; // Skip the \n in \r\n
      }
      
      // Only add row if we have content
      if (currentField.length > 0 || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        
        // Skip completely empty rows
        if (currentRow.some(field => field.length > 0)) {
          rows.push(currentRow);
        }
        
        currentRow = [];
        currentField = '';
      }
    } else {
      // Regular character
      currentField += char;
    }
  }
  
  // Handle last field/row if exists
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(field => field.length > 0)) {
      rows.push(currentRow);
    }
  }
  
  return rows;
}



// Auto-categorize based on title and tags
function autoCategorizeListing(title, tags) {
  const text = (title + ' ' + tags.join(' ')).toLowerCase();
  
  if (text.includes('wedding') || text.includes('bride') || text.includes('groom') || text.includes('bridal')) {
    return 'wedding';
  }
  if (text.includes('baby') || text.includes('nursery') || text.includes('milestone') || text.includes('birth') || text.includes('newborn')) {
    return 'baby';
  }
  if (text.includes('corporate') || text.includes('business') || text.includes('logo') || text.includes('company')) {
    return 'corporate';
  }
  if (text.includes('home') || text.includes('decor') || text.includes('wall') || text.includes('house')) {
    return 'home';
  }
  if (text.includes('gift') || text.includes('personalized') || text.includes('custom')) {
    return 'gifts';
  }
  
  return 'specialty';
}