// /app/static/js/lazy-load.js
/**
 * Lazy loading implementation for Adaptive Auto Hub website
 * Uses Intersection Observer API for efficient image and content loading
 */

class LazyLoader {
    constructor(options = {}) {
        this.options = {
            rootMargin: '50px 0px',
            threshold: 0.01,
            enableLQIP: true,
            fadeInDuration: 300,
            retryAttempts: 3,
            ...options
        };
        
        this.observer = null;
        this.loadedImages = new Set();
        this.retryQueue = new Map();
        
        this.init();
    }
    
    /**
     * Initialize lazy loading system
     */
    init() {
        if ('IntersectionObserver' in window) {
            this.setupIntersectionObserver();
            this.observeImages();
            this.observeContent();
        } else {
            // Fallback for older browsers
            this.loadAllImages();
        }
        
        // Listen for dynamic content additions
        this.setupMutationObserver();
        
        // Handle network connectivity changes
        this.setupNetworkHandling();
    }
    
    /**
     * Set up Intersection Observer for lazy loading
     */
    setupIntersectionObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (entry.target.tagName === 'IMG' || entry.target.tagName === 'PICTURE') {
                        this.loadImage(entry.target);
                    } else if (entry.target.hasAttribute('data-lazy-content')) {
                        this.loadContent(entry.target);
                    }
                    
