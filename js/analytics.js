/**
 * Google Analytics 4 (GA4) Integration Helper
 * Allows setting measurement ID via UI settings modal or direct default
 */

window.GA_CONFIG = {
  // If you have your Measurement ID, you can replace G-XXXXXXXXXX here or enter it in Settings Modal
  defaultMeasurementId: 'GTM-TB2S2497',

  getMeasurementId() {
    return localStorage.getItem('khatib_ga_id') || this.defaultMeasurementId;
  },

  setMeasurementId(id) {
    if (id) {
      localStorage.setItem('khatib_ga_id', id.trim());
    } else {
      localStorage.removeItem('khatib_ga_id');
    }
  },

  init() {
    const gaId = this.getMeasurementId();
    if (!gaId || gaId === 'GTM-TB2S2497') {
      return;
    }

    // Load gtag.js asynchronously
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', gaId, {
      send_page_view: true
    });
  },

  // Track virtual page views for SPA tab navigation
  trackPageView(pageName) {
    const gaId = this.getMeasurementId();
    if (window.gtag && gaId && gaId !== 'GTM-TB2S2497') {
      window.gtag('event', 'page_view', {
        page_title: pageName,
        page_location: window.location.href,
        page_path: `/${pageName}`
      });
    }
  },

  // Track user interaction events
  trackEvent(eventName, params = {}) {
    const gaId = this.getMeasurementId();
    if (window.gtag && gaId && gaId !== 'GTM-TB2S2497') {
      window.gtag('event', eventName, params);
    }
  }
};

window.GA_CONFIG.init();
