// Google Maps Loader - Secure API Key Loading
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
      
      script.onerror = () => {
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
      
      mapWidgets.forEach(widget => {
        this.initializeMapWidget(widget);
      });
      
    } catch (error) {
      console.error('Failed to initialize Google Maps:', error);
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
  }
}

// Initialize maps when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const mapsLoader = new MapsLoader();
  mapsLoader.initializeMaps();
});

// Also initialize if DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const mapsLoader = new MapsLoader();
    mapsLoader.initializeMaps();
  });
} else {
  const mapsLoader = new MapsLoader();
  mapsLoader.initializeMaps();
}
