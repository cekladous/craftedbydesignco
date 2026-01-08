import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import * as XLSX from 'npm:xlsx@0.18.5';

const BATCH_SIZE = 25; // Process rows in batches to prevent timeouts

// Clean up encoding issues and corrupted characters
function cleanText(text) {
  if (!text || typeof text !== 'string') return text;
  
  return text
    // Fix common Windows-1252 to UTF-8 mojibake
    .replace(/Ã¢â‚¬â„¢/g, "'")
    .replace(/Ã¢â‚¬Å"/g, '"')
    .replace(/Ã¢â‚¬\u009d/g, '"')
    .replace(/Ã¢â‚¬â€œ/g, '—')
    .replace(/Ã¢â‚¬â€/g, '–')
    .replace(/Ã¢â‚¬Â¢/g, '•')
    .replace(/Ã‚Â°/g, '°')
    // Fix the specific patterns mentioned
    .replace(/Äì/g, '—')
    .replace(/Äî/g, '"')
    .replace(/Äô[sS]/g, "'s")
    .replace(/Äôt/g, "'t")
    .replace(/Äôre/g, "'re")
    .replace(/Äôll/g, "'ll")
    .replace(/Äôve/g, "'ve")
    .replace(/Äôd/g, "'d")
    .replace(/Äù/g, "'")
    .replace(/Äú/g, '"')
    .replace(/Ä¢/g, '"')
    .replace(/-18‚/g, "'")
    .replace(/ú®/g, '®')
    .replace(/úâ„¢/g, '™')
    .replace(/√©/g, 'é')
    .replace(/√®/g, 'î')
    .replace(/√°/g, 'à')
    .replace(/√¢/g, 'â')
    // Additional common patterns
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€\u009d/g, '"')
    .replace(/â€"/g, '—')
    .replace(/â€"/g, '–')
    .replace(/â€¢/g, '•')
    .replace(/Â®/g, '®')
    .replace(/Â©/g, '©')
    .replace(/â„¢/g, '™')
    .replace(/Ã©/g, 'é')
    .replace(/Ã¨/g, 'è')
    .replace(/Ã¡/g, 'á')
    .replace(/Ã /g, 'à')
    .replace(/Ã³/g, 'ó')
    .replace(/Ã²/g, 'ò')
    .replace(/Ãº/g, 'ú')
    .replace(/Ã¹/g, 'ù')
    .replace(/Ã­/g, 'í')
    .replace(/Ã±/g, 'ñ')
    // Preserve exact line breaks and paragraph spacing
    .split('\n')
    .map(line => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .trim();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { fileContent, fileType } = await req.json();

    if (!fileContent || typeof fileContent !== 'string') {
      return Response.json({ error: 'No file content provided' }, { status: 400 });
    }

    console.log(`=== ${fileType?.toUpperCase() || 'CSV'} IMPORT STARTED ===`);

    // Parse file based on type
    let rows;
    if (fileType === 'xlsx') {
      rows = parseExcel(fileContent);
    } else {
      rows = parseCSV(fileContent);
    }
    
    if (rows.length < 2) {
      return Response.json({ 
        success: false, 
        error: 'CSV must contain headers and at least one data row' 
      }, { status: 400 });
    }

    // Validate headers
    const headers = rows[0].map(h => h.toUpperCase().trim());
    const requiredHeaders = ['TITLE'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      return Response.json({ 
        success: false, 
        error: `Missing required column: TITLE` 
      }, { status: 400 });
    }

    console.log(`Found ${rows.length - 1} data rows to process`);

    const results = {
      imported: 0,
      updated: 0,
      skipped: 0,
      failed: [],
      total: rows.length - 1,
      importedItems: [],
      updatedItems: [],
      createdIds: [],
      previousState: []
    };

    // Load existing items for TITLE + IMAGE1 deduplication
    const existingItems = await base44.asServiceRole.entities.PortfolioItem.filter({});
    console.log(`Loaded ${existingItems.length} existing items`);

    const itemsByKey = new Map();
    for (const item of existingItems) {
      if (item.name) {
        const key = `${item.name.toLowerCase().trim()}|${item.images?.[0] || ''}`;
        itemsByKey.set(key, item);
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

        // Skip rows with empty title
        const title = row.TITLE?.trim() || '';
        const sku = row.SKU?.trim() || '';
        
        if (!title) {
          console.log(`Row ${rowNum}: Missing TITLE - skipping`);
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

            // Check if item already exists (by TITLE + IMAGE1)
            const firstImageUrl = imageUrls[0] || '';
            const itemKey = `${title.toLowerCase()}|${firstImageUrl}`;
            const existingItem = itemsByKey.get(itemKey);

            // Parse materials and tags safely
        const materials = row.MATERIALS 
          ? row.MATERIALS.split(/[,|]/).map(m => m.replace(/^["']|["']$/g, '').trim()).filter(m => m.length > 0)
          : [];

        const tags = row.TAGS 
          ? row.TAGS.split(/[,|]/).map(t => t.replace(/^["']|["']$/g, '').trim()).filter(t => t.length > 0)
          : [];

        // Auto-categorize
        const category = autoCategorizeListing(title, tags);

        // Build portfolio item data with cleaned text
        const portfolioData = {
          name: cleanText(title),
          description: cleanText(row.DESCRIPTION?.trim() || ''),
          materials: materials.map(m => cleanText(m)),
          tags: tags.map(t => cleanText(t)),
          sku: sku,
          images: imageUrls,
          etsy_url: row['ETSY LISTING URL']?.trim() || row.URL?.trim() || row.ETSY_URL?.trim() || '',
          category: category,
          customization_options: cleanText(row.CUSTOMIZATION_OPTIONS?.trim() || ''),
          featured: existingItem?.featured || false,
          visible: existingItem?.visible !== undefined ? existingItem.visible : true,
          display_order: existingItem?.display_order !== undefined ? existingItem.display_order : displayOrder++
        };

        if (existingItem) {
          // Store previous state for undo
          results.previousState.push({
            id: existingItem.id,
            data: { ...existingItem }
          });
          
          // Update existing item
          await base44.asServiceRole.entities.PortfolioItem.update(existingItem.id, portfolioData);
          results.updated++;
          results.updatedItems.push({ title, category, row: rowNum });
          console.log(`Row ${rowNum}: Updated "${title}"`);
        } else {
          // Create new item
          const newItem = await base44.asServiceRole.entities.PortfolioItem.create(portfolioData);
          results.imported++;
          results.importedItems.push({ title, category, row: rowNum });
          results.createdIds.push(newItem.id);
          console.log(`Row ${rowNum}: Created "${title}"`);

          // Register key to prevent duplicates in this batch
          itemsByKey.set(itemKey, { name: title, images: imageUrls, id: newItem.id });
        }

        // Batch control: yield control periodically
        if (i % BATCH_SIZE === 0) {
          console.log(`Processed ${i}/${rows.length - 1} rows`);
          await new Promise(resolve => setTimeout(resolve, 10));
        }

      } catch (rowError) {
        console.error(`Row ${rowNum} failed:`, rowError.message);
        results.failed.push({ 
          row: rowNum, 
          title: row?.TITLE || 'Unknown',
          reason: rowError.message 
        });
      }
    }

    console.log('=== IMPORT COMPLETE ===');
    console.log(`Created: ${results.imported}, Updated: ${results.updated}, Failed: ${results.failed.length}`);

    const success = results.failed.length === 0;

    return Response.json({
      success: success,
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

// Parse Excel file from base64 string
function parseExcel(base64String) {
  try {
    // Decode base64 to binary
    const binaryString = atob(base64String);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Parse Excel workbook
    const workbook = XLSX.read(bytes, { type: 'array' });
    
    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to array of arrays
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, defval: '' });
    
    return jsonData;
  } catch (error) {
    console.error('Excel parsing error:', error);
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
}

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