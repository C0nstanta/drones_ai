// /static/js/counter-animator.js

/**
 * Counter Animation System for Hero Section
 * Smooth number animations with easing and formatting
 * @module CounterAnimator
 * @version 1.0.0
 */

(function() {
    'use strict';

    /**
     * Easing functions for smooth animations
     * @namespace
     */
    const Easing = {
        linear: t => t,
        easeInQuad: t => t * t,
        easeOutQuad: t => t * (2 - t),
        easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        easeInCubic: t => t * t * t,
        easeOutCubic: t => (--t) * t * t + 1,
        easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
        easeOutElastic: t => {
            const c4 = (2 * Math.PI) / 3;
            return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
        }
    };

    /**
     * CounterAnimator class - Handles animated number counting
     * @class
     */
    class CounterAnimator {
        /**
         * Initialize counter animator
         * @param {Object} options - Configuration options
         * @param {string} options.selector - CSS selector for counter elements
         * @param {number} options.duration - Animation duration in ms (default: 2000)
         * @param {string} options.easing - Easing function name (default: 'easeOutCubic')
         * @param {boolean} options.once - Animate only once (default: true)
         * @param {string} options.separator - Thousand separator (default: ',')
         */
        constructor(options = {}) {
            this.config = {
                selector: options.selector || '.counter',
                duration: options.duration || 2000,
                easing: options.easing || 'easeOutCubic',
                once: options.once !== false,
                separator: options.separator || ',',
                decimal: options.decimal || '.',
                prefix: options.prefix || '',
                suffix: options.suffix || '',
                observerThreshold: options.observerThreshold || 0.1,
                observerRootMargin: options.observerRootMargin || '0px'
            };
            
            this.counters = [];
            this.observer = null;
            this.animationMap = new WeakMap();
            
            this.init();
        }
        
        /**
         * Initialize counter animator
         * @private
         */
        init() {
            this.collectCounters();
            this.setupIntersectionObserver();
            this.prepareCounters();
        }
        
        /**
         * Collect all counter elements
         * @private
         */
        collectCounters() {
            const nodeList = document.querySelectorAll(this.config.selector);
            this.counters = Array.from(nodeList).map(element => {
                const target = parseFloat(element.getAttribute('data-target') || element.textContent);
                const duration = parseInt(element.getAttribute('data-duration')) || this.config.duration;
                const decimals = parseInt(element.getAttribute('data-decimals')) || 0;
                const prefix = element.getAttribute('data-prefix') || this.config.prefix;
                const suffix = element.getAttribute('data-suffix') || this.config.suffix;
                
                return {
                    element,
                    target,
                    duration,
                    decimals,
                    prefix,
                    suffix,
                    current: 0
                };
            });
            
            if (this.counters.length === 0) {
                console.warn('CounterAnimator: No elements found for selector', this.config.selector);
            }
        }
        
        /**
         * Setup intersection observer
         * @private
         */
        setupIntersectionObserver() {
            const observerOptions = {
                threshold: this.config.observerThreshold,
                rootMargin: this.config.observerRootMargin
            };
            
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const counter = this.counters.find(c => c.element === entry.target);
                        if (counter && (!this.config.once || !this.animationMap.get(counter.element))) {
                            this.animateCounter(counter);
                            this.animationMap.set(counter.element, true);
                        }
                    }
                });
            }, observerOptions);
        }
        
        /**
         * Prepare counters for animation
         * @private
         */
        prepareCounters() {
            this.counters.forEach(counter => {
                // Set initial value
                this.updateCounterDisplay(counter, 0);
                
                // Add to observer
                this.observer.observe(counter.element);
                
                // Add CSS class
                counter.element.classList.add('counter-ready');
            });
        }
        
        /**
         * Animate single counter
         * @param {Object} counter - Counter object
         * @private
         */
        animateCounter(counter) {
            const startTime = performance.now();
            const startValue = counter.current;
            const endValue = counter.target;
            const easingFn = Easing[this.config.easing] || Easing.easeOutCubic;
            
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / counter.duration, 1);
                
                // Apply easing
                const easedProgress = easingFn(progress);
                
                // Calculate current value
                const currentValue = startValue + (endValue - startValue) * easedProgress;
                counter.current = currentValue;
                
                // Update display
                this.updateCounterDisplay(counter, currentValue);
                
                // Continue animation
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    // Ensure final value is exact
                    this.updateCounterDisplay(counter, endValue);
                    counter.element.classList.add('counter-complete');
                    
                    // Dispatch completion event
                    counter.element.dispatchEvent(new CustomEvent('counterComplete', {
                        detail: { value: endValue }
                    }));
                }
            };
            
            // Start animation
            requestAnimationFrame(animate);
            counter.element.classList.add('counter-animating');
        }
        
        /**
         * Update counter display with formatting
         * @param {Object} counter - Counter object
         * @param {number} value - Current value
         * @private
         */
        updateCounterDisplay(counter, value) {
            // Format number
            let formattedValue = this.formatNumber(value, counter.decimals);
            
            // Add prefix and suffix
            const displayValue = `${counter.prefix}${formattedValue}${counter.suffix}`;
            
            // Update element
            counter.element.textContent = displayValue;
        }
        
        /**
         * Format number with separators and decimals
         * @param {number} value - Number to format
         * @param {number} decimals - Decimal places
         * @returns {string} Formatted number
         * @private
         */
        formatNumber(value, decimals) {
            // Round to specified decimals
            const rounded = decimals > 0 ? 
                value.toFixed(decimals) : 
                Math.floor(value).toString();
            
            // Split into integer and decimal parts
            const parts = rounded.split('.');
            
            // Add thousand separators to integer part
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, this.config.separator);
            
            // Join parts with decimal separator
            return parts.join(this.config.decimal);
        }
        
        /**
         * Reset counter to initial state
         * @param {HTMLElement} element - Counter element
         * @public
         */
        resetCounter(element) {
            const counter = this.counters.find(c => c.element === element);
            if (counter) {
                counter.current = 0;
                this.updateCounterDisplay(counter, 0);
                counter.element.classList.remove('counter-animating', 'counter-complete');
                this.animationMap.delete(element);
            }
        }
        
        /**
         * Reset all counters
         * @public
         */
        resetAll() {
            this.counters.forEach(counter => {
                this.resetCounter(counter.element);
            });
        }
        
        /**
         * Start specific counter animation
         * @param {HTMLElement} element - Counter element
         * @public
         */
        startCounter(element) {
            const counter = this.counters.find(c => c.element === element);
            if (counter) {
                this.animateCounter(counter);
            }
        }
        
        /**
         * Start all counter animations
         * @public
         */
        startAll() {
            this.counters.forEach(counter => {
                this.animateCounter(counter);
            });
        }
        
        /**
         * Add new counter elements
         * @param {string|NodeList|Array} elements - Elements to add
         * @public
         */
        addCounters(elements) {
            let newElements = [];
            
            if (typeof elements === 'string') {
                newElements = Array.from(document.querySelectorAll(elements));
            } else if (NodeList.prototype.isPrototypeOf(elements)) {
                newElements = Array.from(elements);
            } else if (Array.isArray(elements)) {
                newElements = elements;
            }
            
            newElements.forEach(element => {
                if (!this.counters.find(c => c.element === element)) {
                    const target = parseFloat(element.getAttribute('data-target') || element.textContent);
                    const duration = parseInt(element.getAttribute('data-duration')) || this.config.duration;
                    const decimals = parseInt(element.getAttribute('data-decimals')) || 0;
                    const prefix = element.getAttribute('data-prefix') || this.config.prefix;
                    const suffix = element.getAttribute('data-suffix') || this.config.suffix;
                    
                    const counter = {
                        element,
                        target,
                        duration,
                        decimals,
                        prefix,
                        suffix,
                        current: 0
                    };
                    
                    this.counters.push(counter);
                    this.updateCounterDisplay(counter, 0);
                    this.observer.observe(element);
                    element.classList.add('counter-ready');
                }
            });
        }
        
        /**
         * Destroy animator and clean up
         * @public
         */
        destroy() {
            if (this.observer) {
                this.observer.disconnect();
                this.observer = null;
            }
            
            this.counters = [];
            this.animationMap = new WeakMap();
        }
        
        /**
         * Update configuration
         * @param {Object} newConfig - New configuration options
         * @public
         */
        updateConfig(newConfig) {
            Object.assign(this.config, newConfig);
            this.resetAll();
        }
    }
    
    /**
     * Utility function for one-off counter animations
     * @param {string|HTMLElement} target - Element or selector
     * @param {number} endValue - Target value
     * @param {Object} options - Animation options
     * @returns {CounterAnimator} CounterAnimator instance
     */
    window.animateCounter = function(target, endValue, options = {}) {
        const element = typeof target === 'string' ? 
            document.querySelector(target) : target;
        
        if (!element) {
            console.error('animateCounter: Target element not found');
            return null;
        }
        
        // Set target value
        element.setAttribute('data-target', endValue);
        
        // Create unique animator
        const uniqueClass = `counter-${Date.now()}`;
        element.classList.add(uniqueClass);
        
        const animator = new CounterAnimator({
            ...options,
            selector: `.${uniqueClass}`,
            once: true
        });
        
        // Start immediately
        animator.startCounter(element);
        
        return animator;
    };
    
    // Export to global namespace
    window.CounterAnimator = CounterAnimator;
    
})();
