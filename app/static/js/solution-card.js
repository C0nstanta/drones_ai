// app/static/js/solution-card.js

/**
 * Solution Card Component
 * Handles individual card interactions and state
 */
class SolutionCard {
    /**
     * @param {HTMLElement} element - Card DOM element
     * @param {Object} options - Configuration options
     */
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            imageLoadTimeout: 5000,
            animationDelay: 100,
            ...options
        };
        
        this.imageElement = this.element.querySelector('.solution-card-image img');
        this.isImageLoaded = false;
        
        this.init();
    }
    
    /**
     * Initialize card functionality
     */
    init() {
        this.setupImageLoading();
        this.setupEventListeners();
    }
    
    /**
     * Handle image lazy loading
     */
    setupImageLoading() {
        if (!this.imageElement) return;
        
        // Native lazy loading fallback
        if ('loading' in HTMLImageElement.prototype) {
            this.imageElement.loading = 'lazy';
        }
        
        // Handle image load events
        this.imageElement.addEventListener('load', () => {
            this.isImageLoaded = true;
            this.element.classList.remove('loading');
        });
        
        this.imageElement.addEventListener('error', () => {
            this.handleImageError();
        });
        
        // Timeout fallback
        setTimeout(() => {
            if (!this.isImageLoaded) {
                this.handleImageError();
            }
        }, this.options.imageLoadTimeout);
    }
    
    /**
     * Handle image loading errors
     */
    handleImageError() {
        const imageContainer = this.element.querySelector('.solution-card-image');
        if (imageContainer) {
            imageContainer.classList.add('no-image');
            if (this.imageElement) {
                this.imageElement.style.display = 'none';
            }
        }
        this.element.classList.remove('loading');
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Click handler for modal trigger
        this.element.addEventListener('click', (e) => {
            // Prevent if clicking on a link inside the card
            if (e.target.tagName === 'A') return;
            
            this.handleCardClick(e);
        });
        
        // Keyboard accessibility
        this.element.setAttribute('tabindex', '0');
        this.element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.handleCardClick(e);
            }
        });
    }
    
    /**
     * Handle card click events
     * @param {Event} event - Click event
     */
    handleCardClick(event) {
        const title = this.element.querySelector('.solution-card-title')?.textContent;
        const description = this.element.querySelector('.solution-card-description')?.textContent;
        
        // Dispatch custom event for modal handler
        this.element.dispatchEvent(new CustomEvent('solution-card-click', {
            bubbles: true,
            detail: {
                title,
                description,
                element: this.element
            }
        }));
    }
    
    /**
     * Reveal animation when in viewport
     */
    reveal() {
        this.element.classList.add('visible');
    }
    
    /**
     * Clean up
     */
    destroy() {
        this.element.removeEventListener('click', this.handleCardClick);
        this.element.removeEventListener('keydown', this.handleCardClick);
        if (this.imageElement) {
            this.imageElement.removeEventListener('load', () => {});
            this.imageElement.removeEventListener('error', () => {});
        }
    }
}

export default SolutionCard;
