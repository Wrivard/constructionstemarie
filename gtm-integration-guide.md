# GTM Integration Guide for HTML/CSS/JS Sites

This guide shows how to integrate Google Tag Manager with consent mode on a vanilla HTML/CSS/JavaScript site, based on the implementation from the Kua website.

## Overview

The integration includes:
- GTM script loading with proper consent mode
- Cookie consent banner (reusable from this project)
- Default denied consent that updates after user interaction
- SPA navigation support for dataLayer events

## 1. GTM Script Integration

### Basic GTM Setup

Add this to your HTML `<head>` section:

```html
<!-- GTM Script -->
<script>
  (function(w,d,s,l,i){
    w[l]=w[l]||[];
    w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
    var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
    j.async=true;
    j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
    f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-XXXXXXX');
</script>

<!-- GTM NoScript fallback -->
<noscript>
  <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
          height="0" width="0" style="display:none;visibility:hidden"></iframe>
</noscript>
```

**Replace `GTM-XXXXXXX` with your actual GTM container ID.**

### Enhanced GTM with Consent Mode

For a more robust implementation with consent mode:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- GTM Script with Consent Mode -->
  <script>
    // Initialize dataLayer before GTM loads
    window.dataLayer = window.dataLayer || [];
    
    function gtag(...args) {
      window.dataLayer.push(args);
    }
    
    // Make gtag globally available
    window.gtag = gtag;
    
    // Set default consent IMMEDIATELY before GTM loads
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
    
    // Check for existing consent and apply it
    const existingConsent = getCookieConsent();
    if (existingConsent) {
      applyConsentSettings(existingConsent);
      
      // If analytics is already approved, fire the analytics_consent_granted event
      if (existingConsent.analytics) {
        window.dataLayer.push({
          'event': 'analytics_consent_granted'
        });
      }
    }
  </script>
  
  <!-- GTM Script -->
  <script>
    (function(w,d,s,l,i){
      w[l]=w[l]||[];
      w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
      var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
      j.async=true;
      j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
      f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-XXXXXXX');
  </script>
</head>
<body>
  <!-- GTM NoScript fallback -->
  <noscript>
    <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
            height="0" width="0" style="display:none;visibility:hidden"></iframe>
  </noscript>
  
  <!-- Your content here -->
  
  <!-- Cookie Consent Banner -->
  <div id="cookie-consent-banner" class="cookie-banner" style="display: none;">
    <div class="cookie-content">
      <p>Nous utilisons des cookies pour améliorer votre expérience sur notre site.</p>
      <div class="cookie-buttons">
        <button id="accept-all-cookies" class="btn-accept">Accepter tout</button>
        <button id="reject-all-cookies" class="btn-reject">Refuser tout</button>
        <button id="customize-cookies" class="btn-customize">Personnaliser</button>
      </div>
    </div>
  </div>
  
  <!-- Cookie Preferences Modal -->
  <div id="cookie-preferences-modal" class="cookie-modal" style="display: none;">
    <div class="modal-content">
      <h3>Préférences des cookies</h3>
      <div class="cookie-categories">
        <div class="cookie-category">
          <label>
            <input type="checkbox" id="analytics-consent" checked>
            <span>Cookies analytiques</span>
          </label>
          <p>Nous aident à comprendre comment vous utilisez notre site.</p>
        </div>
        <div class="cookie-category">
          <label>
            <input type="checkbox" id="marketing-consent">
            <span>Cookies marketing</span>
          </label>
          <p>Utilisés pour vous montrer des publicités pertinentes.</p>
        </div>
      </div>
      <div class="modal-buttons">
        <button id="save-preferences" class="btn-save">Sauvegarder</button>
        <button id="accept-all-modal" class="btn-accept">Accepter tout</button>
        <button id="reject-all-modal" class="btn-reject">Refuser tout</button>
      </div>
    </div>
  </div>
  
  <script src="cookie-utils.js"></script>
  <script src="cookie-banner.js"></script>
</body>
</html>
```

## 2. Cookie Utilities (cookie-utils.js)

Create `cookie-utils.js`:

```javascript
// Cookie consent types
const CookieConsent = {
  analytics: false,
  marketing: false,
  necessary: true
};

// Get stored consent from localStorage
function getCookieConsent() {
  if (typeof window === "undefined") return null;
  
  try {
    const stored = localStorage.getItem('cookie-consent');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error reading cookie consent:', error);
    return null;
  }
}

// Save consent to localStorage
function saveCookieConsent(consent) {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem('cookie-consent', JSON.stringify(consent));
  } catch (error) {
    console.error('Error saving cookie consent:', error);
  }
}

// Check if user has consented to a specific category
function hasConsented(category) {
  const consent = getCookieConsent();
  return consent ? consent[category] : false;
}

// Apply consent settings by updating GTM Consent Mode
function applyConsentSettings(consent) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  
  // Update consent for analytics
  window.gtag('consent', 'update', {
    'analytics_storage': consent.analytics ? 'granted' : 'denied',
    'ad_storage': consent.marketing ? 'granted' : 'denied',
    'ad_user_data': consent.marketing ? 'granted' : 'denied',
    'ad_personalization': consent.marketing ? 'granted' : 'denied',
    'functionality_storage': consent.necessary ? 'granted' : 'denied',
    'personalization_storage': consent.marketing ? 'granted' : 'denied'
  });
  
  // Fire analytics consent event if analytics is granted
  if (consent.analytics) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'event': 'analytics_consent_granted'
    });
  }
}

