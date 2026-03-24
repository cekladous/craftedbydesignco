import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const mode = formData.get('mode') || 'create'; // 'create' or 'update'

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    const csvText = await file.text();
    const lines = csvText.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return Response.json({ error: 'CSV file is empty or invalid' }, { status: 400 });
    }

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    // Parse rows
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const row = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] || '';
      });
      rows.push(row);
    }

    // Get existing items for duplicate detection
    const existingItems = await base44.asServiceRole.entities.PortfolioItem.list();
    
    const results = {
      imported: 0,
      updated: 0,
      skipped: 0,
      failed: []
    };

    for (const row of rows) {
      try {
        const title = row.TITLE?.trim();
        if (!title) {
          results.skipped++;
          continue;
        }

        // Collect images from IMAGE1-IMAGE10
        const images = [];
        for (let i = 1; i <= 10; i++) {
          const imageUrl = row[`IMAGE${i}`]?.trim();
          if (imageUrl && imageUrl.startsWith('http')) {
            images.push(imageUrl);
          }
        }

        // Parse materials - split by comma or semicolon
        const materialsStr = row.MATERIALS?.trim() || '';
        const materials = materialsStr ? materialsStr.split(/[,;]/).map(m => m.trim()).filter(Boolean) : [];

        // Auto-categorize based on tags or title
        const tags = (row.TAGS || '').toLowerCase();
        const titleLower = title.toLowerCase();
        let category = 'gifts'; // default
        
        if (tags.includes('wedding') || titleLower.includes('wedding')) category = 'wedding';
        else if (tags.includes('baby') || titleLower.includes('baby') || titleLower.includes('milestone')) category = 'baby';
        else if (tags.includes('corporate') || titleLower.includes('corporate') || titleLower.includes('business')) category = 'corporate';
        else if (tags.includes('home') || titleLower.includes('home') || titleLower.includes('decor')) category = 'home';
        else if (tags.includes('gift') || titleLower.includes('gift')) category = 'gifts';

        // Build customization info from variations
        let customization = '';
        if (row['VARIATION 1 TYPE']) {
          customization += `${row['VARIATION 1 TYPE']}: ${row['VARIATION 1 VALUES'] || 'Custom'}\n`;
        }
        if (row['VARIATION 2 TYPE']) {
          customization += `${row['VARIATION 2 TYPE']}: ${row['VARIATION 2 VALUES'] || 'Custom'}`;
        }

        const itemData = {
          name: title,
          category: category,
          description: row.DESCRIPTION?.trim() || '',
          materials: materials,
          images: images,
          customization_options: customization.trim() || '',
          featured: false,
          visible: true,
          display_order: 0
        };

        // Check for existing item by title
        const existing = existingItems.find(item => 
          item.name.toLowerCase() === title.toLowerCase()
        );

        if (existing && mode === 'update') {
          // Update existing item, preserve some fields
          await base44.asServiceRole.entities.PortfolioItem.update(existing.id, {
            ...itemData,
            featured: existing.featured,
            visible: existing.visible,
            display_order: existing.display_order,
            etsy_url: existing.etsy_url || '',
            attachments: existing.attachments || []
          });
          results.updated++;
        } else if (!existing) {
          // Create new item
          await base44.asServiceRole.entities.PortfolioItem.create(itemData);
          results.imported++;
        } else {
          results.skipped++;
        }
      } catch (error) {
        results.failed.push({ 
          title: row.TITLE || 'Unknown', 
          reason: error.message 
        });
      }
    }

    return Response.json({ 
      success: true, 
      results 
    });
  } catch (error) {
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});

// Helper to parse CSV line handling quoted values
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  
  return values.map(v => v.replace(/^"|"$/g, ''));
}