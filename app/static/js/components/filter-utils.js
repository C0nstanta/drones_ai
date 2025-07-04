// app/static/js/components/filter-utils.js

/**
 * FilterUtils - Utility functions for filtering system
 * Provides helper methods and shared functionality
 */
const FilterUtils = {
  /**
   * Debounce function execution
   * @param {Function} func - Function to debounce
   * @param {number} delay - Delay in milliseconds
   * @returns {Function} Debounced function
   */
  debounce(func, delay) {
    let timeoutId;
    
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  },
  
  /**
   * Parse price string to number
   * @param {string} price - Price string
   * @returns {number}
   */
  parsePrice(price) {
    return parseFloat(price.replace(/[^0-9.-]+/g, ''));
  },
  
  /**
   * Format price for display
   * @param {number} price - Price value
   * @returns {string}
   */
  formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  },
  
  /**
   * Create range slider
   * @param {Object} config - Slider configuration
   * @returns {Object} Slider instance
   */
  createRangeSlider(config) {
    const {
      container,
      min = 0,
      max = 1000,
      values = [min, max],
      onChange
    } = config;
    
    const slider = {
      container,
      min,
      max,
      values,
      handles: [],
      progress: null,
      
      init() {
        this.render();
        this.bindEvents();
        return this;
      },
      
      render() {
        const track = container.querySelector('.filter-range__slider');
        const progress = container.querySelector('.filter-range__progress');
        
        // Create handles
        values.forEach((value, index) => {
          const handle = document.createElement('div');
          handle.className = 'filter-range__handle';
          handle.dataset.index = index;
          track.appendChild(handle);
          this.handles.push(handle);
        });
        
        this.progress = progress;
        this.updatePositions();
      },
      
      bindEvents() {
        this.handles.forEach(handle => {
          handle.addEventListener('mousedown', this.startDrag.bind(this));
          handle.addEventListener('touchstart', this.startDrag.bind(this));
        });
      },
      
      startDrag(e) {
        e.preventDefault();
        const handle = e.target;
        const index = parseInt(handle.dataset.index);
        
        const onMove = (e) => {
          const clientX = e.touches ? e.touches[0].clientX : e.clientX;
          const rect = this.container.getBoundingClientRect();
          const percent = Math.max(0, Math.min(1, 
            (clientX - rect.left) / rect.width
          ));
          
          const value = this.min + (this.max - this.min) * percent;
          this.setValue(index, value);
        };
        
        const onEnd = () => {
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('touchmove', onMove);
          document.removeEventListener('mouseup', onEnd);
          document.removeEventListener('touchend', onEnd);
        };
        
        document.addEventListener('mousemove', onMove);
        document.addEventListener('touchmove', onMove);
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchend', onEnd);
      },
      
      setValue(index, value) {
        // Constrain value
        value = Math.max(this.min, Math.min(this.max, value));
        
        // Prevent overlap
        if (index === 0 && value > this.values[1]) {
          value = this.values[1];
        } else if (index === 1 && value < this.values[0]) {
          value = this.values[0];
        }
        
        this.values[index] = value;
        this.updatePositions();
        
        if (onChange) {
          onChange(this.values);
        }
      },
      
      updatePositions() {
        const range = this.max - this.min;
        
        this.handles.forEach((handle, index) => {
          const percent = ((this.values[index] - this.min) / range) * 100;
          handle.style.left = `${percent}%`;
        });
        
        // Update progress bar
        if (this.progress) {
          const left = ((this.values[0] - this.min) / range) * 100;
          const right = ((this.values[1] - this.min) / range) * 100;
          
          this.progress.style.left = `${left}%`;
          this.progress.style.width = `${right - left}%`;
        }
      }
    };
    
    return slider.init();
  },
  
  /**
   * Animate number counting
   * @param {Element} element - Target element
   * @param {number} target - Target number
   * @param {number} duration - Animation duration
   */
  animateNumber(element, target, duration = 500) {
    const start = parseInt(element.textContent) || 0;
    const increment = (target - start) / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
      current += increment;
      
      if ((increment > 0 && current >= target) || 
          (increment < 0 && current <= target)) {
        current = target;
        clearInterval(timer);
      }
      
      element.textContent = Math.round(current).toLocaleString();
    }, 16);
  },
  
  /**
   * Smooth scroll to element
   * @param {Element} element - Target element
   * @param {number} offset - Offset from top
   */
  scrollToElement(element, offset = 100) {
    const top = element.getBoundingClientRect().top + 
                window.pageYOffset - offset;
    
    window.scrollTo({
      top,
      behavior: 'smooth'
    });
  },
  
  /**
   * Check if element is in viewport
   * @param {Element} element - Element to check
   * @returns {boolean}
   */
  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  }
};

// Export for use
window.FilterUtils = FilterUtils;
