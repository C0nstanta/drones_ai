// File: app/static/js/components/PaginationUI.js

/**
 * PaginationUI - Handles all pagination UI components
 * 
 * Features:
 * - Multiple pagination styles
 * - Responsive design
 * - Accessibility compliance
 * - Smooth animations
 * 
 * @class PaginationUI
 */
class PaginationUI {
    /**
     * Initialize pagination UI
     * @param {PaginationManager} paginationManager - Pagination manager instance
     * @param {Object} options - UI options
     */
    constructor(paginationManager, options = {}) {
        this.manager = paginationManager;
        this.options = {
            container: '.pagination-container',
            infoContainer: '.pagination-info',
            maxVisiblePages: 7,
            showInfo: true,
            showJumper: true,
            ...options
        };
        
        this.elements = {};
        this._init();
    }
    
    /**
     * Initialize UI
     * @private
     */
    _init() {
        this._createContainers();
        this._bindManagerEvents();
        this._render();
    }
    
    /**
     * Create UI containers
     * @private
     */
    _createContainers() {
        // Main pagination container
        const container = document.querySelector(this.options.container);
        if (!container) {
            console.error('Pagination container not found');
            return;
        }
        
        this.elements.container = container;
        this.elements.container.setAttribute('role', 'navigation');
        this.elements.container.setAttribute('aria-label', 'Pagination Navigation');
        
        // Info container
        if (this.options.showInfo) {
            const infoContainer = document.querySelector(this.options.infoContainer);
            if (infoContainer) {
                this.elements.infoContainer = infoContainer;
            }
        }
    }
    
    /**
     * Bind manager events
     * @private
     */
    _bindManagerEvents() {
        this.manager.options.onUpdate = (state) => {
            this._render(state);
        };
    }
    
    /**
     * Render pagination based on mode
     * @private
     * @param {Object} state - Pagination state
     */
    _render(state = this.manager.getState()) {
        switch (state.mode) {
            case 'numbered':
                this._renderNumberedPagination(state);
                break;
            case 'loadmore':
                this._renderLoadMorePagination(state);
                break;
            case 'infinite':
                this._renderInfinitePagination(state);
                break;
        }
        
        if (this.options.showInfo) {
            this._renderInfo(state);
        }
    }
    
    /**
     * Render numbered pagination
     * @private
     * @param {Object} state - Pagination state
     */
    _renderNumberedPagination(state) {
        const { currentPage, totalPages, loading } = state;
        
        if (totalPages <= 1) {
            this.elements.container.innerHTML = '';
            return;
        }
        
        const pages = this._calculateVisiblePages(currentPage, totalPages);
        
        const html = `
            <div class="pagination ${loading ? 'pagination--loading' : ''}">
                ${this._renderPrevButton(currentPage, loading)}
                
                <div class="pagination__pages">
                    ${pages.map(page => {
                        if (page === '...') {
                            return '<span class="pagination__ellipsis">...</span>';
                        }
                        
                        const isActive = page === currentPage;
                        return `
                            <button 
                                class="pagination__page ${isActive ? 'pagination__page--active' : ''}"
                                data-page="${page}"
                                ${isActive ? 'aria-current="page"' : ''}
                                ${loading ? 'disabled' : ''}
                                aria-label="Go to page ${page}"
                            >
                                ${page}
                            </button>
                        `;
                    }).join('')}
                </div>
                
                ${this._renderNextButton(currentPage, totalPages, loading)}
                
                ${this.options.showJumper ? this._renderJumper(currentPage, totalPages, loading) : ''}
            </div>
        `;
        
        this.elements.container.innerHTML = html;
        this._bindPaginationEvents();
    }
    
    /**
     * Render load more pagination
     * @private
     * @param {Object} state - Pagination state
     */
    _renderLoadMorePagination(state) {
        const { hasMore, loading } = state;
        
        if (!hasMore) {
            this.elements.container.innerHTML = `
                <div class="load-more">
                    <p class="load-more__end">No more products to load</p>
                </div>
            `;
            return;
        }
        
        const html = `
            <div class="load-more">
                <button 
                    class="load-more__button ${loading ? 'load-more__button--loading' : ''}"
                    ${loading ? 'disabled' : ''}
                    aria-label="Load more products"
                >
                    ${loading ? `
                        <span class="load-more__spinner"></span>
                        <span>Loading...</span>
                    ` : `
                        <span>Load More Products</span>
                        <svg class="load-more__icon" viewBox="0 0 24 24">
                            <path d="M7 10l5 5 5-5z"/>
                        </svg>
                    `}
                </button>
            </div>
        `;
        
        this.elements.container.innerHTML = html;
        
        if (!loading) {
            const button = this.elements.container.querySelector('.load-more__button');
            button.addEventListener('click', () => this.manager.loadNextPage());
        }
    }
    