                    this.observer.unobserve(entry.target);
                }
            });
        }, this.options);
    }
    
    /**
     * Observe all images with lazy loading attributes
     */
    observeImages() {
        const lazyImages = document.querySelectorAll('img[data-lazy], picture[data-lazy]');
        
        lazyImages.forEach(img => {
            // Set up LQIP if available
            if (this.options.enableLQIP && img.hasAttribute('data-lqip')) {
                this.setupLQIP(img);
            }
            
            this.observer.observe(img);
        });
    }
    
    /**
     * Observe content containers for lazy loading
     */
    observeContent() {
        const lazyContent = document.querySelectorAll('[data-lazy-content]');
        
        lazyContent.forEach(element => {
            this.observer.observe(element);
        });
    }
    
    /**
     * Set up Low Quality Image Placeholder (LQIP)
     */
    setupLQIP(img) {
        const lqipSrc = img.getAttribute('data-lqip');
        if (lqipSrc && !img.src) {
            img.src = lqipSrc;
            img.style.filter = 'blur(5px)';
            img.style.transition = `filter ${this.options.fadeInDuration}ms ease`;
        }
    }
    
    /**
     * Load image with error handling and retry logic
     */
    async loadImage(element) {
        const isImg = element.tagName === 'IMG';
        const isPicture = element.tagName === 'PICTURE';
        
        if (isImg) {
            await this.loadImgElement(element);
        } else if (isPicture) {
            await this.loadPictureElement(element);
        }
    }
    
    /**
     * Load IMG element with srcset and fallback handling
     */
    async loadImgElement(img) {
        const originalSrc = img.src;
        const dataSrc = img.getAttribute('data-src');
        const dataSrcset = img.getAttribute('data-srcset');
        
        return new Promise((resolve, reject) => {
            const newImg = new Image();
            
            // Set up load handlers
            newImg.onload = () => {
                // Update the original image
                if (dataSrcset) {
                    img.srcset = dataSrcset;
                }
                if (dataSrc) {
                    img.src = dataSrc;
                }
                
                // Remove LQIP blur effect
                if (img.style.filter) {
                    img.style.filter = 'none';
                }
                
                // Add loaded class for CSS animations
                img.classList.add('lazy-loaded');
                
                // Clean up attributes
                img.removeAttribute('data-src');
                img.removeAttribute('data-srcset');
                img.removeAttribute('data-lqip');
                
                this.loadedImages.add(img);
                resolve();
            };
            
            newImg.onerror = () => {
                this.handleImageError(img, dataSrc || originalSrc);
                reject(new Error(`Failed to load image: ${dataSrc || originalSrc}`));
            };
            
            // Start loading
            if (dataSrcset) {
                newImg.srcset = dataSrcset;
            }
            newImg.src = dataSrc || originalSrc;
        });
    }
    
    /**
     * Load PICTURE element with multiple sources
     */
    async loadPictureElement(picture) {
        const img = picture.querySelector('img');
        const sources = picture.querySelectorAll('source');
        
        // Update source elements
        sources.forEach(source => {
            const dataSrcset = source.getAttribute('data-srcset');
            if (dataSrcset) {
                source.srcset = dataSrcset;
                source.removeAttribute('data-srcset');
            }
        });
        
        // Load the img element
        if (img) {
            await this.loadImgElement(img);
        }
        
        picture.classList.add('lazy-loaded');
    }
    
    /**
     * Handle image loading errors with retry logic
     */
    handleImageError(img, src) {
        const retryCount = this.retryQueue.get(img) || 0;
        
        if (retryCount < this.options.retryAttempts) {
            this.retryQueue.set(img, retryCount + 1);
            
            // Retry after delay
            setTimeout(() => {
                this.loadImage(img);
            }, Math.pow(2, retryCount) * 1000); // Exponential backoff
        } else {
            // Show fallback or error state
            img.classList.add('lazy-error');
            this.showImageFallback(img);
        }
    }
    
    /**
     * Show fallback content for failed images
     */
    showImageFallback(img) {
        const fallback = img.getAttribute('data-fallback');
        if (fallback) {
            img.src = fallback;
        } else {
            // Create a placeholder
            const placeholder = this.createImagePlaceholder(img);
            img.parentNode.replaceChild(placeholder, img);
        }
    }
    
    /**
     * Create placeholder element for failed images
     */
    createImagePlaceholder(img) {
        const placeholder = document.createElement('div');
        placeholder.className = 'image-placeholder lazy-error';
        placeholder.style.cssText = `
            width: ${img.getAttribute('width') || '100%'};
            height: ${img.getAttribute('height') || '200px'};
            background: #f3f4f6;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #9ca3af;
            font-size: 14px;
            border-radius: 4px;
        `;
        placeholder.textContent = 'Image unavailable';
        placeholder.setAttribute('role', 'img');
        placeholder.setAttribute('aria-label', img.alt || 'Failed to load image');
        
        return placeholder;
    }
    
    /**
     * Load lazy content sections
     */
    async loadContent(element) {
        const contentUrl = element.getAttribute('data-lazy-content');
        
        if (!contentUrl) return;
        
        try {
            element.classList.add('loading');
            
            const response = await fetch(contentUrl);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const content = await response.text();
            element.innerHTML = content;
            element.classList.remove('loading');
            element.classList.add('lazy-loaded');
            
            // Re-observe any new lazy elements in the loaded content
            this.observeNewContent(element);
            
        } catch (error) {
            console.error('Failed to load lazy content:', error);
            element.classList.remove('loading');
            element.classList.add('lazy-error');
            element.innerHTML = '<p>Content temporarily unavailable</p>';
        }
    }
    
    /**
     * Observe newly added content for lazy loading
     */
    observeNewContent(container) {
        const newImages = container.querySelectorAll('img[data-lazy], picture[data-lazy]');
        const newContent = container.querySelectorAll('[data-lazy-content]');
        
        newImages.forEach(img => this.observer.observe(img));
        newContent.forEach(element => this.observer.observe(element));
    }
    
    /**
     * Set up mutation observer for dynamic content
     */
    setupMutationObserver() {
        if ('MutationObserver' in window) {
            const mutationObserver = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.observeNewContent(node);
                        }
                    });
                });
            });
            
            mutationObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }
    
    /**
     * Handle network connectivity changes
     */
    setupNetworkHandling() {
        if ('navigator' in window && 'onLine' in navigator) {
            window.addEventListener('online', () => {
                // Retry failed images when connection is restored
                this.retryFailedImages();
            });
        }
    }
    
    /**
     * Retry images that failed to load
     */
    retryFailedImages() {
        const failedImages = document.querySelectorAll('img.lazy-error, .image-placeholder.lazy-error');
        
        failedImages.forEach(element => {
            if (element.tagName === 'IMG') {
                this.retryQueue.delete(element);
                this.loadImage(element);
            }
        });
    }
    
    /**
     * Load all images immediately (fallback for unsupported browsers)
     */
    loadAllImages() {
        const lazyImages = document.querySelectorAll('img[data-src], img[data-srcset]');
        
        lazyImages.forEach(img => {
            const dataSrc = img.getAttribute('data-src');
            const dataSrcset = img.getAttribute('data-srcset');
            
            if (dataSrcset) {
                img.srcset = dataSrcset;
            }
            if (dataSrc) {
                img.src = dataSrc;
            }
            
            img.removeAttribute('data-src');
            img.removeAttribute('data-srcset');
            img.classList.add('lazy-loaded');
        });
    }
    
    /**
     * Preload critical images above the fold
     */
    preloadCriticalImages() {
        const criticalImages = document.querySelectorAll('img[data-critical]');
        
        criticalImages.forEach(img => {
            const dataSrc = img.getAttribute('data-src');
            if (dataSrc) {
                const preloadImg = new Image();
                preloadImg.src = dataSrc;
            }
        });
    }
    
    /**
     * Clean up observers and event listeners
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        
        this.loadedImages.clear();
        this.retryQueue.clear();
    }
}

// Initialize lazy loading when DOM is ready
function initLazyLoading() {
    const options = {
        rootMargin: '50px 0px',
        threshold: 0.01,
        enableLQIP: true,
        fadeInDuration: 300
    };
    
    const lazyLoader = new LazyLoader(options);
    
    // Preload critical images
    lazyLoader.preloadCriticalImages();
    
    // Export for global access
    window.lazyLoader = lazyLoader;
}

// Auto-initialize or export for manual initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLazyLoading);
} else {
    initLazyLoading();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LazyLoader;
}