// Initialize GTM Consent Mode
function initializeGTMConsent() {
  if (typeof window === "undefined") return;
  
  // Wait for gtag to be available
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

// Track page views for SPA navigation
function trackPageView(path) {
  if (typeof window.gtag === "function") {
    window.gtag('config', 'GTM-XXXXXXX', {
      page_path: path
    });
  }
}
```

## 3. Cookie Banner (cookie-banner.js)

Create `cookie-banner.js`:

```javascript
// Cookie banner functionality
document.addEventListener('DOMContentLoaded', function() {
  const banner = document.getElementById('cookie-consent-banner');
  const modal = document.getElementById('cookie-preferences-modal');
  const acceptAllBtn = document.getElementById('accept-all-cookies');
  const rejectAllBtn = document.getElementById('reject-all-cookies');
  const customizeBtn = document.getElementById('customize-cookies');
  const saveBtn = document.getElementById('save-preferences');
  const acceptAllModalBtn = document.getElementById('accept-all-modal');
  const rejectAllModalBtn = document.getElementById('reject-all-modal');
  
  // Check if consent already exists
  const existingConsent = getCookieConsent();
  if (!existingConsent) {
    banner.style.display = 'block';
  }
  
  // Accept all cookies
  function acceptAll() {
    const consent = {
      analytics: true,
      marketing: true,
      necessary: true
    };
    
    saveCookieConsent(consent);
    applyConsentSettings(consent);
    banner.style.display = 'none';
    modal.style.display = 'none';
  }
  
  // Reject all cookies
  function rejectAll() {
    const consent = {
      analytics: false,
      marketing: false,
      necessary: true
    };
    
    saveCookieConsent(consent);
    applyConsentSettings(consent);
    banner.style.display = 'none';
    modal.style.display = 'none';
  }
  
  // Show customization modal
  function showCustomize() {
    modal.style.display = 'block';
    banner.style.display = 'none';
  }
  
  // Save customized preferences
  function savePreferences() {
    const consent = {
      analytics: document.getElementById('analytics-consent').checked,
      marketing: document.getElementById('marketing-consent').checked,
      necessary: true
    };
    
    saveCookieConsent(consent);
    applyConsentSettings(consent);
    modal.style.display = 'none';
  }
  
  // Event listeners
  acceptAllBtn.addEventListener('click', acceptAll);
  rejectAllBtn.addEventListener('click', rejectAll);
  customizeBtn.addEventListener('click', showCustomize);
  saveBtn.addEventListener('click', savePreferences);
  acceptAllModalBtn.addEventListener('click', acceptAll);
  rejectAllModalBtn.addEventListener('click', rejectAll);
  
  // Close modal when clicking outside
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.style.display = 'none';
      banner.style.display = 'block';
    }
  });
});
```

## 4. CSS Styling (cookie-banner.css)

Create `cookie-banner.css`:

```css
/* Cookie Banner Styles */
.cookie-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #1a1a1a;
  color: white;
  padding: 20px;
  z-index: 1000;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.3);
}

