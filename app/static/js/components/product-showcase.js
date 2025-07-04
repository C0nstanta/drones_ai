/* app/static/js/components/product-showcase.js */

/**
 * Product Showcase Controller
 * Manages grid initialization, animations, and filtering
 * Performance-optimized with intersection observer and debouncing
 */
class ProductShowcase {
    constructor(container, options = {}) {
        this.container = container;
        this.grid = container.querySelector('.product-grid');
        this.items = [];
        this.visibleItems = new Set();
        this.filters = new Map();
        this.isInitialized = false;
        
        // Configuration
        this.options = {
            animationStagger: 50,
            observerThreshold: 0.1,
            observerRootMargin: '50px',
            debounceDelay: 300,
            itemsPerLoad: 12,
            enableVirtualScroll: false,
            onFilterChange: null,
            onItemClick: null,
            ...options
        };
        
        // Performance tracking
        this.performance = {
            renderTime: 0,
            filterTime: 0,
            itemCount: 0
        };
        
        // Bind methods
        this.handleIntersection = this.handleIntersection.bind(this);
        this.handleResize = this.debounce(this.handleResize.bind(this), 250);
        this.handleFilterChange = this.handleFilterChange.bind(this);
        
        this.init();
    }
    
    /**
     * Initialize the showcase
     */
    init() {
        if (this.isInitialized) return;
        
        // Setup intersection observer for lazy animations
        this.setupIntersectionObserver();
        
        // Get all product items
        this.items = Array.from(this.grid.querySelectorAll('.product-grid-item'));
        this.performance.itemCount = this.items.length;
        
        // Setup resize observer for responsive behavior
        this.setupResizeObserver();
        
        // Initialize filter system
        this.initializeFilters();
        
        // Add loading spinner
        this.addLoadingSpinner();
        
        // Mark as initialized
        this.isInitialized = true;
        
        // Trigger initial animations
        this.animateVisibleItems();
        
        console.log('ProductShowcase initialized:', {
            itemCount: this.items.length,
            container: this.container
        });
    }
    
    /**
     * Setup Intersection Observer for viewport detection
     */
    setupIntersectionObserver() {
        const options = {
            threshold: this.options.observerThreshold,
            rootMargin: this.options.observerRootMargin
        };
        
        this.observer = new IntersectionObserver(this.handleIntersection, options);
        
        // Observe all items
        requestAnimationFrame(() => {
            const items = this.grid.querySelectorAll('.product-grid-item');
            items.forEach(item => this.observer.observe(item));
        });
    }
    
