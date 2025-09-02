/**
 * Cookie Banner System - Main Banner Component
 * GDPR/CCPA compliant cookie consent banner
 */

class CookieBanner {
  constructor() {
    this.open = false;
    this.showPreferences = false;
    this.mounted = false;
    this.preferences = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false
    };

    // Cookie provider details - CUSTOMIZE for your project
    this.cookieProviders = {
      necessary: [
        {
          name: "Session Cookie",
          provider: "Construction Ste-Marie", // CHANGED: Company name
          purpose: "Maintient votre session active pendant la navigation.",
          duration: "Session",
          type: "HTTP Cookie"
        }
      ],
      functional: [],
      analytics: [],
      marketing: []
    };

    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.mount());
    } else {
      this.mount();
    }
  }

  mount() {
    this.mounted = true;
    
    const existingConsent = window.CookieUtils.getCookieConsent();
    if (existingConsent) {
      this.preferences = existingConsent;
      window.CookieUtils.applyConsentSettings(existingConsent);
    } else {
      this.open = true;
      this.render();
    }

    // Listen for preference opening events
    window.addEventListener("openCookiePreferences", () => {
      this.open = true;
      this.showPreferences = true;
      this.render();
    });
  }

  handlePreferenceChange(category) {
    if (category === 'necessary') return;
    this.preferences[category] = !this.preferences[category];
    this.updatePreferencesUI();
  }

  handleSavePreferences() {
    window.CookieUtils.setCookieConsent(this.preferences);
    window.CookieUtils.applyConsentSettings(this.preferences);
    
    if (this.preferences.analytics) {
      window.dispatchEvent(new CustomEvent('analytics_consent_granted'));
      if (window.dataLayer) {
        window.dataLayer.push({
          'event': 'analytics_consent_granted'
        });
      }
    }
    
    this.showPreferences = false;
    this.open = false;
    this.remove();
  }

  handleRefuse() {
    const refusedPreferences = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false
    };
    this.preferences = refusedPreferences;
    window.CookieUtils.setCookieConsent(refusedPreferences);
    window.CookieUtils.applyConsentSettings(refusedPreferences);
    this.open = false;
    this.remove();
  }

  handleAcceptAll() {
    const acceptedPreferences = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true
    };
    this.preferences = acceptedPreferences;
    window.CookieUtils.setCookieConsent(acceptedPreferences);
    window.CookieUtils.applyConsentSettings(acceptedPreferences);
    
    if (acceptedPreferences.analytics) {
      window.dispatchEvent(new CustomEvent('analytics_consent_granted'));
      if (window.dataLayer) {
        window.dataLayer.push({
          'event': 'analytics_consent_granted'
        });
      }
    }
    
    this.open = false;
    this.remove();
  }

  updatePreferencesUI() {
    // Update checkbox states in preferences modal
    const checkboxes = document.querySelectorAll('.cookie-preference-checkbox');
    checkboxes.forEach(checkbox => {
      const category = checkbox.dataset.category;
      if (this.preferences[category] !== undefined) {
        checkbox.checked = this.preferences[category];
      }
    });
  }

  createPreferencesModal() {
    return `
      <div class="cookie-modal-overlay" onclick="cookieBanner.closePreferences()"></div>
      <div class="cookie-preferences-modal">
        <div class="cookie-modal-header">
          <div class="cookie-modal-title">
            <span class="cookie-brand-bar"></span>
            <h3>Préférences des cookies</h3>
          </div>
          <button onclick="cookieBanner.closePreferences()" class="cookie-modal-close" aria-label="Fermer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="cookie-modal-content">
          <p class="cookie-modal-description">
            Nous utilisons différents types de cookies pour optimiser votre expérience sur notre site. 
            Vous pouvez choisir les catégories de cookies que vous acceptez.
          </p>

          <div class="cookie-categories">
            <div class="cookie-category">
              <div class="cookie-category-header">
                <div class="cookie-category-info">
                  <div class="cookie-category-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <div>
                    <div class="cookie-category-title">
                      <h4>Cookies Nécessaires</h4>
                      <div class="cookie-info-tooltip">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M9,9a3,3 0 0,1 6,0c0,2-3,3-3,3"/>
                          <path d="M12,17h.01"/>
                        </svg>
                        <div class="tooltip-content">
                          <p><strong>Exemples:</strong></p>
                          <div><strong>cookieConsent</strong> – Sauvegarde les préférences de cookies</div>
                          <div><strong>__hcaptcha</strong> – Sécurité CAPTCHA</div>
                        </div>
                      </div>
                    </div>
                    <p>Ces cookies sont essentiels au fonctionnement du site web.</p>
                  </div>
                </div>
                <input type="checkbox" class="cookie-preference-checkbox" data-category="necessary" checked disabled>
              </div>
            </div>

            <div class="cookie-category">
              <div class="cookie-category-header">
                <div class="cookie-category-info">
                  <div class="cookie-category-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 20h9"/>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                    </svg>
                  </div>
                  <div>
                    <div class="cookie-category-title">
                      <h4>Cookies Fonctionnels</h4>
                    </div>
                    <p>Améliorent l'expérience utilisateur avec des fonctionnalités personnalisées.</p>
                  </div>
                </div>
                <input type="checkbox" class="cookie-preference-checkbox" data-category="functional" 
                       ${this.preferences.functional ? 'checked' : ''} 
                       onchange="cookieBanner.handlePreferenceChange('functional')">
              </div>
            </div>

            <div class="cookie-category">
              <div class="cookie-category-header">
                <div class="cookie-category-info">
                  <div class="cookie-category-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 3v5h5"/>
                      <path d="M3 8a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 4"/>
                      <path d="M21 21v-5h-5"/>
                      <path d="M21 16a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 20"/>
                    </svg>
                  </div>
                  <div>
                    <div class="cookie-category-title">
                      <h4>Cookies Analytiques</h4>
                    </div>
                    <p>Nous aident à comprendre comment vous utilisez notre site web.</p>
                  </div>
                </div>
                <input type="checkbox" class="cookie-preference-checkbox" data-category="analytics" 
                       ${this.preferences.analytics ? 'checked' : ''} 
                       onchange="cookieBanner.handlePreferenceChange('analytics')">
              </div>
            </div>

            <div class="cookie-category">
              <div class="cookie-category-header">
                <div class="cookie-category-info">
                  <div class="cookie-category-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M12 1v6m0 6v6"/>
                      <path d="M21 12h-6m-6 0H3"/>
                    </svg>
                  </div>
                  <div>
                    <div class="cookie-category-title">
                      <h4>Cookies Marketing</h4>
                    </div>
                    <p>Permettent la personnalisation des publicités et du contenu.</p>
                  </div>
                </div>
                <input type="checkbox" class="cookie-preference-checkbox" data-category="marketing" 
                       ${this.preferences.marketing ? 'checked' : ''} 
                       onchange="cookieBanner.handlePreferenceChange('marketing')">
              </div>
            </div>
          </div>
        </div>

        <div class="cookie-modal-footer">
          <a href="politique-de-cookie.html" class="cookie-policy-link">Politique des cookies</a>
          <div class="cookie-modal-buttons">
            <button onclick="cookieBanner.closePreferences()" class="cookie-btn cookie-btn-secondary">Annuler</button>
            <button onclick="cookieBanner.handleSavePreferences()" class="cookie-btn cookie-btn-primary">Sauvegarder</button>
          </div>
        </div>
      </div>
    `;
  }

  createBanner() {
    return `
      <div class="cookie-banner">
        <button onclick="cookieBanner.closeBanner()" class="cookie-banner-close" aria-label="Fermer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <p class="cookie-banner-text">
          En cliquant sur "Accepter", vous consentez à l'utilisation de cookies pour améliorer votre expérience, 
          analyser le trafic et personnaliser le contenu.
        </p>

        <div class="cookie-banner-actions">
          <div class="cookie-banner-buttons">
            <button onclick="cookieBanner.openPreferences()" class="cookie-btn cookie-btn-settings">Paramètres</button>
            <button onclick="cookieBanner.handleRefuse()" class="cookie-btn cookie-btn-refuse">Refuser</button>
            <button onclick="cookieBanner.handleAcceptAll()" class="cookie-btn cookie-btn-accept">Accepter</button>
          </div>
          <div class="cookie-banner-policy">
            <a href="politique-de-cookie.html" class="cookie-policy-link-small">Politique des cookies</a>
          </div>
        </div>
      </div>
    `;
  }

  render() {
    if (!this.mounted || !this.open) return;

    // Remove existing banner
    this.remove();

    // Create container
    const container = document.createElement('div');
    container.id = 'cookie-banner-container';
    
    if (this.showPreferences) {
      container.innerHTML = this.createPreferencesModal();
    } else {
      container.innerHTML = this.createBanner();
    }

    document.body.appendChild(container);
  }

  remove() {
    const existing = document.getElementById('cookie-banner-container');
    if (existing) {
      existing.remove();
    }
  }

  openPreferences() {
    this.showPreferences = true;
    this.render();
  }

  closePreferences() {
    this.showPreferences = false;
    this.render();
  }

  closeBanner() {
    this.open = false;
    this.remove();
  }
}

// Global methods for onclick handlers
window.cookieBanner = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  window.cookieBanner = new CookieBanner();
});
