// /app/static/js/navigation.js
/**
 * Navigation functionality for Adaptive Auto Hub
 * Handles mobile menu, dropdowns, and accessibility
 */

(function() {
    'use strict';
    
    // Cache DOM elements
    const navToggle = document.querySelector('.nav-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    const mobileNavToggles = document.querySelectorAll('.mobile-nav-toggle');
    const dropdownButtons = document.querySelectorAll('.nav-link--dropdown');
    const flashCloseButtons = document.querySelectorAll('.flash__close');
    
    // State
    let mobileMenuOpen = false;
    
    /**
     * Toggle mobile menu
     */
    function toggleMobileMenu() {
        mobileMenuOpen = !mobileMenuOpen;
        
        navToggle.setAttribute('aria-expanded', mobileMenuOpen);
        mobileMenu.setAttribute('aria-hidden', !mobileMenuOpen);
        mobileMenuOverlay.setAttribute('aria-hidden', !mobileMenuOpen);
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
        
        // Trap focus in mobile menu when open
        if (mobileMenuOpen) {
            mobileMenu.querySelector('a, button').focus();
        }
    }
    
    /**
     * Close mobile menu
     */
    function closeMobileMenu() {
        if (mobileMenuOpen) {
            toggleMobileMenu();
        }
    }
    
    /**
     * Handle dropdown menus for desktop
     */
    function handleDropdowns() {
        dropdownButtons.forEach(button => {
            const dropdown = button.nextElementSibling;
            let timeout;
            
            // Mouse events
            button.addEventListener('mouseenter', () => {
                clearTimeout(timeout);
                button.setAttribute('aria-expanded', 'true');
            });
            
            button.parentElement.addEventListener('mouseleave', () => {
                timeout = setTimeout(() => {
                    button.setAttribute('aria-expanded', 'false');
                }, 100);
            });
            
            // Keyboard events
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const isExpanded = button.getAttribute('aria-expanded') === 'true';
                button.setAttribute('aria-expanded', !isExpanded);
            });
            
            // Close on Escape
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    button.setAttribute('aria-expanded', 'false');
                    button.focus();
                }
            });
        });
    }
    
    /**
     * Handle mobile submenu toggles
     */
    function handleMobileSubmenus() {
        mobileNavToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
                toggle.setAttribute('aria-expanded', !isExpanded);
            });
        });
    }
    
    /**
     * Handle flash message close buttons
     */
    function handleFlashMessages() {
        flashCloseButtons.forEach(button => {
            button.addEventListener('click', () => {
                const flash = button.closest('.flash');
                flash.style.opacity = '0';
                setTimeout(() => flash.remove(), 300);
            });
        });
    }
    
    /**
     * Handle escape key
     */
    function handleEscapeKey(e) {
        if (e.key === 'Escape' && mobileMenuOpen) {
            closeMobileMenu();
            navToggle.focus();
        }
    }
    
    /**
     * Initialize navigation
     */
    function init() {
        if (!navToggle) return;
        
        // Event listeners
        navToggle.addEventListener('click', toggleMobileMenu);
        mobileMenuOverlay.addEventListener('click', closeMobileMenu);
        document.addEventListener('keydown', handleEscapeKey);
        
        // Handle window resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (window.innerWidth > 768 && mobileMenuOpen) {
                    closeMobileMenu();
                }
            }, 250);
        });
        
        // Initialize components
        handleDropdowns();
        handleMobileSubmenus();
        handleFlashMessages();
        
        // Close mobile menu on route change (for SPAs)
        window.addEventListener('popstate', closeMobileMenu);
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
