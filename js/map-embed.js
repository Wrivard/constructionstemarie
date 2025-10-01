// Simple Google Maps iframe error handler
document.addEventListener('DOMContentLoaded', function() {
  // Find all map iframes
  const mapIframes = document.querySelectorAll('iframe.contact16_map');
  
  // Add error handling for each iframe
  mapIframes.forEach(function(iframe) {
    iframe.onerror = function() {
      showMapError(iframe);
    };
    
    // Also check if iframe loaded correctly after a timeout
    setTimeout(function() {
      if (!isIframeLoaded(iframe)) {
        showMapError(iframe);
      }
    }, 5000); // 5 second timeout
  });
  
  // Check if iframe loaded correctly
  function isIframeLoaded(iframe) {
    try {
      // If we can access contentWindow, the iframe is probably loaded
      return !!iframe.contentWindow;
    } catch (e) {
      // If we get an error, the iframe probably failed to load
      return false;
    }
  }
  
  // Show error message when map can't be loaded
  function showMapError(iframe) {
    const container = iframe.parentElement;
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = `
      <div style="padding: 20px; background: #f8f9fa; color: #495057; border-radius: 8px; text-align: center; height: 450px; display: flex; flex-direction: column; justify-content: center;">
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
