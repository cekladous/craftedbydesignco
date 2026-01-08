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

    // Parse CSV
    const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length < 2) {
      return Response.json({ error: 'CSV must have headers and at least one data row' }, { status: 400 });
    }

    // Parse headers
    const headers = parseCSVLine(lines[0]).map(h => h.toUpperCase().trim());
    
    // Validate required headers
    const requiredHeaders = ['TITLE'];
    for (const required of requiredHeaders) {
      if (!headers.includes(required)) {
        return Response.json({ error: `Missing required header: ${required}` }, { status: 400 });
      }
    }

    const results = {
      imported: 0,
      failed: [],
      total: lines.length - 1
    };

    // Get existing items count for display_order
    const existingItems = await base44.asServiceRole.entities.PortfolioItem.filter({});
    let displayOrder = existingItems.length;

    // Process each row
    for (let i = 1; i < lines.length; i++) {
      const rowNum = i + 1;
      try {
        const values = parseCSVLine(lines[i]);
        const row = {};
        
        headers.forEach((header, idx) => {
          row[header] = values[idx] || '';
        });

        // Skip empty rows
        if (!row.TITLE || row.TITLE.trim() === '') {
          results.failed.push({ row: rowNum, reason: 'Empty TITLE' });
          continue;
        }

        // Process images - fetch and upload each one
        const imageUrls = [];
        for (let imgNum = 1; imgNum <= 10; imgNum++) {
          const imgField = `IMAGE${imgNum}`;
          const imgUrl = row[imgField];
          
          if (imgUrl && imgUrl.trim()) {
            try {
              const uploadedUrl = await fetchAndUploadImage(imgUrl.trim(), base44);
              if (uploadedUrl) {
                imageUrls.push(uploadedUrl);
              }
            } catch (imgError) {
              console.log(`Row ${rowNum}: Failed to fetch image ${imgNum}: ${imgError.message}`);
              // Continue without this image
            }
          }
        }

        // Parse materials (comma-separated)
        const materials = row.MATERIALS 
          ? row.MATERIALS.split(',').map(m => m.trim()).filter(m => m.length > 0)
          : [];

        // Parse tags (comma-separated)
        const tags = row.TAGS 
          ? row.TAGS.split(',').map(t => t.trim()).filter(t => t.length > 0)
          : [];

        // Auto-categorize based on title/tags
        const category = autoCategorizeListing(row.TITLE, tags);

        // Create portfolio item
        const portfolioItem = {
          name: row.TITLE.trim(),
          description: row.DESCRIPTION || '',
          materials: materials,
          tags: tags,
          sku: row.SKU || '',
          images: imageUrls,
          category: category,
          featured: false,
          visible: true,
          display_order: displayOrder++
        };

        await base44.asServiceRole.entities.PortfolioItem.create(portfolioItem);
        results.imported++;

      } catch (rowError) {
        results.failed.push({ row: rowNum, reason: rowError.message });
      }
    }

    return Response.json({
      success: true,
      results
    });

  } catch (error) {
    console.error('Import error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// Parse a CSV line handling quoted fields
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

// Fetch image from URL and upload to storage
async function fetchAndUploadImage(url, base44) {
  // Fetch the image
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; ImageFetcher/1.0)'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || 'image/jpeg';
  const blob = await response.blob();
  
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