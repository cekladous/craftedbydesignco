import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { csvContent } = await req.json();

    if (!csvContent || typeof csvContent !== 'string') {
      return Response.json({ error: 'Missing or invalid csvContent' }, { status: 400 });
    }

    console.log('Starting CSV import...');

    // Parse CSV properly handling multiline quoted fields
    const rows = parseCSV(csvContent);
    
    if (rows.length < 2) {
      return Response.json({ error: 'CSV must have headers and at least one data row' }, { status: 400 });
    }

    // Parse headers
    const headers = rows[0].map(h => h.toUpperCase().trim());
    
    // Validate required headers
    const requiredHeaders = ['TITLE'];
    for (const required of requiredHeaders) {
      if (!headers.includes(required)) {
        return Response.json({ error: `Missing required header: ${required}` }, { status: 400 });
      }
    }

    console.log(`Processing ${rows.length - 1} rows...`);

    const results = {
      imported: 0,
      updated: 0,
      skipped: 0,
      failed: [],
      total: lines.length - 1
    };

    // Get existing items for duplicate detection
    const existingItems = await base44.asServiceRole.entities.PortfolioItem.filter({});
    console.log(`Found ${existingItems.length} existing portfolio items`);
    
    // Create lookup maps for duplicate detection
    const itemsByTitle = new Map();
    const itemsBySku = new Map();
    for (const item of existingItems) {
      if (item.name) {
        itemsByTitle.set(item.name.toLowerCase().trim(), item);
      }
      if (item.sku) {
        itemsBySku.set(item.sku.toLowerCase().trim(), item);
      }
    }

    let displayOrder = existingItems.length;

    // Process each row
    for (let i = 1; i < rows.length; i++) {
      const rowNum = i + 1;
      console.log(`Processing row ${rowNum}/${rows.length}...`);
      
      try {
        const values = rows[i];
        const row = {};
        
        headers.forEach((header, idx) => {
          row[header] = values[idx] || '';
        });

        // Skip empty rows
        const title = row.TITLE?.trim() || '';
        if (!title) {
          console.log(`Row ${rowNum}: Skipping empty title`);
          results.skipped++;
          continue;
        }

        // Check for duplicates via SKU
        const sku = row.SKU?.trim() || '';
        let existingItem = null;
        
        if (sku && itemsBySku.has(sku.toLowerCase())) {
          existingItem = itemsBySku.get(sku.toLowerCase());
          console.log(`Row ${rowNum}: Found existing item by SKU: ${sku} - will update`);
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
          // Update existing item
          await base44.asServiceRole.entities.PortfolioItem.update(existingItem.id, portfolioData);
          results.updated++;
          console.log(`Row ${rowNum}: Updated existing item: ${title}`);
        } else {
          // Create new item
          await base44.asServiceRole.entities.PortfolioItem.create(portfolioData);
          results.imported++;
          console.log(`Row ${rowNum}: Created new item: ${title}`);
        }

      } catch (rowError) {
        console.error(`Row ${rowNum} error:`, rowError);
        results.failed.push({ 
          row: rowNum, 
          title: row.TITLE || 'Unknown',
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

// Fetch image from URL and upload to storage with timeout
async function fetchAndUploadImageWithTimeout(url, base44, timeoutMs = 15000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Fetch the image with timeout
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ImageFetcher/1.0)',
        'Accept': 'image/*'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Validate content type
    if (!contentType.startsWith('image/')) {
      throw new Error(`Invalid content type: ${contentType}`);
    }

    const blob = await response.blob();
    
    // Validate blob size (max 10MB)
    if (blob.size > 10 * 1024 * 1024) {
      throw new Error('Image too large (max 10MB)');
    }
    
    // Determine file extension
    let ext = 'jpg';
    if (contentType.includes('png')) ext = 'png';
    else if (contentType.includes('gif')) ext = 'gif';
    else if (contentType.includes('webp')) ext = 'webp';

    // Create a File object
    const filename = `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${ext}`;
    const file = new File([blob], filename, { type: contentType });

    // Upload using the integration
    const { file_url } = await base44.asServiceRole.integrations.Core.UploadFile({ file });
    
    return file_url;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Image fetch timeout');
    }
    throw error;
  }
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