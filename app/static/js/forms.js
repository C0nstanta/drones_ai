// /app/static/js/forms.js
/**
 * Form enhancement and validation for Adaptive Auto Hub website
 * Provides progressive enhancement for contact forms and user interactions
 */

class FormEnhancer {
    constructor(options = {}) {
        this.options = {
            validateOnBlur: true,
            validateOnInput: false,
            showSuccessStates: true,
            submitTimeout: 30000,
            ...options
        };
        
        this.forms = new Map();
        this.validators = new Map();
        
        this.init();
    }
    
    /**
     * Initialize form enhancements
     */
    init() {
        this.setupValidators();
        this.enhanceForms();
        this.setupGlobalEventListeners();
    }
    
    /**
     * Set up validation rules
     */
    setupValidators() {
        // Email validation
        this.validators.set('email', {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Please enter a valid email address'
        });
        
        // Phone validation (flexible international format)
        this.validators.set('phone', {
            pattern: /^[\+]?[1-9][\d]{0,15}$/,
            message: 'Please enter a valid phone number'
        });
        
        // Required field validation
        this.validators.set('required', {
            test: (value) => value.trim().length > 0,
            message: 'This field is required'
        });
        
        // Minimum length validation
        this.validators.set('minlength', {
            test: (value, min) => value.trim().length >= parseInt(min),
            message: (min) => `Minimum ${min} characters required`
        });
        
        // Maximum length validation
        this.validators.set('maxlength', {
            test: (value, max) => value.trim().length <= parseInt(max),
            message: (max) => `Maximum ${max} characters allowed`
        });
        
        // Company name validation (for business forms)
        this.validators.set('company', {
            pattern: /^[a-zA-Z0-9\s\-\.,&]+$/,
            message: 'Please enter a valid company name'
        });
        
        // Name validation
        this.validators.set('name', {
            pattern: /^[a-zA-Z\s\-']+$/,
            message: 'Please enter a valid name'
        });
    }
    
    /**
     * Enhance all forms on the page
     */
    enhanceForms() {
        const forms = document.querySelectorAll('form[data-enhance]');
        
        forms.forEach(form => {
            this.enhanceForm(form);
        });
    }
    
    /**
     * Enhance a specific form
     */
    enhanceForm(form) {
        const formId = form.id || `form_${Date.now()}`;
        form.id = formId;
        
        const formData = {
            element: form,
            fields: new Map(),
            isValid: false,
            isSubmitting: false
        };
        
        this.forms.set(formId, formData);
        
        // Enhance form fields
        this.enhanceFormFields(form, formData);
        
        // Add form event listeners
        this.setupFormEventListeners(form, formData);
        
        // Add loading states
        this.setupLoadingStates(form);
        
        // Add ARIA attributes for accessibility
        this.enhanceAccessibility(form);
    }
    
    /**
     * Enhance individual form fields
     */
    enhanceFormFields(form, formData) {
        const fields = form.querySelectorAll('input, textarea, select');
        
        fields.forEach(field => {
            const fieldData = {
                element: field,
                validators: this.getFieldValidators(field),
                isValid: false,
                errorElement: null
            };
            
            formData.fields.set(field.name || field.id, fieldData);
            
            // Create error message element
            this.createErrorElement(field, fieldData);
            
            // Add field event listeners
            this.setupFieldEventListeners(field, fieldData, formData);
            
            // Add visual enhancements
            this.enhanceFieldAppearance(field);
        });
    }
    
    /**
     * Get validators for a specific field
     */
    getFieldValidators(field) {
        const validators = [];
        
        // Required validation
        if (field.hasAttribute('required')) {
            validators.push('required');
        }
        
        // Type-based validation
        if (field.type === 'email') {
            validators.push('email');
        }
        
        if (field.type === 'tel') {
            validators.push('phone');
        }
        
        // Length validation
        if (field.hasAttribute('minlength')) {
            validators.push(['minlength', field.getAttribute('minlength')]);
        }
        
        if (field.hasAttribute('maxlength')) {
            validators.push(['maxlength', field.getAttribute('maxlength')]);
        }
        
        // Custom validation based on data attributes
        if (field.hasAttribute('data-validate')) {
            const customValidators = field.getAttribute('data-validate').split(',');
            validators.push(...customValidators);
        }
        
        return validators;
    }
    
    /**
     * Create error message element for field
     */
    createErrorElement(field, fieldData) {
        const errorId = `${field.id || field.name}_error`;
        let errorElement = document.getElementById(errorId);
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = errorId;
            errorElement.className = 'field-error';
            errorElement.setAttribute('role', 'alert');
            errorElement.setAttribute('aria-live', 'polite');
            
            // Insert after field or field container
            const container = field.closest('.form-group') || field.parentNode;
            container.appendChild(errorElement);
        }
        
        fieldData.errorElement = errorElement;
        field.setAttribute('aria-describedby', errorId);
    }
    
