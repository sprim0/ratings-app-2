var sortButton = document.getElementById('sort-button');
var sortDirection = 'desc'; // Start with highest to lowest
var albumsList = document.getElementById('albums-list');

// Use event delegation for star rating clicks
if (albumsList) {
  albumsList.addEventListener('click', function(event) {
    // Check if clicked element is a star
    if (event.target.classList.contains('star') || event.target.closest('.star')) {
      const star = event.target.classList.contains('star') ? event.target : event.target.closest('.star');
      const starRating = star.closest('.star-rating');
      const album = starRating.getAttribute('data-album');
      const artist = starRating.getAttribute('data-artist') || '';
      const rating = parseInt(star.getAttribute('data-rating'));
      
      fetch('/albums', {
        method: 'put',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          'album': album,
          'artist': artist,
          'rating': rating
        })
      })
      .then(function (response) {
        if (response.ok) return response.json()
      })
      .then(function (data) {
        window.location.reload()
      })
    }
    
    // Check if clicked element is a trash icon or delete icon container
    if (event.target.classList.contains('fa-trash') || 
        event.target.closest('.fa-trash') || 
        event.target.classList.contains('delete-icon') ||
        event.target.closest('.delete-icon')) {
      const deleteElement = event.target.classList.contains('delete-icon') 
        ? event.target 
        : event.target.closest('.delete-icon');
      const albumCard = deleteElement.closest('.album-card');
      const album = albumCard.getAttribute('data-album');
      const artist = albumCard.getAttribute('data-artist') || '';
      
      fetch('/messages', {
        method: 'delete',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          'album': album,
          'artist': artist
        })
      }).then(function (response) {
        window.location.reload()
      })
    }
  });
}

// Handle sort button click
if (sortButton && albumsList) {
  sortButton.addEventListener('click', function() {
    const albumCards = Array.from(albumsList.querySelectorAll('.album-card'));
    
    // Toggle sort direction
    sortDirection = sortDirection === 'desc' ? 'asc' : 'desc';
    
    // Sort albums by rating
    albumCards.sort(function(a, b) {
      const ratingA = parseInt(a.getAttribute('data-rating')) || 0;
      const ratingB = parseInt(b.getAttribute('data-rating')) || 0;
      
      if (sortDirection === 'desc') {
        return ratingB - ratingA; // Highest to lowest
      } else {
        return ratingA - ratingB; // Lowest to highest
      }
    });
    
    // Clear the list and re-append sorted cards
    albumsList.innerHTML = '';
    albumCards.forEach(function(card) {
      albumsList.appendChild(card);
    });
    
    // Update button text
    sortButton.textContent = sortDirection === 'desc' 
      ? 'Sort by Rating (Highest to Lowest)' 
      : 'Sort by Rating (Lowest to Highest)';
  });
}

// completed with the help of Michael Kazin and Cursor (AI)