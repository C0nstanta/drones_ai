// app/static/js/components/filter-ui.js

/**
 * FilterUI - Handles filter interface interactions
 * Manages sidebar, active filters, and UI updates
 */
class FilterUI {
  constructor(filterManager, options = {}) {
    this.filterManager = filterManager;
    this.options = {
      sidebarSelector: '.filter-sidebar',
      toggleSelector: '.filter-toggle',
      activeFiltersSelector: '.active-filters__list',
      sortSelector: '.sort-controls__select',
      ...options
    };
    
    this.elements = {};
    this.init();
  }
  
  /**
   * Initialize the filter UI
   */
  init() {
    this.cacheElements();
    this.bindEvents();
    this.subscribeToManager();
    
    // Initial render
    this.updateActiveFilters();
    this.updateFilterCounts();
  }
  
  /**
   * Cache DOM elements
   */
  cacheElements() {
    this.elements = {
      sidebar: document.querySelector(this.options.sidebarSelector),
      toggle: document.querySelector(this.options.toggleSelector),
      activeFilters: document.querySelector(this.options.activeFiltersSelector),
      sortSelect: document.querySelector(this.options.sortSelector),
      overlay: document.querySelector('.filter-sidebar__overlay'),
      closeBtn: document.querySelector('.filter-sidebar__close'),
      clearBtn: document.querySelector('.filter-sidebar__clear')
    };
  }
  
  /**
   * Bind UI events
   */
  bindEvents() {
    // Mobile toggle
    if (this.elements.toggle) {
      this.elements.toggle.addEventListener('click', () => {
        this.toggleSidebar();
      });
    }
    
    // Overlay click
    if (this.elements.overlay) {
      this.elements.overlay.addEventListener('click', () => {
        this.closeSidebar();
      });
    }
    
    // Close button
    if (this.elements.closeBtn) {
      this.elements.closeBtn.addEventListener('click', () => {
        this.closeSidebar();
      });
    }
    
    // Clear filters
    if (this.elements.clearBtn) {
      this.elements.clearBtn.addEventListener('click', () => {
        this.filterManager.clearFilters();
      });
    }
    
    // Sort select
    if (this.elements.sortSelect) {
      this.elements.sortSelect.addEventListener('change', (e) => {
        this.filterManager.setSort(e.target.value);
      });
    }
    
    // Filter options
    this.bindFilterOptions();
    
    // Filter groups
    this.bindFilterGroups();
    
    // Price range
    this.bindPriceRange();
  }
  
  /**
   * Bind filter option events
   */
  bindFilterOptions() {
    const options = document.querySelectorAll('.filter-option');
    
    options.forEach(option => {
      const input = option.querySelector('.filter-option__input');
      const type = input.dataset.filterType;
      const value = input.value;
      const label = option.querySelector('.filter-option__label').textContent;
      
      // Set initial state
      input.checked = this.filterManager.hasFilter(type, value);
      
      // Handle change
      input.addEventListener('change', (e) => {
        this.filterManager.toggleFilter(type, value, { label });
      });
    });
  }
  
  /**
   * Bind filter group collapse/expand
   */
  bindFilterGroups() {
    const headers = document.querySelectorAll('.filter-group__header');
    
    headers.forEach(header => {
      header.addEventListener('click', () => {
        const group = header.closest('.filter-group');
        group.classList.toggle('is-collapsed');
      });
    });
  }
  
  /**
   * Bind price range inputs
   */
  bindPriceRange() {
    const minInput = document.querySelector('[data-price-min]');
    const maxInput = document.querySelector('[data-price-max]');
    
    if (!minInput || !maxInput) return;
    
    const updatePriceRange = () => {
      const min = parseFloat(minInput.value) || 0;
      const max = parseFloat(maxInput.value) || 999999;
      
      this.filterManager.setPriceRange(min, max);
    };
    
    minInput.addEventListener('change', updatePriceRange);
    maxInput.addEventListener('change', updatePriceRange);
    
    // Update slider if present
    this.initPriceSlider(minInput, maxInput);
  }
  