    /**
     * Set up event listeners for form fields
     */
    setupFieldEventListeners(field, fieldData, formData) {
        // Validation on blur
        if (this.options.validateOnBlur) {
            field.addEventListener('blur', () => {
                this.validateField(fieldData);
                this.updateFormValidation(formData);
            });
        }
        
        // Validation on input (with debouncing)
        if (this.options.validateOnInput) {
            let inputTimeout;
            field.addEventListener('input', () => {
                clearTimeout(inputTimeout);
                inputTimeout = setTimeout(() => {
                    this.validateField(fieldData);
                    this.updateFormValidation(formData);
                }, 300);
            });
        }
        
        // Clear errors on focus
        field.addEventListener('focus', () => {
            this.clearFieldError(fieldData);
        });
    }
    
    /**
     * Set up form-level event listeners
     */
    setupFormEventListeners(form, formData) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit(formData);
        });
        
        // Auto-save for drafts (if enabled)
        if (form.hasAttribute('data-autosave')) {
            this.setupAutoSave(form, formData);
        }
    }
    
    /**
     * Validate individual field
     */
    validateField(fieldData) {
        const field = fieldData.element;
        const value = field.value;
        const validators = fieldData.validators;
        
        fieldData.isValid = true;
        this.clearFieldError(fieldData);
        
        for (const validator of validators) {
            let validatorName, validatorParam;
            
            if (Array.isArray(validator)) {
                [validatorName, validatorParam] = validator;
            } else {
                validatorName = validator;
            }
            
            const validatorConfig = this.validators.get(validatorName);
            if (!validatorConfig) continue;
            
            let isValid = false;
            let errorMessage = validatorConfig.message;
            
            if (validatorConfig.pattern) {
                isValid = validatorConfig.pattern.test(value);
            } else if (validatorConfig.test) {
                isValid = validatorConfig.test(value, validatorParam);
                if (typeof errorMessage === 'function') {
                    errorMessage = errorMessage(validatorParam);
                }
            }
            
            if (!isValid) {
                fieldData.isValid = false;
                this.showFieldError(fieldData, errorMessage);
                break;
            }
        }
        
        // Update field appearance
        this.updateFieldAppearance(fieldData);
        
        return fieldData.isValid;
    }
    
    /**
     * Show field error message
     */
    showFieldError(fieldData, message) {
        const field = fieldData.element;
        const errorElement = fieldData.errorElement;
        
        field.classList.add('field-invalid');
        field.classList.remove('field-valid');
        field.setAttribute('aria-invalid', 'true');
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }
    
    /**
     * Clear field error state
     */
    clearFieldError(fieldData) {
        const field = fieldData.element;
        const errorElement = fieldData.errorElement;
        
        field.classList.remove('field-invalid');
        field.setAttribute('aria-invalid', 'false');
        
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        }
    }
    
    /**
     * Update field visual appearance based on validation state
     */
    updateFieldAppearance(fieldData) {
        const field = fieldData.element;
        
        if (fieldData.isValid && field.value.trim().length > 0) {
            field.classList.add('field-valid');
            field.classList.remove('field-invalid');
            
            if (this.options.showSuccessStates) {
                this.showFieldSuccess(fieldData);
            }
        }
    }
    
    /**
     * Show field success state
     */
    showFieldSuccess(fieldData) {
        const field = fieldData.element;
        
        // Add success indicator (could be a checkmark icon)
        if (!field.parentNode.querySelector('.field-success-icon')) {
            const successIcon = document.createElement('span');
            successIcon.className = 'field-success-icon';
            successIcon.innerHTML = '✓';
            successIcon.setAttribute('aria-hidden', 'true');
            field.parentNode.appendChild(successIcon);
        }
    }
    
    /**
     * Enhance field appearance with modern touches
     */
    enhanceFieldAppearance(field) {
        // Add floating label effect if needed
        if (field.hasAttribute('data-floating-label')) {
            this.setupFloatingLabel(field);
        }
        
        // Add character counter for limited fields
        if (field.hasAttribute('maxlength') && field.hasAttribute('data-counter')) {
            this.setupCharacterCounter(field);
        }
    }
    
    /**
     * Set up floating label effect
     */
    setupFloatingLabel(field) {
        const label = field.parentNode.querySelector('label');
        if (!label) return;
        
        const updateLabelState = () => {
            if (field.value.trim().length > 0 || field === document.activeElement) {
                label.classList.add('floating');
            } else {
                label.classList.remove('floating');
            }
        };
        
        field.addEventListener('focus', updateLabelState);
        field.addEventListener('blur', updateLabelState);
        field.addEventListener('input', updateLabelState);
        
        updateLabelState(); // Initial state
    }
    
    /**
     * Set up character counter
     */
    setupCharacterCounter(field) {
        const maxLength = parseInt(field.getAttribute('maxlength'));
        const counter = document.createElement('div');
        counter.className = 'character-counter';
        
        const updateCounter = () => {
            const currentLength = field.value.length;
            const remaining = maxLength - currentLength;
            
            counter.textContent = `${currentLength}/${maxLength}`;
            
            if (remaining < 10) {
                counter.classList.add('warning');
            } else {
                counter.classList.remove('warning');
            }
        };
        
        field.addEventListener('input', updateCounter);
        field.parentNode.appendChild(counter);
        updateCounter(); // Initial state
    }
    
    /**
     * Update overall form validation state
     */
    updateFormValidation(formData) {
        const allFieldsValid = Array.from(formData.fields.values())
            .every(fieldData => fieldData.isValid);
        
        formData.isValid = allFieldsValid;
        
        // Update submit button state
        const submitButton = formData.element.querySelector('[type="submit"]');
        if (submitButton) {
            submitButton.disabled = !allFieldsValid || formData.isSubmitting;
        }
        
        return allFieldsValid;
    }
    
    /**
     * Handle form submission
     */
    async handleFormSubmit(formData) {
        const form = formData.element;
        
        // Validate all fields
        let isValid = true;
        for (const fieldData of formData.fields.values()) {
            if (!this.validateField(fieldData)) {
                isValid = false;
            }
        }
        
        if (!isValid) {
            this.focusFirstError(formData);
            return;
        }
        
        // Set submitting state
        this.setSubmittingState(formData, true);
        
        try {
            await this.submitForm(formData);
            this.showFormSuccess(formData);
        } catch (error) {
            this.showFormError(formData, error.message);
        } finally {
            this.setSubmittingState(formData, false);
        }
    }
    
    /**
     * Submit form data
     */
    async submitForm(formData) {
        const form = formData.element;
        const formDataObj = new FormData(form);
        
        const response = await fetch(form.action || window.location.pathname, {
            method: form.method || 'POST',
            body: formDataObj,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || 'Form submission failed');
        }
        
        return result;
    }
    
    /**
     * Set form submitting state
     */
    setSubmittingState(formData, isSubmitting) {
        const form = formData.element;
        const submitButton = form.querySelector('[type="submit"]');
        
        formData.isSubmitting = isSubmitting;
        
        if (submitButton) {
            submitButton.disabled = isSubmitting;
            
            if (isSubmitting) {
                submitButton.classList.add('btn-loading');
                submitButton.setAttribute('aria-busy', 'true');
            } else {
                submitButton.classList.remove('btn-loading');
                submitButton.setAttribute('aria-busy', 'false');
            }
        }
        
        form.classList.toggle('form-submitting', isSubmitting);
    }
    
    /**
     * Show form success message
     */
    showFormSuccess(formData) {
        const form = formData.element;
        
        this.showFormMessage(form, 'Thank you! Your message has been sent successfully.', 'success');
        
        // Reset form
        form.reset();
        
        // Clear validation states
        formData.fields.forEach(fieldData => {
            this.clearFieldError(fieldData);
            fieldData.element.classList.remove('field-valid', 'field-invalid');
        });
    }
    
    /**
     * Show form error message
     */
    showFormError(formData, message) {
        const form = formData.element;
        this.showFormMessage(form, message || 'An error occurred. Please try again.', 'error');
    }
    
    /**
     * Show form message (success or error)
     */
    showFormMessage(form, message, type) {
        let messageElement = form.querySelector('.form-message');
        
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.className = 'form-message';
            messageElement.setAttribute('role', 'alert');
            form.insertBefore(messageElement, form.firstChild);
        }
        
        messageElement.textContent = message;
        messageElement.className = `form-message form-message-${type}`;
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Auto-hide success messages
        if (type === 'success') {
            setTimeout(() => {
                messageElement.style.display = 'none';
            }, 5000);
        }
    }
    
    /**
     * Focus first field with error
     */
    focusFirstError(formData) {
        for (const fieldData of formData.fields.values()) {
            if (!fieldData.isValid) {
                fieldData.element.focus();
                break;
            }
        }
    }
    
    /**
     * Set up global event listeners
     */
    setupGlobalEventListeners() {
        // Handle dynamic form additions
        document.addEventListener('DOMContentLoaded', () => {
            this.enhanceForms();
        });
        
        // Re-enhance forms when new content is added
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const newForms = node.querySelectorAll('form[data-enhance]');
                        newForms.forEach(form => this.enhanceForm(form));
                    }
                });
            });
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    }
    
    /**
     * Enhance accessibility features
     */
    enhanceAccessibility(form) {
        // Add form labeling
        if (!form.getAttribute('aria-label') && !form.getAttribute('aria-labelledby')) {
            const heading = form.querySelector('h1, h2, h3, h4, h5, h6');
            if (heading && heading.id) {
                form.setAttribute('aria-labelledby', heading.id);
            }
        }
        
        // Ensure all fields have labels
        const fields = form.querySelectorAll('input, textarea, select');
        fields.forEach(field => {
            if (!field.getAttribute('aria-label') && !field.getAttribute('aria-labelledby')) {
                const label = form.querySelector(`label[for="${field.id}"]`);
                if (!label && field.id) {
                    const implicitLabel = field.closest('label');
                    if (!implicitLabel) {
                        console.warn(`Field ${field.id} is missing a label`);
                    }
                }
            }
        });
    }
}

// Initialize form enhancement
function initFormEnhancement() {
    const formEnhancer = new FormEnhancer({
        validateOnBlur: true,
        validateOnInput: false,
        showSuccessStates: true
    });
    
    // Export for global access
    window.formEnhancer = formEnhancer;
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFormEnhancement);
} else {
    initFormEnhancement();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormEnhancer;
}
