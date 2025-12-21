import { storage } from "./storage";

interface SiteMetaData {
  title: string;
  description: string;
  image: string;
  url: string;
}

function normalizeHost(host: string): string {
  let normalized = host.toLowerCase().trim();
  normalized = normalized.replace(/:\d+$/, '');
  normalized = normalized.replace(/\.+$/, '');
  normalized = normalized.replace(/^www\./, '');
  return normalized;
}

export async function getSiteMetaData(host: string, path: string): Promise<SiteMetaData | null> {
  try {
    let site = null;
    
    const hostNormalized = normalizeHost(host);
    const agentAssetsDomains = ['agentassets.com', 'replit.dev', 'replit.app'];
    const isAgentAssetsDomain = agentAssetsDomains.some(domain => hostNormalized.includes(domain));
    
    if (!isAgentAssetsDomain) {
      site = await storage.getSiteByHost(hostNormalized);
      if (!site) {
        site = await storage.getSiteByHost(`www.${hostNormalized}`);
      }
    } else {
      for (const domain of agentAssetsDomains) {
        if (hostNormalized.endsWith(domain) && hostNormalized !== domain) {
          const subdomain = hostNormalized.replace(`.${domain}`, '');
          if (subdomain && subdomain !== 'www') {
            site = await storage.getSiteBySubdomain(subdomain);
            break;
          }
        }
      }
    }
    
    if (!site && path.startsWith('/p/')) {
      const slug = path.replace('/p/', '').split('/')[0].split('?')[0].toLowerCase();
      if (slug) {
        site = await storage.getSiteBySubdomain(slug);
      }
    }
    
    if (!site) {
      return null;
    }
    
    const seoTitle = (site as any).seoTitle || site.title || site.address || 'Property Listing';
    const seoDescription = (site as any).seoDescription || site.description?.substring(0, 160) || `View this property listing: ${site.address}`;
    
    let seoImage = (site as any).seoImage || '';
    if (!seoImage && site.heroPhotos && site.heroPhotos.length > 0) {
      seoImage = site.heroPhotos[0];
    }
    if (!seoImage && site.photos && site.photos.length > 0) {
      seoImage = site.photos[0];
    }
    
    const siteUrl = site.customDomain 
      ? `https://${site.customDomain.replace(/^www\./, '')}`
      : `https://agentassets.com/p/${site.subdomain || site.id}`;
    
    // Convert relative image paths to absolute URLs
    if (seoImage && !seoImage.startsWith('http')) {
      const baseUrl = 'https://agentassets.com';
      seoImage = seoImage.startsWith('/') ? `${baseUrl}${seoImage}` : `${baseUrl}/${seoImage}`;
    }
    
    return {
      title: seoTitle,
      description: seoDescription,
      image: seoImage,
      url: siteUrl,
    };
  } catch (error) {
    console.error('Error fetching site meta data:', error);
    return null;
  }
}

export function injectMetaTags(html: string, meta: SiteMetaData): string {
  const escapedTitle = escapeHtml(meta.title);
  const escapedDescription = escapeHtml(meta.description);
  const escapedImage = meta.image ? escapeHtml(meta.image) : '';
  const escapedUrl = escapeHtml(meta.url);
  
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapedTitle}</title>`);
  
  html = replaceOrInsertMeta(html, 'name', 'description', escapedDescription);
  html = replaceOrInsertMeta(html, 'property', 'og:title', escapedTitle);
  html = replaceOrInsertMeta(html, 'property', 'og:description', escapedDescription);
  html = replaceOrInsertMeta(html, 'property', 'og:url', escapedUrl);
  html = replaceOrInsertMeta(html, 'property', 'og:type', 'website');
  html = replaceOrInsertMeta(html, 'name', 'twitter:card', 'summary_large_image');
  html = replaceOrInsertMeta(html, 'name', 'twitter:title', escapedTitle);
  html = replaceOrInsertMeta(html, 'name', 'twitter:description', escapedDescription);
  
  if (escapedImage) {
    html = replaceOrInsertMeta(html, 'property', 'og:image', escapedImage);
    html = replaceOrInsertMeta(html, 'name', 'twitter:image', escapedImage);
  }
  
  return html;
}

function replaceOrInsertMeta(html: string, attr: 'property' | 'name', key: string, content: string): string {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`<meta\\s+${attr}="${escapedKey}"\\s+content="[^"]*"\\s*\\/?>`, 'gi');
  const regexAlt = new RegExp(`<meta\\s+content="[^"]*"\\s+${attr}="${escapedKey}"\\s*\\/?>`, 'gi');
  
  const newTag = `<meta ${attr}="${key}" content="${content}" />`;
  
  if (regex.test(html)) {
    return html.replace(regex, newTag);
  } else if (regexAlt.test(html)) {
    return html.replace(regexAlt, newTag);
  } else {
    return html.replace('</head>', `  ${newTag}\n  </head>`);
  }
}

function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
}
