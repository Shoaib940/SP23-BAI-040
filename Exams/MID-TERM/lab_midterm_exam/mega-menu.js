// Get the menu and button elements
const previousTasksButton = document.getElementById('megaMenuToggle');
const megaMenu = document.getElementById('megaMenu');

// Add event listener for toggling Mega Menu visibility
previousTasksButton.addEventListener('click', function(event) {
    // Toggle the Mega Menu's display style
    megaMenu.style.display = megaMenu.style.display === 'block' ? 'none' : 'block';
    
    // Prevent the click from propagating to the document
    event.stopPropagation();
});

// Close the Mega Menu if the user clicks outside of it
document.addEventListener('click', function(event) {
    // Check if the click was outside the Mega Menu and button
    if (!megaMenu.contains(event.target) && event.target !== previousTasksButton) {
        megaMenu.style.display = 'none';
    }
});
