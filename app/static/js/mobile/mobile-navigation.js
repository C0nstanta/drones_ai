// /app/static/js/mobile/mobile-navigation.js
// Enhanced mobile navigation with touch gestures and performance optimizations
// Follows performance-first principles with vanilla JavaScript

(function() {
    'use strict';

    // Cache DOM elements
    const elements = {
        toggle: null,
        mobileMenu: null,
        overlay: null,
        closeBtn: null,
        dropdownToggles: [],
        body: document.body,
        header: document.querySelector('.header')
    };

    // State management
    const state = {
        isOpen: false,
        touchStartX: 0,
        touchStartY: 0,
        touchEndX: 0,
        touchEndY: 0,
        scrollPosition: 0
    };

    // Configuration
    const config = {
        swipeThreshold: 50,
        animationDuration: 300,
        breakpoint: 768
    };

    /**
     * Initialize mobile navigation
     */
    function init() {
        // Query DOM elements
        elements.toggle = document.querySelector('.nav__toggle');
        elements.mobileMenu = document.querySelector('.nav__mobile-menu');
        elements.overlay = document.querySelector('.mobile-menu-overlay');
        elements.closeBtn = document.querySelector('.mobile-menu__close');
        elements.dropdownToggles = document.querySelectorAll('.mobile-menu__item--has-dropdown .mobile-menu__link');

        if (!elements.toggle || !elements.mobileMenu) {
            console.warn('Mobile navigation elements not found');
            return;
        }

        // Bind events
        bindEvents();

        // Initialize ARIA attributes
        initializeAria();

        // Check initial viewport
        handleResize();
    }

    /**
     * Bind all event listeners
     */
    function bindEvents() {
        // Toggle button
        elements.toggle.addEventListener('click', toggleMenu);
        
        // Close button
        if (elements.closeBtn) {
            elements.closeBtn.addEventListener('click', closeMenu);
        }

        // Overlay click
        if (elements.overlay) {
            elements.overlay.addEventListener('click', closeMenu);
        }

        // Dropdown toggles
        elements.dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', handleDropdownToggle);
        });

        // Touch gestures
        if ('ontouchstart' in window) {
            elements.mobileMenu.addEventListener('touchstart', handleTouchStart, { passive: true });
            elements.mobileMenu.addEventListener('touchend', handleTouchEnd, { passive: true });
        }

        // Escape key
        document.addEventListener('keydown', handleKeyDown);

        // Window resize
        window.addEventListener('resize', debounce(handleResize, 250));

        // Prevent scrolling when menu is open
        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    /**
     * Initialize ARIA attributes for accessibility
     */
    function initializeAria() {
        elements.toggle.setAttribute('aria-expanded', 'false');
        elements.toggle.setAttribute('aria-controls', 'mobile-menu');
        elements.toggle.setAttribute('aria-label', 'Toggle navigation menu');
        
        elements.mobileMenu.setAttribute('id', 'mobile-menu');
        elements.mobileMenu.setAttribute('aria-hidden', 'true');
        
        if (elements.overlay) {
            elements.overlay.setAttribute('aria-hidden', 'true');
        }
    }

    /**
     * Toggle mobile menu
     */
    function toggleMenu(e) {
        e.preventDefault();
        state.isOpen ? closeMenu() : openMenu();
    }

    /**
     * Open mobile menu
     */
    function openMenu() {
        if (state.isOpen) return;

        state.isOpen = true;
        state.scrollPosition = window.pageYOffset;

        // Update classes
        elements.toggle.classList.add('is-active');
        elements.mobileMenu.classList.add('is-active');
        elements.overlay?.classList.add('is-active');
        elements.body.classList.add('mobile-menu-open');

        // Update ARIA
        elements.toggle.setAttribute('aria-expanded', 'true');
        elements.mobileMenu.setAttribute('aria-hidden', 'false');
        elements.overlay?.setAttribute('aria-hidden', 'false');

        // Lock body scroll
        elements.body.style.top = `-${state.scrollPosition}px`;

        // Focus management
        elements.mobileMenu.focus();

        // Announce to screen readers
        announceToScreenReader('Navigation menu opened');
    }

    /**
     * Close mobile menu
     */
    function closeMenu() {
        if (!state.isOpen) return;

        state.isOpen = false;

        // Update classes
        elements.toggle.classList.remove('is-active');
        elements.mobileMenu.classList.remove('is-active');
        elements.overlay?.classList.remove('is-active');
        elements.body.classList.remove('mobile-menu-open');

        // Update ARIA
        elements.toggle.setAttribute('aria-expanded', 'false');
        elements.mobileMenu.setAttribute('aria-hidden', 'true');
        elements.overlay?.setAttribute('aria-hidden', 'true');

        // Restore body scroll
        elements.body.style.top = '';
        window.scrollTo(0, state.scrollPosition);

        // Return focus to toggle
        elements.toggle.focus();

        // Announce to screen readers
        announceToScreenReader('Navigation menu closed');
    }

    /**
     * Handle dropdown toggle
     */
    function handleDropdownToggle(e) {
        e.preventDefault();
        
        const parent = e.currentTarget.parentElement;
        const wasExpanded = parent.classList.contains('mobile-menu__item--expanded');
        
        // Close all dropdowns
        document.querySelectorAll('.mobile-menu__item--expanded').forEach(item => {
            item.classList.remove('mobile-menu__item--expanded');
            item.querySelector('.mobile-menu__link').setAttribute('aria-expanded', 'false');
        });

        // Toggle current dropdown
        if (!wasExpanded) {
            parent.classList.add('mobile-menu__item--expanded');
            e.currentTarget.setAttribute('aria-expanded', 'true');
        }
    }

    /**
     * Handle touch start for swipe gestures
     */
    function handleTouchStart(e) {
        state.touchStartX = e.changedTouches[0].screenX;
        state.touchStartY = e.changedTouches[0].screenY;
    }

    /**
     * Handle touch end for swipe gestures
     */
    function handleTouchEnd(e) {
        state.touchEndX = e.changedTouches[0].screenX;
        state.touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }

    /**
     * Process swipe gesture
     */
    function handleSwipe() {
        const deltaX = state.touchEndX - state.touchStartX;
        const deltaY = Math.abs(state.touchEndY - state.touchStartY);

        // Only process horizontal swipes
        if (Math.abs(deltaX) > config.swipeThreshold && deltaY < 50) {
            if (deltaX > 0) {
                // Swipe right - close menu
                closeMenu();
            }
        }
    }

    /**
     * Handle keyboard navigation
     */
    function handleKeyDown(e) {
        if (e.key === 'Escape' && state.isOpen) {
            closeMenu();
        }

        // Tab trap when menu is open
        if (e.key === 'Tab' && state.isOpen) {
            const focusableElements = elements.mobileMenu.querySelectorAll(
                'a, button, [tabindex]:not([tabindex="-1"])'
            );
            
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
        if (window.innerWidth > config.breakpoint && state.isOpen) {
            closeMenu();
        }
    }

    /**
     * Handle scroll for header effects
     */
    function handleScroll() {
        if (state.isOpen) return;

        const scrolled = window.pageYOffset > 10;
        elements.header?.classList.toggle('header--scrolled', scrolled);
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
        setTimeout(() => announcement.remove(), 1000);
    }

    /**
     * Debounce utility
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export for testing
    window.MobileNavigation = {
        init,
        openMenu,
        closeMenu,
        isOpen: () => state.isOpen
    };
})();
