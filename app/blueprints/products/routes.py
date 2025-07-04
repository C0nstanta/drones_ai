# /app/blueprints/products/routes.py
"""
Products blueprint routes for Adaptive Auto Hub website.
Handles product overview, Aura Analytics, and Aegis Defense pages.
"""

from flask import Blueprint, render_template, jsonify, request

products_bp = Blueprint('products', __name__, 
                       url_prefix='/products',
                       template_folder='templates',
                       static_folder='static')

def get_aura_data():
    """Get Aura Analytics product data."""
    return {
        'name': 'Aura Analytics',
        'tagline': 'The Intelligent Brain for Your Imaging Systems',
        'description': 'Transform infrastructure inspection with AI-powered analytics that delivers real-time insights, reduces costs by 75-85%, and prevents failures before they happen.',
        'hero_image': '/static/images/products/aura-hero.png',
        'features': [
            {
                'title': 'Real-Time Object Recognition',
                'description': 'Instantly identify defects, corrosion, and structural issues with 98% accuracy.',
                'icon': 'eye'
            },
            {
                'title': '3D Scene Reconstruction',
                'description': 'Generate precise 3D models from drone footage for detailed analysis.',
                'icon': 'cube'
            },
            {
                'title': 'Predictive Analytics',
                'description': 'AI algorithms predict maintenance needs before failures occur.',
                'icon': 'chart'
            },
            {
                'title': 'Multi-Platform Integration',
                'description': 'Works with any drone platform and existing inspection workflows.',
                'icon': 'plug'
            }
        ],
        'benefits': [
            {
                'metric': '75-85%',
                'label': 'Cost Reduction',
                'description': 'Compared to traditional inspection methods'
            },
            {
                'metric': '10x',
                'label': 'Faster Inspections',
                'description': 'Complete inspections in hours, not days'
            },
            {
                'metric': '98%',
                'label': 'Accuracy Rate',
                'description': 'Industry-leading defect detection accuracy'
            },
            {
                'metric': '24/7',
                'label': 'Continuous Monitoring',
                'description': 'Real-time alerts and predictive insights'
            }
        ],
        'use_cases': [
            'Pipeline inspection and leak detection',
            'Bridge and infrastructure structural analysis',
            'Power line and utility corridor monitoring',
            'Wind turbine blade inspection',
            'Solar panel efficiency analysis',
            'Construction progress tracking'
        ],
        'technical_specs': {
            'Processing Speed': 'Real-time (30+ FPS)',
            'Accuracy': '98% defect detection rate',
            'Integration': 'REST API, SDK available',
            'Platforms': 'Cloud & Edge deployment',
            'Data Formats': 'All major image/video formats',
            'Export Options': 'PDF, CSV, JSON, 3D models'
        },
        'case_study': {
            'client': 'Major Energy Company',
            'challenge': 'Manual inspection of 500 miles of pipeline annually',
            'solution': 'Automated drone inspection with Aura Analytics',
            'results': [
                '80% reduction in inspection costs',
                '90% faster inspection completion',
                'Prevented 3 potential failures through early detection',
                'ROI achieved in 6 months'
            ]
        },
        'specifications': {
            'Processing Speed': 'Real-time at 30+ FPS',
            'Supported Formats': 'JPEG, PNG, RAW, H.264, H.265',
            'AI Models': 'Custom trained on 10M+ infrastructure images',
            'Accuracy': '98% defect detection, 95% classification',
            'Integration': 'REST API, Python SDK, MQTT',
            'Deployment': 'Cloud (AWS/Azure) or On-premise',
            'Minimum Requirements': '8GB RAM, NVIDIA GPU recommended',
            'Data Security': 'AES-256 encryption, SOC 2 compliant'
        }
    }

def get_aegis_data():
    """Get Aegis Defense product data."""
    return {
        'name': 'Aegis Defense',
        'tagline': 'AI-Powered Counter-Drone Protection',
        'description': 'Protect critical infrastructure with autonomous drone detection, classification, and neutralization powered by advanced AI.',
        'hero_image': '/static/images/products/aegis-hero.png',
        'features': [
            {
                'title': 'Multi-Sensor Fusion',
                'description': 'Combines RF, acoustic, optical, and radar data for comprehensive threat detection.',
                'icon': 'radar'
            },
            {
                'title': 'AI Threat Classification',
                'description': 'Instantly identify drone type, payload, and threat level with machine learning.',
                'icon': 'shield'
            },
            {
                'title': 'Autonomous Response',
                'description': 'Automated threat neutralization with multiple defeat mechanisms.',
                'icon': 'zap'
            },
            {
                'title': 'RIFF Integration',
                'description': 'Seamlessly integrates with InterProInvest\'s RIFF defense platform.',
                'icon': 'link'
            }
        ],
        'benefits': [
            {
                'metric': '360°',
                'label': 'Coverage Area',
                'description': 'Complete spherical detection zone'
            },
            {
                'metric': '5km',
                'label': 'Detection Range',
                'description': 'Early warning at extended distances'
            },
            {
                'metric': '<3s',
                'label': 'Response Time',
                'description': 'From detection to neutralization'
            },
            {
                'metric': '99.9%',
                'label': 'Uptime',
                'description': 'Reliable 24/7 autonomous operation'
            }
        ],
        'capabilities': [
            'Detect and track multiple simultaneous threats',
            'Distinguish between authorized and hostile drones',
            'Predict drone flight paths and intentions',
            'Deploy appropriate countermeasures automatically',
            'Integrate with existing security systems',
            'Provide real-time alerts and reporting'
        ],
        'defeat_mechanisms': [
            'RF jamming and protocol manipulation',
            'GPS/GNSS denial and spoofing',
            'Directed energy systems',
            'Kinetic interceptors',
            'Cyber takeover capabilities',
            'Net capture systems'
        ],
        'partnership': {
            'partner': 'InterProInvest',
            'integration': 'RIFF Platform Integration',
            'benefits': 'Leverages InterProInvest\'s battle-tested RIFF system with Adaptive Auto Hub\'s advanced AI for superior threat detection and response.',
            'achievements': [
                'Joint development of AI threat classifier',
                'Integrated command and control interface',
                'Combined sensor data processing',
                'Unified threat response protocols'
            ]
        },
        'specifications': {
            'Detection Range': 'Up to 5km (dependent on drone size)',
            'Coverage': '360° azimuth, 90° elevation',
            'Response Time': '<3 seconds from detection',
            'Simultaneous Targets': 'Up to 50 tracked objects',
            'False Positive Rate': '<0.1%',
            'Weather Rating': 'IP66, -40°C to +60°C operation',
            'Power Requirements': '220V AC, 5kW typical',
            'Communication': 'Ethernet, 4G/5G, Satellite backup'
        }
    }

