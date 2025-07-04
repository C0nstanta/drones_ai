# /config.py
"""
Configuration settings for Adaptive Auto Hub Flask application.
Updated with asset pipeline and performance optimization settings.
"""

import os
from datetime import timedelta


class BaseConfig:
    """Base configuration class with common settings."""
    
    # Flask core settings
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # Application settings
    APP_NAME = 'Adaptive Auto Hub'
    APP_VERSION = '1.0.0'
    
    # Security settings
    WTF_CSRF_ENABLED = True
    WTF_CSRF_TIME_LIMIT = None
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    PERMANENT_SESSION_LIFETIME = timedelta(hours=24)
    
    # Asset pipeline settings
    ASSETS_DEBUG = False
    ASSETS_AUTO_BUILD = True
    ASSETS_CACHE = True
    ASSETS_MANIFEST = 'cache'

    ANALYTICS_ID = os.environ.get('ANALYTICS_ID', 'dev-tracking')
    ANALYTICS_ENABLED = os.environ.get('ANALYTICS_ENABLED', 'false').lower() == 'true'
    
    # Performance settings
    COMPRESS_MIMETYPES = [
        'text/html',
        'text/css',
        'text/xml',
        'text/javascript',
        'application/json',
        'application/javascript',
        'application/xml+rss',
        'application/atom+xml',
        'image/svg+xml'
    ]
    COMPRESS_LEVEL = 6
    COMPRESS_MIN_SIZE = 500
    
    # Image optimization settings
    IMAGE_WEBP_QUALITY = 85
    IMAGE_JPEG_QUALITY = 90
    IMAGE_RESPONSIVE_SIZES = [400, 800, 1200]
    IMAGE_LQIP_SIZE = (20, 20)
    IMAGE_LQIP_QUALITY = 20
    
    # Email settings (for contact forms)
    MAIL_SERVER = os.environ.get('MAIL_SERVER')
    MAIL_PORT = int(os.environ.get('MAIL_PORT') or 587)
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'true').lower() in ['true', 'on', '1']
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER')
    
    # Contact information
    CONTACT_EMAIL = os.environ.get('CONTACT_EMAIL') or 'info@adaptiveautohub.com'
    PHONE_NUMBER = os.environ.get('PHONE_NUMBER') or '+1-555-0123'
    COMPANY_ADDRESS = os.environ.get('COMPANY_ADDRESS') or 'Salt Lake City, Utah, USA'
    
    # Business information
    COMPANY_NAME = 'Adaptive Auto Hub'
    COMPANY_TAGLINE = 'AI-Driven Drone Solutions'
    COMPANY_DESCRIPTION = 'AI-driven drone solutions for infrastructure inspection and defense'
    
    # Social media (if needed)
    SOCIAL_LINKS = {
        'linkedin': os.environ.get('LINKEDIN_URL'),
        'twitter': os.environ.get('TWITTER_URL'),
        'github': os.environ.get('GITHUB_URL')
    }
    
    # Analytics settings
    ANALYTICS_ENABLED = os.environ.get('ANALYTICS_ENABLED', 'false').lower() in ['true', 'on', '1']
    GOOGLE_ANALYTICS_ID = os.environ.get('GOOGLE_ANALYTICS_ID')
    
    # SEO settings
    DEFAULT_META_DESCRIPTION = 'AI-driven drone solutions for infrastructure inspection and defense. Aura Analytics and Aegis Defense systems by Adaptive Auto Hub.'
    DEFAULT_META_KEYWORDS = 'AI drone solutions, infrastructure inspection, defense technology, Aura Analytics, Aegis Defense'
    
    @staticmethod
    def init_app(app):
        """Initialize application with configuration."""
        pass


class DevelopmentConfig(BaseConfig):
    """Development configuration."""
    
    DEBUG = True
    FLASK_ENV = 'development'
    
    # Asset pipeline settings for development
    ASSETS_DEBUG = True
    ASSETS_AUTO_BUILD = True
    
    # Relaxed security for development
    SESSION_COOKIE_SECURE = False
    WTF_CSRF_ENABLED = True  # Keep CSRF protection even in dev
    
    # Development email settings (console output)
    MAIL_SUPPRESS_SEND = False
    MAIL_DEBUG = True
    
    # Performance monitoring in development
    PERFORMANCE_MONITORING = True
    
    @staticmethod
    def init_app(app):
        """Initialize development environment."""
        import logging
        logging.basicConfig(level=logging.DEBUG)
        
        # Development-specific logging
        logger = logging.getLogger('adaptive_auto_hub')
        logger.setLevel(logging.DEBUG)
        
        # Asset debug logging
        assets_logger = logging.getLogger('webassets')
        assets_logger.setLevel(logging.DEBUG)


