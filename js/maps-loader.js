// Google Maps Loader - Secure API Key Loading for Vercel
class MapsLoader {
  constructor() {
    this.apiKey = null;
    this.isLoaded = false;
    this.callbacks = [];
  }

  // Load the API key from our secure endpoint
  async loadApiKey() {
    if (this.apiKey) return this.apiKey;
    
    try {
      const response = await fetch('/api/maps-config');
      const data = await response.json();
      
      if (data.apiKey) {
        this.apiKey = data.apiKey;
        return this.apiKey;
      } else {
        throw new Error('API key not available');
      }
    } catch (error) {
      console.error('Failed to load Google Maps API key:', error);
      this.handleMapError('Failed to load API key');
      return null;
    }
  }

  // Load Google Maps API with the secure key
  async loadGoogleMaps() {
    if (this.isLoaded) return Promise.resolve();
    
    const apiKey = await this.loadApiKey();
    if (!apiKey) {
      throw new Error('Cannot load Google Maps without API key');
    }

    return new Promise((resolve, reject) => {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        this.isLoaded = true;
        resolve();
        return;
      }

      // Create script element
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        this.isLoaded = true;
        resolve();
      };
      
      script.onerror = (error) => {
        this.handleMapError('Failed to load Google Maps API');
        reject(new Error('Failed to load Google Maps API'));
      };

      // Add to document head
      document.head.appendChild(script);
    });
  }

  // Initialize maps on the page
  async initializeMaps() {
    try {
      await this.loadGoogleMaps();
      
      // Find all map widgets and initialize them
      const mapWidgets = document.querySelectorAll('.w-widget-map[data-widget-latlng]');
      
      if (mapWidgets.length === 0) {
        console.warn('No map widgets found on this page');
        return;
      }
      
      mapWidgets.forEach(widget => {
        this.initializeMapWidget(widget);
      });
      
    } catch (error) {
      console.error('Failed to initialize Google Maps:', error);
      this.handleMapError('Failed to initialize maps');
    }
  }

  // Initialize a single map widget
  initializeMapWidget(widget) {
    const latlng = widget.getAttribute('data-widget-latlng');
    const title = widget.getAttribute('title') || 'Construction Ste-Marie';
    const tooltip = widget.getAttribute('data-widget-tooltip') || 'Construction Ste-Marie Inc.';
    const zoom = parseInt(widget.getAttribute('data-widget-zoom')) || 12;

    if (!latlng) {
      console.warn('Map widget missing coordinates:', widget);
      return;
    }

    const [lat, lng] = latlng.split(',').map(coord => parseFloat(coord.trim()));
    
    if (isNaN(lat) || isNaN(lng)) {
      console.warn('Invalid coordinates for map widget:', latlng);
      return;
    }

    try {
      // Create map
      const map = new google.maps.Map(widget, {
        zoom: zoom,
        center: { lat: lat, lng: lng },
        mapTypeId: 'roadmap',
        scrollwheel: widget.getAttribute('data-enable-scroll') === 'true',
        gestureHandling: widget.getAttribute('data-enable-touch') === 'true' ? 'auto' : 'cooperative'
      });

      // Add marker
      const marker = new google.maps.Marker({
        position: { lat: lat, lng: lng },
        map: map,
        title: title,
        animation: google.maps.Animation.DROP
      });

      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: `<div style="padding: 10px;"><strong>${title}</strong><br>${tooltip}</div>`
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
    } catch (error) {
      console.error('Error creating map:', error);
      this.handleMapError('Error creating map');
    }
  }

  // Handle map errors by displaying a user-friendly message
  handleMapError(message = 'Map unavailable') {
    const mapWidgets = document.querySelectorAll('.w-widget-map');
    
    mapWidgets.forEach(widget => {
      widget.innerHTML = `
        <div style="padding: 20px; background: #f8d7da; color: #842029; border-radius: 8px; text-align: center;">
          <h3>Carte non disponible</h3>
          <p>${message}</p>
          <p>Veuillez désactiver les bloqueurs de publicité ou réessayer plus tard.</p>
        </div>
      `;
    });
  }

  // Detect if maps.googleapis.com is blocked by ad blockers
  static async detectMapBlocker() {
    return new Promise(resolve => {
      const testImage = new Image();
      const timeout = setTimeout(() => {
        resolve(true); // Assume blocked if timeout
      }, 2000);

      testImage.onload = () => {
        clearTimeout(timeout);
        resolve(false); // Not blocked
      };

      testImage.onerror = () => {
        clearTimeout(timeout);
        resolve(true); // Blocked
      };

      // Try to load a small image from Google Maps
      testImage.src = 'https://maps.googleapis.com/maps/api/staticmap?size=1x1&key=test';
    });
  }

  // Check if maps are blocked and show a message
  static async checkMapAvailability() {
    const isBlocked = await MapsLoader.detectMapBlocker();
    
    if (isBlocked) {
      const mapWidgets = document.querySelectorAll('.w-widget-map');
      
      mapWidgets.forEach(widget => {
        const latlng = widget.getAttribute('data-widget-latlng') || '45.8506,-73.8370';
        const [lat, lng] = latlng.split(',').map(coord => parseFloat(coord.trim()));
        
        widget.innerHTML = `
          <div style="padding: 20px; background: #f8f9fa; border-radius: 8px; text-align: center;">
            <h3>Carte non disponible</h3>
            <p>Votre bloqueur de publicité semble empêcher le chargement de Google Maps.</p>
            <p>Pour voir la carte, veuillez désactiver votre bloqueur de publicité pour ce site.</p>
            <div style="margin-top: 15px; padding: 10px; background: #e9ecef; border-radius: 4px;">
              <strong>Construction Ste-Marie</strong><br>
              Saint-Roch-de-l'Achigan<br>
              <a href="https://www.google.com/maps?q=${lat},${lng}" target="_blank" rel="noopener">
                Voir sur Google Maps
              </a>
            </div>
          </div>
        `;
      });
      
      return true;
    }
    
    return false;
  }
}

// Initialize maps when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  // First check if maps are blocked by ad blockers
  const isBlocked = await MapsLoader.checkMapAvailability();
  
  if (!isBlocked) {
    const mapsLoader = new MapsLoader();
    mapsLoader.initializeMaps();
  }
});

// Also initialize if DOM is already loaded
if (document.readyState !== 'loading') {
  MapsLoader.checkMapAvailability().then(isBlocked => {
    if (!isBlocked) {
      const mapsLoader = new MapsLoader();
      mapsLoader.initializeMaps();
    }
  });
}