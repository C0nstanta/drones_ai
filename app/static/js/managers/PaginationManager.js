// File: app/static/js/managers/PaginationManager.js

/**
 * PaginationManager - Handles pagination state and logic
 * 
 * Features:
 * - Page state management
 * - URL synchronization
 * - Multiple pagination modes
 * - Prefetching support
 * - Integration with FilterManager
 * 
 * @class PaginationManager
 */
class PaginationManager {
    /**
     * Initialize pagination manager
     * @param {Object} options - Configuration options
     * @param {number} options.itemsPerPage - Items to show per page
     * @param {string} options.mode - Pagination mode (numbered|loadmore|infinite)
     * @param {Function} options.onUpdate - Callback for page changes
     * @param {boolean} options.prefetch - Enable prefetching
     * @param {Object} options.filterManager - Reference to FilterManager instance
     */
    constructor(options = {}) {
        this.options = {
            itemsPerPage: 24,
            mode: 'numbered',
            onUpdate: () => {},
            prefetch: true,
            scrollThreshold: 0.8,
            ...options
        };
        
        this.state = {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            items: [],
            loading: false,
            hasMore: true
        };
        
        this.cache = new Map();
        this.prefetchQueue = new Set();
        this.abortController = null;
        
        this._init();
    }
    
    /**
     * Initialize manager
     * @private
     */
    _init() {
        this._bindEvents();
        this._restoreFromURL();
        
        if (this.options.mode === 'infinite') {
            this._initInfiniteScroll();
        }
    }
    
    /**
     * Bind event listeners
     * @private
     */
    _bindEvents() {
        // Listen for filter changes
        if (this.options.filterManager) {
            this.options.filterManager.on('filtersChanged', () => {
                this.reset();
            });
        }
        
        // Listen for popstate (browser back/forward)
        window.addEventListener('popstate', () => {
            this._restoreFromURL();
            this.loadPage(this.state.currentPage, false);
        });
    }
    
    /**
     * Initialize infinite scroll
     * @private
     */
    _initInfiniteScroll() {
        const scrollContainer = document.querySelector('.product-grid-container') || window;
        const scrollElement = scrollContainer === window ? document.documentElement : scrollContainer;
        
        let ticking = false;
        const checkScroll = () => {
            if (!ticking && !this.state.loading && this.state.hasMore) {
                window.requestAnimationFrame(() => {
                    const scrollHeight = scrollElement.scrollHeight;
                    const scrollTop = scrollContainer === window 
                        ? window.pageYOffset 
                        : scrollContainer.scrollTop;
                    const clientHeight = scrollContainer === window 
                        ? window.innerHeight 
                        : scrollContainer.clientHeight;
                    
                    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
                    
                    if (scrollPercentage > this.options.scrollThreshold) {
                        this.loadNextPage();
                    }
                    
                    ticking = false;
                });
                ticking = true;
            }
        };
        
        scrollContainer.addEventListener('scroll', checkScroll, { passive: true });
    }
    
