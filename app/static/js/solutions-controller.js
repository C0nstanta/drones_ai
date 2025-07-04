// app/static/js/solutions-controller.js

import SolutionGrid from './solution-grid.js';
import SolutionModal from './solution-modal.js';

/**
 * Main controller for the solutions section
 * Coordinates all solution components
 */
class SolutionsController {
    constructor() {
        this.grid = null;
        this.modal = null;
        this.initialized = false;
        
        // Wait for DOM ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    /**
     * Initialize all components
     */
    init() {
        // Check if solutions section exists
        const solutionsSection = document.querySelector('.solutions-section');
        if (!solutionsSection) return;
        
        // Initialize components
        this.grid = new SolutionGrid();
        this.modal = new SolutionModal();
        
        this.initialized = true;
        
        // Setup performance monitoring
        this.monitorPerformance();
    }
    
    /**
     * Monitor and log performance metrics
     */
    monitorPerformance() {
        // Check if Performance API is available
        if ('performance' in window && 'PerformanceObserver' in window) {
            // Log initial load metrics
            window.addEventListener('load', () => {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log('Solutions Section Performance:', {
                    domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                    loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
                });
            });
        }
    }
    
    /**
     * Public method to add a solution card dynamically
     * @param {Object} solutionData - Solution information
     */
    addSolution(solutionData) {
        if (!this.grid) return;
        
        const cardElement = this.createCardElement(solutionData);
        this.grid.addCard(cardElement);
    }
    
    /**
     * Create a card element from data
     * @param {Object} data - Solution data
     * @returns {HTMLElement} Card element
     */
    createCardElement(data) {
        const card = document.createElement('article');
        card.className = 'solution-card';
        
        card.innerHTML = `
            <div class="solution-card-image ${data.image ? '' : 'no-image'}">
                ${data.image ? `<img src="${data.image}" alt="${data.title}">` : ''}
            </div>
            <div class="solution-card-content">
                <h3 class="solution-card-title">${data.title}</h3>
                <p class="solution-card-description">${data.description}</p>
                ${data.tags ? this.createTagsHTML(data.tags) : ''}
            </div>
        `;
        
        return card;
    }
    
    /**
     * Create tags HTML
     * @param {Array} tags - Array of tag strings
     * @returns {String} Tags HTML
     */
    createTagsHTML(tags) {
        const tagsHTML = tags.map(tag => 
            `<span class="solution-tag">${tag}</span>`
        ).join('');
        
        return `<div class="solution-card-tags">${tagsHTML}</div>`;
    }
    
    /**
     * Clean up all components
     */
    destroy() {
        if (this.grid) {
            this.grid.destroy();
            this.grid = null;
        }
        
        if (this.modal) {
            this.modal.destroy();
            this.modal = null;
        }
        
        this.initialized = false;
    }
}

// Auto-initialize when imported
const solutionsController = new SolutionsController();

// Export for use in other modules if needed
export default solutionsController;
