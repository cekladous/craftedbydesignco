import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function SitemapXml() {
  const [xml, setXml] = useState('');

  useEffect(() => {
    generateSitemap();
  }, []);

  const generateSitemap = async () => {
    try {
      const portfolioItems = await base44.entities.PortfolioItem.filter(
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

      let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
      sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

      staticPages.forEach(page => {
        sitemap += `  <url>\n`;
        sitemap += `    <loc>${baseUrl}${page.path}</loc>\n`;
        sitemap += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
        sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
        sitemap += `    <priority>${page.priority}</priority>\n`;
        sitemap += `  </url>\n`;
      });

      const categories = ['wedding', 'baby', 'corporate', 'home', 'gifts', 'specialty'];
      categories.forEach(cat => {
        sitemap += `  <url>\n`;
        sitemap += `    <loc>${baseUrl}/portfolio?category=${cat}</loc>\n`;
        sitemap += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
        sitemap += `    <changefreq>weekly</changefreq>\n`;
        sitemap += `    <priority>0.8</priority>\n`;
        sitemap += `  </url>\n`;
      });

      portfolioItems.forEach(item => {
        sitemap += `  <url>\n`;
        sitemap += `    <loc>${baseUrl}/portfolio?item=${encodeURIComponent(item.id)}</loc>\n`;
        sitemap += `    <lastmod>${new Date(item.updated_date).toISOString().split('T')[0]}</lastmod>\n`;
        sitemap += `    <changefreq>monthly</changefreq>\n`;
        sitemap += `    <priority>0.7</priority>\n`;
        sitemap += `  </url>\n`;
      });

      sitemap += '</urlset>';
      setXml(sitemap);
    } catch (error) {
      console.error('Sitemap generation error:', error);
      setXml('Error generating sitemap');
    }
  };

  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-4xl text-[#2D2D2D] mb-6">XML Sitemap</h1>
        <div className="bg-white p-6 rounded-sm shadow-sm">
          <p className="text-[#6B6B6B] mb-4">
            Copy this sitemap and submit it to Google Search Console at:{' '}
            <a 
              href="https://search.google.com/search-console" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#C4A962] hover:underline"
            >
              search.google.com/search-console
            </a>
          </p>
          <div className="relative">
            <button
              onClick={() => {
                navigator.clipboard.writeText(xml);
                alert('Sitemap copied to clipboard!');
              }}
              className="absolute top-2 right-2 px-4 py-2 bg-[#C4A962] text-white text-sm rounded hover:bg-[#2D2D2D] transition-colors"
            >
              Copy XML
            </button>
            <pre className="bg-[#F5F5F5] p-4 rounded overflow-x-auto text-xs">
              <code>{xml}</code>
            </pre>
          </div>
          
          <div className="mt-6 p-4 bg-[#C4A962]/10 rounded-sm">
            <h3 className="font-medium text-[#2D2D2D] mb-2">How to Submit to Google:</h3>
            <ol className="text-sm text-[#6B6B6B] space-y-2 list-decimal list-inside">
              <li>Click "Copy XML" button above</li>
              <li>Go to <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-[#C4A962] hover:underline">Google Search Console</a></li>
              <li>Select your property (craftedbydesignco.vercel.app)</li>
              <li>Go to "Sitemaps" in the left sidebar</li>
              <li>Create a file named "sitemap.xml" with the copied content</li>
              <li>Upload it to your hosting or submit the function URL directly</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}