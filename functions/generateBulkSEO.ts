import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const items = await base44.asServiceRole.entities.PortfolioItem.list();
    
    const itemsNeedingSEO = items.filter(
      item => !item.seo_title || !item.seo_description || !item.seo_keywords
    );

    if (itemsNeedingSEO.length === 0) {
      return Response.json({ 
        success: true, 
        message: 'All items already have SEO data',
        processed: 0,
        total: items.length 
      });
    }

    const results = {
      successful: 0,
      failed: 0,
      items: []
    };

    for (const item of itemsNeedingSEO) {
      try {
        const context = `
Product: ${item.name}
Category: ${item.category}
Description: ${item.description}
Materials: ${(item.materials || []).join(', ')}
Customization: ${item.customization_options || 'None'}
        `.trim();

        const seoData = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `You are an SEO expert for a custom laser-cutting and engraving business called "Crafted By Design Co."

Based on this product information:
${context}

Generate optimized SEO content with the following JSON schema:
- seo_title: An engaging, keyword-rich title (max 60 chars) that would rank well in search
- seo_description: A compelling meta description (max 160 chars) that describes the product and includes a call-to-action
- seo_keywords: Comma-separated keywords (10-15 keywords) relevant to laser cutting, custom design, and this specific product

Focus on keywords like: laser cutting, laser engraving, custom design, personalized gifts, and category-specific terms.`,
          response_json_schema: {
            type: "object",
            properties: {
              seo_title: { type: "string" },
              seo_description: { type: "string" },
              seo_keywords: { type: "string" }
            },
            required: ["seo_title", "seo_description", "seo_keywords"]
          }
        });

        if (seoData) {
          await base44.asServiceRole.entities.PortfolioItem.update(item.id, {
            seo_title: seoData.seo_title,
            seo_description: seoData.seo_description,
            seo_keywords: seoData.seo_keywords
          });
          results.successful++;
          results.items.push({
            name: item.name,
            seo_title: seoData.seo_title
          });
        }
      } catch (error) {
        console.error(`Failed to generate SEO for ${item.name}:`, error);
        results.failed++;
      }
    }

    return Response.json({
      success: true,
      processed: itemsNeedingSEO.length,
      total: items.length,
      successful: results.successful,
      failed: results.failed,
      items: results.items
    });

  } catch (error) {
    console.error('Bulk SEO generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});