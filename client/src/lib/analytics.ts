declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export const initGA = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (!measurementId) {
    console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    return;
  }

  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  const script2 = document.createElement('script');
  script2.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}');
  `;
  document.head.appendChild(script2);
};

export const trackPageView = (url: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!measurementId) return;
  
  window.gtag('config', measurementId, {
    page_path: url
  });
};

export const trackEvent = (
  action: string, 
  category?: string, 
  label?: string, 
  value?: number
) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

export const trackPurchase = (
  packageName: string,
  credits: number,
  price: number
) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'purchase', {
    currency: 'USD',
    value: price,
    items: [{
      item_name: packageName,
      quantity: credits,
      price: price
    }]
  });

  const eventName = packageName.toLowerCase().replace(/\s+/g, '_') + '_purchase';
  window.gtag('event', eventName, {
    event_category: 'purchase',
    event_label: packageName,
    value: price
  });
};

export const trackRegistration = (method: string = 'email') => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'site_registrations', {
    event_category: 'engagement',
    event_label: method
  });
};

export const trackLeadSubmission = (siteSlug: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'qualify_lead', {
    event_category: 'lead',
    event_label: siteSlug
  });
};

export const trackLeadConversion = (leadId: number) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'close_convert_lead', {
    event_category: 'lead',
    event_label: String(leadId)
  });
};