def get_products_data():
    """Get all products data for the overview page."""
    return [
        {
            'id': 'aura',
            'name': 'Aura Analytics',
            'category': 'Infrastructure Intelligence',
            'summary': 'Transform infrastructure inspection with AI that sees what humans miss.',
            'key_benefit': '75-85% Cost Reduction',
            'markets': ['Oil & Gas', 'Infrastructure', 'Construction'],
            'image': '/static/images/products/aura-hero.png',
            'url': '/products/aura'
        },
        {
            'id': 'aegis',
            'name': 'Aegis Defense',
            'category': 'Security & Defense',
            'summary': 'Protect critical assets with AI-powered counter-drone technology.',
            'key_benefit': '360° Threat Detection',
            'markets': ['Defense', 'Critical Infrastructure', 'Public Safety'],
            'image': '/static/images/products/aegis-hero.png',
            'url': '/products/aegis'
        }
    ]

@products_bp.route('/')
def index():
    """Products overview page with pagination support."""
    # Get pagination parameters
    page = request.args.get('page', 1, type=int)
    per_page = 9  # Products per page
    
    # Get all products
    all_products = get_products_data()
    total = len(all_products)
    
    # Calculate pagination
    start = (page - 1) * per_page
    end = start + per_page
    products = all_products[start:end]
    
    # Calculate total pages
    total_pages = (total + per_page - 1) // per_page
    
    context = {
        'page_title': 'AI-Driven Drone Solutions - Products',
        'meta_description': 'Explore Adaptive Auto Hub\'s product line: Aura Analytics for infrastructure inspection and Aegis Defense for counter-drone protection.',
        'products': products,
        'page': page,
        'total_pages': total_pages,
        'per_page': per_page,
        'total': total,
        'comparison': {
            'headers': ['Feature', 'Aura Analytics', 'Aegis Defense'],
            'rows': [
                ['Primary Use', 'Infrastructure Inspection', 'Threat Detection'],
                ['AI Technology', 'Computer Vision & ML', 'Sensor Fusion & Classification'],
                ['Key Benefit', '75-85% Cost Savings', '24/7 Autonomous Protection'],
                ['Integration', 'Any Drone Platform', 'RIFF Defense Systems'],
                ['Markets', 'Commercial/Industrial', 'Defense/Security']
            ]
        }
    }
    
    return render_template('products/index.html', **context)

@products_bp.route('/aura')
def aura():
    """Aura Analytics product detail page."""
    context = {
        'page_title': 'Aura Analytics - AI Infrastructure Inspection',
        'meta_description': 'Aura Analytics: AI-powered drone analytics for infrastructure inspection. 75-85% cost savings, real-time defect detection, predictive maintenance.',
        'product': get_aura_data(),
        'schema_type': 'Product',
        'breadcrumbs': [
            {'name': 'Home', 'url': '/'},
            {'name': 'Products', 'url': '/products/'},
            {'name': 'Aura Analytics', 'url': '/products/aura'}
        ]
    }
    
    return render_template('products/aura.html', **context)

@products_bp.route('/aegis')
def aegis():
    """Aegis Defense product detail page."""
    context = {
        'page_title': 'Aegis Defense - AI Counter-Drone System',
        'meta_description': 'Aegis Defense: AI-powered counter-drone protection for critical infrastructure. Multi-sensor fusion, threat classification, RIFF integration.',
        'product': get_aegis_data(),
        'schema_type': 'Product',
        'breadcrumbs': [
            {'name': 'Home', 'url': '/'},
            {'name': 'Products', 'url': '/products/'},
            {'name': 'Aegis Defense', 'url': '/products/aegis'}
        ]
    }
    
    return render_template('products/aegis.html', **context)

@products_bp.route('/api/specifications/<product>')
def api_specifications(product):
    """API endpoint for product specifications."""
    specs = {
        'aura': get_aura_data()['specifications'],
        'aegis': get_aegis_data()['specifications']
    }
    
    if product not in specs:
        return jsonify({'error': 'Product not found'}), 404
    
    return jsonify({
        'product': product,
        'specifications': specs[product]
    })