    /**
     * Load specific page
     * @param {number} page - Page number to load
     * @param {boolean} updateURL - Whether to update URL
     * @returns {Promise<Object>} Page data
     */
    async loadPage(page, updateURL = true) {
        if (page < 1 || (this.state.totalPages > 0 && page > this.state.totalPages)) {
            return;
        }
        
        // Check cache first
        const cacheKey = this._getCacheKey(page);
        if (this.cache.has(cacheKey)) {
            const cachedData = this.cache.get(cacheKey);
            this._updateState(cachedData, page);
            if (updateURL) this._updateURL();
            return cachedData;
        }
        
        // Cancel any pending requests
        if (this.abortController) {
            this.abortController.abort();
        }
        
        this.state.loading = true;
        this._emitUpdate();
        
        try {
            this.abortController = new AbortController();
            
            const params = new URLSearchParams({
                page: page,
                limit: this.options.itemsPerPage,
                ...this._getFilterParams()
            });
            
            const response = await fetch(`/api/products?${params}`, {
                signal: this.abortController.signal
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Cache the results
            this.cache.set(cacheKey, data);
            
            // Update state
            this._updateState(data, page);
            
            // Update URL
            if (updateURL) {
                this._updateURL();
            }
            
            // Prefetch adjacent pages
            if (this.options.prefetch) {
                this._prefetchPages(page);
            }
            
            return data;
            
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Failed to load page:', error);
                this.state.loading = false;
                this._emitUpdate();
            }
        }
    }
    
    /**
     * Load next page (for load more / infinite scroll)
     * @returns {Promise<Object>} Page data
     */
    async loadNextPage() {
        if (!this.state.hasMore || this.state.loading) {
            return;
        }
        
        const nextPage = this.state.currentPage + 1;
        const data = await this.loadPage(nextPage);
        
        if (this.options.mode !== 'numbered' && data) {
            // Append items instead of replacing
            this.state.items = [...this.state.items, ...data.items];
            this._emitUpdate();
        }
        
        return data;
    }
    
    /**
     * Prefetch adjacent pages
     * @private
     * @param {number} currentPage - Current page number
     */
    async _prefetchPages(currentPage) {
        const pagesToPrefetch = [];
        
        // Prefetch next page
        if (currentPage < this.state.totalPages) {
            pagesToPrefetch.push(currentPage + 1);
        }
        
        // Prefetch previous page (for numbered pagination)
        if (this.options.mode === 'numbered' && currentPage > 1) {
            pagesToPrefetch.push(currentPage - 1);
        }
        
        for (const page of pagesToPrefetch) {
            const cacheKey = this._getCacheKey(page);
            
            if (!this.cache.has(cacheKey) && !this.prefetchQueue.has(page)) {
                this.prefetchQueue.add(page);
                
                // Prefetch in background
                this._prefetchPage(page).finally(() => {
                    this.prefetchQueue.delete(page);
                });
            }
        }
    }
    
    /**
     * Prefetch single page
     * @private
     * @param {number} page - Page to prefetch
     */
    async _prefetchPage(page) {
        try {
            const params = new URLSearchParams({
                page: page,
                limit: this.options.itemsPerPage,
                ...this._getFilterParams()
            });
            
            const response = await fetch(`/api/products?${params}`, {
                priority: 'low'
            });
            
            if (response.ok) {
                const data = await response.json();
                const cacheKey = this._getCacheKey(page);
                this.cache.set(cacheKey, data);
            }
        } catch (error) {
            // Silently fail for prefetch
        }
    }
    
    /**
     * Update internal state
     * @private
     * @param {Object} data - API response data
     * @param {number} page - Current page
     */
    _updateState(data, page) {
        const totalPages = Math.ceil(data.total / this.options.itemsPerPage);
        
        this.state = {
            currentPage: page,
            totalPages: totalPages,
            totalItems: data.total,
            items: this.options.mode === 'numbered' ? data.items : this.state.items,
            loading: false,
            hasMore: page < totalPages
        };
        
        this._emitUpdate();
    }
    
    /**
     * Get filter parameters
     * @private
     * @returns {Object} Filter parameters
     */
    _getFilterParams() {
        if (this.options.filterManager) {
            return this.options.filterManager.getActiveFilters();
        }
        return {};
    }
    
    /**
     * Get cache key
     * @private
     * @param {number} page - Page number
     * @returns {string} Cache key
     */
    _getCacheKey(page) {
        const filters = JSON.stringify(this._getFilterParams());
        return `page_${page}_${filters}`;
    }
    
    /**
     * Update URL with current page
     * @private
     */
    _updateURL() {
        const url = new URL(window.location);
        
        if (this.state.currentPage > 1) {
            url.searchParams.set('page', this.state.currentPage);
        } else {
            url.searchParams.delete('page');
        }
        
        window.history.pushState({}, '', url);
    }
    
    /**
     * Restore page from URL
     * @private
     */
    _restoreFromURL() {
        const params = new URLSearchParams(window.location.search);
        const page = parseInt(params.get('page')) || 1;
        
        if (page !== this.state.currentPage) {
            this.state.currentPage = page;
        }
    }
    
    /**
     * Emit update event
     * @private
     */
    _emitUpdate() {
        this.options.onUpdate({
            ...this.state,
            mode: this.options.mode
        });
    }
    
    /**
     * Reset pagination
     */
    reset() {
        this.state.currentPage = 1;
        this.state.items = [];
        this.cache.clear();
        this.prefetchQueue.clear();
        
        if (this.abortController) {
            this.abortController.abort();
        }
        
        this.loadPage(1);
    }
    
    /**
     * Set items per page
     * @param {number} itemsPerPage - New items per page
     */
    setItemsPerPage(itemsPerPage) {
        this.options.itemsPerPage = itemsPerPage;
        this.reset();
    }
    
    /**
     * Set pagination mode
     * @param {string} mode - New mode (numbered|loadmore|infinite)
     */
    setMode(mode) {
        this.options.mode = mode;
        
        if (mode === 'infinite') {
            this._initInfiniteScroll();
        }
        
        this._emitUpdate();
    }
    
    /**
     * Get current state
     * @returns {Object} Current pagination state
     */
    getState() {
        return { ...this.state };
    }
}