    /**
     * Handle intersection observer callbacks
     */
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !this.visibleItems.has(entry.target)) {
                this.visibleItems.add(entry.target);
                requestAnimationFrame(() => {
                    entry.target.classList.add('is-visible');
                });
            }
        });
    }
    
    /**
     * Setup resize observer for responsive grid adjustments
     */
    setupResizeObserver() {
        if ('ResizeObserver' in window) {
            this.resizeObserver = new ResizeObserver(this.handleResize);
            this.resizeObserver.observe(this.container);
        } else {
            // Fallback to window resize
            window.addEventListener('resize', this.handleResize);
        }
    }
    
    /**
     * Handle container resize
     */
    handleResize() {
        // Update CSS custom properties if needed
        const containerWidth = this.container.offsetWidth;
        if (containerWidth < 768) {
            this.grid.style.setProperty('--columns', '1');
        } else if (containerWidth < 1024) {
            this.grid.style.setProperty('--columns', '2');
        } else if (containerWidth < 1400) {
            this.grid.style.setProperty('--columns', '3');
        } else {
            this.grid.style.setProperty('--columns', '4');
        }
    }
    
    /**
     * Initialize filter system
     */
    initializeFilters() {
        const filterControls = this.container.querySelector('.showcase-controls');
        if (!filterControls) return;
        
        // Setup filter event delegation
        filterControls.addEventListener('click', this.handleFilterChange);
        filterControls.addEventListener('change', this.handleFilterChange);
        
        // Initialize active filters
        this.filters.set('category', 'all');
        this.filters.set('tags', new Set());
    }
    
    /**
     * Handle filter changes
     */
    handleFilterChange(event) {
        const target = event.target;
        if (!target.matches('[data-filter]')) return;
        
        const filterType = target.dataset.filterType || 'category';
        const filterValue = target.dataset.filter;
        
        // Update filter state
        if (filterType === 'category') {
            this.filters.set('category', filterValue);
        } else if (filterType === 'tag') {
            const tags = this.filters.get('tags');
            if (target.checked) {
                tags.add(filterValue);
            } else {
                tags.delete(filterValue);
            }
        }
        
        // Apply filters
        this.applyFilters();
        
        // Callback
        if (this.options.onFilterChange) {
            this.options.onFilterChange(this.filters);
        }
    }
    
    /**
     * Apply active filters to items
     */
    applyFilters() {
        const startTime = performance.now();
        
        // Show loading state
        this.setLoadingState(true);
        
        // Prepare items for filtering animation
        this.items.forEach(item => {
            item.classList.add('is-filtering');
        });
        
        // Apply filters after a frame
        requestAnimationFrame(() => {
            let visibleCount = 0;
            
            this.items.forEach(item => {
                const shouldShow = this.itemMatchesFilters(item);
                
                if (shouldShow) {
                    item.classList.remove('is-hidden');
                    visibleCount++;
                } else {
                    item.classList.add('is-hidden');
                }
            });
            
            // Remove filtering state
            setTimeout(() => {
                this.items.forEach(item => {
                    item.classList.remove('is-filtering');
                });
                this.setLoadingState(false);
            }, 300);
            
            // Show empty state if needed
            this.toggleEmptyState(visibleCount === 0);
            
            // Track performance
            this.performance.filterTime = performance.now() - startTime;
            console.log(`Filter applied in ${this.performance.filterTime.toFixed(2)}ms`);
        });
    }
    
    /**
     * Check if item matches active filters
     */
    itemMatchesFilters(item) {
        const category = this.filters.get('category');
        const tags = this.filters.get('tags');
        
        // Check category filter
        if (category && category !== 'all') {
            const itemCategory = item.dataset.category;
            if (itemCategory !== category) return false;
        }
        
        // Check tag filters
        if (tags && tags.size > 0) {
            const itemTags = new Set((item.dataset.tags || '').split(',').map(t => t.trim()));
            const hasAllTags = Array.from(tags).every(tag => itemTags.has(tag));
            if (!hasAllTags) return false;
        }
        
        return true;
    }
    
    /**
     * Add loading spinner to grid
     */
    addLoadingSpinner() {
        const spinner = document.createElement('div');
        spinner.className = 'showcase-loading-spinner';
        spinner.setAttribute('aria-hidden', 'true');
        this.grid.appendChild(spinner);
    }
    
    /**
     * Set loading state
     */
    setLoadingState(isLoading) {
        if (isLoading) {
            this.grid.classList.add('is-loading');
        } else {
            this.grid.classList.remove('is-loading');
        }
    }
    
    /**
     * Toggle empty state
     */
    toggleEmptyState(isEmpty) {
        let emptyState = this.grid.querySelector('.showcase-empty');
        
        if (isEmpty && !emptyState) {
            emptyState = this.createEmptyState();
            this.grid.appendChild(emptyState);
        } else if (!isEmpty && emptyState) {
            emptyState.remove();
        }
    }
    
    /**
     * Create empty state element
     */
    createEmptyState() {
        const empty = document.createElement('div');
        empty.className = 'showcase-empty';
        empty.innerHTML = `
            <div class="showcase-empty-icon">🔍</div>
            <div class="showcase-empty-text">No products found</div>
            <div class="showcase-empty-hint">Try adjusting your filters</div>
        `;
        return empty;
    }
    
    /**
     * Animate visible items on initial load
     */
    animateVisibleItems() {
        const visibleItems = this.items.filter(item => {
            const rect = item.getBoundingClientRect();
            return rect.top < window.innerHeight && rect.bottom > 0;
        });
        
        visibleItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('is-visible');
            }, index * this.options.animationStagger);
        });
    }
    
    /**
     * Load more items (for pagination/infinite scroll)
     */
    loadMore(newItems) {
        const fragment = document.createDocumentFragment();
        
        newItems.forEach((itemData, index) => {
            const item = this.createItemElement(itemData);
            fragment.appendChild(item);
            this.items.push(item);
            
            // Observe new item
            if (this.observer) {
                this.observer.observe(item);
            }
        });
        
        this.grid.appendChild(fragment);
        this.performance.itemCount = this.items.length;
    }
    
    /**
     * Create item element from data
     */
    createItemElement(data) {
        const item = document.createElement('div');
        item.className = 'product-grid-item';
        item.dataset.category = data.category || '';
        item.dataset.tags = (data.tags || []).join(',');
        item.dataset.productId = data.id || '';
        return item;
    }
    
    /**
     * Utility: Debounce function
     */
    debounce(func, wait) {
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
    
    /**
     * Destroy the showcase instance
     */
    destroy() {
        // Remove observers
        if (this.observer) {
            this.observer.disconnect();
        }
        
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        } else {
            window.removeEventListener('resize', this.handleResize);
        }
        
        // Remove event listeners
        const filterControls = this.container.querySelector('.showcase-controls');
        if (filterControls) {
            filterControls.removeEventListener('click', this.handleFilterChange);
            filterControls.removeEventListener('change', this.handleFilterChange);
        }
        
        // Clear references
        this.items = [];
        this.visibleItems.clear();
        this.filters.clear();
        
        console.log('ProductShowcase destroyed');
    }
}

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    const showcases = document.querySelectorAll('[data-product-showcase]');
    
    showcases.forEach(showcase => {
        const instance = new ProductShowcase(showcase, {
            // Override options from data attributes
            animationStagger: parseInt(showcase.dataset.animationStagger) || 50,
            itemsPerLoad: parseInt(showcase.dataset.itemsPerLoad) || 12
        });
        
        // Store instance on element for external access
        showcase.productShowcase = instance;
    });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductShowcase;
}
