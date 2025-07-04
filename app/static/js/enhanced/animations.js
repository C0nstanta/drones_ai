// /app/static/js/enhanced/animations.js
/**
 * Enhanced animations for Adaptive Auto Hub website
 * Advanced UI animations and micro-interactions for modern browsers
 */

class AnimationManager {
    constructor() {
        this.observers = new Map();
        this.animationQueue = [];
        this.isProcessing = false;
        this.preferredMotion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        this.init();
    }
    
    /**
     * Initialize animation system
     */
    init() {
        if (!this.preferredMotion) {
            console.log('Reduced motion preference detected - animations simplified');
            return;
        }
        
        this.setupIntersectionObserver();
        this.setupScrollAnimations();
        this.setupHoverEffects();
        this.setupLoadAnimations();
        this.setupParallaxEffects();
        
        // Listen for preference changes
        window.matchMedia('(prefers-reduced-motion: reduce)')
            .addEventListener('change', (e) => {
                this.preferredMotion = !e.matches;
                if (!this.preferredMotion) {
                    this.disableAnimations();
                }
            });
    }
    
    /**
     * Set up intersection observer for scroll-triggered animations
     */
    setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.triggerAnimation(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px 0px'
        });
        
        // Observe elements with animation attributes
        const animatedElements = document.querySelectorAll('[data-animate]');
        animatedElements.forEach(el => observer.observe(el));
        
        this.observers.set('scroll', observer);
    }
    
    /**
     * Trigger animation based on element's data attributes
     */
    triggerAnimation(element) {
        const animationType = element.getAttribute('data-animate');
        const delay = parseInt(element.getAttribute('data-animate-delay')) || 0;
        const duration = parseInt(element.getAttribute('data-animate-duration')) || 600;
        
        setTimeout(() => {
            switch (animationType) {
                case 'fade-in':
                    this.fadeIn(element, duration);
                    break;
                case 'slide-up':
                    this.slideUp(element, duration);
                    break;
                case 'slide-down':
                    this.slideDown(element, duration);
                    break;
                case 'slide-left':
                    this.slideLeft(element, duration);
                    break;
                case 'slide-right':
                    this.slideRight(element, duration);
                    break;
                case 'scale-in':
                    this.scaleIn(element, duration);
                    break;
                case 'rotate-in':
                    this.rotateIn(element, duration);
                    break;
                case 'bounce-in':
                    this.bounceIn(element, duration);
                    break;
                case 'typewriter':
                    this.typewriter(element, duration);
                    break;
                case 'counter':
                    this.animateCounter(element, duration);
                    break;
                default:
                    this.fadeIn(element, duration);
            }
        }, delay);
    }
    
    /**
     * Fade in animation
     */
    fadeIn(element, duration = 600) {
        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.classList.add('animated');
        });
    }
    
    /**
     * Slide up animation
     */
    slideUp(element, duration = 600) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(40px)';
        element.style.transition = `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
            element.classList.add('animated');
        });
    }
    
    /**
     * Slide down animation
     */
    slideDown(element, duration = 600) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(-40px)';
        element.style.transition = `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
            element.classList.add('animated');
        });
    }
    
    /**
     * Slide left animation
     */
    slideLeft(element, duration = 600) {
        element.style.opacity = '0';
        element.style.transform = 'translateX(40px)';
        element.style.transition = `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateX(0)';
            element.classList.add('animated');
        });
    }
    
    /**
     * Slide right animation
     */
    slideRight(element, duration = 600) {
        element.style.opacity = '0';
        element.style.transform = 'translateX(-40px)';
        element.style.transition = `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateX(0)';
            element.classList.add('animated');
        });
    }
    
    /**
     * Scale in animation
     */
    scaleIn(element, duration = 600) {
        element.style.opacity = '0';
        element.style.transform = 'scale(0.8)';
        element.style.transition = `all ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'scale(1)';
            element.classList.add('animated');
        });
    }
    
    /**
     * Rotate in animation
     */
    rotateIn(element, duration = 600) {
        element.style.opacity = '0';
        element.style.transform = 'rotate(-10deg) scale(0.9)';
        element.style.transition = `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'rotate(0deg) scale(1)';
            element.classList.add('animated');
        });
    }
    
    /**
     * Bounce in animation
     */
    bounceIn(element, duration = 800) {
        element.style.opacity = '0';
        element.style.transform = 'scale(0.3)';
        element.style.transition = `all ${duration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'scale(1)';
            element.classList.add('animated');
        });
    }
    
    /**
     * Typewriter animation for text
     */
    typewriter(element, duration = 2000) {
        const text = element.textContent;
        const speed = duration / text.length;
        
        element.textContent = '';
        element.style.opacity = '1';
        element.classList.add('animated');
        
        let index = 0;
        const typeInterval = setInterval(() => {
            element.textContent += text[index];
            index++;
            
            if (index >= text.length) {
                clearInterval(typeInterval);
            }
        }, speed);
    }
    
    /**
     * Animate counter numbers
     */
    animateCounter(element, duration = 2000) {
        const target = parseInt(element.textContent);
        const increment = target / (duration / 16);
        let current = 0;
        
        element.style.opacity = '1';
        element.classList.add('animated');
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current).toLocaleString();
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target.toLocaleString();
            }
        };
        
        updateCounter();
    }
    
    /**
     * Set up scroll-based animations
     */
    setupScrollAnimations() {
        let ticking = false;
        
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.updateScrollAnimations();
                    ticking = false;
                });
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    /**
     * Update scroll-based animations
     */
    updateScrollAnimations() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        // Parallax background elements
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        parallaxElements.forEach(element => {
            const speed = parseFloat(element.getAttribute('data-parallax')) || 0.5;
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
        
        // Header background blur effect
        const header = document.querySelector('.header');
        if (header) {
            const opacity = Math.min(scrolled / 100, 0.95);
            header.style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;
            header.style.backdropFilter = scrolled > 50 ? 'blur(10px)' : 'none';
        }
    }
    
    /**
     * Set up hover effects
     */
    setupHoverEffects() {
        // Card hover effects
        const cards = document.querySelectorAll('.card, .card-product, .card-feature');
        cards.forEach(card => {
            this.addHoverEffect(card, 'lift');
        });
        
        // Button hover effects
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            this.addHoverEffect(button, 'glow');
        });
        
        // Image hover effects
        const images = document.querySelectorAll('[data-hover="zoom"]');
        images.forEach(image => {
            this.addHoverEffect(image, 'zoom');
        });
    }
    
    /**
     * Add hover effect to element
     */
    addHoverEffect(element, type) {
        switch (type) {
            case 'lift':
                element.addEventListener('mouseenter', () => {
                    if (this.preferredMotion) {
                        element.style.transform = 'translateY(-4px)';
                        element.style.boxShadow = '0 20px 40px -10px rgba(0, 0, 0, 0.2)';
                    }
                });
                element.addEventListener('mouseleave', () => {
                    element.style.transform = '';
                    element.style.boxShadow = '';
                });
                break;
                
            case 'glow':
                element.addEventListener('mouseenter', () => {
                    if (this.preferredMotion) {
                        element.style.boxShadow = '0 0 20px rgba(30, 64, 175, 0.4)';
                    }
                });
                element.addEventListener('mouseleave', () => {
                    element.style.boxShadow = '';
                });
                break;
                
            case 'zoom':
                element.style.overflow = 'hidden';
                const img = element.querySelector('img') || element;
                img.style.transition = 'transform 300ms ease';
                
                element.addEventListener('mouseenter', () => {
                    if (this.preferredMotion) {
                        img.style.transform = 'scale(1.05)';
                    }
                });
                element.addEventListener('mouseleave', () => {
                    img.style.transform = 'scale(1)';
                });
                break;
        }
    }
    
    /**
     * Set up page load animations
     */
    setupLoadAnimations() {
        const hero = document.querySelector('.hero');
        if (hero) {
            setTimeout(() => {
                hero.classList.add('hero-loaded');
            }, 100);
        }
        
        // Stagger animation for navigation items
        const navItems = document.querySelectorAll('.nav-link');
        navItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
    
    /**
     * Set up parallax effects
     */
    setupParallaxEffects() {
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        
        if (parallaxElements.length === 0) return;
        
        // Use Intersection Observer for performance
        const parallaxObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.enableParallax(entry.target);
                } else {
                    this.disableParallax(entry.target);
                }
            });
        });
        
        parallaxElements.forEach(el => parallaxObserver.observe(el));
    }
    
    /**
     * Enable parallax for element
     */
    enableParallax(element) {
        element.classList.add('parallax-active');
    }
    
    /**
     * Disable parallax for element
     */
    disableParallax(element) {
        element.classList.remove('parallax-active');
        element.style.transform = '';
    }
    
    /**
     * Disable all animations (for reduced motion preference)
     */
    disableAnimations() {
        // Clear all observers
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        
        // Remove transition styles
        const animatedElements = document.querySelectorAll('.animated, [data-animate]');
        animatedElements.forEach(element => {
            element.style.transition = 'none';
            element.style.transform = '';
            element.style.opacity = '';
        });
        
        console.log('All animations disabled due to user preference');
    }
    
    /**
     * Create loading animation
     */
    createLoader(container, type = 'spinner') {
        const loader = document.createElement('div');
        loader.className = `loader loader-${type}`;
        
        switch (type) {
            case 'spinner':
                loader.innerHTML = '<div class="spinner"></div>';
                break;
            case 'dots':
                loader.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
                break;
            case 'pulse':
                loader.innerHTML = '<div class="pulse"></div>';
                break;
        }
        
        container.appendChild(loader);
        return loader;
    }
    
    /**
     * Remove loading animation
     */
    removeLoader(loader) {
        if (loader && loader.parentNode) {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.parentNode.removeChild(loader);
            }, 300);
        }
    }
    
    /**
     * Cleanup method
     */
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        this.animationQueue = [];
    }
}

// Initialize animation manager when DOM is ready
function initAnimations() {
    const animationManager = new AnimationManager();
    
    // Export for global access
    window.animationManager = animationManager;
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimations);
} else {
    initAnimations();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationManager;
}