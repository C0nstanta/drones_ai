// /app/static/js/mobile-menu-fix.js
// Complete Mobile Menu JavaScript for Adaptive Auto Hub
// Vanilla JavaScript implementation with touch gesture support and accessibility

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        mobileBreakpoint: 768,
        animationDuration: 300,
        swipeThreshold: 50,
        menuWidth: 280,
        classNames: {
            menuOpen: 'is-open',
            bodyLocked: 'mobile-menu-open',
            menuActive: 'is-active'
        }
    };

    // State management
    const state = {
        isMenuOpen: false,
        scrollPosition: 0,
        touchStartX: 0,
        touchStartY: 0,
        isSwiping: false
    };

    // DOM element cache
    const elements = {};

    /**
     * Initialize mobile menu system
     */
    function init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initialize);
        } else {
            initialize();
        }
    }

    /**
     * Main initialization function
     */
    function initialize() {
        // Cache DOM elements
        cacheElements();
        
        // Create mobile menu if it doesn't exist
        if (!elements.mobileMenu) {
            createMobileMenu();
        }
        
        // Create overlay if it doesn't exist
        if (!elements.overlay) {
            createOverlay();
        }
        
        // Set up event listeners
        bindEvents();
        
        // Initialize ARIA attributes
        initializeAccessibility();
        
        // Check viewport on load
        handleResize();
        
        console.log('Mobile menu initialized successfully');
    }

    /**
     * Cache DOM elements for performance
     */
    function cacheElements() {
        elements.header = document.querySelector('.header, header, .site-header');
        elements.toggle = document.querySelector('.nav__toggle, .menu-toggle, .hamburger, button[aria-label*="menu"]');
        elements.nav = document.querySelector('.nav__menu, .nav-menu, nav ul, .navigation ul');
        elements.mobileMenu = document.querySelector('.mobile-menu, .nav__mobile-menu');
        elements.overlay = document.querySelector('.mobile-menu-overlay');
        elements.body = document.body;
    }

    /**
     * Create mobile menu structure
     */
    function createMobileMenu() {
        if (!elements.nav) {
            console.warn('Navigation menu not found');
            return;
        }

        const mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu';
        mobileMenu.setAttribute('role', 'dialog');
        mobileMenu.setAttribute('aria-modal', 'true');
        mobileMenu.setAttribute('aria-label', 'Navigation menu');
        
        // Clone navigation items
        const navClone = elements.nav.cloneNode(true);
        navClone.classList.add('mobile-menu-nav');
        
        mobileMenu.innerHTML = `
            <div class="mobile-menu-header">
                <span class="mobile-menu-title">Menu</span>
                <button type="button" class="mobile-menu-close" aria-label="Close menu">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
            </div>
            <div class="mobile-menu-content">
                <!-- Navigation items will be inserted here -->
            </div>
        `;
        
        // Insert cloned navigation
        const content = mobileMenu.querySelector('.mobile-menu-content');
        content.appendChild(navClone);
        
        // Process links for mobile
        processNavigationLinks(content);
        
        // Add to body
        document.body.appendChild(mobileMenu);
        elements.mobileMenu = mobileMenu;
    }

    /**
     * Create overlay element
     */
    function createOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'mobile-menu-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        document.body.appendChild(overlay);
        elements.overlay = overlay;
    }

    /**
     * Process navigation links for mobile menu
     */
    function processNavigationLinks(container) {
        const links = container.querySelectorAll('a');
        
        links.forEach(link => {
            // Add mobile-specific classes
            link.classList.add('mobile-menu-link');
            
            // Handle current page highlighting
            if (link.href === window.location.href) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            }
            
            // Close menu on link click (for same-page anchors)
            if (link.getAttribute('href').startsWith('#')) {
                link.addEventListener('click', () => {
                    closeMenu();
                });
            }
        });
        
        // Handle dropdowns/submenus
        const dropdowns = container.querySelectorAll('.has-dropdown, .dropdown');
        dropdowns.forEach(setupDropdown);
    }

    /**
     * Setup dropdown functionality
     */
    function setupDropdown(dropdown) {
        const toggle = dropdown.querySelector('a, button');
        const submenu = dropdown.querySelector('ul, .dropdown-menu');
        
        if (toggle && submenu) {
            toggle.addEventListener('click', (e) => {
                if (submenu.contains(e.target)) return;
                
                e.preventDefault();
                const isOpen = dropdown.classList.contains('is-open');
                
                // Close all other dropdowns
                document.querySelectorAll('.has-dropdown.is-open').forEach(item => {
                    if (item !== dropdown) {
                        item.classList.remove('is-open');
                    }
                });
                
                // Toggle current dropdown
                dropdown.classList.toggle('is-open', !isOpen);
                toggle.setAttribute('aria-expanded', !isOpen);
            });
        }
    }

    /**
     * Bind all event listeners
     */
    function bindEvents() {
        // Toggle button click
        if (elements.toggle) {
            elements.toggle.addEventListener('click', toggleMenu);
        }
        
        // Close button click
        const closeBtn = elements.mobileMenu?.querySelector('.mobile-menu-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeMenu);
        }
        
        // Overlay click
        if (elements.overlay) {
            elements.overlay.addEventListener('click', closeMenu);
        }
        
        // Touch events for swipe gestures
        if (elements.mobileMenu && 'ontouchstart' in window) {
            elements.mobileMenu.addEventListener('touchstart', handleTouchStart, { passive: true });
            elements.mobileMenu.addEventListener('touchmove', handleTouchMove, { passive: true });
            elements.mobileMenu.addEventListener('touchend', handleTouchEnd);
        }
        
        // Keyboard events
        document.addEventListener('keydown', handleKeyDown);
        
        // Window resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(handleResize, 250);
        });
        
        // Prevent body scroll when menu is open
        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    /**
     * Initialize accessibility attributes
     */
    function initializeAccessibility() {
        if (elements.toggle) {
            elements.toggle.setAttribute('aria-expanded', 'false');
            elements.toggle.setAttribute('aria-controls', 'mobile-menu');
            
            if (!elements.toggle.hasAttribute('aria-label')) {
                elements.toggle.setAttribute('aria-label', 'Toggle navigation menu');
            }
        }
        
        if (elements.mobileMenu) {
            elements.mobileMenu.setAttribute('id', 'mobile-menu');
            elements.mobileMenu.setAttribute('aria-hidden', 'true');
        }
    }

    /**
     * Toggle menu open/closed
     */
    function toggleMenu(e) {
        if (e) e.preventDefault();
        
        if (state.isMenuOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    /**
     * Open mobile menu
     */
    function openMenu() {
        if (state.isMenuOpen || !elements.mobileMenu) return;
        
        // Update state
        state.isMenuOpen = true;
        state.scrollPosition = window.pageYOffset;
        
        // Update classes
        elements.mobileMenu.classList.add(CONFIG.classNames.menuOpen);
        elements.overlay?.classList.add(CONFIG.classNames.menuOpen);
        elements.toggle?.classList.add(CONFIG.classNames.menuActive);
        elements.body.classList.add(CONFIG.classNames.bodyLocked);
        
        // Update ARIA
        elements.toggle?.setAttribute('aria-expanded', 'true');
        elements.mobileMenu.setAttribute('aria-hidden', 'false');
        
        // Lock body scroll
        elements.body.style.top = `-${state.scrollPosition}px`;
        
        // Focus management
        setTimeout(() => {
            const firstFocusable = elements.mobileMenu.querySelector('button, a');
            firstFocusable?.focus();
        }, CONFIG.animationDuration);
        
        // Announce to screen readers
        announceToScreenReader('Navigation menu opened');
        
        // Dispatch custom event
        document.dispatchEvent(new CustomEvent('mobileMenuOpen'));
    }

    /**
     * Close mobile menu
     */
    function closeMenu() {
        if (!state.isMenuOpen || !elements.mobileMenu) return;
        
        // Update state
        state.isMenuOpen = false;
        
        // Update classes
        elements.mobileMenu.classList.remove(CONFIG.classNames.menuOpen);
        elements.overlay?.classList.remove(CONFIG.classNames.menuOpen);
        elements.toggle?.classList.remove(CONFIG.classNames.menuActive);
        elements.body.classList.remove(CONFIG.classNames.bodyLocked);
        
        // Update ARIA
        elements.toggle?.setAttribute('aria-expanded', 'false');
        elements.mobileMenu.setAttribute('aria-hidden', 'true');
        
        // Restore body scroll
        elements.body.style.top = '';
        window.scrollTo(0, state.scrollPosition);
        
        // Return focus to toggle button
        elements.toggle?.focus();
        
        // Announce to screen readers
        announceToScreenReader('Navigation menu closed');
        
        // Close any open dropdowns
        elements.mobileMenu.querySelectorAll('.is-open').forEach(dropdown => {
            dropdown.classList.remove('is-open');
        });
        
        // Dispatch custom event
        document.dispatchEvent(new CustomEvent('mobileMenuClose'));
    }

    /**
     * Handle touch start for swipe gestures
     */
    function handleTouchStart(e) {
        state.touchStartX = e.touches[0].clientX;
        state.touchStartY = e.touches[0].clientY;
        state.isSwiping = false;
    }

    /**
     * Handle touch move for swipe detection
     */
    function handleTouchMove(e) {
        if (!state.touchStartX || !state.touchStartY) return;
        
        const touchEndX = e.touches[0].clientX;
        const touchEndY = e.touches[0].clientY;
        
        const deltaX = touchEndX - state.touchStartX;
        const deltaY = Math.abs(touchEndY - state.touchStartY);
        
        // Detect horizontal swipe
        if (Math.abs(deltaX) > 10 && deltaY < 50) {
            state.isSwiping = true;
        }
    }

    /**
     * Handle touch end for swipe gestures
     */
    function handleTouchEnd(e) {
        if (!state.isSwiping) return;
        
        const touchEndX = e.changedTouches[0].clientX;
        const deltaX = touchEndX - state.touchStartX;
        
        // Swipe right to close
        if (deltaX > CONFIG.swipeThreshold) {
            closeMenu();
        }
        
        // Reset touch state
        state.touchStartX = 0;
        state.touchStartY = 0;
        state.isSwiping = false;
    }

    /**
     * Handle keyboard navigation
     */
    function handleKeyDown(e) {
        // Close on Escape
        if (e.key === 'Escape' && state.isMenuOpen) {
            closeMenu();
            return;
        }
        
        // Tab trapping when menu is open
        if (e.key === 'Tab' && state.isMenuOpen && elements.mobileMenu) {
            const focusableElements = elements.mobileMenu.querySelectorAll(
                'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );
            
            if (focusableElements.length === 0) return;
            
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    /**
     * Handle window resize
     */
    function handleResize() {
        // Close menu if resizing to desktop
        if (window.innerWidth > CONFIG.mobileBreakpoint && state.isMenuOpen) {
            closeMenu();
        }
        
        // Update menu width for very small screens
        if (elements.mobileMenu && window.innerWidth < 320) {
            elements.mobileMenu.style.width = '90vw';
        } else if (elements.mobileMenu) {
            elements.mobileMenu.style.width = '';
        }
    }

    /**
     * Handle scroll events
     */
    function handleScroll() {
        // Prevent scrolling when menu is open
        if (state.isMenuOpen && elements.body.classList.contains(CONFIG.classNames.bodyLocked)) {
            window.scrollTo(0, state.scrollPosition);
        }
    }

    /**
     * Announce to screen readers
     */
    function announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.classList.add('sr-only');
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            announcement.remove();
        }, 1000);
    }

    /**
     * Public API
     */
    const MobileMenu = {
        init: init,
        open: openMenu,
        close: closeMenu,
        toggle: toggleMenu,
        isOpen: () => state.isMenuOpen,
        destroy: () => {
            closeMenu();
            // Remove event listeners
            elements.toggle?.removeEventListener('click', toggleMenu);
            document.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll);
        }
    };

    // Initialize
    init();

    // Export for use in other scripts
    window.MobileMenu = MobileMenu;

})();
