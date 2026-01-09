import React from 'react';

export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'Crafted By Design Co.',
    'url': 'https://craftedbydesignco.vercel.app',
    'logo': 'https://craftedbydesignco.vercel.app/logo.png',
    'description': 'Custom laser-cut and engraved designs for weddings, gifts, home décor, and more.',
    'sameAs': [
      'https://www.instagram.com/craftedbydesignco',
      'https://www.facebook.com/CraftedbyDesignCo',
      'https://craftedxdesignco.etsy.com'
    ],
    'contactPoint': {
      '@type': 'ContactPoint',
      'telephone': '+1-XXX-XXX-XXXX',
      'contactType': 'Customer Service',
      'email': 'craftedxdesignco@gmail.com'
    },
    'address': {
      '@type': 'PostalAddress',
      'addressCountry': 'US',
      'addressRegion': 'NJ'
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ProductSchema({ item }) {
  if (!item) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': item.name,
    'description': item.seo_description || item.description,
    'image': item.images?.[0] || '',
    'url': `https://craftedbydesignco.vercel.app/portfolio?item=${item.id}`,
    'sku': item.sku || item.id,
    'category': item.category,
    'offers': {
      '@type': 'Offer',
      'url': item.etsy_url || `https://craftedbydesignco.vercel.app/portfolio?item=${item.id}`,
      'availability': 'https://schema.org/InStock',
      'priceCurrency': 'USD'
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}