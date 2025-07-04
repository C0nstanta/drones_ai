# /app/extensions.py
"""
Flask extensions configuration for Adaptive Auto Hub website.
Configures Flask-Assets for CSS/JS bundling and optimization.
"""

from flask_assets import Environment, Bundle


def configure_assets(app):
    """
    Configure Flask-Assets for CSS and JavaScript bundling.
    
    Sets up asset bundles for development and production environments
    with appropriate filters for minification and cache busting.
    
    Args:
        app: Flask application instance
        
    Returns:
        Environment: Configured Flask-Assets environment
    """
    assets = Environment(app)
    
    # Configure asset environment
    assets.url = app.static_url_path
    assets.directory = app.static_folder
    
    # Development vs Production configuration
    if app.config.get('FLASK_ENV') == 'development':
        assets.debug = True
        assets.auto_build = True
        css_filters = []
        js_filters = []
    else:
        assets.debug = False
        assets.auto_build = False
        css_filters = ['cssmin']
        js_filters = ['jsmin']
    
    # Critical CSS bundle (for inline rendering)
    critical_css = Bundle(
        'css/critical.css',
        filters=css_filters,
        output='gen/critical.%(version)s.css'
    )
    
    # Main CSS bundle
    main_css = Bundle(
        'css/base.css',
        'css/components/navigation.css',
        'css/components/buttons.css',
        'css/components/cards.css',
        'css/components/forms.css',
        'css/components/hero.css',
        'css/utilities.css',
        filters=css_filters,
        output='gen/main.%(version)s.css'
    )
    
    # Main JavaScript bundle
    main_js = Bundle(
        'js/modules/utils.js',
        'js/navigation.js',
        'js/lazy-load.js',
        'js/forms.js',
        filters=js_filters,
        output='gen/main.%(version)s.js'
    )
    
    # Enhanced JavaScript bundle (for advanced features)
    enhanced_js = Bundle(
        'js/enhanced/animations.js',
        'js/enhanced/analytics.js',
        filters=js_filters,
        output='gen/enhanced.%(version)s.js'
    )
    
    # Register bundles
    assets.register('critical_css', critical_css)
    assets.register('main_css', main_css)
    assets.register('main_js', main_js)
    assets.register('enhanced_js', enhanced_js)
    
    return assets


def get_asset_url(bundle_name, app=None):
    """
    Get the URL for a specific asset bundle.
    
    Utility function to retrieve asset URLs for templates,
    with fallback handling for development environments.
    
    Args:
        bundle_name: Name of the registered bundle
        app: Flask application instance (optional)
        
    Returns:
        str: Asset URL or empty string if not found
    """
    if app is None:
        from flask import current_app as app
    
    try:
        assets = app.extensions.get('assets')
        if assets and bundle_name in assets:
            return assets[bundle_name].urls()[0]
    except (AttributeError, IndexError, KeyError):
        pass
    
    return ''


def preload_critical_assets():
    """
    Generate preload directives for critical assets.
    
    Returns list of preload directives for inclusion in HTML head.
    Used to optimize loading of critical CSS and JavaScript.
    
    Returns:
        list: Preload directives as dictionaries
    """
    preloads = []
    
    # Critical CSS preload
    critical_css_url = get_asset_url('critical_css')
    if critical_css_url:
        preloads.append({
            'href': critical_css_url,
            'rel': 'preload',
            'as': 'style'
        })
    
    # Main CSS preload
    main_css_url = get_asset_url('main_css')
    if main_css_url:
        preloads.append({
            'href': main_css_url,
            'rel': 'preload',
            'as': 'style'
        })
    
    # Main JS preload
    main_js_url = get_asset_url('main_js')
    if main_js_url:
        preloads.append({
            'href': main_js_url,
            'rel': 'preload',
            'as': 'script'
        })
    
    return preloads


def inline_critical_css(app=None):
    """
    Read critical CSS content for inline rendering.
    
    Returns the minified critical CSS content as a string
    for inclusion in HTML head to eliminate render-blocking.
    
    Args:
        app: Flask application instance (optional)
        
    Returns:
        str: Critical CSS content or empty string
    """
    if app is None:
        from flask import current_app as app
    
    try:
        import os
        critical_path = os.path.join(
            app.static_folder, 
            'css', 
            'critical.css'
        )
        
        if os.path.exists(critical_path):
            with open(critical_path, 'r', encoding='utf-8') as f:
                css_content = f.read()
            
            # Simple minification for inline CSS
            if app.config.get('FLASK_ENV') == 'production':
                css_content = _minify_css_simple(css_content)
            
            return css_content
            
    except (IOError, OSError):
        pass
    
    return ''


def _minify_css_simple(css_content):
    """
    Simple CSS minification for inline styles.
    
    Removes comments, excess whitespace, and line breaks
    for basic CSS optimization without external dependencies.
    
    Args:
        css_content: CSS string to minify
        
    Returns:
        str: Minified CSS content
    """
    import re
    
    # Remove comments
    css_content = re.sub(r'/\*.*?\*/', '', css_content, flags=re.DOTALL)
    
    # Remove excess whitespace
    css_content = re.sub(r'\s+', ' ', css_content)
    
    # Remove spaces around specific characters
    css_content = re.sub(r'\s*([{}:;,>+~])\s*', r'\1', css_content)
    
    # Remove trailing semicolons before closing braces
    css_content = re.sub(r';\s*}', '}', css_content)
    
    return css_content.strip()
