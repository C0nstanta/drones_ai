// /static/js/text-animator.js

/**
 * Text Animation System for Hero Section
 * Splits text and animates with stagger effects
 * @module TextAnimator
 * @version 1.0.0
 */

(function() {
    'use strict';

    /**
     * TextAnimator class - Handles text splitting and animation
     * @class
     */
    class TextAnimator {
        /**
         * Initialize text animator
         * @param {Object} options - Configuration options
         * @param {string} options.selector - CSS selector for text elements
         * @param {string} options.splitType - 'words' or 'letters' (default: 'words')
         * @param {number} options.staggerDelay - Delay between animations in ms (default: 50)
         * @param {string} options.animationClass - CSS class to apply for animation
         * @param {boolean} options.preserveSpaces - Maintain space width (default: true)
         */
        constructor(options = {}) {
            this.config = {
                selector: options.selector || '.animate-text',
                splitType: options.splitType || 'words',
                staggerDelay: options.staggerDelay || 50,
                animationClass: options.animationClass || 'text-reveal',
                preserveSpaces: options.preserveSpaces !== false,
                observerThreshold: options.observerThreshold || 0.1,
                observerRootMargin: options.observerRootMargin || '0px'
            };
            
            this.elements = [];
            this.observer = null;
            this.animationMap = new WeakMap();
            
            this.init();
        }
        
        /**
         * Initialize text animator
         * @private
         */
        init() {
            this.collectElements();
            this.setupIntersectionObserver();
            this.prepareElements();
        }
        
        /**
         * Collect all elements to animate
         * @private
         */
        collectElements() {
            const nodeList = document.querySelectorAll(this.config.selector);
            this.elements = Array.from(nodeList);
            
            if (this.elements.length === 0) {
                console.warn('TextAnimator: No elements found for selector', this.config.selector);
            }
        }
        
        /**
         * Setup intersection observer for viewport detection
         * @private
         */
        setupIntersectionObserver() {
            const observerOptions = {
                threshold: this.config.observerThreshold,
                rootMargin: this.config.observerRootMargin
            };
            
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.animationMap.get(entry.target)) {
                        this.animateElement(entry.target);
                        this.animationMap.set(entry.target, true);
                    }
                });
            }, observerOptions);
        }
        
        /**
         * Prepare elements for animation
         * @private
         */
        prepareElements() {
            this.elements.forEach(element => {
                // Store original text
                const originalText = element.textContent;
                element.setAttribute('data-original-text', originalText);
                
                // Split and wrap text
                this.splitText(element);
                
                // Add to observer
                this.observer.observe(element);
            });
        }
        
        /**
         * Split text into spans
         * @param {HTMLElement} element - Element containing text
         * @private
         */
        splitText(element) {
            const text = element.textContent;
            const splitMethod = this.config.splitType === 'letters' ? 
                this.splitIntoLetters : this.splitIntoWords;
            
            const fragments = splitMethod.call(this, text);
            
            // Clear element and add fragments
            element.innerHTML = '';
            element.classList.add('text-split');
            
            fragments.forEach((fragment, index) => {
                const span = document.createElement('span');
                span.className = 'text-fragment';
                span.style.setProperty('--fragment-index', index);
                
                if (fragment === ' ' && this.config.preserveSpaces) {
                    span.innerHTML = '&nbsp;';
                    span.classList.add('text-space');
                } else {
                    span.textContent = fragment;
                }
                
                // Set initial state
                span.style.opacity = '0';
                span.style.transform = 'translateY(20px)';
                
                element.appendChild(span);
            });
        }
        
        /**
         * Split text into words
         * @param {string} text - Text to split
         * @returns {Array} Array of words and spaces
         * @private
         */
        splitIntoWords(text) {
            // Split by spaces but preserve them
            const words = [];
            let currentWord = '';
            
            for (let i = 0; i < text.length; i++) {
                if (text[i] === ' ') {
                    if (currentWord) {
                        words.push(currentWord);
                        currentWord = '';
                    }
                    words.push(' ');
                } else {
                    currentWord += text[i];
                }
            }
            
            if (currentWord) {
                words.push(currentWord);
            }
            
            return words;
        }
        
        /**
         * Split text into individual letters
         * @param {string} text - Text to split
         * @returns {Array} Array of letters
         * @private
         */
        splitIntoLetters(text) {
            return text.split('');
        }
        
        /**
         * Animate element fragments
         * @param {HTMLElement} element - Element to animate
         * @private
         */
        animateElement(element) {
            const fragments = element.querySelectorAll('.text-fragment');
            
            fragments.forEach((fragment, index) => {
                // Calculate stagger delay
                const delay = index * this.config.staggerDelay;
                
                // Use requestAnimationFrame for smooth animation
                setTimeout(() => {
                    requestAnimationFrame(() => {
                        fragment.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
                        fragment.style.opacity = '1';
                        fragment.style.transform = 'translateY(0)';
                        
                        if (this.config.animationClass) {
                            fragment.classList.add(this.config.animationClass);
                        }
                    });
                }, delay);
            });
            
            // Mark element as animated
            element.classList.add('text-animated');
        }
        
        /**
         * Reset element to original state
         * @param {HTMLElement} element - Element to reset
         * @public
         */
        resetElement(element) {
            const originalText = element.getAttribute('data-original-text');
            if (originalText) {
                element.textContent = originalText;
                element.classList.remove('text-split', 'text-animated');
                this.animationMap.delete(element);
            }
        }
        
        /**
         * Reset all elements
         * @public
         */
        resetAll() {
            this.elements.forEach(element => this.resetElement(element));
        }
        
        /**
         * Add new elements to animator
         * @param {string|NodeList|Array} elements - Elements to add
         * @public
         */
        addElements(elements) {
            let newElements = [];
            
            if (typeof elements === 'string') {
                newElements = Array.from(document.querySelectorAll(elements));
            } else if (NodeList.prototype.isPrototypeOf(elements)) {
                newElements = Array.from(elements);
            } else if (Array.isArray(elements)) {
                newElements = elements;
            }
            
            newElements.forEach(element => {
                if (!this.elements.includes(element)) {
                    this.elements.push(element);
                    this.prepareElements();
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
            
            this.resetAll();
            this.elements = [];
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
            this.init();
        }
    }
    
    /**
     * Utility function for one-off text animations
     * @param {string|HTMLElement} target - Element or selector
     * @param {Object} options - Animation options
     * @returns {TextAnimator} TextAnimator instance
     */
    window.animateText = function(target, options = {}) {
        const selector = typeof target === 'string' ? target : null;
        const element = typeof target === 'string' ? 
            document.querySelector(target) : target;
        
        if (!element) {
            console.error('animateText: Target element not found');
            return null;
        }
        
        // Add unique class if element doesn't have one
        if (!element.classList.length) {
            const uniqueClass = `text-animate-${Date.now()}`;
            element.classList.add(uniqueClass);
            options.selector = `.${uniqueClass}`;
        } else if (!selector) {
            options.selector = `.${element.classList[0]}`;
        } else {
            options.selector = selector;
        }
        
        return new TextAnimator(options);
    };
    
    // Export to global namespace
    window.TextAnimator = TextAnimator;
    
})();
