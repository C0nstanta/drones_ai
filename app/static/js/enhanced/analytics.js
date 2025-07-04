// /app/static/js/enhanced/analytics.js
/**
 * Analytics and performance tracking for Adaptive Auto Hub website
 * Privacy-focused analytics and performance monitoring
 */

class Analytics {
    constructor(options = {}) {
        this.options = {
            trackPageViews: true,
            trackClicks: true,
            trackScrollDepth: true,
            trackFormSubmissions: true,
            trackPerformance: true,
            trackErrors: true,
            sessionTimeout: 30 * 60 * 1000, // 30 minutes
            ...options
        };
        
        this.sessionId = this.generateSessionId();
        this.pageViewId = this.generatePageViewId();
        this.startTime = Date.now();
        this.lastActivity = Date.now();
        this.events = [];
        this.performanceMetrics = {};
        
        this.init();
    }
    
    /**
     * Initialize analytics tracking
     */
    init() {
        if (this.options.trackPageViews) {
            this.trackPageView();
        }
        
        if (this.options.trackClicks) {
            this.setupClickTracking();
        }
        
        if (this.options.trackScrollDepth) {
            this.setupScrollTracking();
        }
        
        if (this.options.trackFormSubmissions) {
            this.setupFormTracking();
        }
        
        if (this.options.trackPerformance) {
            this.setupPerformanceTracking();
        }
        
        if (this.options.trackErrors) {
            this.setupErrorTracking();
        }
        
        this.setupSessionTracking();
        this.setupBeforeUnload();
        
        console.log('Analytics initialized', {
            sessionId: this.sessionId,
            pageViewId: this.pageViewId
        });
    }
    
