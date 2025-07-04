// /app/static/js/animations/navigation-enhanced.js
/**
 * Enhanced Navigation System
 * Professional animations with mobile support
 */

class NavigationEnhanced {
  constructor() {
    this.header = document.querySelector('.header');
    this.navLinks = document.querySelectorAll('.nav-link');
    this.navToggle = document.querySelector('.nav-toggle');
    this.mobileMenu = document.querySelector('.mobile-menu');
    this.mobileOverlay = document.querySelector('.mobile-menu-overlay');
    this.dropdowns = document.querySelectorAll('.nav-item--dropdown');
    
    this.scrollPosition = 0;
    this.isScrolling = false;
    this.isMobileMenuOpen = false;
    
    this.init();
  }
  
  init() {
    this.setupScrollEffects();
    this.setupHoverEffects();
    this.setupMobileMenu();
    this.setupDropdowns();
    this.setupScrollProgress();
    this.setupActiveStates();
  }
  
  /**
   * Scroll-based header effects
   */
  setupScrollEffects() {
    let ticking = false;
    
    const updateHeader = () => {
      const currentScroll = window.pageYOffset;
      
      // Add scrolled class
      if (currentScroll > 50) {
        this.header.classList.add('header--scrolled');
      } else {
        this.header.classList.remove('header--scrolled');
      }
      
      // Hide/show header on scroll
      if (currentScroll > this.scrollPosition && currentScroll > 100) {
        this.header.style.transform = 'translateY(-100%)';
      } else {
        this.header.style.transform = 'translateY(0)';
      }
      
      this.scrollPosition = currentScroll;
      ticking = false;
    };
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    });
  }
  
  /**
   * Enhanced hover effects with magnetic behavior
   */
  setupHoverEffects() {
    const ctaButton = document.querySelector('.nav-link--cta');
    
    if (ctaButton) {
      ctaButton.addEventListener('mousemove', (e) => {
        const rect = ctaButton.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        // Subtle magnetic effect
        const moveX = x * 0.1;
        const moveY = y * 0.1;
        
        ctaButton.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });
      
      ctaButton.addEventListener('mouseleave', () => {
        ctaButton.style.transform = '';
      });
    }
    
    // Add ripple effect to clickable elements
    this.navLinks.forEach(link => {
      link.classList.add('ripple');
      
      link.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple-effect');
        
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
      });
    });
  }
  
  /**
   * Mobile menu functionality
   */
  setupMobileMenu() {
    if (!this.navToggle || !this.mobileMenu) return;
    
    this.navToggle.addEventListener('click', () => {
      this.toggleMobileMenu();
    });
    
    this.mobileOverlay?.addEventListener('click', () => {
      this.closeMobileMenu();
    });
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMobileMenuOpen) {
        this.closeMobileMenu();
      }
    });
    
    // Prevent body scroll when menu is open
    const preventDefault = (e) => e.preventDefault();
    
    this.mobileMenu.addEventListener('touchstart', () => {
      document.body.style.overflow = 'hidden';
    });
    
    this.mobileMenu.addEventListener('touchend', () => {
      if (!this.isMobileMenuOpen) {
        document.body.style.overflow = '';
      }
    });
  }
  
  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    
    this.navToggle.setAttribute('aria-expanded', this.isMobileMenuOpen);
    this.mobileMenu.setAttribute('aria-hidden', !this.isMobileMenuOpen);
    this.mobileOverlay?.setAttribute('aria-hidden', !this.isMobileMenuOpen);
    
    if (this.isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      
      // Reset and trigger animations
      const items = this.mobileMenu.querySelectorAll('.mobile-nav-item');
      items.forEach((item, index) => {
        item.style.animation = 'none';
        setTimeout(() => {
          item.style.animation = '';
        }, index * 50);
      });
    } else {
      document.body.style.overflow = '';
    }
  }
  
  closeMobileMenu() {
    if (this.isMobileMenuOpen) {
      this.toggleMobileMenu();
    }
  }
  
  /**
   * Enhanced dropdown functionality
   */
  setupDropdowns() {
    this.dropdowns.forEach(dropdown => {
      const trigger = dropdown.querySelector('.nav-link--dropdown');
      const menu = dropdown.querySelector('.nav-dropdown');
      let timeout;
      
      if (!trigger || !menu) return;
      
      // Mouse events
      dropdown.addEventListener('mouseenter', () => {
        clearTimeout(timeout);
        trigger.setAttribute('aria-expanded', 'true');
        
        // Reset and trigger stagger animations
        const items = menu.querySelectorAll('.nav-dropdown-item');
        items.forEach((item, index) => {
          item.style.animation = 'none';
          requestAnimationFrame(() => {
            item.style.animation = '';
          });
        });
      });
      
      dropdown.addEventListener('mouseleave', () => {
        timeout = setTimeout(() => {
          trigger.setAttribute('aria-expanded', 'false');
        }, 200);
      });
      
      // Keyboard navigation
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const isOpen = trigger.getAttribute('aria-expanded') === 'true';
          trigger.setAttribute('aria-expanded', !isOpen);
        }
      });
    });
  }
  
  /**
   * Scroll progress indicator
   */
  setupScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.innerHTML = '<div class="scroll-progress-bar"></div>';
    document.body.appendChild(progressBar);
    
    const bar = progressBar.querySelector('.scroll-progress-bar');
    
    const updateProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (window.pageYOffset / scrollHeight) * 100;
      bar.style.transform = `translateX(${scrolled - 100}%)`;
    };
    
    window.addEventListener('scroll', () => {
      requestAnimationFrame(updateProgress);
    });
  }
  
  /**
   * Active link states based on scroll position
   */
  setupActiveStates() {
    const sections = document.querySelectorAll('section[id]');
    
    const updateActiveLink = () => {
      const scrollY = window.pageYOffset;
      
      sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          this.navLinks.forEach(link => {
            link.classList.remove('nav-link--active');
            if (link.getAttribute('href') === `#${sectionId}`) {
              link.classList.add('nav-link--active');
            }
          });
        }
      });
    };
    
    window.addEventListener('scroll', () => {
      requestAnimationFrame(updateActiveLink);
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new NavigationEnhanced();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NavigationEnhanced;
}
