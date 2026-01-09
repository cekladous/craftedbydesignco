import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch all visible portfolio items
    const portfolioItems = await base44.asServiceRole.entities.PortfolioItem.filter(
      { visible: true },
      "display_order"
    );

    const baseUrl = 'https://craftedbydesignco.vercel.app';
    
    const staticPages = [
      { path: '/', changefreq: 'weekly', priority: '1.0' },
      { path: '/portfolio', changefreq: 'weekly', priority: '0.9' },
      { path: '/capabilities', changefreq: 'monthly', priority: '0.8' },
      { path: '/process', changefreq: 'monthly', priority: '0.8' },
      { path: '/about', changefreq: 'monthly', priority: '0.8' },
      { path: '/contact', changefreq: 'weekly', priority: '0.9' },
    ];

    // Generate sitemap XML
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static pages
    staticPages.forEach(page => {
      sitemap += `  <url>\n`;
      sitemap += `    <loc>${baseUrl}${page.path}</loc>\n`;
      sitemap += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
      sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
      sitemap += `    <priority>${page.priority}</priority>\n`;
      sitemap += `  </url>\n`;
    });

    // Add portfolio category pages
    const categories = ['wedding', 'baby', 'corporate', 'home', 'gifts', 'specialty'];
    categories.forEach(cat => {
      sitemap += `  <url>\n`;
      sitemap += `    <loc>${baseUrl}/portfolio?category=${cat}</loc>\n`;
      sitemap += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
      sitemap += `    <changefreq>weekly</changefreq>\n`;
      sitemap += `    <priority>0.8</priority>\n`;
      sitemap += `  </url>\n`;
    });

    // Add portfolio items with updated date
    portfolioItems.forEach(item => {
      sitemap += `  <url>\n`;
      sitemap += `    <loc>${baseUrl}/portfolio?item=${encodeURIComponent(item.id)}</loc>\n`;
      sitemap += `    <lastmod>${new Date(item.updated_date).toISOString().split('T')[0]}</lastmod>\n`;
      sitemap += `    <changefreq>monthly</changefreq>\n`;
      sitemap += `    <priority>0.7</priority>\n`;
      sitemap += `  </url>\n`;
    });

    sitemap += '</urlset>';

    return new Response(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=86400'
      }
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});