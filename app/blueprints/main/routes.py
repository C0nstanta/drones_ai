# /app/blueprints/main/routes.py
"""
Main blueprint routes for Adaptive Auto Hub website.
Handles homepage, sitemap, and general routes.
"""

from flask import Blueprint, render_template, jsonify, redirect, url_for
from datetime import datetime

main_bp = Blueprint('main', __name__, template_folder='templates')


@main_bp.route('/')
def index():
    """Homepage route with comprehensive company overview."""
    context = {
        'page_title': 'AI-Driven Drone Solutions',
        'hero': {
            'title': 'AI-Driven Drone Solutions',
            'subtitle': 'for Infrastructure & Defense',
            'description': 'Revolutionary analytics and defense systems that transform how organizations inspect infrastructure and secure perimeters.',
            'cta_primary': 'Explore Solutions',
            'cta_secondary': 'Schedule Demo'
        },
        'metrics': {
            'jobs_created': '7',
            'cost_savings': '75-85%',
            'investment': '$120,000',
            'market_growth': '23% CAGR'
        },
        'products': [
            {
                'id': 'aura',
                'name': 'Aura Analytics',
                'icon': 'analytics',
                'tagline': 'Intelligent Brain for Imaging Systems',
                'description': 'Real-time AI analytics for infrastructure inspection with 75-85% cost savings.',
                'features': ['Pipeline Inspection', '3D Reconstruction', 'Defect Detection'],
                'link': '/products/aura'
            },
            {
                'id': 'aegis',
                'name': 'Aegis Defense',
                'icon': 'shield',
                'tagline': 'AI-Powered Counter-Drone System',
                'description': 'Advanced threat detection and classification for critical infrastructure.',
                'features': ['360° Detection', 'AI Classification', 'RIFF Integration'],
                'link': '/products/aegis'
            }
        ],
        'testimonials': [
            {
                'quote': 'Aura reduced our inspection costs by 82% while improving defect detection accuracy.',
                'client': 'Major Pipeline Operator',
                'industry': 'Oil & Gas'
            },
            {
                'quote': 'The integration with RIFF provides unmatched perimeter security.',
                'client': 'Defense Contractor',
                'industry': 'Defense'
            }
        ],
        'partners': [
            {
                'name': 'Elphel Inc.',
                'type': 'Technology Partner'
            },
            {
                'name': 'InterProInvest',
                'type': 'Defense Systems'
            }
        ],
        'solutions': [
            {
                'id': 'computer-vision',
                'title': 'Computer Vision',
                'description': 'Advanced image recognition and analysis systems for quality control, security, and automated visual inspection.',
                'image': '/static/images/solutions/computer-vision.webp',
                'tags': ['Deep Learning', 'Image Recognition'],
                'details': 'Our computer vision solutions leverage state-of-the-art neural networks...'
            },
            {
                'id': 'predictive-analytics',
                'title': 'Predictive Analytics',
                'description': 'AI-driven predictive maintenance and failure prevention for critical infrastructure.',
                'image': '/static/images/solutions/predictive-analytics.webp',
                'tags': ['Machine Learning', 'IoT Integration'],
                'details': 'Prevent costly failures before they happen with our predictive analytics...'
            },
            {
                'id': 'autonomous-navigation',
                'title': 'Autonomous Navigation',
                'description': 'Intelligent path planning and obstacle avoidance for drone fleets.',
                'image': '/static/images/solutions/autonomous-navigation.webp',
                'tags': ['Robotics', 'Path Planning'],
                'details': 'Enable your drones to navigate complex environments autonomously...'
            }
        ]
    }
    
    return render_template('main/index.html', **context)


@main_bp.route('/health')
def health():
    """Health check endpoint for monitoring."""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'service': 'Adaptive Auto Hub Web Application'
    })


@main_bp.route('/api/metrics')
def api_metrics():
    """API endpoint for business metrics."""
    return jsonify({
        'jobs_created': 7,
        'cost_savings_percent': '75-85',
        'investment': 120000,
        'market_size_billion': 9.2,
        'growth_rate_percent': 23,
        'partners': 2,
        'products': 2
    })


@main_bp.route('/contact/')
def contact_redirect():
    """Redirect /contact/ to /about/contact"""
    return redirect(url_for('about.contact'), code=301)


@main_bp.route('/sitemap.xml')
def sitemap():
    """Generate XML sitemap for SEO."""
    # Define all routes for sitemap
    pages = [
        {'loc': '/', 'changefreq': 'weekly', 'priority': '1.0'},
        {'loc': '/products/', 'changefreq': 'weekly', 'priority': '0.9'},
        {'loc': '/products/aura', 'changefreq': 'monthly', 'priority': '0.8'},
        {'loc': '/products/aegis', 'changefreq': 'monthly', 'priority': '0.8'},
        {'loc': '/industries/', 'changefreq': 'monthly', 'priority': '0.7'},
        {'loc': '/partnerships/', 'changefreq': 'monthly', 'priority': '0.7'},
        {'loc': '/about/', 'changefreq': 'monthly', 'priority': '0.6'},
        {'loc': '/about/contact', 'changefreq': 'monthly', 'priority': '0.9'},
    ]
    
    response = render_template('sitemap.xml', pages=pages)
    response = app.make_response(response)
    response.headers['Content-Type'] = 'application/xml'
    return response


@main_bp.route('/robots.txt')
def robots():
    """Robots.txt for search engines."""
    return """User-agent: *
Allow: /
Sitemap: https://adaptiveautohub.com/sitemap.xml

User-agent: AdsBot-Google
Allow: /

User-agent: Googlebot-Image
Allow: /static/images/
""", 200, {'Content-Type': 'text/plain'}
