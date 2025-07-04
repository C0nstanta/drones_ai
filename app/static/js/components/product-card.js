/* app/static/js/components/product-card.js */

/**
 * Product Card Component
 * Handles card interactions, lazy loading, and dynamic content
 * Lightweight and performance-optimized
 */
class ProductCard {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            lazyLoadImages: true,
            imageLoadDelay: 100,
            currencySymbol: '$',
            onAddToCart: null,
            onQuickView: null,
            onAddToWishlist: null,
            ...options
        };
        
        // Cache DOM elements
        this.elements = {
            image: element.querySelector('.product-card__image'),
            imageContainer: element.querySelector('.product-card__image-container'),
            addToCartBtn: element.querySelector('.product-card__add-to-cart'),
            actionBtns: element.querySelectorAll('.product-card__action-btn'),
            priceElements: {
                current: element.querySelector('.product-card__price-current'),
                original: element.querySelector('.product-card__price-original'),
                discount: element.querySelector('.product-card__price-discount')
            }
        };
        
        // Product data
        this.productData = this.extractProductData();
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize the card
     */
    init() {
        // Setup lazy loading
        if (this.options.lazyLoadImages && this.elements.image) {
            this.setupLazyLoading();
        }
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize tooltips if needed
        this.initializeTooltips();
    }
    
    /**
     * Extract product data from element attributes
     */
    extractProductData() {
        return {
            id: this.element.dataset.productId,
            name: this.element.dataset.productName,
            price: parseFloat(this.element.dataset.productPrice) || 0,
            originalPrice: parseFloat(this.element.dataset.productOriginalPrice) || 0,
            category: this.element.dataset.productCategory,
            inStock: this.element.dataset.productStock !== 'false'
        };
    }
    
    /**
     * Setup lazy loading for images
     */
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage();
                        imageObserver.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '50px'
            });
            
            imageObserver.observe(this.elements.imageContainer);
        } else {
            // Fallback for older browsers
            this.loadImage();
        }
    }
    
    /**
     * Load product image
     */
    loadImage() {
        const img = this.elements.image;
        if (!img || img.src) return;
        
        const src = img.dataset.src;
        if (!src) return;
        
        // Create skeleton loader
        const skeleton = this.createImageSkeleton();
        this.elements.imageContainer.appendChild(skeleton);
        
        // Load image
        const tempImg = new Image();
        tempImg.onload = () => {
            setTimeout(() => {
                img.src = src;
                img.classList.add('is-loaded');
                skeleton.remove();
            }, this.options.imageLoadDelay);
        };
        
        tempImg.onerror = () => {
            img.src = this.options.placeholderImage || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y4ZjhmOCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiNjY2MiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
            skeleton.remove();
        };
        
        tempImg.src = src;
    }
    
    /**
     * Create image skeleton loader
     */
    createImageSkeleton() {
        const skeleton = document.createElement('div');
        skeleton.className = 'product-card__image-skeleton';
        return skeleton;
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Add to cart button
        if (this.elements.addToCartBtn) {
            this.elements.addToCartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleAddToCart();
            });
        }
        
        // Quick action buttons
        this.elements.actionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = btn.dataset.action;
                this.handleQuickAction(action);
            });
        });
        
        // Keyboard navigation
        this.element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target === this.element) {
                this.element.querySelector('a')?.click();
            }
        });
    }
    
    /**
     * Handle add to cart action
     */
    handleAddToCart() {
        if (!this.productData.inStock) {
            this.showNotification('Product is out of stock', 'error');
            return;
        }
        
        // Add loading state
        this.elements.addToCartBtn.classList.add('is-loading');
        this.elements.addToCartBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            // Callback or default behavior
            if (this.options.onAddToCart) {
                this.options.onAddToCart(this.productData);
            } else {
                this.showNotification('Added to cart!', 'success');
            }
            
            // Remove loading state
            this.elements.addToCartBtn.classList.remove('is-loading');
            this.elements.addToCartBtn.disabled = false;
            
            // Update button text temporarily
            const originalText = this.elements.addToCartBtn.textContent;
            this.elements.addToCartBtn.textContent = '✓ Added';
            
            setTimeout(() => {
                this.elements.addToCartBtn.textContent = originalText;
            }, 2000);
        }, 600);
    }
    
    /**
     * Handle quick action buttons
     */
    handleQuickAction(action) {
        switch (action) {
            case 'quickview':
                if (this.options.onQuickView) {
                    this.options.onQuickView(this.productData);
                } else {
                    console.log('Quick view:', this.productData);
                }
                break;
                
            case 'wishlist':
                this.toggleWishlist();
                break;
                
            case 'compare':
                this.addToCompare();
                break;
                
            default:
                console.warn('Unknown action:', action);
        }
    }
    
    /**
     * Toggle wishlist status
     */
    toggleWishlist() {
        const wishlistBtn = this.element.querySelector('[data-action="wishlist"]');
        if (!wishlistBtn) return;
        
        const isInWishlist = wishlistBtn.classList.toggle('is-active');
        
        if (this.options.onAddToWishlist) {
            this.options.onAddToWishlist(this.productData, isInWishlist);
        }
        
        // Update icon
        const icon = wishlistBtn.querySelector('svg, i');
        if (icon) {
            if (isInWishlist) {
                icon.style.fill = '#ef4444';
            } else {
                icon.style.fill = 'none';
            }
        }
        
        this.showNotification(
            isInWishlist ? 'Added to wishlist' : 'Removed from wishlist',
            'success'
        );
    }
    
    /**
     * Add product to comparison
     */
    addToCompare() {
        const compareList = this.getCompareList();
        
        if (compareList.includes(this.productData.id)) {
            this.showNotification('Already in comparison', 'info');
            return;
        }
        
        if (compareList.length >= 4) {
            this.showNotification('Maximum 4 products for comparison', 'warning');
            return;
        }
        
        compareList.push(this.productData.id);
        this.saveCompareList(compareList);
        this.showNotification('Added to comparison', 'success');
    }
    
    /**
     * Get comparison list from storage
     */
    getCompareList() {
        const stored = sessionStorage.getItem('compareList');
        return stored ? JSON.parse(stored) : [];
    }
    
    /**
     * Save comparison list
     */
    saveCompareList(list) {
        sessionStorage.setItem('compareList', JSON.stringify(list));
    }
    
    /**
     * Initialize tooltips
     */
    initializeTooltips() {
        const tooltipElements = this.element.querySelectorAll('[data-tooltip]');
        
        tooltipElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.showTooltip(el, el.dataset.tooltip);
            });
            
            el.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
    }
    
    /**
     * Show tooltip
     */
    showTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'product-card__tooltip';
        tooltip.textContent = text;
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.position = 'fixed';
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8}px`;
        tooltip.style.left = `${rect.left + (rect.width - tooltip.offsetWidth) / 2}px`;
        
        this.currentTooltip = tooltip;
    }
    
    /**
     * Hide tooltip
     */
    hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.remove();
            this.currentTooltip = null;
        }
    }
    
    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Emit custom event for global notification system
        const event = new CustomEvent('product-notification', {
            detail: { message, type, productId: this.productData.id }
        });
        
        document.dispatchEvent(event);
    }
    
    /**
     * Update price display
     */
    updatePrice(newPrice, originalPrice = null) {
        if (this.elements.priceElements.current) {
            this.elements.priceElements.current.textContent = 
                `${this.options.currencySymbol}${newPrice.toFixed(2)}`;
        }
        
        if (originalPrice && this.elements.priceElements.original) {
            this.elements.priceElements.original.textContent = 
                `${this.options.currencySymbol}${originalPrice.toFixed(2)}`;
            
            // Calculate discount
            const discount = Math.round((1 - newPrice / originalPrice) * 100);
            if (this.elements.priceElements.discount) {
                this.elements.priceElements.discount.textContent = `-${discount}%`;
            }
        }
    }
    
    /**
     * Destroy the card instance
     */
    destroy() {
        // Remove event listeners
        this.elements.addToCartBtn?.removeEventListener('click', this.handleAddToCart);
        
        // Hide tooltips
        this.hideTooltip();
        
        // Clear references
        this.element = null;
        this.elements = null;
    }
}

// Auto-initialize cards
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('[data-product-card]');
    
    cards.forEach(card => {
        const instance = new ProductCard(card);
        card.productCard = instance;
    });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductCard;
}