class ProductionConfig(BaseConfig):
    """Production configuration for Namecheap shared hosting."""
    
    DEBUG = False
    FLASK_ENV = 'production'
    
    # Asset pipeline settings for production
    ASSETS_DEBUG = False
    ASSETS_AUTO_BUILD = False  # Pre-build assets for production
    ASSETS_CACHE = True
    
    # Enhanced security for production
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Strict'
    
    # Production email settings
    MAIL_SUPPRESS_SEND = False
    MAIL_DEBUG = False
    
    # Performance optimization
    COMPRESS_LEVEL = 9  # Maximum compression for production
    COMPRESS_MIN_SIZE = 256  # Compress smaller files in production
    
    # Security headers (handled by Flask-Talisman)
    FORCE_HTTPS = True
    STRICT_TRANSPORT_SECURITY = True
    STRICT_TRANSPORT_SECURITY_MAX_AGE = 31536000  # 1 year
    
    # Content Security Policy
    CONTENT_SECURITY_POLICY = {
        'default-src': "'self'",
        'style-src': [
            "'self'",
            "'unsafe-inline'",  # For critical inline CSS
            "https://fonts.googleapis.com"
        ],
        'font-src': [
            "'self'",
            "https://fonts.gstatic.com"
        ],
        'script-src': [
            "'self'",
            "'unsafe-inline'"  # For inline scripts if needed
        ],
        'img-src': [
            "'self'",
            "data:"  # For base64 images/LQIP
        ],
        'connect-src': "'self'"
    }
    
    # Performance monitoring
    PERFORMANCE_MONITORING = True
    
    # Error logging
    ERROR_EMAIL = os.environ.get('ERROR_EMAIL')
    
    @staticmethod
    def init_app(app):
        """Initialize production environment."""
        import logging
        from logging.handlers import RotatingFileHandler
        
        # Production logging
        if not app.debug:
            # File logging
            if not os.path.exists('logs'):
                os.mkdir('logs')
            
            file_handler = RotatingFileHandler(
                'logs/adaptive_auto_hub.log',
                maxBytes=10240000,  # 10MB
                backupCount=10
            )
            file_handler.setFormatter(logging.Formatter(
                '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
            ))
            file_handler.setLevel(logging.INFO)
            app.logger.addHandler(file_handler)
            
            app.logger.setLevel(logging.INFO)
            app.logger.info('Adaptive Auto Hub startup')


class TestingConfig(BaseConfig):
    """Testing configuration."""
    
    TESTING = True
    FLASK_ENV = 'testing'
    WTF_CSRF_ENABLED = False
    
    # In-memory testing
    ASSETS_DEBUG = True
    ASSETS_AUTO_BUILD = True
    
    # Disable email sending in tests
    MAIL_SUPPRESS_SEND = True
    
    # Fast image processing for tests
    IMAGE_WEBP_QUALITY = 50
    IMAGE_JPEG_QUALITY = 50
    
    @staticmethod
    def init_app(app):
        """Initialize testing environment."""
        import logging
        logging.disable(logging.CRITICAL)


# Configuration mapping
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}


def get_config(env_name=None):
    """
    Get configuration class based on environment.
    
    Args:
        env_name: Environment name ('development', 'production', 'testing')
        
    Returns:
        Configuration class
    """
    if env_name is None:
        env_name = os.environ.get('FLASK_ENV', 'development')
    
    return config.get(env_name, config['default'])


# Asset bundles configuration for different environments
ASSET_BUNDLES = {
    'css_critical': {
        'inputs': ['css/critical.css'],
        'output': 'gen/critical.%(version)s.css',
        'filters': ['cssmin'] if os.environ.get('FLASK_ENV') == 'production' else []
    },
    'css_main': {
        'inputs': [
            'css/base.css',
            'css/components/navigation.css',
            'css/components/buttons.css',
            'css/components/cards.css',
            'css/components/forms.css',
            'css/components/hero.css',
            'css/utilities.css'
        ],
        'output': 'gen/main.%(version)s.css',
        'filters': ['cssmin'] if os.environ.get('FLASK_ENV') == 'production' else []
    },
    'js_main': {
        'inputs': [
            'js/modules/utils.js',
            'js/navigation.js',
            'js/lazy-load.js',
            'js/forms.js'
        ],
        'output': 'gen/main.%(version)s.js',
        'filters': ['jsmin'] if os.environ.get('FLASK_ENV') == 'production' else []
    },
    'js_enhanced': {
        'inputs': [
            'js/enhanced/animations.js',
            'js/enhanced/analytics.js'
        ],
        'output': 'gen/enhanced.%(version)s.js',
        'filters': ['jsmin'] if os.environ.get('FLASK_ENV') == 'production' else []
    }
}
