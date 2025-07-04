// app/static/js/main.js - Main frontend script (bundled into js_all)
// Handles mobile nav toggle and any other interactive behavior.
document.addEventListener('DOMContentLoaded', function() {
  const navToggle = document.querySelector('.nav__toggle');
  const navMenu = document.getElementById('nav-menu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function() {
      // Toggle mobile menu visibility
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !isExpanded);
      navMenu.classList.toggle('nav__menu--open');
    });
  }
});

