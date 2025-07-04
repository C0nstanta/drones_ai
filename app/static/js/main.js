// /app/static/js/main.js
/**
 * Main JavaScript module for Adaptive Auto Hub
 * Performance-optimized, accessibility-focused functionality
 */

(function() {
  'use strict';
  
  // =====================================================
  // Utility Functions
  // =====================================================
  
  const utils = {
    // Debounce function for performance
    debounce: function(func, wait, immediate) {
      let timeout;
      return function executedFunction() {
        const context = this;
        const args = arguments;
        const later = function() {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    },
    
    // Smooth scroll to element
    smoothScrollTo: function(target, duration = 800) {
      const targetElement = typeof target === 'string' ? document.querySelector(target) : target;
      if (!targetElement) return;
      
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      let startTime = null;
      
      function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
      }
      
      function easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
      }
      
      requestAnimationFrame(animation);
    },
    
    // Check if element is in viewport
    isInViewport: function(element) {
      const rect = element.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    },
    
    // Add class with animation delay
    animateOnScroll: function(elements, className = 'animate-in', threshold = 0.1) {
      const observer = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add(className);
            }, index * 100); // Stagger animation
          }
        });
      }, { threshold });
      
      elements.forEach(el => observer.observe(el));
    }
  };
  
  // =====================================================
  // Navigation Module
  // =====================================================
  
  const Navigation = {
    init: function() {
      this.setupMobileMenu();
      this.setupSmoothScrolling();
      this.setupActiveNavHighlight();
    },
    
    setupMobileMenu: function() {
      const toggle = document.getElementById('nav-toggle');
      const menu = document.getElementById('nav-menu');
      
      if (!toggle || !menu) return;
      
      toggle.addEventListener('click', this.toggleMobileMenu.bind(this));
      
      // Close menu on outside click
      document.addEventListener('click', (e) => {
        if (!toggle.contains(e.target) && !menu.contains(e.target)) {
          this.closeMobileMenu();
        }
      });
      
      // Close menu on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.classList.contains('is-open')) {
          this.closeMobileMenu();
          toggle.focus();
        }
      });
      
      // Close menu when clicking nav links
      menu.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', () => {
          this.closeMobileMenu();
        });
      });
    },
    
    toggleMobileMenu: function() {
      const toggle = document.getElementById('nav-toggle');
      const menu = document.getElementById('nav-menu');
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      
      toggle.setAttribute('aria-expanded', !isOpen);
      toggle.classList.toggle('is-active');
      menu.classList.toggle('is-open');
      
      // Prevent body scroll when menu is open
      document.body.style.overflow = !isOpen ? 'hidden' : '';
    },
    
    closeMobileMenu: function() {
      const toggle = document.getElementById('nav-toggle');
      const menu = document.getElementById('nav-menu');
      
      if (toggle && menu) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.classList.remove('is-active');
        menu.classList.remove('is-open');
        document.body.style.overflow = '';
      }
    },
    
    setupSmoothScrolling: function() {
      // Smooth scroll for anchor links
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
          e.preventDefault();
          const target = document.querySelector(this.getAttribute('href'));
          if (target) {
            utils.smoothScrollTo(target);
          }
        });
      });
    },
    
    setupActiveNavHighlight: function() {
      // Highlight active navigation item based on scroll position
      const sections = document.querySelectorAll('section[id]');
      const navLinks = document.querySelectorAll('.nav__link');
      
      if (sections.length === 0) return;
      
      const highlightNav = utils.debounce(() => {
        let current = '';
        sections.forEach(section => {
          const sectionTop = section.getBoundingClientRect().top;
          if (sectionTop <= 100) {
            current = section.getAttribute('id');
          }
        });
        
        navLinks.forEach(link => {
          link.classList.remove('nav__link--active');
          if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('nav__link--active');
          }
        });
      }, 100);
      
      window.addEventListener('scroll', highlightNav);
    }
  };
  
  // =====================================================
  // Image Lazy Loading
  // =====================================================
  
  const LazyLoad = {
    init: function() {
      this.setupImageLazyLoading();
      this.setupBackgroundImageLazyLoading();
    },
    
    setupImageLazyLoading: function() {
      // Modern browsers with native lazy loading
      if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        });
        return;
      }
      
      // Fallback for older browsers
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });
      
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    },
    
    setupBackgroundImageLazyLoading: function() {
      const bgImageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target;
            element.style.backgroundImage = `url(${element.dataset.bg})`;
            element.classList.remove('lazy-bg');
            bgImageObserver.unobserve(element);
          }
        });
      });
      
      document.querySelectorAll('[data-bg]').forEach(element => {
        bgImageObserver.observe(element);
      });
    }
  };
  
  // =====================================================
  // Form Enhancements
  // =====================================================
  
  const Forms = {
    init: function() {
      this.setupFormValidation();
      this.setupFormSubmission();
    },
    
    setupFormValidation: function() {
      const forms = document.querySelectorAll('form[data-validate]');
      
      forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
          input.addEventListener('blur', () => this.validateField(input));
          input.addEventListener('input', utils.debounce(() => this.validateField(input), 300));
        });
        
        form.addEventListener('submit', (e) => this.validateForm(e, form));
      });
    },
    
    validateField: function(field) {
      const value = field.value.trim();
      const type = field.type;
      const required = field.hasAttribute('required');
      let isValid = true;
      let message = '';
      
      // Clear previous errors
      this.clearFieldError(field);
      
      // Required validation
      if (required && !value) {
        isValid = false;
        message = 'This field is required';
      }
      
      // Email validation
      else if (type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          isValid = false;
          message = 'Please enter a valid email address';
        }
      }
      
      // Phone validation
      else if (type === 'tel' && value) {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
        if (!phoneRegex.test(value)) {
          isValid = false;
          message = 'Please enter a valid phone number';
        }
      }
      
      if (!isValid) {
        this.showFieldError(field, message);
      }
      
      return isValid;
    },
    
    validateForm: function(e, form) {
      const inputs = form.querySelectorAll('input, textarea, select');
      let formIsValid = true;
      
      inputs.forEach(input => {
        if (!this.validateField(input)) {
          formIsValid = false;
        }
      });
      
      if (!formIsValid) {
        e.preventDefault();
        // Focus first invalid field
        const firstInvalid = form.querySelector('.field-error');
        if (firstInvalid) {
          firstInvalid.focus();
        }
      }
    },
    
    showFieldError: function(field, message) {
      field.classList.add('field-error');
      field.setAttribute('aria-invalid', 'true');
      
      let errorElement = field.parentNode.querySelector('.error-message');
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.setAttribute('role', 'alert');
        field.parentNode.appendChild(errorElement);
      }
      
      errorElement.textContent = message;
      field.setAttribute('aria-describedby', errorElement.id || (errorElement.id = `error-${Math.random().toString(36).substr(2, 9)}`));
    },
    
    clearFieldError: function(field) {
      field.classList.remove('field-error');
      field.removeAttribute('aria-invalid');
      
      const errorElement = field.parentNode.querySelector('.error-message');
      if (errorElement) {
        errorElement.remove();
      }
    },
    
    setupFormSubmission: function() {
      // Add loading states to form submissions
      document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function() {
          const submitBtn = this.querySelector('[type="submit"]');
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Sending...';
          }
        });
      });
    }
  };
  
  // =====================================================
  // Scroll Animations
  // =====================================================
  
  const ScrollAnimations = {
    init: function() {
      this.setupScrollAnimations();
      this.setupParallaxEffects();
    },
    
    setupScrollAnimations: function() {
      // Animate elements on scroll
      const animatedElements = document.querySelectorAll('.animate-on-scroll, .card, .hero__content');
      
      if (animatedElements.length === 0) return;
      
      // Add initial state
      animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        el.style.transitionDelay = `${index * 0.1}s`;
      });
      
      // Observe and animate
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
      
      animatedElements.forEach(el => observer.observe(el));
    },
    
    setupParallaxEffects: function() {
      // Simple parallax for hero background
      const hero = document.querySelector('.hero');
      if (!hero) return;
      
      const parallaxScroll = utils.debounce(() => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        hero.style.transform = `translateY(${rate}px)`;
      }, 10);
      
      // Only enable on larger screens for performance
      if (window.innerWidth > 768) {
        window.addEventListener('scroll', parallaxScroll);
      }
    }
  };
  
  // =====================================================
  // Performance Monitoring
  // =====================================================
  
  const Performance = {
    init: function() {
      this.monitorPageLoad();
      this.setupErrorTracking();
    },
    
    monitorPageLoad: function() {
      window.addEventListener('load', () => {
        // Log Core Web Vitals if available
        if ('web-vital' in window) {
          console.log('Page loaded successfully');
        }
        
        // Remove loading states
        document.body.classList.remove('loading');
      });
    },
    
    setupErrorTracking: function() {
      window.addEventListener('error', (e) => {
        console.error('JavaScript error:', e.error);
        // In production, send to error tracking service
      });
      
      window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled promise rejection:', e.reason);
        // In production, send to error tracking service
      });
    }
  };
  
  // =====================================================
  // Accessibility Enhancements
  // =====================================================
  
  const Accessibility = {
    init: function() {
      this.setupKeyboardNavigation();
      this.setupFocusManagement();
      this.setupReducedMotion();
    },
    
    setupKeyboardNavigation: function() {
      // Skip link functionality
      const skipLink = document.querySelector('.skip-link');
      if (skipLink) {
        skipLink.addEventListener('click', (e) => {
          e.preventDefault();
          const target = document.querySelector(skipLink.getAttribute('href'));
          if (target) {
            target.focus();
            target.scrollIntoView();
          }
        });
      }
      
      // Dropdown keyboard navigation
      document.querySelectorAll('[aria-haspopup]').forEach(trigger => {
        trigger.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            trigger.click();
          }
        });
      });
    },
    
    setupFocusManagement: function() {
      // Trap focus in modal dialogs
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          const modal = document.querySelector('.modal.is-open');
          if (modal) {
            this.trapFocus(e, modal);
          }
        }
      });
    },
    
    trapFocus: function(e, container) {
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    },
    
    setupReducedMotion: function() {
      // Respect user's motion preferences
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.style.setProperty('--transition-fast', '0ms');
        document.documentElement.style.setProperty('--transition-normal', '0ms');
        document.documentElement.style.setProperty('--transition-slow', '0ms');
      }
    }
  };
  
  // =====================================================
  // Application Initialization
  // =====================================================
  
  const App = {
    init: function() {
      // Initialize all modules
      Navigation.init();
      LazyLoad.init();
      Forms.init();
      ScrollAnimations.init();
      Performance.init();
      Accessibility.init();
      
      console.log('Adaptive Auto Hub - Application initialized');
    }
  };
  
  // =====================================================
  // DOM Ready and Load Events
  // =====================================================
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', App.init);
  } else {
    App.init();
  }
  
  // Expose utilities globally for other scripts
  window.AdaptiveAutoHub = {
    utils: utils,
    Navigation: Navigation,
    LazyLoad: LazyLoad,
    Forms: Forms,
    ScrollAnimations: ScrollAnimations
  };

})();