    /**
     * Render infinite scroll pagination
     * @private
     * @param {Object} state - Pagination state
     */
    _renderInfinitePagination(state) {
        const { loading, hasMore } = state;
        
        const html = `
            <div class="infinite-scroll">
                ${loading ? `
                    <div class="infinite-scroll__loader">
                        <div class="infinite-scroll__spinner"></div>
                        <p>Loading more products...</p>
                    </div>
                ` : !hasMore ? `
                    <div class="infinite-scroll__end">
                        <p>You've reached the end</p>
                    </div>
                ` : ''}
            </div>
        `;
        
        this.elements.container.innerHTML = html;
    }
    
    /**
     * Render pagination info
     * @private
     * @param {Object} state - Pagination state
     */
    _renderInfo(state) {
        if (!this.elements.infoContainer) return;
        
        const { currentPage, totalPages, totalItems, itemsPerPage } = state;
        const startItem = (currentPage - 1) * itemsPerPage + 1;
        const endItem = Math.min(currentPage * itemsPerPage, totalItems);
        
        const html = `
            <div class="pagination-info">
                <span class="pagination-info__text">
                    Showing <strong>${startItem}-${endItem}</strong> 
                    of <strong>${totalItems}</strong> products
                </span>
            </div>
        `;
        
        this.elements.infoContainer.innerHTML = html;
    }
    
    /**
     * Calculate visible page numbers
     * @private
     * @param {number} current - Current page
     * @param {number} total - Total pages
     * @returns {Array} Array of page numbers and ellipsis
     */
    _calculateVisiblePages(current, total) {
        const max = this.options.maxVisiblePages;
        const pages = [];
        
        if (total <= max) {
            // Show all pages
            for (let i = 1; i <= total; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);
            
            let start = Math.max(2, current - Math.floor((max - 3) / 2));
            let end = Math.min(total - 1, start + max - 4);
            
            // Adjust if we're near the end
            if (end === total - 1) {
                start = Math.max(2, end - (max - 4));
            }
            
            // Add ellipsis if needed
            if (start > 2) {
                pages.push('...');
            }
            
            // Add middle pages
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            
            // Add ellipsis if needed
            if (end < total - 1) {
                pages.push('...');
            }
            
            // Always show last page
            pages.push(total);
        }
        
        return pages;
    }
    
    /**
     * Render previous button
     * @private
     */
    _renderPrevButton(currentPage, loading) {
        const disabled = currentPage === 1 || loading;
        return `
            <button 
                class="pagination__nav pagination__nav--prev"
                ${disabled ? 'disabled' : ''}
                data-page="${currentPage - 1}"
                aria-label="Go to previous page"
            >
                <svg viewBox="0 0 24 24">
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                </svg>
                <span>Previous</span>
            </button>
        `;
    }
    
    /**
     * Render next button
     * @private
     */
    _renderNextButton(currentPage, totalPages, loading) {
        const disabled = currentPage === totalPages || loading;
        return `
            <button 
                class="pagination__nav pagination__nav--next"
                ${disabled ? 'disabled' : ''}
                data-page="${currentPage + 1}"
                aria-label="Go to next page"
            >
                <span>Next</span>
                <svg viewBox="0 0 24 24">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                </svg>
            </button>
        `;
    }
    
    /**
     * Render page jumper
     * @private
     */
    _renderJumper(currentPage, totalPages, loading) {
        return `
            <div class="pagination__jumper">
                <span>Go to:</span>
                <input 
                    type="number" 
                    class="pagination__jumper-input"
                    min="1" 
                    max="${totalPages}"
                    value="${currentPage}"
                    ${loading ? 'disabled' : ''}
                    aria-label="Enter page number"
                >
                <button 
                    class="pagination__jumper-button"
                    ${loading ? 'disabled' : ''}
                    aria-label="Go to entered page"
                >
                    Go
                </button>
            </div>
        `;
    }
    
    /**
     * Bind pagination events
     * @private
     */
    _bindPaginationEvents() {
        // Page buttons
        this.elements.container.querySelectorAll('[data-page]').forEach(button => {
            if (!button.disabled) {
                button.addEventListener('click', (e) => {
                    const page = parseInt(e.currentTarget.dataset.page);
                    this.manager.loadPage(page);
                });
            }
        });
        
        // Page jumper
        const jumperInput = this.elements.container.querySelector('.pagination__jumper-input');
        const jumperButton = this.elements.container.querySelector('.pagination__jumper-button');
        
        if (jumperInput && jumperButton) {
            const handleJump = () => {
                const page = parseInt(jumperInput.value);
                const { totalPages } = this.manager.getState();
                
                if (page >= 1 && page <= totalPages) {
                    this.manager.loadPage(page);
                } else {
                    jumperInput.value = this.manager.getState().currentPage;
                }
            };
            
            jumperButton.addEventListener('click', handleJump);
            jumperInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleJump();
                }
            });
        }
    }
    
    /**
     * Update pagination mode
     * @param {string} mode - New mode
     */
    setMode(mode) {
        this.manager.setMode(mode);
    }
    
    /**
     * Update items per page
     * @param {number} itemsPerPage - New items per page
     */
    setItemsPerPage(itemsPerPage) {
        this.manager.setItemsPerPage(itemsPerPage);
    }
}
