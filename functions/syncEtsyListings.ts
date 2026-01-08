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

    const apiKey = Deno.env.get('ETSY_API_KEY');
    if (!apiKey) {
      return Response.json({
        success: false,
        error: 'Etsy API key not configured',
        details: 'Please add your ETSY_API_KEY in the dashboard settings.',
        graceful: true
      });
    }

    // Fetch shop ID first
    const shopName = 'craftedxdesignco';
    let shopId;
    
    try {
      const shopResponse = await fetch(
        `https://openapi.etsy.com/v3/application/shops?shop_name=${shopName}`,
        {
          headers: {
            'x-api-key': apiKey,
          }
        }
      );

      if (!shopResponse.ok) {
        return Response.json({
          success: false,
          error: `Etsy API error (${shopResponse.status})`,
          details: shopResponse.status === 403 
            ? 'API key may be invalid or lacking permissions.'
            : 'Unable to connect to Etsy API.',
          graceful: true
        });
      }

      const shopData = await shopResponse.json();
      if (!shopData.results || shopData.results.length === 0) {
        return Response.json({
          success: false,
          error: 'Shop not found',
          details: `Could not find shop "${shopName}" on Etsy.`,
          graceful: true
        });
      }

      shopId = shopData.results[0].shop_id;
    } catch (error) {
      return Response.json({
        success: false,
        error: 'Network error connecting to Etsy',
        details: error.message,
        graceful: true
      });
    }

    // Fetch active listings
    let listings = [];
    try {
      const listingsResponse = await fetch(
        `https://openapi.etsy.com/v3/application/shops/${shopId}/listings/active?limit=100&includes=Images`,
        {
          headers: {
            'x-api-key': apiKey,
          }
        }
      );

      if (!listingsResponse.ok) {
        return Response.json({
          success: false,
          error: `Failed to fetch listings (${listingsResponse.status})`,
          details: 'Unable to retrieve shop listings from Etsy API.',
          graceful: true
        });
      }

      const listingsData = await listingsResponse.json();
      listings = listingsData.results || [];

      if (listings.length === 0) {
        return Response.json({
          success: false,
          error: 'No active listings found',
          details: 'Your shop has no active listings to import.',
          graceful: true
        });
      }
    } catch (error) {
      return Response.json({
        success: false,
        error: 'Error fetching listings',
        details: error.message,
        graceful: true
      });
    }

    // Fetch existing portfolio items
    const existingItems = await base44.asServiceRole.entities.PortfolioItem.list();

    // PREVIEW MODE
    if (preview) {
      const previewData = listings.map(listing => ({
        title: listing.title,
        listing_id: listing.listing_id.toString(),
        image_count: listing.images?.length || 0,
        price: listing.price ? `$${listing.price.amount / listing.price.divisor}` : 'N/A',
        already_imported: existingItems.some(item => 
          item.etsy_listing_id === listing.listing_id.toString()
        )
      }));

      return Response.json({
        success: true,
        preview: true,
        total_detected: listings.length,
        listings: previewData,
        stats: {
          new_items: previewData.filter(p => !p.already_imported).length,
          already_imported: previewData.filter(p => p.already_imported).length
        }
      });
    }

    // Category mapping
    const categorizeItem = (title, description = '', tags = []) => {
      const text = `${title} ${description} ${tags.join(' ')}`.toLowerCase();
      
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

    // Process listings
    for (const listing of listings) {
      try {
        const listingId = listing.listing_id.toString();
        
        const existingItem = existingItems.find(item => 
          item.etsy_listing_id === listingId
        );

        // Skip if already imported and not in refresh mode
        if (existingItem && !isRefresh) {
          importResults.skipped++;
          continue;
        }

        // Download and upload images
        const uploadedImages = [];
        const images = listing.images || [];
        
        if (images.length === 0) {
          importResults.failed.push({
            title: listing.title,
            reason: 'No images available'
          });
          continue;
        }

        for (const image of images.slice(0, 8)) {
          try {
            const imageUrl = image.url_fullxfull || image.url_570xN || image.url_75x75;
            if (!imageUrl) continue;

            const imageResponse = await fetch(imageUrl);
            if (!imageResponse.ok) continue;
            
            const imageBlob = await imageResponse.blob();
            const { file_url } = await base44.asServiceRole.integrations.Core.UploadFile({
              file: imageBlob
            });
            
            uploadedImages.push(file_url);
          } catch (imageError) {
            console.error(`Failed to upload image:`, imageError.message);
          }
        }

        if (uploadedImages.length === 0) {
          importResults.failed.push({
            title: listing.title,
            reason: 'Failed to upload images'
          });
          continue;
        }

        // Extract materials from description
        const validMaterials = [
          "Mirrored acrylic", "Colored acrylic", "Clear acrylic", "Frosted acrylic",
          "Painted acrylic", "Back-painted acrylic", "UV-printable acrylic",
          "Birch plywood", "Maple wood", "Walnut wood", "Acacia wood", "MDF",
          "Stained wood", "Painted wood", "Leatherette",
          "Adhesive vinyl (permanent)", "Adhesive vinyl (removable)",
          "Printed vinyl banners", "UV printed acrylic", "UV printed wood"
        ];

        const materialText = listing.description || '';
        const mappedMaterials = validMaterials.filter(mat =>
          materialText.toLowerCase().includes(mat.toLowerCase())
        );

        // Clean description
        let cleanDescription = listing.description || listing.title;
        cleanDescription = cleanDescription.replace(/\n{3,}/g, '\n\n').trim();
        if (cleanDescription.length > 500) {
          cleanDescription = cleanDescription.slice(0, 497) + '...';
        }

        const etsyData = {
          name: listing.title,
          description: cleanDescription,
          materials: mappedMaterials.length > 0 ? mappedMaterials : undefined,
          images: uploadedImages,
          etsy_url: listing.url,
          etsy_listing_id: listingId,
        };

        if (existingItem && isRefresh) {
          // Update existing item
          await base44.asServiceRole.entities.PortfolioItem.update(existingItem.id, {
            ...etsyData,
            // Preserve user customizations
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
            action: 'updated'
          });

        } else if (!existingItem) {
          // Create new item
          const portfolioItem = await base44.asServiceRole.entities.PortfolioItem.create({
            ...etsyData,
            category: categorizeItem(listing.title, listing.description, listing.tags),
            visible: true,
            featured: false,
            display_order: existingItems.length + importResults.imported,
          });

          importResults.imported++;
          importResults.items.push({
            id: portfolioItem.id,
            title: listing.title,
            action: 'imported'
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
      results: importResults
    });

  } catch (error) {
    console.error('Sync error:', error);
    return Response.json({ 
      success: false,
      error: 'Unexpected error',
      details: error.message,
      graceful: true
    }, { status: 500 });
  }
});