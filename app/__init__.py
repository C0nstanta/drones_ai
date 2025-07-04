# /app/__init__.py
"""
Application factory for Adaptive Auto Hub Flask website.
Creates and configures Flask application with blueprints and extensions.
"""

from flask import Flask
from flask_talisman import Talisman
from flask_wtf.csrf import CSRFProtect
from flask_compress import Compress

def create_app(config_name='default'):
    """
    Application factory pattern for Flask app creation.
    """
    app = Flask(__name__)

    # Load configuration
    if config_name == 'production':
        app.config.from_object('config.ProductionConfig')
    elif config_name == 'testing':
        app.config.from_object('config.TestingConfig')
    else:
        app.config.from_object('config.DevelopmentConfig')

    # Initialize extensions
    _configure_security(app)
    _configure_compression(app)
    
    # Optional: Configure assets (comment out if not using Flask-Assets)
    # _configure_assets(app)

    # Register blueprints
    _register_blueprints(app)

    # Register error handlers
    _register_error_handlers(app)

    return app

def _configure_security(app):
    """Configure security extensions"""
    csrf = CSRFProtect(app)
    
    # Only enable Talisman in production
    if app.config.get('FLASK_ENV') == 'production':
        csp = {
            'default-src': "'self'",
            'style-src': ["'self'", "'unsafe-inline'"],
            'script-src': ["'self'", "'unsafe-inline'"],
            'img-src': ["'self'", "data:"],
            'font-src': ["'self'"],
        }
        Talisman(
            app,
            force_https=True,
            strict_transport_security=True,
            strict_transport_security_max_age=31536000,
            content_security_policy=csp,
            content_security_policy_nonce_in=['style-src', 'script-src']
        )

def _configure_compression(app):
    """Configure response compression"""
    Compress(app)

def _configure_assets(app):
    """Configure Flask-Assets if needed"""
    try:
        from .extensions import configure_assets
        assets = configure_assets(app)
        return assets
    except ImportError:
        app.logger.warning("Flask-Assets not configured - using static files directly")
        return None

def _register_blueprints(app):
    """Register all application blueprints"""
    from .blueprints.main import main_bp
    from .blueprints.products import products_bp
    from .blueprints.industries import industries_bp
    from .blueprints.partnerships import partnerships_bp
    from .blueprints.about import about_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(products_bp, url_prefix='/products')
    app.register_blueprint(industries_bp, url_prefix='/industries')
    app.register_blueprint(partnerships_bp, url_prefix='/partnerships')
    app.register_blueprint(about_bp, url_prefix='/about')

def _register_error_handlers(app):
    """Register error handlers"""
    @app.errorhandler(404)
    def not_found_error(error):
        from flask import render_template
        return render_template('errors/404.html'), 404

    @app.errorhandler(500)
    def internal_error(error):
        from flask import render_template
        # In development, let Flask show the debug page
        if app.config.get('DEBUG'):
            raise error
        return render_template('errors/500.html'), 500