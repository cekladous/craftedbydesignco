import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin access
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { mode = 'import', preview = false } = await req.json().catch(() => ({}));
    const isRefresh = mode === 'refresh';

    // Fetch existing portfolio items if refreshing
    let existingItems = [];
    if (isRefresh || preview) {
      existingItems = await base44.asServiceRole.entities.PortfolioItem.list();
    }

    // Fetch Etsy shop page
    const etsyShopUrl = 'https://craftedxdesignco.etsy.com';
    console.log('Fetching Etsy shop:', etsyShopUrl);
    
    const shopResponse = await fetch(etsyShopUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!shopResponse.ok) {
      return Response.json({
        success: false,
        error: `Failed to fetch Etsy shop (HTTP ${shopResponse.status})`,
        details: 'The shop may be private, temporarily unavailable, or the URL is incorrect.',
        diagnostics: {
          url: etsyShopUrl,
          status: shopResponse.status,
          statusText: shopResponse.statusText
        }
      });
    }

    const shopHtml = await shopResponse.text();
    console.log(`Fetched HTML: ${shopHtml.length} characters`);

    // Try to extract JSON-LD structured data first
    const jsonLdMatches = shopHtml.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs);
    let listings = [];
    
    for (const match of jsonLdMatches) {
      try {
        const data = JSON.parse(match[1]);
        if (data['@type'] === 'Product' || (Array.isArray(data) && data.some(item => item['@type'] === 'Product'))) {
          console.log('Found JSON-LD product data');
        }
      } catch (e) {
        // Continue to next match
      }
    }

    // Extract listing data using LLM with better prompting
    const extractionPrompt = `You are analyzing an Etsy shop page to extract product listings.

CRITICAL: The shop "craftedxdesignco" is PUBLIC and HAS ACTIVE LISTINGS. If you report 0 listings, the extraction has FAILED.

Examine this HTML carefully and extract ALL product listings you can find. Look for:
- Product cards, tiles, or grid items
- Listing titles (usually in h3, h2, or link text)
- Image URLs (check img tags, srcset attributes, data-src, etc.)
- Listing URLs (links containing /listing/)
- Prices (if visible)
- Any material or description text

For EACH listing found, provide:
{
  "title": "exact product title",
  "description": "any description text found (or empty string)",
  "price": "price if found (or empty string)",
  "image_urls": ["ALL image URLs found for this listing"],
  "etsy_url": "full listing URL",
  "etsy_listing_id": "numeric ID from URL"
}

Return JSON:
{
  "total_listings_detected": <number>,
  "extraction_notes": "brief note about what was found",
  "listings": [...]
}

HTML (first 60000 chars):
${shopHtml.slice(0, 60000)}`;

    const extractionResult = await base44.integrations.Core.InvokeLLM({
      prompt: extractionPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          total_listings_detected: { type: "number" },
          extraction_notes: { type: "string" },
          listings: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                price: { type: "string" },
                image_urls: {
                  type: "array",
                  items: { type: "string" }
                },
                etsy_url: { type: "string" },
                etsy_listing_id: { type: "string" }
              },
              required: ["title", "etsy_url"]
            }
          }
        },
        required: ["total_listings_detected", "listings"]
      }
    });

    listings = extractionResult.listings || [];
    
    console.log(`Extraction result: ${listings.length} listings detected`);
    console.log('Extraction notes:', extractionResult.extraction_notes);

    // Handle 0 listings found
    if (listings.length === 0) {
      return Response.json({
        success: false,
        error: 'No listings detected',
        details: `The extraction found 0 listings. ${extractionResult.extraction_notes || 'No additional details.'}`,
        diagnostics: {
          html_length: shopHtml.length,
          html_preview: shopHtml.slice(0, 500),
          extraction_notes: extractionResult.extraction_notes,
          total_detected: extractionResult.total_listings_detected
        }
      });
    }

    // PREVIEW MODE: Return detected listings without importing
    if (preview) {
      const previewData = listings.slice(0, 50).map(listing => ({
        title: listing.title,
        image_count: listing.image_urls?.length || 0,
        has_etsy_url: !!listing.etsy_url,
        etsy_listing_id: listing.etsy_listing_id,
        already_imported: existingItems.some(item => 
          item.etsy_listing_id === listing.etsy_listing_id
        )
      }));

      return Response.json({
        success: true,
        preview: true,
        total_detected: listings.length,
        extraction_notes: extractionResult.extraction_notes,
        listings: previewData,
        stats: {
          new_items: previewData.filter(p => !p.already_imported).length,
          already_imported: previewData.filter(p => p.already_imported).length
        }
      });
    }

    // Category mapping helper
    const categorizeItem = (title, description = '') => {
      const text = `${title} ${description}`.toLowerCase();
      
      if (text.match(/wedding|bride|groom|seating chart|escort card|place card|reception|ceremony|engagement/)) {
        return 'wedding';
      }
      if (text.match(/baby|baptism|christening|shower|newborn|nursery|gender reveal|pregnancy/)) {
        return 'baby';
      }
      if (text.match(/corporate|business|office|branded|company|team/)) {
        return 'corporate';
      }
      if (text.match(/home|decor|house|living|kitchen|doormat|wall art|ornament|christmas/)) {
        return 'home';
      }
      if (text.match(/gift|personalized|custom|favor|party|birthday/)) {
        return 'gifts';
      }
      return 'specialty';
    };

    const importResults = {
      total: listings.length,
      imported: 0,
      updated: 0,
      skipped: 0,
      failed: [],
      items: []
    };

    // Process each listing (up to 50 to avoid timeouts)
    for (const listing of listings.slice(0, 50)) {
      try {
        // Extract listing ID from URL if not provided
        const listingId = listing.etsy_listing_id || 
          listing.etsy_url?.match(/\/listing\/(\d+)/)?.[1];

        if (!listingId) {
          importResults.failed.push({
            title: listing.title,
            reason: 'Could not extract Etsy listing ID from URL'
          });
          continue;
        }

        // Check if item already exists (for refresh)
        const existingItem = existingItems.find(item => 
          item.etsy_listing_id === listingId
        );

        // Skip if already imported and not in refresh mode
        if (existingItem && !isRefresh) {
          importResults.skipped++;
          continue;
        }

        // Download and upload images to app storage
        const uploadedImages = [];
        const imageUrls = listing.image_urls || [];
        
        if (imageUrls.length === 0) {
          importResults.failed.push({
            title: listing.title,
            reason: 'No images found for this listing'
          });
          continue;
        }

        for (const imageUrl of imageUrls.slice(0, 8)) {
          try {
            // Clean and validate image URL
            let cleanUrl = imageUrl.trim();
            if (!cleanUrl.startsWith('http')) {
              if (cleanUrl.startsWith('//')) {
                cleanUrl = 'https:' + cleanUrl;
              } else {
                continue;
              }
            }

            const imageResponse = await fetch(cleanUrl);
            if (!imageResponse.ok) {
              console.error(`Failed to fetch image: ${cleanUrl} (${imageResponse.status})`);
              continue;
            }
            
            const imageBlob = await imageResponse.blob();
            
            const { file_url } = await base44.asServiceRole.integrations.Core.UploadFile({
              file: imageBlob
            });
            
            uploadedImages.push(file_url);
          } catch (imageError) {
            console.error(`Failed to upload image ${imageUrl}:`, imageError.message);
          }
        }

        if (uploadedImages.length === 0) {
          importResults.failed.push({
            title: listing.title,
            reason: 'No images could be uploaded'
          });
          continue;
        }

        // Map materials to existing enum values
        const validMaterials = [
          "Mirrored acrylic", "Colored acrylic", "Clear acrylic", "Frosted acrylic",
          "Painted acrylic", "Back-painted acrylic", "UV-printable acrylic",
          "Birch plywood", "Maple wood", "Walnut wood", "Acacia wood", "MDF",
          "Stained wood", "Painted wood", "Leatherette",
          "Adhesive vinyl (permanent)", "Adhesive vinyl (removable)",
          "Printed vinyl banners", "UV printed acrylic", "UV printed wood"
        ];

        const materialText = listing.description || '';
        const mappedMaterials = [];
        for (const validMat of validMaterials) {
          if (materialText.toLowerCase().includes(validMat.toLowerCase())) {
            mappedMaterials.push(validMat);
          }
        }

        // Clean description for portfolio use
        let cleanDescription = listing.description || listing.title;
        cleanDescription = cleanDescription.replace(/\n{3,}/g, '\n\n').trim();
        if (cleanDescription.length > 500) {
          cleanDescription = cleanDescription.slice(0, 497) + '...';
        }

        // Prepare data from Etsy
        const etsyData = {
          name: listing.title,
          description: cleanDescription,
          materials: mappedMaterials.length > 0 ? mappedMaterials : undefined,
          images: uploadedImages,
          etsy_url: listing.etsy_url,
          etsy_listing_id: listingId,
        };

        if (existingItem && isRefresh) {
          // REFRESH MODE: Update existing item, preserve custom fields
          await base44.asServiceRole.entities.PortfolioItem.update(existingItem.id, {
            ...etsyData,
            // Preserve these custom fields set by user
            category: existingItem.category,
            featured: existingItem.featured,
            visible: existingItem.visible,
            display_order: existingItem.display_order,
            customization_options: existingItem.customization_options,
          });

          importResults.updated++;
          importResults.items.push({
            id: existingItem.id,
            title: listing.title,
            action: 'updated',
            images_count: uploadedImages.length
          });

        } else if (!existingItem) {
          // IMPORT MODE: Create new item
          const portfolioItem = await base44.asServiceRole.entities.PortfolioItem.create({
            ...etsyData,
            category: categorizeItem(listing.title, listing.description),
            visible: true,
            featured: false,
            display_order: existingItems.length + importResults.imported,
          });

          importResults.imported++;
          importResults.items.push({
            id: portfolioItem.id,
            title: listing.title,
            action: 'imported',
            category: categorizeItem(listing.title, listing.description),
            images_count: uploadedImages.length
          });
        }

      } catch (itemError) {
        importResults.failed.push({
          title: listing.title,
          reason: itemError.message
        });
      }
    }

    return Response.json({
      success: true,
      mode: isRefresh ? 'refresh' : 'import',
      extraction_notes: extractionResult.extraction_notes,
      results: importResults
    });

  } catch (error) {
    return Response.json({ 
      success: false,
      error: error.message,
      stack: error.stack,
      details: 'An unexpected error occurred during import'
    }, { status: 500 });
  }
});