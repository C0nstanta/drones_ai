// /app/static/js/modules/utils.js
/**
 * Utility functions for Adaptive Auto Hub website
 * Shared helper functions for DOM manipulation, performance, and common tasks
 */

// DOM utility functions
const DOM = {
    /**
     * Get element by selector with error handling
     */
    get(selector, context = document) {
        try {
            return context.querySelector(selector);
        } catch (error) {
            console.warn(`Invalid selector: ${selector}`, error);
            return null;
        }
    },

    /**
     * Get all elements by selector
     */
    getAll(selector, context = document) {
        try {
            return Array.from(context.querySelectorAll(selector));
        } catch (error) {
            console.warn(`Invalid selector: ${selector}`, error);
            return [];
        }
    },

    /**
     * Create element with attributes and content
     */
    create(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else if (key === 'textContent') {
                element.textContent = value;
            } else if (key.startsWith('data-')) {
                element.setAttribute(key, value);
            } else {
                element[key] = value;
            }
        });

        if (content) {
            element.textContent = content;
        }

        return element;
    },

    /**
     * Add event listener with cleanup tracking
     */
    on(element, event, handler, options = {}) {
        if (!element || typeof handler !== 'function') return null;

        element.addEventListener(event, handler, options);

        // Return cleanup function
        return () => element.removeEventListener(event, handler, options);
    },

    /**
     * Add event listener that fires once
     */
    once(element, event, handler, options = {}) {
        return this.on(element, event, handler, { ...options, once: true });
    },

    /**
     * Check if element is visible in viewport
     */
    isInViewport(element, threshold = 0) {
        if (!element) return false;

        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const windowWidth = window.innerWidth || document.documentElement.clientWidth;

        return (
            rect.top >= -threshold &&
            rect.left >= -threshold &&
            rect.bottom <= windowHeight + threshold &&
            rect.right <= windowWidth + threshold
        );
    },

    /**
     * Smooth scroll to element
     */
    scrollTo(element, options = {}) {
        if (!element) return;

        const defaultOptions = {
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
        };

        element.scrollIntoView({ ...defaultOptions, ...options });
    },

    /**
     * Get element's offset from document top
     */
    getOffset(element) {
        if (!element) return { top: 0, left: 0 };

        const rect = element.getBoundingClientRect();
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        return {
            top: rect.top + scrollTop,
            left: rect.left + scrollLeft
        };
    }
};

// Performance utilities
const Performance = {
    /**
     * Debounce function execution
     */
    debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(this, args);
        };
    },

    /**
     * Throttle function execution
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Request animation frame with fallback
     */
    raf(callback) {
        if (window.requestAnimationFrame) {
            return window.requestAnimationFrame(callback);
        }
        return setTimeout(callback, 16);
    },

    /**
     * Cancel animation frame with fallback
     */
    cancelRaf(id) {
        if (window.cancelAnimationFrame) {
            return window.cancelAnimationFrame(id);
        }
        return clearTimeout(id);
    },

    /**
     * Measure function execution time
     */
    measure(name, func) {
        const start = performance.now();
        const result = func();
        const end = performance.now();
        console.log(`${name} took ${end - start} milliseconds`);
        return result;
    },

    /**
     * Wait for next tick
     */
    nextTick(callback) {
        return Promise.resolve().then(callback);
    }
};

