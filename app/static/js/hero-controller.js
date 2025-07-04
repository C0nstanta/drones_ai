// /static/js/hero-controller.js

/**
 * Hero Section Controller
 * Orchestrates all hero animations and interactions
 * @module HeroController
 * @version 1.0.0
 */

(function() {
    'use strict';

    /**
     * HeroController class - Main orchestration layer
     * @class
     */
    class HeroController {
        /**
         * Initialize hero controller
         * @param {Object} options - Configuration options
         */
        constructor(options = {}) {
            this.config = {
                particleCanvas: options.particleCanvas || 'particle-canvas',
                headlineSelector: options.headlineSelector || '.hero-headline',
                subheadlineSelector: options.subheadlineSelector || '.hero-subheadline',
                counterSelector: options.counterSelector || '.hero-counter',
                ctaSelector: options.ctaSelector || '.hero-cta',
                autoStart: options.autoStart !== false,
                performanceMode: options.performanceMode || 'auto',
                reducedMotion: options.reducedMotion || false
            };
            
            this.components = {
                particles: null,
                textAnimators: [],
                counterAnimator: null
            };
            
            this.isInitialized = false;
            this.performanceLevel = this.detectPerformanceLevel();
            
            if (this.config.autoStart) {
                this.init();
            }
        }
        
        /**
         * Initialize all hero components
         * @public
         */
        init() {
            if (this.isInitialized) return;
            
            // Check for reduced motion preference
            if (this.checkReducedMotion()) {
                this.config.reducedMotion = true;
            }
            
            // Initialize components based on performance
            this.initParticles();
            this.initTextAnimations();
            this.initCounters();
            this.initCTAAnimations();
            
            // Setup resize handling
            this.setupResizeHandler();
            
            // Mark as initialized
            this.isInitialized = true;
            
            // Dispatch ready event
            document.dispatchEvent(new CustomEvent('heroReady', {
                detail: { controller: this }
            }));
        }
        
        /**
         * Detect device performance level
         * @returns {string} 'high', 'medium', or 'low'
         * @private
         */
        detectPerformanceLevel() {
            if (this.config.performanceMode !== 'auto') {
                return this.config.performanceMode;
            }
            
            // Check hardware concurrency
            const cores = navigator.hardwareConcurrency || 4;
            
            // Check device memory (if available)
            const memory = navigator.deviceMemory || 4;
            
            // Check connection
            const connection = navigator.connection || {};
            const slowConnection = connection.saveData || 
                                 connection.effectiveType === 'slow-2g' ||
                                 connection.effectiveType === '2g';
            
            // Simple performance scoring
            if (cores >= 4 && memory >= 4 && !slowConnection) {
                return 'high';
            } else if (cores >= 2 && memory >= 2 && !slowConnection) {
                return 'medium';
            }
            
            return 'low';
        }
        
        /**
         * Check if user prefers reduced motion
         * @returns {boolean}
         * @private
         */
        checkReducedMotion() {
            return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        }
        
        /**
         * Initialize particle system
         * @private
         */
        initParticles() {
            if (this.config.reducedMotion || this.performanceLevel === 'low') {
                return;
            }
            
            // Ensure ParticleSystem is loaded
            if (typeof ParticleSystem === 'undefined') {
                console.warn('HeroController: ParticleSystem not loaded');
                return;
            }
            
            // Adjust particle count based on performance
            const particleCount = {
                high: 120,
                medium: 80,
                low: 40
            }[this.performanceLevel];
            
            const mobileParticleCount = Math.floor(particleCount * 0.5);
            
            this.components.particles = new ParticleSystem({
                canvasId: this.config.particleCanvas,
                particleCount: particleCount,
                mobileParticleCount: mobileParticleCount,
                particleColor: 'rgba(100, 255, 218, 0.6)',
                connectionColor: 'rgba(100, 255, 218, 0.15)',
                maxSpeed: 0.8,
                connectionDistance: this.performanceLevel === 'high' ? 120 : 80
            });
        }
        
        /**
         * Initialize text animations
         * @private
         */
        initTextAnimations() {
            if (this.config.reducedMotion) {
                // Show text immediately without animation
                const elements = document.querySelectorAll(
                    `${this.config.headlineSelector}, ${this.config.subheadlineSelector}`
                );
                elements.forEach(el => el.style.opacity = '1');
                return;
            }
            
            // Ensure TextAnimator is loaded
            if (typeof TextAnimator === 'undefined') {
                console.warn('HeroController: TextAnimator not loaded');
                return;
            }
            
            // Headline animation
            if (document.querySelector(this.config.headlineSelector)) {
                const headlineAnimator = new TextAnimator({
                    selector: this.config.headlineSelector,
                    splitType: 'words',
                    staggerDelay: 80,
                    animationClass: 'word-reveal'
                });
                this.components.textAnimators.push(headlineAnimator);
            }
            
            // Subheadline animation
            if (document.querySelector(this.config.subheadlineSelector)) {
                const subheadlineAnimator = new TextAnimator({
                    selector: this.config.subheadlineSelector,
                    splitType: 'words',
                    staggerDelay: 50,
                    animationClass: 'word-reveal-subtle'
                });
                this.components.textAnimators.push(subheadlineAnimator);
            }
        }
        
        /**
         * Initialize counter animations
         * @private
         */
        initCounters() {
            if (this.config.reducedMotion) {
                // Show final values immediately
                const counters = document.querySelectorAll(this.config.counterSelector);
                counters.forEach(counter => {
                    const target = counter.getAttribute('data-target');
                    if (target) counter.textContent = target;
                });
                return;
            }
            
            // Ensure CounterAnimator is loaded
            if (typeof CounterAnimator === 'undefined') {
                console.warn('HeroController: CounterAnimator not loaded');
                return;
            }
            
            if (document.querySelector(this.config.counterSelector)) {
                this.components.counterAnimator = new CounterAnimator({
                    selector: this.config.counterSelector,
                    duration: 2500,
                    easing: 'easeOutCubic'
                });
            }
        }
        
        /**
         * Initialize CTA button animations
         * @private
         */
        initCTAAnimations() {
            const ctaElements = document.querySelectorAll(this.config.ctaSelector);
            
            ctaElements.forEach(cta => {
                // Add hover effect class
                cta.classList.add('hero-cta-animated');
                
                // Add entrance animation
                if (!this.config.reducedMotion) {
                    cta.style.opacity = '0';
                    cta.style.transform = 'translateY(20px)';
                    
                    // Animate in after delay
                    setTimeout(() => {
                        cta.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
                        cta.style.opacity = '1';
                        cta.style.transform = 'translateY(0)';
                    }, 800);
                }
            });
        }
        
        /**
         * Setup resize handler with debouncing
         * @private
         */
        setupResizeHandler() {
            let resizeTimeout;
            
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    this.handleResize();
                }, 250);
            });
        }
        
        /**
         * Handle window resize
         * @private
         */
        handleResize() {
            // Update performance level
            const newLevel = this.detectPerformanceLevel();
            
            if (newLevel !== this.performanceLevel) {
                this.performanceLevel = newLevel;
                
                // Adjust particle system
                if (this.components.particles) {
                    const particleCount = {
                        high: 120,
                        medium: 80,
                        low: 40
                    }[this.performanceLevel];
                    
                    this.components.particles.updateConfig({
                        particleCount: particleCount,
                        connectionDistance: this.performanceLevel === 'high' ? 120 : 80
                    });
                }
            }
        }
        
        /**
         * Pause all animations
         * @public
         */
        pause() {
            if (this.components.particles) {
                this.components.particles.stop();
            }
        }
        
        /**
         * Resume all animations
         * @public
         */
        resume() {
            if (this.components.particles) {
                this.components.particles.start();
            }
        }
        
        /**
         * Reset all animations
         * @public
         */
        reset() {
            // Reset text animations
            this.components.textAnimators.forEach(animator => {
                animator.resetAll();
            });
            
            // Reset counters
            if (this.components.counterAnimator) {
                this.components.counterAnimator.resetAll();
            }
        }
        
        /**
         * Destroy controller and clean up
         * @public
         */
        destroy() {
            // Destroy particles
            if (this.components.particles) {
                this.components.particles.destroy();
                this.components.particles = null;
            }
            
            // Destroy text animators
            this.components.textAnimators.forEach(animator => {
                animator.destroy();
            });
            this.components.textAnimators = [];
            
            // Destroy counter animator
            if (this.components.counterAnimator) {
                this.components.counterAnimator.destroy();
                this.components.counterAnimator = null;
            }
            
            this.isInitialized = false;
        }
        
        /**
         * Get current performance metrics
         * @returns {Object} Performance data
         * @public
         */
        getPerformanceMetrics() {
            const metrics = {
                performanceLevel: this.performanceLevel,
                reducedMotion: this.config.reducedMotion,
                componentsLoaded: {
                    particles: !!this.components.particles,
                    textAnimators: this.components.textAnimators.length,
                    counters: !!this.components.counterAnimator
                }
            };
            
            // Add particle metrics if available
            if (this.components.particles && this.components.particles.frameCount) {
                metrics.particleFPS = Math.round(
                    1000 / (Date.now() - this.components.particles.then)
                );
            }
            
            return metrics;
        }
    }
    
    // Auto-initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.heroController = new HeroController();
        });
    } else {
        window.heroController = new HeroController();
    }
    
    // Export to global namespace
    window.HeroController = HeroController;
    
})();