  /**
   * Initialize price range slider
   */
  initPriceSlider(minInput, maxInput) {
    // Implementation for visual slider
    // This would connect to the price inputs
  }
  
  /**
   * Subscribe to filter manager events
   */
  subscribeToManager() {
    this.filterManager.subscribe((event, data) => {
      switch (event) {
        case 'filterchange':
          this.updateActiveFilters();
          this.updateFilterCounts();
          this.updateCheckboxes();
          break;
        case 'loading':
          this.setLoading(data);
          break;
        case 'update':
          this.updateResultsCount(data.total);
          break;
      }
    });
  }
  
  /**
   * Update active filters display
   */
  updateActiveFilters() {
    if (!this.elements.activeFilters) return;
    
    const filters = this.filterManager.getFlatFilters();
    
    // Clear existing
    this.elements.activeFilters.innerHTML = '';
    
    // Add filter tags
    filters.forEach(filter => {
      const tag = this.createFilterTag(filter);
      this.elements.activeFilters.appendChild(tag);
    });
    
    // Update clear button state
    if (this.elements.clearBtn) {
      this.elements.clearBtn.disabled = filters.length === 0;
    }
  }
  
  /**
   * Create filter tag element
   */
  createFilterTag(filter) {
    const tag = document.createElement('div');
    tag.className = 'filter-tag';
    
    const displayValue = filter.label || filter.value;
    const displayType = this.formatFilterType(filter.type);
    
    tag.innerHTML = `
      <span class="filter-tag__label">${displayType}:</span>
      <span class="filter-tag__value">${displayValue}</span>
      <button class="filter-tag__remove" aria-label="Remove filter">
        <svg viewBox="0 0 12 12" fill="currentColor">
          <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
    `;
    
    // Bind remove event
    const removeBtn = tag.querySelector('.filter-tag__remove');
    removeBtn.addEventListener('click', () => {
      this.filterManager.removeFilter(filter.type, filter.value);
    });
    
    return tag;
  }
  
  /**
   * Format filter type for display
   */
  formatFilterType(type) {
    const formats = {
      category: 'Category',
      brand: 'Brand',
      price: 'Price',
      color: 'Color',
      size: 'Size'
    };
    
    return formats[type] || type.charAt(0).toUpperCase() + type.slice(1);
  }
  
  /**
   * Update filter counts
   */
  updateFilterCounts() {
    const count = this.filterManager.getFilterCount();
    
    // Update mobile toggle count
    if (this.elements.toggle) {
      const countEl = this.elements.toggle.querySelector('.filter-toggle__count');
      if (countEl) {
        countEl.textContent = count;
        countEl.style.display = count > 0 ? 'block' : 'none';
      }
    }
  }
  
  /**
   * Update checkbox states
   */
  updateCheckboxes() {
    const options = document.querySelectorAll('.filter-option__input');
    
    options.forEach(input => {
      const type = input.dataset.filterType;
      const value = input.value;
      input.checked = this.filterManager.hasFilter(type, value);
    });
  }
  
  /**
   * Update results count
   */
  updateResultsCount(total) {
    const countEl = document.querySelector('.results-count__number');
    if (countEl) {
      countEl.textContent = total.toLocaleString();
    }
  }
  
  /**
   * Set loading state
   */
  setLoading(loading) {
    if (this.elements.sidebar) {
      this.elements.sidebar.classList.toggle('filter-sidebar--loading', loading);
    }
    
    // Update product grid
    const grid = document.querySelector('.product-grid');
    if (grid) {
      grid.classList.toggle('filter-loading', loading);
    }
  }
  
  /**
   * Toggle sidebar visibility
   */
  toggleSidebar() {
    if (this.elements.sidebar) {
      this.elements.sidebar.classList.toggle('is-open');
      document.body.style.overflow = 
        this.elements.sidebar.classList.contains('is-open') ? 'hidden' : '';
    }
  }
  
  /**
   * Close sidebar
   */
  closeSidebar() {
    if (this.elements.sidebar) {
      this.elements.sidebar.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  }
}

// Export for use
window.FilterUI = FilterUI;
