document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('checkoutForm');
  
    form.addEventListener('submit', function (e) {
      e.preventDefault();
  
      // Clear previous errors
      clearErrors();
  
      let isValid = true;
  
      // Full Name
      const name = document.getElementById('name');
      if (!/^[A-Za-z\s]+$/.test(name.value.trim())) {
        showError(name, 'Full Name must contain only letters and spaces.');
        isValid = false;
      }
  
      // Email
      const email = document.getElementById('email');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        showError(email, 'Please enter a valid email address.');
        isValid = false;
      }
  
      // Phone Number
      const phone = document.getElementById('phone');
      if (!/^\d{10,15}$/.test(phone.value.trim())) {
        showError(phone, 'Phone number must be between 10 to 15 digits.');
        isValid = false;
      }
  
      // Address
      const address = document.getElementById('address');
      if (address.value.trim() === '') {
        showError(address, 'Address is required.');
        isValid = false;
      }
  
      // Credit Card Number
      const card = document.getElementById('card');
      if (!/^\d{16}$/.test(card.value.trim())) {
        showError(card, 'Credit Card number must be exactly 16 digits.');
        isValid = false;
      }
  
      // Expiry Date
      const expiry = document.getElementById('expiry');
      const currentDate = new Date();
      const selectedDate = new Date(expiry.value);
      selectedDate.setDate(1); // ensure consistent comparison
      if (!expiry.value || selectedDate <= currentDate) {
        showError(expiry, 'Expiry date must be a future date.');
        isValid = false;
      }
  
      // CVV
      const cvv = document.getElementById('cvv');
      if (!/^\d{3}$/.test(cvv.value.trim())) {
        showError(cvv, 'CVV must be exactly 3 digits.');
        isValid = false;
      }
  
      // Submit if valid
      if (isValid) {
        alert('Form submitted successfully!');
        form.reset();
        clearErrors();
      }
    });
  
    // Reset button clears errors
    form.addEventListener('reset', () => {
      clearErrors();
    });
  
    // Helper functions
    function showError(input, message) {
      const errorDiv = document.getElementById(input.id + 'Error');
      errorDiv.textContent = message;
      input.classList.add('input-error');
    }
  
    function clearErrors() {
      const errorMessages = document.querySelectorAll('.error-message');
      errorMessages.forEach(div => div.textContent = '');
  
      const inputs = form.querySelectorAll('.input-error');
      inputs.forEach(input => input.classList.remove('input-error'));
    }
  });
  