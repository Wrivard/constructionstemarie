/**
 * Google Tag Manager Integration with Cookie Consent
 * GDPR/CCPA compliant GTM implementation
 */

class GTMIntegration {
  constructor(gtmId = null) {
    this.gtmId = gtmId || 'GTM-TFMJVGLK'; // GTM Container ID
    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    
    // Define gtag function
    function gtag(...args) {
      window.dataLayer.push(args);
    }
    
    window.gtag = gtag;
    
    // Set default consent before GTM loads
    gtag('consent', 'default', {
      'analytics_storage': 'denied',
      'ad_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied',
      'functionality_storage': 'denied',
      'personalization_storage': 'denied',
      'security_storage': 'granted',
      'wait_for_update': 500
    });
    
    // Apply existing consent if available
    const existingConsent = window.CookieUtils ? window.CookieUtils.getCookieConsent() : null;
    if (existingConsent) {
      this.applyConsentSettings(existingConsent);
    }

    // Load GTM script
    this.loadGTMScript();

    // Listen for page changes (for SPAs)
    this.setupPageTracking();

    // Track initial page view after a short delay to ensure GTM is loaded
    setTimeout(() => {
      this.trackPageView();
    }, 1000);
  }

  loadGTMScript() {
    // GTM script injection
    const script = document.createElement('script');
    script.innerHTML = `
      (function(w,d,s,l,i){
        w[l]=w[l]||[];
        w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
        var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
        j.async=true;
        j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
        f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${this.gtmId}');
    `;
    document.head.appendChild(script);

    // Add noscript fallback
    this.addNoscriptFallback();
  }

  addNoscriptFallback() {
    const noscript = document.createElement('noscript');
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${this.gtmId}`;
    iframe.height = '0';
    iframe.width = '0';
    iframe.style.display = 'none';
    iframe.style.visibility = 'hidden';
    
    noscript.appendChild(iframe);
    document.body.insertBefore(noscript, document.body.firstChild);
  }

  applyConsentSettings(consent) {
    if (typeof window.gtag !== 'function') return;

    try {
      window.gtag('consent', 'update', {
        'analytics_storage': consent.analytics ? 'granted' : 'denied',
        'ad_storage': consent.marketing ? 'granted' : 'denied',
        'ad_user_data': consent.marketing ? 'granted' : 'denied',
        'ad_personalization': consent.marketing ? 'granted' : 'denied',
        'functionality_storage': consent.functional ? 'granted' : 'denied',
        'personalization_storage': consent.functional ? 'granted' : 'denied',
        'security_storage': 'granted'
      });

      window.gtag('event', 'consent_update', {
        'event_category': 'consent',
        'analytics_consent': consent.analytics,
        'marketing_consent': consent.marketing,
        'functional_consent': consent.functional,
        'consent_method': 'granular_selection'
      });
    } catch (error) {
      console.error('Error applying consent settings:', error);
    }
  }

  setupPageTracking() {
    // Listen for hash changes (for single-page navigation)
    window.addEventListener('hashchange', () => {
      this.trackPageView();
    });

    // Listen for popstate events
    window.addEventListener('popstate', () => {
      this.trackPageView();
    });

    // Override pushState and replaceState to track programmatic navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      setTimeout(() => gtmIntegration.trackPageView(), 100);
    };

    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      setTimeout(() => gtmIntegration.trackPageView(), 100);
    };
  }

  trackPageView() {
    if (typeof window.gtag !== 'function') return;

    // Check for existing consent and apply it
    const existingConsent = this.getExistingConsent();
    if (existingConsent) {
      this.applyConsentSettings(existingConsent);
    }

    // Track page view
    window.gtag('event', 'page_view', {
      'page_title': document.title,
      'page_location': window.location.href,
      'page_path': window.location.pathname
    });
  }

  getExistingConsent() {
    try {
      const cookies = document.cookie.split("; ");
      const consentCookie = cookies.find((cookie) => cookie.startsWith("cookie-consent="));
      
      if (consentCookie) {
        const consentValue = consentCookie.split("=")[1];
        return JSON.parse(decodeURIComponent(consentValue));
      }
    } catch (error) {
      console.error('Error reading consent cookie:', error);
    }
    return null;
  }

  // Method to track custom events
  trackEvent(eventName, parameters = {}) {
    if (typeof window.gtag !== 'function') return;

    window.gtag('event', eventName, parameters);
  }

  // Method to track conversions
  trackConversion(conversionId, parameters = {}) {
    if (typeof window.gtag !== 'function') return;

    window.gtag('event', 'conversion', {
      'send_to': conversionId,
      ...parameters
    });
  }
}

// Global instance
window.gtmIntegration = null;

// Initialize GTM Integration
document.addEventListener('DOMContentLoaded', function() {
  // You can pass your GTM ID here or set it in the environment
  const gtmId = window.GTM_ID || 'GTM-TFMJVGLK'; // GTM Container ID
  window.gtmIntegration = new GTMIntegration(gtmId);
});

// Global methods for easy access
window.trackGTMEvent = function(eventName, parameters) {
  if (window.gtmIntegration) {
    window.gtmIntegration.trackEvent(eventName, parameters);
  }
};

window.trackGTMConversion = function(conversionId, parameters) {
  if (window.gtmIntegration) {
    window.gtmIntegration.trackConversion(conversionId, parameters);
  }
};
