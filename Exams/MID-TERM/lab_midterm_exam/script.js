window.addEventListener("DOMContentLoaded", valid);

function valid() {
  const form = document.getElementById("checkoutForm");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    let isValid = true;

    document.querySelectorAll(".error-message").forEach(el => el.textContent = "");
    document.querySelectorAll("input").forEach(el => el.classList.remove("invalid"));

    const name = form.name;
    if (!name.value.match(/^[A-Za-z\s]+$/)) {
      showError(name, "Name must contain only alphabets.");
      isValid = false;
    }

    const email = form.email;
    if (!email.checkValidity()) {
      showError(email, "Please enter a valid email.");
      isValid = false;
    }

    const phone = form.phone;
    if (!phone.value.match(/^\d{10,15}$/)) {
      showError(phone, "Phone number must be 10 to 15 digits.");
      isValid = false;
    }

    const address = form.address;
    if (!address.value.trim()) {
      showError(address, "Address is required.");
      isValid = false;
    }

    const card = form.card;
    if (!card.value.match(/^\d{16}$/)) {
      showError(card, "Credit Card Number must be 16 digits.");
      isValid = false;
    }

    const expiryValue = form.expiry.value;
    const expiryDate = new Date(expiryValue);
    const today = new Date();
    today.setDate(1); // compare by month
    today.setHours(0, 0, 0, 0);

    if (!expiryValue || expiryDate <= today) {
      showError(form.expiry, "Expiry date must be in the future.");
      isValid = false;
    }

    const cvv = form.cvv;
    if (!cvv.value.match(/^\d{3}$/)) {
      showError(cvv, "CVV must be 3 digits.");
      isValid = false;
    }

    if (isValid) {
      displayData();
      form.reset();
    }
  });

  form.addEventListener("reset", function () {
    document.querySelectorAll(".error-message").forEach(el => el.textContent = "");
    document.querySelectorAll("input").forEach(el => el.classList.remove("invalid"));
    document.getElementById("submittedData").innerHTML = "";
  });

  function showError(input, message) {
    input.classList.add("invalid");
    document.getElementById(input.name + "Error").textContent = message;
  }
}
