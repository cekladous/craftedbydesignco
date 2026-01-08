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

    const apiKey = Deno.env.get("ETSY_API_KEY");
    const shopId = Deno.env.get("ETSY_SHOP_ID");

    if (!apiKey || !shopId) {
      return Response.json({
        success: false,
        error: 'Etsy API credentials not configured',
        details: 'Please set ETSY_API_KEY and ETSY_SHOP_ID in your environment variables.'
      });
    }

    // Fetch existing portfolio items if refreshing or previewing
    let existingItems = [];
    if (isRefresh || preview) {
      existingItems = await base44.asServiceRole.entities.PortfolioItem.list();
    }

    // Fetch active listings from Etsy API v3
    console.log('Fetching Etsy listings via API...');
    const listingsResponse = await fetch(
      `https://openapi.etsy.com/v3/application/shops/${shopId}/listings/active?limit=100`,
      {
        headers: {
          'x-api-key': apiKey,
        }
      }
    );

    if (!listingsResponse.ok) {
      const errorText = await listingsResponse.text();
      return Response.json({
        success: false,
        error: `Etsy API error (HTTP ${listingsResponse.status})`,
        details: errorText || 'Failed to fetch listings from Etsy. Check your API key and shop ID.',
        diagnostics: {
          status: listingsResponse.status,
          shopId: shopId
        }
      });
    }

    const listingsData = await listingsResponse.json();
    const listings = listingsData.results || [];

    console.log(`Fetched ${listings.length} active listings from Etsy API`);

    if (listings.length === 0) {
      return Response.json({
        success: false,
        error: 'No active listings found',
        details: 'Your Etsy shop has no active listings. Make sure your shop has published products.'
      });
    }

    // PREVIEW MODE: Return detected listings without importing
    if (preview) {
      const previewData = listings.map(listing => ({
        title: listing.title,
        listing_id: listing.listing_id.toString(),
        price: listing.price?.amount ? `$${(listing.price.amount / listing.price.divisor).toFixed(2)}` : '',
        state: listing.state,
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

    // Category mapping helper
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
      failed: []
    };

    // Process each listing
    for (const listing of listings) {
      try {
        const listingId = listing.listing_id.toString();

        // Check if item already exists (for refresh)
        const existingItem = existingItems.find(item => 
          item.etsy_listing_id === listingId
        );

        // Skip if already imported and not in refresh mode
        if (existingItem && !isRefresh) {
          importResults.skipped++;
          continue;
        }

        // Fetch listing images
        const imagesResponse = await fetch(
          `https://openapi.etsy.com/v3/application/listings/${listing.listing_id}/images`,
          {
            headers: {
              'x-api-key': apiKey,
            }
          }
        );

        let imageUrls = [];
        if (imagesResponse.ok) {
          const imagesData = await imagesResponse.json();
          imageUrls = (imagesData.results || [])
            .map(img => img.url_fullxfull || img.url_570xN)
            .filter(Boolean);
        }

        if (imageUrls.length === 0) {
          importResults.failed.push({
            title: listing.title,
            reason: 'No images available'
          });
          continue;
        }

        // Download and upload images to app storage
        const uploadedImages = [];
        for (const imageUrl of imageUrls.slice(0, 8)) {
          try {
            const imageResponse = await fetch(imageUrl);
            if (!imageResponse.ok) continue;
            
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
            reason: 'Failed to upload images'
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

        const materialText = `${listing.description || ''} ${(listing.materials || []).join(' ')}`.toLowerCase();
        const mappedMaterials = validMaterials.filter(mat => 
          materialText.includes(mat.toLowerCase())
        );

        // Prepare data from Etsy
        const etsyData = {
          name: listing.title,
          description: (listing.description || '').slice(0, 500),
          materials: mappedMaterials.length > 0 ? mappedMaterials : undefined,
          images: uploadedImages,
          etsy_url: listing.url,
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

        } else if (!existingItem) {
          // IMPORT MODE: Create new item
          await base44.asServiceRole.entities.PortfolioItem.create({
            ...etsyData,
            category: categorizeItem(listing.title, listing.description, listing.tags || []),
            visible: true,
            featured: false,
            display_order: existingItems.length + importResults.imported,
          });

          importResults.imported++;
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
      error: error.message,
      details: 'An unexpected error occurred during sync. Check your Etsy API credentials.'
    }, { status: 500 });
  }
});