    /**
     * Generate unique session ID
     */
    generateSessionId() {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Generate unique page view ID
     */
    generatePageViewId() {
        return 'pv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Track page view
     */
    trackPageView() {
        const pageData = {
            event: 'page_view',
            timestamp: Date.now(),
            sessionId: this.sessionId,
            pageViewId: this.pageViewId,
            url: window.location.href,
            path: window.location.pathname,
            referrer: document.referrer,
            title: document.title,
            userAgent: navigator.userAgent,
            language: navigator.language,
            screenResolution: `${screen.width}x${screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            deviceType: this.getDeviceType(),
            connectionType: this.getConnectionType()
        };
        
        this.sendEvent(pageData);
        this.updateLastActivity();
    }
    
    /**
     * Set up click tracking
     */
    setupClickTracking() {
        document.addEventListener('click', (event) => {
            const element = event.target;
            const clickData = this.getElementData(element);
            
            if (this.isTrackableElement(element)) {
                this.trackEvent('click', {
                    ...clickData,
                    x: event.clientX,
                    y: event.clientY,
                    timestamp: Date.now()
                });
                
                this.updateLastActivity();
            }
        });
    }
    
    /**
     * Set up scroll depth tracking
     */
    setupScrollTracking() {
        let maxScrollDepth = 0;
        const scrollMilestones = [25, 50, 75, 90, 100];
        const trackedMilestones = new Set();
        
        const trackScroll = this.throttle(() => {
            const scrollTop = window.pageYOffset;
            const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollDepth = Math.round((scrollTop / documentHeight) * 100);
            
            if (scrollDepth > maxScrollDepth) {
                maxScrollDepth = scrollDepth;
                
                // Track milestones
                scrollMilestones.forEach(milestone => {
                    if (scrollDepth >= milestone && !trackedMilestones.has(milestone)) {
                        trackedMilestones.add(milestone);
                        this.trackEvent('scroll_depth', {
                            depth: milestone,
                            timestamp: Date.now()
                        });
                    }
                });
                
                this.updateLastActivity();
            }
        }, 250);
        
        window.addEventListener('scroll', trackScroll, { passive: true });
    }
    
    /**
     * Set up form tracking
     */
    setupFormTracking() {
        // Track form submissions
        document.addEventListener('submit', (event) => {
            const form = event.target;
            const formData = this.getFormData(form);
            
            this.trackEvent('form_submit', {
                formId: form.id || 'unnamed',
                formAction: form.action,
                formMethod: form.method,
                fieldCount: form.elements.length,
                ...formData,
                timestamp: Date.now()
            });
            
            this.updateLastActivity();
        });
        
        // Track form field interactions
        document.addEventListener('focus', (event) => {
            if (this.isFormField(event.target)) {
                this.trackEvent('form_field_focus', {
                    fieldType: event.target.type,
                    fieldName: event.target.name,
                    formId: event.target.form?.id || 'unnamed',
                    timestamp: Date.now()
                });
            }
        }, true);
    }
    
    /**
     * Set up performance tracking
     */
    setupPerformanceTracking() {
        // Track page load performance
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.trackPerformanceMetrics();
            }, 0);
        });
        
        // Track Core Web Vitals
        this.trackCoreWebVitals();
        
        // Track resource loading
        this.trackResourcePerformance();
    }
    
    /**
     * Track performance metrics
     */
    trackPerformanceMetrics() {
        if (!('performance' in window)) return;
        
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        
        const metrics = {
            event: 'performance',
            timestamp: Date.now(),
            sessionId: this.sessionId,
            pageViewId: this.pageViewId,
            
            // Navigation timing
            domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
            loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,
            domInteractive: navigation?.domInteractive - navigation?.fetchStart,
            
            // Paint timing
            firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
            firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
            
            // Connection info
            connectionType: navigator.connection?.effectiveType,
            downlink: navigator.connection?.downlink,
            rtt: navigator.connection?.rtt
        };
        
        this.performanceMetrics = metrics;
        this.sendEvent(metrics);
    }
    
    /**
     * Track Core Web Vitals
     */
    trackCoreWebVitals() {
        // Largest Contentful Paint (LCP)
        if ('PerformanceObserver' in window) {
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    
                    this.trackEvent('core_web_vital', {
                        metric: 'LCP',
                        value: lastEntry.startTime,
                        rating: this.getWebVitalRating('LCP', lastEntry.startTime),
                        timestamp: Date.now()
                    });
                });
                
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                console.warn('LCP tracking not supported');
            }
            
            // First Input Delay (FID)
            try {
                const fidObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        this.trackEvent('core_web_vital', {
                            metric: 'FID',
                            value: entry.processingStart - entry.startTime,
                            rating: this.getWebVitalRating('FID', entry.processingStart - entry.startTime),
                            timestamp: Date.now()
                        });
                    });
                });
                
                fidObserver.observe({ entryTypes: ['first-input'] });
            } catch (e) {
                console.warn('FID tracking not supported');
            }
            
            // Cumulative Layout Shift (CLS)
            try {
                let clsValue = 0;
                const clsObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    });
                });
                
                clsObserver.observe({ entryTypes: ['layout-shift'] });
                
                // Report CLS on page unload
                window.addEventListener('beforeunload', () => {
                    this.trackEvent('core_web_vital', {
                        metric: 'CLS',
                        value: clsValue,
                        rating: this.getWebVitalRating('CLS', clsValue),
                        timestamp: Date.now()
                    });
                });
            } catch (e) {
                console.warn('CLS tracking not supported');
            }
        }
    }
    
    /**
     * Get Web Vital rating (good, needs improvement, poor)
     */
    getWebVitalRating(metric, value) {
        const thresholds = {
            LCP: { good: 2500, poor: 4000 },
            FID: { good: 100, poor: 300 },
            CLS: { good: 0.1, poor: 0.25 }
        };
        
        const threshold = thresholds[metric];
        if (!threshold) return 'unknown';
        
        if (value <= threshold.good) return 'good';
        if (value <= threshold.poor) return 'needs-improvement';
        return 'poor';
    }
    
    /**
     * Track resource performance
     */
    trackResourcePerformance() {
        window.addEventListener('load', () => {
            const resources = performance.getEntriesByType('resource');
            const resourceSummary = this.summarizeResources(resources);
            
            this.trackEvent('resource_performance', {
                ...resourceSummary,
                timestamp: Date.now()
            });
        });
    }
    
    /**
     * Summarize resource loading performance
     */
    summarizeResources(resources) {
        const summary = {
            totalResources: resources.length,
            totalSize: 0,
            totalDuration: 0,
            byType: {}
        };
        
        resources.forEach(resource => {
            const type = this.getResourceType(resource.name);
            
            if (!summary.byType[type]) {
                summary.byType[type] = { count: 0, size: 0, duration: 0 };
            }
            
            summary.byType[type].count++;
            summary.byType[type].size += resource.transferSize || 0;
            summary.byType[type].duration += resource.duration || 0;
            
            summary.totalSize += resource.transferSize || 0;
            summary.totalDuration += resource.duration || 0;
        });
        
        return summary;
    }
    
    /**
     * Get resource type from URL
     */
    getResourceType(url) {
        if (url.includes('.css')) return 'css';
        if (url.includes('.js')) return 'js';
        if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'image';
        if (url.match(/\.(woff|woff2|ttf|otf)$/i)) return 'font';
        return 'other';
    }
    
    /**
     * Set up error tracking
     */
    setupErrorTracking() {
        // JavaScript errors
        window.addEventListener('error', (event) => {
            this.trackEvent('javascript_error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
                timestamp: Date.now()
            });
        });
        
        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.trackEvent('promise_rejection', {
                reason: event.reason?.toString(),
                stack: event.reason?.stack,
                timestamp: Date.now()
            });
        });
        
        // Resource loading errors
        document.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.trackEvent('resource_error', {
                    tagName: event.target.tagName,
                    source: event.target.src || event.target.href,
                    timestamp: Date.now()
                });
            }
        }, true);
    }
    
    /**
     * Set up session tracking
     */
    setupSessionTracking() {
        // Track session duration
        setInterval(() => {
            const now = Date.now();
            if (now - this.lastActivity > this.options.sessionTimeout) {
                this.trackEvent('session_timeout', {
                    duration: now - this.startTime,
                    timestamp: now
                });
                
                // Start new session
                this.sessionId = this.generateSessionId();
                this.startTime = now;
                this.lastActivity = now;
            }
        }, 60000); // Check every minute
        
        // Track user activity
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, () => {
                this.updateLastActivity();
            }, { passive: true });
        });
    }
    
    /**
     * Set up before unload tracking
     */
    setupBeforeUnload() {
        window.addEventListener('beforeunload', () => {
            const sessionDuration = Date.now() - this.startTime;
            
            this.trackEvent('session_end', {
                duration: sessionDuration,
                timestamp: Date.now()
            }, true); // Send immediately
        });
    }
    
    /**
     * Track custom event
     */
    trackEvent(eventName, data = {}, immediate = false) {
        const event = {
            event: eventName,
            sessionId: this.sessionId,
            pageViewId: this.pageViewId,
            timestamp: Date.now(),
            ...data
        };
        
        if (immediate) {
            this.sendEvent(event);
        } else {
            this.events.push(event);
            this.flushEvents();
        }
    }
    
    /**
     * Send event to analytics endpoint
     */
    sendEvent(event) {
        // In a real implementation, this would send to your analytics service
        // For now, we'll just log to console in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('Analytics Event:', event);
        }
        
        // Example implementation for sending to server:
        /*
        fetch('/api/analytics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
        }).catch(error => {
            console.warn('Analytics error:', error);
        });
        */
    }
    
    /**
     * Flush events queue
     */
    flushEvents() {
        if (this.events.length === 0) return;
        
        // Send events in batches
        const eventsToSend = this.events.splice(0, 10);
        eventsToSend.forEach(event => this.sendEvent(event));
    }
    
    /**
     * Helper methods
     */
    getDeviceType() {
        const width = window.innerWidth;
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
    }
    
    getConnectionType() {
        return navigator.connection?.effectiveType || 'unknown';
    }
    
    getElementData(element) {
        return {
            tagName: element.tagName,
            id: element.id,
            className: element.className,
            text: element.textContent?.substring(0, 100),
            href: element.href,
            src: element.src
        };
    }
    
    getFormData(form) {
        const formData = new FormData(form);
        const fields = {};
        
        for (const [key, value] of formData.entries()) {
            fields[key] = typeof value === 'string' ? value.length : 'file';
        }
        
        return { fields };
    }
    
    isTrackableElement(element) {
        return element.tagName === 'A' || 
               element.tagName === 'BUTTON' || 
               element.type === 'submit' ||
               element.classList.contains('trackable');
    }
    
    isFormField(element) {
        return ['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName);
    }
    
    updateLastActivity() {
        this.lastActivity = Date.now();
    }
    
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Initialize analytics
function initAnalytics() {
    const analytics = new Analytics({
        trackPageViews: true,
        trackClicks: true,
        trackScrollDepth: true,
        trackFormSubmissions: true,
        trackPerformance: true,
        trackErrors: true
    });
    
    // Export for global access
    window.analytics = analytics;
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnalytics);
} else {
    initAnalytics();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Analytics;
}