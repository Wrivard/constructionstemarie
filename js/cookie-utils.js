/**
 * Cookie Banner System - Utilities
 * GDPR/CCPA compliant cookie consent management
 */

const CONSENT_COOKIE_NAME = "cookie-consent";
const CONSENT_EXPIRY_DAYS = 365;

// Cookie consent type definition
function createDefaultConsent() {
  return {
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false
  };
}

// Set cookie consent preferences
function setCookieConsent(consent) {
  if (typeof window === "undefined") return;

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + CONSENT_EXPIRY_DAYS);

  document.cookie = `${CONSENT_COOKIE_NAME}=${JSON.stringify(
    consent
  )}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;

  applyConsentSettings(consent);
}

// Get current cookie consent preferences
function getCookieConsent() {
  if (typeof window === "undefined") return null;

  const cookies = document.cookie.split("; ");
  const consentCookie = cookies.find((cookie) => cookie.startsWith(`${CONSENT_COOKIE_NAME}=`));

  if (!consentCookie) return null;

  try {
    const consentValue = consentCookie.split("=")[1];
    return JSON.parse(decodeURIComponent(consentValue));
  } catch (error) {
    console.error("Error parsing cookie consent:", error);
    return null;
  }
}

// Check if user has consented to a specific category
function hasConsented(category) {
  const consent = getCookieConsent();
  return consent ? consent[category] : false;
}

// Initialize GTM consent mode
function initializeGTMConsent() {
  if (typeof window === "undefined") return;
  
  const checkGtag = () => {
    if (typeof window.gtag === "function") {
      const existingConsent = getCookieConsent();
      if (existingConsent) {
        applyConsentSettings(existingConsent);
      }
    } else {
      setTimeout(checkGtag, 100);
    }
  };
  
  checkGtag();
}

// Apply consent settings to GTM
function applyConsentSettings(consent) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

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

// Check if GTM is loaded
function isGTMLoaded() {
  return typeof window !== "undefined" && typeof window.gtag === "function";
}

// Export functions for global use
window.CookieUtils = {
  setCookieConsent,
  getCookieConsent,
  hasConsented,
  initializeGTMConsent,
  applyConsentSettings,
  isGTMLoaded,
  createDefaultConsent
};
