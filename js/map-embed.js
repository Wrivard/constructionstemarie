// Google Maps Embed API Integration
document.addEventListener('DOMContentLoaded', function() {
  // Create static map embed for each map container
  const mapContainers = document.querySelectorAll('.contact16_map-wrapper');
  
  mapContainers.forEach(function(container) {
    // Check if there's already an iframe (our implementation) or a map div (original implementation)
    const existingMap = container.querySelector('.contact16_map');
    if (!existingMap) return;
    
    // Get coordinates from the map element
    let lat = 45.8506;
    let lng = -73.8370;
    
    if (existingMap.hasAttribute('data-widget-latlng')) {
      const latlng = existingMap.getAttribute('data-widget-latlng');
      const coords = latlng.split(',').map(coord => parseFloat(coord.trim()));
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        lat = coords[0];
        lng = coords[1];
      }
    }
    
    // Get title and tooltip
    const title = existingMap.getAttribute('title') || 'Construction Ste-Marie';
    const tooltip = existingMap.getAttribute('data-widget-tooltip') || 'Construction Ste-Marie Inc.';
    
    // Create direct link to Google Maps as fallback
    const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    
    // Create static map image with link
    const mapHTML = `
      <div class="contact16_map" style="width:100%; height:450px; position:relative; overflow:hidden;">
        <a href="${mapUrl}" target="_blank" rel="noopener" style="display:block; width:100%; height:100%;">
          <img 
            src="https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=14&size=800x450&markers=color:red%7C${lat},${lng}&key=AIzaSyDQ7P9ozNLmbeNK6WkiVjyiNSBjf8-LsCQ" 
            alt="${title}" 
            style="width:100%; height:100%; object-fit:cover;"
          />
          <div style="position:absolute; bottom:10px; left:10px; background:white; padding:5px 10px; border-radius:3px;">
            <strong>${title}</strong><br>${tooltip}
          </div>
        </a>
      </div>
    `;
    
    // Replace the existing map with our static map
    container.innerHTML = mapHTML;
  });
});