// Browser capability detection
const Browser = {
    /**
     * Check if browser supports a feature
     */
    supports: {
        intersectionObserver: 'IntersectionObserver' in window,
        mutationObserver: 'MutationObserver' in window,
        resizeObserver: 'ResizeObserver' in window,
        serviceWorker: 'serviceWorker' in navigator,
        webp: null, // Will be set asynchronously
        modernJS: (() => {
            try {
                new Function('class Test { static get [Symbol.species]() { return this; } }');
                return true;
            } catch (e) {
                return false;
            }
        })(),
        touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        localStorage: (() => {
            try {
                localStorage.setItem('test', 'test');
                localStorage.removeItem('test');
                return true;
            } catch (e) {
                return false;
            }
        })()
    },

    /**
     * Get browser name and version
     */
    info: {
        name: (() => {
            const userAgent = navigator.userAgent;
            if (userAgent.includes('Chrome')) return 'Chrome';
            if (userAgent.includes('Firefox')) return 'Firefox';
            if (userAgent.includes('Safari')) return 'Safari';
            if (userAgent.includes('Edge')) return 'Edge';
            return 'Unknown';
        })(),
        mobile: /Mobi|Android/i.test(navigator.userAgent),
        online: navigator.onLine
    },

    /**
     * Check WebP support asynchronously
     */
    checkWebP() {
        return new Promise((resolve) => {
            const webP = new Image();
            webP.onload = webP.onerror = () => {
                const supported = webP.height === 2;
                this.supports.webp = supported;
                resolve(supported);
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }
};

// URL and routing utilities
const URL = {
    /**
     * Get URL parameters as object
     */
    getParams() {
        return Object.fromEntries(new URLSearchParams(window.location.search));
    },

    /**
     * Set URL parameter without page reload
     */
    setParam(key, value) {
        const url = new URL(window.location);
        url.searchParams.set(key, value);
        window.history.replaceState({}, '', url);
    },

    /**
     * Remove URL parameter
     */
    removeParam(key) {
        const url = new URL(window.location);
        url.searchParams.delete(key);
        window.history.replaceState({}, '', url);
    },

    /**
     * Check if current page matches pattern
     */
    matches(pattern) {
        if (typeof pattern === 'string') {
            return window.location.pathname === pattern;
        }
        if (pattern instanceof RegExp) {
            return pattern.test(window.location.pathname);
        }
        return false;
    }
};

// Storage utilities (memory-based for Claude.ai compatibility)
const Storage = {
    _storage: new Map(),

    /**
     * Set item in memory storage
     */
    set(key, value, expiry = null) {
        const item = {
            value: value,
            expiry: expiry ? Date.now() + expiry : null
        };
        this._storage.set(key, item);
    },

    /**
     * Get item from memory storage
     */
    get(key, defaultValue = null) {
        const item = this._storage.get(key);
        
        if (!item) return defaultValue;
        
        if (item.expiry && Date.now() > item.expiry) {
            this._storage.delete(key);
            return defaultValue;
        }
        
        return item.value;
    },

    /**
     * Remove item from storage
     */
    remove(key) {
        this._storage.delete(key);
    },

    /**
     * Clear all storage
     */
    clear() {
        this._storage.clear();
    },

    /**
     * Check if key exists
     */
    has(key) {
        return this._storage.has(key);
    }
};

// Animation utilities
const Animation = {
    /**
     * Fade in element
     */
    fadeIn(element, duration = 300) {
        if (!element) return Promise.resolve();

        return new Promise((resolve) => {
            element.style.opacity = '0';
            element.style.display = 'block';
            element.style.transition = `opacity ${duration}ms ease`;

            requestAnimationFrame(() => {
                element.style.opacity = '1';
                setTimeout(resolve, duration);
            });
        });
    },

    /**
     * Fade out element
     */
    fadeOut(element, duration = 300) {
        if (!element) return Promise.resolve();

        return new Promise((resolve) => {
            element.style.transition = `opacity ${duration}ms ease`;
            element.style.opacity = '0';

            setTimeout(() => {
                element.style.display = 'none';
                resolve();
            }, duration);
        });
    },

    /**
     * Slide down element
     */
    slideDown(element, duration = 300) {
        if (!element) return Promise.resolve();

        return new Promise((resolve) => {
            element.style.height = '0';
            element.style.overflow = 'hidden';
            element.style.display = 'block';
            
            const height = element.scrollHeight;
            element.style.transition = `height ${duration}ms ease`;
            
            requestAnimationFrame(() => {
                element.style.height = height + 'px';
                setTimeout(() => {
                    element.style.height = '';
                    element.style.overflow = '';
                    resolve();
                }, duration);
            });
        });
    },

    /**
     * Slide up element
     */
    slideUp(element, duration = 300) {
        if (!element) return Promise.resolve();

        return new Promise((resolve) => {
            element.style.height = element.scrollHeight + 'px';
            element.style.overflow = 'hidden';
            element.style.transition = `height ${duration}ms ease`;
            
            requestAnimationFrame(() => {
                element.style.height = '0';
                setTimeout(() => {
                    element.style.display = 'none';
                    element.style.height = '';
                    element.style.overflow = '';
                    resolve();
                }, duration);
            });
        });
    }
};

// Validation utilities
const Validate = {
    /**
     * Email validation
     */
    email(email) {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return pattern.test(email);
    },

    /**
     * Phone validation (flexible international)
     */
    phone(phone) {
        const pattern = /^[\+]?[1-9][\d]{0,15}$/;
        return pattern.test(phone.replace(/[\s\-\(\)]/g, ''));
    },

    /**
     * URL validation
     */
    url(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },

    /**
     * Required field validation
     */
    required(value) {
        return typeof value === 'string' ? value.trim().length > 0 : Boolean(value);
    },

    /**
     * Minimum length validation
     */
    minLength(value, min) {
        return value.length >= min;
    },

    /**
     * Maximum length validation
     */
    maxLength(value, max) {
        return value.length <= max;
    }
};

// Initialize browser capabilities
Browser.checkWebP();

// Export utilities for global access
window.Utils = {
    DOM,
    Performance,
    Browser,
    URL,
    Storage,
    Animation,
    Validate
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DOM, Performance, Browser, URL, Storage, Animation, Validate };
}