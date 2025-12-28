import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
}

export const SEO = ({ 
  title, 
  description = "Abhimanyu's Portfolio - Machine Learning & GenAI Engineer",
  image = '/starhd.png',
  url,
  type = 'website'
}: SEOProps) => {
  useEffect(() => {
    // Update document title
    document.title = title ? `${title} | Abhimanyu` : 'Abhimanyu - ML Engineer';
    
    // Update or create meta tags
    const updateMetaTag = (property: string, content: string, isOG = false) => {
      const attr = isOG ? 'property' : 'name';
      let element = document.querySelector(`meta[${attr}="${property}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, property);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Standard meta tags
    updateMetaTag('description', description);
    
    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:type', type, true);
    if (url) updateMetaTag('og:url', url, true);
    
    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    
  }, [title, description, image, url, type]);

  return null;
};

export default SEO;
