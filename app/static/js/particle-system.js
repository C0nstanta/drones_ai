// /static/js/particle-system.js

/**
 * Lightweight Particle System for Hero Section
 * Performance-optimized with object pooling and mobile detection
 * @module ParticleSystem
 * @version 1.0.0
 */

(function() {
    'use strict';

    /**
     * ParticleSystem class - Creates animated particle background
     * @class
     */
    class ParticleSystem {
        /**
         * Initialize particle system
         * @param {Object} options - Configuration options
         * @param {string} options.canvasId - ID of canvas element
         * @param {number} options.particleCount - Number of particles (default: 100)
         * @param {number} options.mobileParticleCount - Particles on mobile (default: 50)
         * @param {string} options.particleColor - Particle color (default: 'rgba(100, 255, 218, 0.5)')
         * @param {number} options.maxSpeed - Maximum particle speed (default: 1)
         * @param {number} options.connectionDistance - Distance to draw connections (default: 120)
         */
        constructor(options = {}) {
            this.canvas = document.getElementById(options.canvasId || 'particle-canvas');
            if (!this.canvas) return;
            
            this.ctx = this.canvas.getContext('2d');
            this.particles = [];
            this.animationId = null;
            this.isRunning = false;
            
            // Configuration with performance defaults
            this.config = {
                particleCount: options.particleCount || 100,
                mobileParticleCount: options.mobileParticleCount || 50,
                particleColor: options.particleColor || 'rgba(100, 255, 218, 0.5)',
                connectionColor: options.connectionColor || 'rgba(100, 255, 218, 0.2)',
                maxSpeed: options.maxSpeed || 1,
                connectionDistance: options.connectionDistance || 120,
                particleSize: options.particleSize || 2,
                mouseRadius: options.mouseRadius || 100
            };
            
            // Performance tracking
            this.frameCount = 0;
            this.fps = 60;
            this.fpsInterval = 1000 / this.fps;
            this.then = Date.now();
            
            // Mouse position tracking
            this.mouse = {
                x: null,
                y: null
            };
            
            this.init();
        }
        
        /**
         * Initialize canvas and particles
         * @private
         */
        init() {
            this.resizeCanvas();
            this.createParticles();
            this.bindEvents();
            this.start();
        }
        
        /**
         * Check if device is mobile
         * @returns {boolean}
         * @private
         */
        isMobile() {
            return window.innerWidth <= 768 || 
                   ('ontouchstart' in window) || 
                   (navigator.maxTouchPoints > 0);
        }
        
        /**
         * Resize canvas to window dimensions
         * @private
         */
        resizeCanvas() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
        
        /**
         * Create particle objects with object pooling
         * @private
         */
        createParticles() {
            const count = this.isMobile() ? 
                this.config.mobileParticleCount : 
                this.config.particleCount;
            
            // Reuse existing particles if possible
            if (this.particles.length > count) {
                this.particles.length = count;
            } else {
                for (let i = this.particles.length; i < count; i++) {
                    this.particles.push(this.createParticle());
                }
            }
        }
        
        /**
         * Create single particle object
         * @returns {Object} Particle object
         * @private
         */
        createParticle() {
            return {
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * this.config.maxSpeed,
                vy: (Math.random() - 0.5) * this.config.maxSpeed,
                size: Math.random() * this.config.particleSize + 1
            };
        }
        
        /**
         * Bind event listeners
         * @private
         */
        bindEvents() {
            // Debounced resize handler
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    this.resizeCanvas();
                    this.createParticles();
                }, 250);
            });
            
            // Mouse move tracking with throttling
            let lastMove = 0;
            this.canvas.addEventListener('mousemove', (e) => {
                const now = Date.now();
                if (now - lastMove > 16) { // ~60fps
                    const rect = this.canvas.getBoundingClientRect();
                    this.mouse.x = e.clientX - rect.left;
                    this.mouse.y = e.clientY - rect.top;
                    lastMove = now;
                }
            });
            
            this.canvas.addEventListener('mouseleave', () => {
                this.mouse.x = null;
                this.mouse.y = null;
            });
            
            // Visibility change handling
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.stop();
                } else {
                    this.start();
                }
            });
        }
        
        /**
         * Update particle positions
         * @private
         */
        updateParticles() {
            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];
                
                // Mouse interaction
                if (this.mouse.x !== null && this.mouse.y !== null) {
                    const dx = this.mouse.x - p.x;
                    const dy = this.mouse.y - p.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < this.config.mouseRadius) {
                        const force = (this.config.mouseRadius - dist) / this.config.mouseRadius;
                        p.vx -= (dx / dist) * force * 0.5;
                        p.vy -= (dy / dist) * force * 0.5;
                    }
                }
                
                // Update position
                p.x += p.vx;
                p.y += p.vy;
                
                // Boundary collision with dampening
                if (p.x < 0 || p.x > this.canvas.width) {
                    p.vx *= -0.9;
                    p.x = Math.max(0, Math.min(this.canvas.width, p.x));
                }
                if (p.y < 0 || p.y > this.canvas.height) {
                    p.vy *= -0.9;
                    p.y = Math.max(0, Math.min(this.canvas.height, p.y));
                }
                
                // Apply friction
                p.vx *= 0.99;
                p.vy *= 0.99;
                
                // Minimum velocity
                if (Math.abs(p.vx) < 0.01) p.vx = (Math.random() - 0.5) * 0.5;
                if (Math.abs(p.vy) < 0.01) p.vy = (Math.random() - 0.5) * 0.5;
            }
        }
        
        /**
         * Draw particles and connections
         * @private
         */
        draw() {
            // Clear canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw connections (skip on mobile for performance)
            if (!this.isMobile()) {
                this.ctx.strokeStyle = this.config.connectionColor;
                this.ctx.lineWidth = 1;
                
                for (let i = 0; i < this.particles.length; i++) {
                    for (let j = i + 1; j < this.particles.length; j++) {
                        const dx = this.particles[i].x - this.particles[j].x;
                        const dy = this.particles[i].y - this.particles[j].y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        
                        if (dist < this.config.connectionDistance) {
                            const opacity = 1 - (dist / this.config.connectionDistance);
                            this.ctx.globalAlpha = opacity * 0.5;
                            this.ctx.beginPath();
                            this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                            this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                            this.ctx.stroke();
                        }
                    }
                }
            }
            
            // Draw particles
            this.ctx.globalAlpha = 1;
            this.ctx.fillStyle = this.config.particleColor;
            
            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        
        /**
         * Animation loop with FPS limiting
         * @private
         */
        animate() {
            if (!this.isRunning) return;
            
            this.animationId = requestAnimationFrame(() => this.animate());
            
            // FPS limiting for consistent performance
            const now = Date.now();
            const elapsed = now - this.then;
            
            if (elapsed > this.fpsInterval) {
                this.then = now - (elapsed % this.fpsInterval);
                
                this.updateParticles();
                this.draw();
                
                // Performance monitoring
                this.frameCount++;
                if (this.frameCount % 60 === 0) {
                    const actualFps = 1000 / (elapsed / this.frameCount);
                    if (actualFps < 30 && !this.isMobile()) {
                        console.warn('Low FPS detected:', actualFps.toFixed(1));
                    }
                    this.frameCount = 0;
                }
            }
        }
        
        /**
         * Start animation
         * @public
         */
        start() {
            if (!this.isRunning && this.canvas) {
                this.isRunning = true;
                this.animate();
            }
        }
        
        /**
         * Stop animation
         * @public
         */
        stop() {
            this.isRunning = false;
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
        }
        
        /**
         * Destroy particle system and clean up
         * @public
         */
        destroy() {
            this.stop();
            this.particles = [];
            this.canvas = null;
            this.ctx = null;
        }
        
        /**
         * Update configuration
         * @param {Object} newConfig - New configuration options
         * @public
         */
        updateConfig(newConfig) {
            Object.assign(this.config, newConfig);
            this.createParticles();
        }
    }
    
    // Export to global namespace
    window.ParticleSystem = ParticleSystem;
    
})();
