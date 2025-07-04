// app/static/js/components/filter-manager.js

/**
 * FilterManager - Core filtering state management
 * Handles filter state, URL sync, and communication with server
 */
class FilterManager {
  constructor(options = {}) {
    this.options = {
      container: '[data-filter-container]',
      debounceDelay: 300,
      urlSync: true,
      onUpdate: null,
      onError: null,
      ...options
    };
    
    this.state = {
      filters: {},
      sort: 'relevance',
      page: 1,
      loading: false
    };
    
    this.listeners = new Set();
    this.debounceTimer = null;
    
    this.init();
  }
  
  /**
   * Initialize the filter manager
   */
  init() {
    // Load state from URL if enabled
    if (this.options.urlSync) {
      this.loadStateFromURL();
    }
    
    // Listen for browser back/forward
    window.addEventListener('popstate', () => {
      if (this.options.urlSync) {
        this.loadStateFromURL();
        this.notifyListeners('statechange', this.state);
      }
    });
  }
  
  /**
   * Add a filter
   * @param {string} type - Filter type (category, price, etc.)
   * @param {string} value - Filter value
   * @param {Object} metadata - Additional filter metadata
   */
  addFilter(type, value, metadata = {}) {
    if (!this.state.filters[type]) {
      this.state.filters[type] = [];
    }
    
    const filter = { value, ...metadata };
    
    // Check if filter already exists
    const exists = this.state.filters[type].some(
      f => f.value === value
    );
    
    if (!exists) {
      this.state.filters[type].push(filter);
      this.onFilterChange();
    }
  }
  
  /**
   * Remove a filter
   * @param {string} type - Filter type
   * @param {string} value - Filter value
   */
  removeFilter(type, value) {
    if (!this.state.filters[type]) return;
    
    this.state.filters[type] = this.state.filters[type].filter(
      f => f.value !== value
    );
    
    // Remove type if empty
    if (this.state.filters[type].length === 0) {
      delete this.state.filters[type];
    }
    
    this.onFilterChange();
  }
  
  /**
   * Toggle a filter
   * @param {string} type - Filter type
   * @param {string} value - Filter value
   * @param {Object} metadata - Additional filter metadata
   */
  toggleFilter(type, value, metadata = {}) {
    const hasFilter = this.hasFilter(type, value);
    
    if (hasFilter) {
      this.removeFilter(type, value);
    } else {
      this.addFilter(type, value, metadata);
    }
  }
  
  /**
   * Check if a filter is active
   * @param {string} type - Filter type
   * @param {string} value - Filter value
   * @returns {boolean}
   */
  hasFilter(type, value) {
    if (!this.state.filters[type]) return false;
    return this.state.filters[type].some(f => f.value === value);
  }
  
  /**
   * Set price range filter
   * @param {number} min - Minimum price
   * @param {number} max - Maximum price
   */
  setPriceRange(min, max) {
    this.state.filters.price = [{ min, max }];
    this.onFilterChange();
  }
  
  /**
   * Set sort order
   * @param {string} sort - Sort value
   */
  setSort(sort) {
    this.state.sort = sort;
    this.state.page = 1; // Reset to first page
    this.onFilterChange();
  }
  
  /**
   * Set current page
   * @param {number} page - Page number
   */
  setPage(page) {
    this.state.page = page;
    this.onFilterChange();
  }
  
  /**
   * Clear all filters
   */
  clearFilters() {
    this.state.filters = {};
    this.state.page = 1;
    this.onFilterChange();
  }
  
  /**
   * Get active filter count
   * @returns {number}
   */
  getFilterCount() {
    return Object.values(this.state.filters).reduce(
      (count, filters) => count + filters.length,
      0
    );
  }
  
  /**
   * Get flattened filter array
   * @returns {Array}
   */
  getFlatFilters() {
    const flat = [];
    
    Object.entries(this.state.filters).forEach(([type, filters]) => {
      filters.forEach(filter => {
        flat.push({ type, ...filter });
      });
    });
    
    return flat;
  }
  
  /**
   * Handle filter change
   */
  onFilterChange() {
    // Reset to first page on filter change
    if (this.state.page !== 1) {
      this.state.page = 1;
    }
    
    // Debounce the update
    clearTimeout(this.debounceTimer);
    
    this.debounceTimer = setTimeout(() => {
      this.updateResults();
    }, this.options.debounceDelay);
    
    // Notify listeners immediately for UI updates
    this.notifyListeners('filterchange', this.state);
  }
  
  /**
   * Update results from server
   */
  async updateResults() {
    if (this.state.loading) return;
    
    this.state.loading = true;
    this.notifyListeners('loading', true);
    
    try {
      const params = this.buildQueryParams();
      const response = await fetch(`/api/products?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }
      
      const data = await response.json();
      
      // Update URL if sync enabled
      if (this.options.urlSync) {
        this.updateURL();
      }
      
      // Notify listeners with results
      this.notifyListeners('update', {
        ...data,
        state: this.state
      });
      
      // Call custom update handler
      if (this.options.onUpdate) {
        this.options.onUpdate(data);
      }
      
    } catch (error) {
      console.error('Filter update error:', error);
      this.notifyListeners('error', error);
      
      if (this.options.onError) {
        this.options.onError(error);
      }
    } finally {
      this.state.loading = false;
      this.notifyListeners('loading', false);
    }
  }
  
  /**
   * Build query parameters from state
   * @returns {string}
   */
  buildQueryParams() {
    const params = new URLSearchParams();
    
    // Add filters
    Object.entries(this.state.filters).forEach(([type, filters]) => {
      filters.forEach(filter => {
        if (type === 'price' && filter.min !== undefined) {
          params.append('price_min', filter.min);
          params.append('price_max', filter.max);
        } else {
          params.append(type, filter.value);
        }
      });
    });
    
    // Add sort and pagination
    params.append('sort', this.state.sort);
    params.append('page', this.state.page);
    
    return params.toString();
  }
  
  /**
   * Update URL with current state
   */
  updateURL() {
    const params = this.buildQueryParams();
    const newURL = `${window.location.pathname}?${params}`;
    
    window.history.pushState(this.state, '', newURL);
  }
  
  /**
   * Load state from URL parameters
   */
  loadStateFromURL() {
    const params = new URLSearchParams(window.location.search);
    const newState = {
      filters: {},
      sort: params.get('sort') || 'relevance',
      page: parseInt(params.get('page')) || 1
    };
    
    // Parse filters from URL
    params.forEach((value, key) => {
      if (key === 'sort' || key === 'page') return;
      
      if (key === 'price_min') {
        if (!newState.filters.price) {
          newState.filters.price = [{}];
        }
        newState.filters.price[0].min = parseFloat(value);
      } else if (key === 'price_max') {
        if (!newState.filters.price) {
          newState.filters.price = [{}];
        }
        newState.filters.price[0].max = parseFloat(value);
      } else {
        if (!newState.filters[key]) {
          newState.filters[key] = [];
        }
        newState.filters[key].push({ value });
      }
    });
    
    this.state = newState;
  }
  
  /**
   * Subscribe to filter events
   * @param {Function} listener - Listener function
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    this.listeners.add(listener);
    
    return () => {
      this.listeners.delete(listener);
    };
  }
  
  /**
   * Notify all listeners
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  notifyListeners(event, data) {
    this.listeners.forEach(listener => {
      listener(event, data);
    });
  }
}

// Export for use
window.FilterManager = FilterManager;
