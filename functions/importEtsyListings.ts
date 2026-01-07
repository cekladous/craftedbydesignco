import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin access
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { mode = 'import' } = await req.json().catch(() => ({}));
    const isRefresh = mode === 'refresh';

    // Fetch existing portfolio items if refreshing
    let existingItems = [];
    if (isRefresh) {
      existingItems = await base44.asServiceRole.entities.PortfolioItem.list();
    }

    // Fetch Etsy shop page
    const etsyShopUrl = 'https://www.etsy.com/shop/craftedxdesignco';
    const shopResponse = await fetch(etsyShopUrl);
    const shopHtml = await shopResponse.text();
    
    // Use LLM to extract structured data from the HTML
    const extractionResult = await base44.integrations.Core.InvokeLLM({
      prompt: `Extract ALL product listings from this Etsy shop HTML. For each listing, provide:
1. Exact title
2. Full description (if visible)
3. Price
4. ALL image URLs (look for high-res versions, typically in srcset or data attributes)
5. Complete listing URL (must include listing ID)
6. Etsy listing ID (extract from the URL, e.g., from /listing/1234567890/)
7. Any materials mentioned

Return as JSON array with this structure:
{
  "listings": [
    {
      "title": "exact title",
      "description": "full description if available",
      "price": "$XX.XX",
      "image_urls": ["url1", "url2", ...],
      "etsy_url": "https://www.etsy.com/listing/...",
      "etsy_listing_id": "1234567890",
      "materials": ["material1", ...]
    }
  ]
}

HTML content:
${shopHtml.slice(0, 50000)}`,
      response_json_schema: {
        type: "object",
        properties: {
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
                etsy_listing_id: { type: "string" },
                materials: {
                  type: "array",
                  items: { type: "string" }
                }
              },
              required: ["title", "etsy_url", "image_urls"]
            }
          }
        }
      }
    });

    const listings = extractionResult.listings || [];
    
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

    // Process each listing
    for (const listing of listings.slice(0, 30)) {
      try {
        // Extract listing ID from URL if not provided
        const listingId = listing.etsy_listing_id || 
          listing.etsy_url.match(/\/listing\/(\d+)/)?.[1];

        if (!listingId) {
          importResults.failed.push({
            title: listing.title,
            reason: 'Could not extract Etsy listing ID'
          });
          continue;
        }

        // Check if item already exists (for refresh)
        const existingItem = existingItems.find(item => 
          item.etsy_listing_id === listingId
        );

        // Download and upload images to app storage
        const uploadedImages = [];
        for (const imageUrl of listing.image_urls.slice(0, 8)) {
          try {
            const imageResponse = await fetch(imageUrl);
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

        const mappedMaterials = (listing.materials || [])
          .map(mat => {
            const matLower = mat.toLowerCase();
            return validMaterials.find(vm => vm.toLowerCase().includes(matLower)) || null;
          })
          .filter(Boolean);

        // Prepare data from Etsy
        const etsyData = {
          name: listing.title,
          description: listing.description || `${listing.title} - ${listing.price}`,
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
            category: existingItem.category, // Keep user's category choice
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

        } else {
          // Item exists but we're in import mode - skip
          importResults.skipped++;
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
      results: importResults
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});