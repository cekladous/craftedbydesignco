import React, { useEffect } from 'react';

export default function SEOHead({ 
  title = 'Crafted By Design Co. | Custom Laser-Cut & Engraved Designs', 
  description = 'Custom laser-cut and engraved designs for weddings, gifts, home décor, and more. Handcrafted in New Jersey.',
  keywords = 'laser cutting, engraving, custom designs, wedding signage, personalized gifts',
  image = 'https://images.unsplash.com/photo-1578926078328-123456789?w=1200&h=630',
  url = 'https://craftedbydesignco.vercel.app'
}) {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta tags
    const updateMeta = (name, content) => {
      let element = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.name = name;
        document.head.appendChild(element);
      }
      element.content = content;
    };

    updateMeta('description', description);
    updateMeta('keywords', keywords);
    updateMeta('og:title', title);
    updateMeta('og:description', description);
    updateMeta('og:image', image);
    updateMeta('og:url', url);
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', image);

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;
  }, [title, description, keywords, image, url]);

  return null;
}