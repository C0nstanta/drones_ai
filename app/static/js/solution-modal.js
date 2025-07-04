// app/static/js/solution-modal.js

/**
 * Solution Modal Handler
 * Manages modal display for solution details
 */
class SolutionModal {
    /**
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        this.options = {
            modalSelector: '.solution-modal',
            closeSelector: '.solution-modal-close',
            contentSelector: '.solution-modal-body',
            activeClass: 'active',
            ...options
        };
        
        this.modal = null;
        this.closeButton = null;
        this.contentArea = null;
        this.isOpen = false;
        
        this.init();
    }
    
    /**
     * Initialize modal
     */
    init() {
        this.createModal();
        this.setupEventListeners();
    }
    
    /**
     * Create modal DOM structure if it doesn't exist
     */
    createModal() {
        // Check if modal already exists
        this.modal = document.querySelector(this.options.modalSelector);
        
        if (!this.modal) {
            // Create modal structure
            this.modal = document.createElement('div');
            this.modal.className = 'solution-modal';
            this.modal.innerHTML = `
                <div class="solution-modal-content">
                    <button class="solution-modal-close" aria-label="Close modal"></button>
                    <div class="solution-modal-body"></div>
                </div>
            `;
            document.body.appendChild(this.modal);
        }
        
        this.closeButton = this.modal.querySelector(this.options.closeSelector);
        this.contentArea = this.modal.querySelector(this.options.contentSelector);
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Close button
        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => this.close());
        }
        
        // Click outside to close
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
        
        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
        
        // Listen for card click events
        document.addEventListener('solution-card-click', (event) => {
            this.open(event.detail);
        });
    }
    
    /**
     * Open modal with content
     * @param {Object} data - Content data
     */
    open(data) {
        if (!this.modal || !this.contentArea) return;
        
        // Set content
        this.contentArea.innerHTML = `
            <h2>${data.title || 'Solution Details'}</h2>
            <p>${data.description || 'No description available.'}</p>
            ${data.additionalContent || ''}
        `;
        
        // Show modal
        this.modal.classList.add(this.options.activeClass);
        this.isOpen = true;
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Focus management for accessibility
        this.previousFocus = document.activeElement;
        this.closeButton.focus();
        
        // Trap focus within modal
        this.trapFocus();
    }
    
    /**
     * Close modal
     */
    close() {
        if (!this.modal || !this.isOpen) return;
        
        this.modal.classList.remove(this.options.activeClass);
        this.isOpen = false;
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Restore focus
        if (this.previousFocus) {
            this.previousFocus.focus();
        }
        
        // Remove focus trap
        this.releaseFocus();
    }
    
    /**
     * Trap focus within modal
     */
    trapFocus() {
        const focusableElements = this.modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        this.focusTrapHandler = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };
        
        this.modal.addEventListener('keydown', this.focusTrapHandler);
    }
    
    /**
     * Release focus trap
     */
    releaseFocus() {
        if (this.focusTrapHandler) {
            this.modal.removeEventListener('keydown', this.focusTrapHandler);
            this.focusTrapHandler = null;
        }
    }
    
    /**
     * Update modal content
     * @param {String} content - HTML content
     */
    updateContent(content) {
        if (this.contentArea) {
            this.contentArea.innerHTML = content;
        }
    }
    
    /**
     * Clean up
     */
    destroy() {
        this.close();
        if (this.modal && this.modal.parentNode) {
            this.modal.parentNode.removeChild(this.modal);
        }
        document.removeEventListener('keydown', () => {});
        document.removeEventListener('solution-card-click', () => {});
    }
}

export default SolutionModal;