.cookie-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.cookie-content p {
  margin: 0;
  flex: 1;
}

.cookie-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.cookie-buttons button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-accept {
  background: #4CAF50;
  color: white;
}

.btn-accept:hover {
  background: #45a049;
}

.btn-reject {
  background: #f44336;
  color: white;
}

.btn-reject:hover {
  background: #da190b;
}

.btn-customize {
  background: #2196F3;
  color: white;
}

.btn-customize:hover {
  background: #1976D2;
}

/* Cookie Modal Styles */
.cookie-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 10px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content h3 {
  margin-top: 0;
  color: #333;
}

.cookie-categories {
  margin: 20px 0;
}

.cookie-category {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
}

.cookie-category label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  cursor: pointer;
}

.cookie-category input[type="checkbox"] {
  width: 18px;
  height: 18px;
}

.cookie-category p {
  margin: 5px 0 0 28px;
  color: #666;
  font-size: 14px;
}

.modal-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.modal-buttons button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
}

.btn-save {
  background: #4CAF50;
  color: white;
}

.btn-save:hover {
  background: #45a049;
}

/* Responsive Design */
@media (max-width: 768px) {
  .cookie-content {
    flex-direction: column;
    text-align: center;
  }
  
  .cookie-buttons {
    justify-content: center;
  }
  
  .modal-buttons {
    justify-content: center;
  }
}
```

## 5. SPA Navigation Support

If your site uses client-side routing, add this to track page views:

```javascript
// Track page changes for SPA navigation
function trackPageChange() {
  const currentPath = window.location.pathname + window.location.search;
  trackPageView(currentPath);
}

// Listen for popstate events (back/forward buttons)
window.addEventListener('popstate', trackPageChange);

// If using a router library, call trackPageChange() after route changes
// Example for different routers:
// - React Router: useEffect with location dependency
// - Vue Router: afterEach hook
// - Angular: Router events
// - Custom router: Call after route change
```

## 6. Testing

### Browser Testing
1. Open browser dev tools
2. Check `window.dataLayer` for events
3. Verify consent mode settings in Network tab
4. Test cookie banner functionality

### GTM Testing
1. Use Google Tag Assistant browser extension
2. Check GTM Preview mode
3. Verify events are firing correctly

## 7. Security Considerations

### Content Security Policy
If you use CSP headers, ensure GTM is allowed:

```html
<meta http-equiv="Content-Security-Policy" 
      content="script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; 
               frame-src 'self' https://www.googletagmanager.com;">
```

### Privacy Compliance
- Ensure compliance with GDPR, CCPA, and other privacy laws
- Update privacy policy to reflect cookie usage
- Consider adding cookie policy page

## 8. File Structure

```
your-site/
├── index.html
├── cookie-utils.js
├── cookie-banner.js
├── cookie-banner.css
└── your-other-files...
```

## 9. Customization

### Styling
- Modify `cookie-banner.css` to match your site's design
- Update colors, fonts, and spacing as needed

### Text Content
- Translate banner text to your language
- Update cookie descriptions to match your usage

### GTM Configuration
- Replace `GTM-XXXXXXX` with your actual container ID
- Configure tags, triggers, and variables in GTM interface

## 10. Advanced Features

### Custom Events
Track custom events in your application:

```javascript
// Track custom event
function trackCustomEvent(eventName, parameters = {}) {
  if (typeof window.gtag === "function") {
    window.gtag('event', eventName, parameters);
  }
}

// Example usage
trackCustomEvent('button_click', {
  button_name: 'contact_form',
  page_location: window.location.href
});
```

### E-commerce Tracking
For e-commerce sites, add enhanced e-commerce tracking:

```javascript
// Track purchase
function trackPurchase(transactionId, value, currency, items) {
  if (typeof window.gtag === "function") {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: value,
      currency: currency,
      items: items
    });
  }
}
```

This implementation provides a complete GTM integration with consent mode that matches the functionality of the Kua website but works on any HTML/CSS/JS site.
