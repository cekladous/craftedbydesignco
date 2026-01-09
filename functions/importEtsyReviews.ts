import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Function to clean up encoding issues common in Etsy exports
function cleanEncoding(text) {
  if (!text) return text;
  
  return text
    .replace(/√©/g, 'é')
    .replace(/√®/g, 'î')
    .replace(/√≥/g, 'ó')
    .replace(/√°/g, 'à')
    .replace(/√¢/g, 'â')
    .replace(/√™/g, 'è')
    .replace(/√´/g, 'ê')
    .replace(/√Ø/g, 'ô')
    .replace(/√π/g, 'ù')
    .replace(/√ª/g, 'û')
    .replace(/‚Äî/g, '—')
    .replace(/‚Äì/g, '–')
    .replace(/‚Äú/g, '"')
    .replace(/‚Äù/g, '"')
    .replace(/‚Äô/g, "'")
    .replace(/‚Ä¶/g, '…')
    .replace(/Ã©/g, 'é')
    .replace(/Ã¨/g, 'è')
    .replace(/Ã /g, 'à')
    .replace(/Ã¢/g, 'â')
    .replace(/Ã´/g, 'ô')
    .replace(/Ã®/g, 'î')
    .replace(/Ã¹/g, 'ù')
    .replace(/Ã»/g, 'û')
    .replace(/Ã§/g, 'ç');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin access
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { fileContent } = await req.json();
    
    if (!fileContent) {
      return Response.json({ error: 'No file content provided' }, { status: 400 });
    }

    // Parse JSON
    let reviews;
    try {
      reviews = JSON.parse(fileContent);
    } catch (error) {
      return Response.json({ error: 'Invalid JSON file' }, { status: 400 });
    }

    // Handle both array and single object
    if (!Array.isArray(reviews)) {
      reviews = [reviews];
    }

    // Fetch existing testimonials to check for duplicates
    const existingTestimonials = await base44.asServiceRole.entities.Testimonial.list();
    const existingReviewIds = new Set(
      existingTestimonials
        .filter(t => t.etsy_review_id)
        .map(t => t.etsy_review_id)
    );
    const existingQuotes = new Set(
      existingTestimonials.map(t => `${t.customer_name}|||${t.quote}`)
    );

    let imported = 0;
    let skipped = 0;
    const errors = [];

    for (const review of reviews) {
      try {
        // Extract review data (support multiple Etsy JSON formats)
        const reviewId = review.transaction_id || review.review_id || review.id;
        const customerName = cleanEncoding(
          review.reviewer || review.buyer_name || review.customer_name || review.name || 'Anonymous'
        );
        const reviewText = cleanEncoding(
          review.review || review.message || review.text || review.comment || ''
        );
        const rating = review.rating || review.stars || 5;
        const reviewDate = review.created_timestamp 
          ? new Date(review.created_timestamp * 1000).toISOString().split('T')[0]
          : review.date || review.review_date || null;

        if (!reviewText) {
          skipped++;
          continue;
        }

        // Check for duplicates
        const duplicateKey = `${customerName}|||${reviewText}`;
        if (reviewId && existingReviewIds.has(reviewId.toString())) {
          skipped++;
          continue;
        }
        if (existingQuotes.has(duplicateKey)) {
          skipped++;
          continue;
        }

        // Create testimonial
        const testimonialData = {
          customer_name: customerName,
          quote: reviewText,
          rating: rating,
          etsy_review_id: reviewId ? reviewId.toString() : null,
          review_date: reviewDate,
          featured: false,
          visible: true,
          display_order: existingTestimonials.length + imported
        };

        await base44.asServiceRole.entities.Testimonial.create(testimonialData);
        
        // Track for next iteration
        if (reviewId) existingReviewIds.add(reviewId.toString());
        existingQuotes.add(duplicateKey);
        
        imported++;
      } catch (error) {
        console.error('Failed to import review:', error);
        errors.push({ review, error: error.message });
      }
    }

    return Response.json({
      success: true,
      imported,
      skipped,
      total: reviews.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Import error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});