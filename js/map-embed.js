// Google Maps Embed API Integration
document.addEventListener('DOMContentLoaded', function() {
  // Find all map embed iframes
  const mapEmbeds = document.querySelectorAll('iframe.contact16_map');
  
  // Replace API key placeholder in each iframe
  mapEmbeds.forEach(async function(iframe) {
    try {
      // Get the API key from our secure endpoint
      const response = await fetch('/api/maps-config');
      const data = await response.json();
      
      if (data.apiKey) {
        // Replace the placeholder with the actual API key
        const src = iframe.getAttribute('src');
        const updatedSrc = src.replace('${GOOGLE_MAPS_API_KEY}', data.apiKey);
        iframe.setAttribute('src', updatedSrc);
      } else {
        console.error('API key not available');
        showMapError(iframe);
      }
    } catch (error) {
      console.error('Failed to load Google Maps API key:', error);
      showMapError(iframe);
    }
  });
  
  // Show error message when map can't be loaded
  function showMapError(iframe) {
    const container = iframe.parentElement;
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = `
      <div style="padding: 20px; background: #f8d7da; color: #842029; border-radius: 8px; text-align: center; height: 450px; display: flex; flex-direction: column; justify-content: center;">
        <h3>Carte non disponible</h3>
        <p>Impossible de charger la carte Google Maps.</p>
        <p>Veuillez réessayer plus tard ou nous contacter directement.</p>
        <div style="margin-top: 15px; padding: 10px; background: #e9ecef; border-radius: 4px;">
          <strong>Construction Ste-Marie</strong><br>
          Saint-Roch-de-l'Achigan<br>
          <a href="https://www.google.com/maps?q=45.8506,-73.8370" target="_blank" rel="noopener">
            Voir sur Google Maps
          </a>
        </div>
      </div>
    `;
    container.replaceChild(errorDiv, iframe);
  }
});
