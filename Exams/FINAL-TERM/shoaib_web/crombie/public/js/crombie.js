// Get the "Previous Tasks" menu link and the mega menu container
const toggle = document.getElementById('megaMenuToggle');
const menu = document.getElementById('megaMenu');

// Function to toggle the mega menu visibility
toggle.addEventListener('click', (e) => {
  e.preventDefault();
  
  // Toggle the display style between none and block
  if (menu.style.display === 'block') {
    menu.style.display = 'none'; // Hide if already visible
  } else {
    menu.style.display = 'block'; // Show if hidden
  }
});

// Close the mega menu if clicked outside of it
document.addEventListener('click', function (e) {
  if (!menu.contains(e.target) && e.target !== toggle) {
    menu.style.display = 'none'; // Close menu if clicked outside
  }
});
