// app/static/js/solution-grid.js

import SolutionCard from './solution-card.js';

/**
 * Solution Grid Controller
 * Manages the grid of solution cards and orchestrates animations
 */
class SolutionGrid {
    /**
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        this.options = {
            containerSelector: '.solutions-grid',
            cardSelector: '.solution-card',
            headerSelector: '.solutions-header',
            revealThreshold: 0.1,
            staggerDelay: 100,
            ...options
        };
        
        this.container = document.querySelector(this.options.containerSelector);
        this.header = document.querySelector(this.options.headerSelector);
        this.cards = [];
        this.observer = null;
        
        if (this.container) {
            this.init();
        }
    }
    
    /**
     * Initialize grid functionality
     */
    init() {
        this.setupCards();
        this.setupIntersectionObserver();
        this.setupEventListeners();
    }
    
    /**
     * Initialize solution cards
     */
    setupCards() {
        const cardElements = this.container.querySelectorAll(this.options.cardSelector);
        
        cardElements.forEach((element, index) => {
            const card = new SolutionCard(element, {
                animationDelay: index * this.options.staggerDelay
            });
            this.cards.push(card);
        });
    }
    
    /**
     * Setup Intersection Observer for reveal animations
     */
    setupIntersectionObserver() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: this.options.revealThreshold
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const card = this.cards.find(c => c.element === entry.target);
                    if (card) {
                        card.reveal();
                        this.observer.unobserve(entry.target);
                    }
                }
            });
        }, observerOptions);
        
        // Observe all cards
        this.cards.forEach(card => {
            this.observer.observe(card.element);
        });
        
        // Also observe header if exists
        if (this.header) {
            this.observer.observe(this.header);
        }
    }
    
    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Listen for card click events
        this.container.addEventListener('solution-card-click', (event) => {
            this.handleCardClick(event.detail);
        });
    }
    
    /**
     * Handle card click - can be extended for modal functionality
     * @param {Object} detail - Event detail object
     */
    handleCardClick(detail) {
        // This will be handled by solution-modal.js
        console.log('Card clicked:', detail.title);
    }
    
    /**
     * Add a new card dynamically
     * @param {HTMLElement} cardElement - New card element
     */
    addCard(cardElement) {
        this.container.appendChild(cardElement);
        const card = new SolutionCard(cardElement);
        this.cards.push(card);
        
        // Observe the new card
        if (this.observer) {
            this.observer.observe(cardElement);
        }
    }
    
    /**
     * Clean up
     */
    destroy() {
        // Disconnect observer
        if (this.observer) {
            this.observer.disconnect();
        }
        
        // Destroy all cards
        this.cards.forEach(card => card.destroy());
        this.cards = [];
    }
}

export default SolutionGrid;
