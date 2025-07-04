# /app/blueprints/partnerships/routes.py
"""
Partnership blueprint routes for Adaptive Auto Hub website.
Handles partnership pages and partner information display.
"""

from flask import Blueprint, render_template, abort

partnerships_bp = Blueprint('partnerships', __name__,
                           url_prefix='/partnerships',
                           template_folder='templates',
                           static_folder='static')


def get_partnerships_data():
    """Get all partnerships data."""
    return {
        'elphel': {
            'id': 'elphel',
            'name': 'Elphel Inc.',
            'logo': '/static/images/partners/elphel-logo.png',
            'type': 'Technology Partner',
            'location': 'Salt Lake City, Utah',
            'website': 'https://www.elphel.com',
            'partnership_since': '2024',
            'description': 'Elphel designs and manufactures open hardware and free software products '
                          'for digital imaging applications. Their advanced camera systems provide '
                          'the foundation for our Aura Analytics platform.',
            'highlights': [
                '20+ years of imaging innovation',
                'Open-source hardware philosophy',
                'Advanced multi-spectral cameras',
                'Located in Salt Lake City for close collaboration',
                'Shared commitment to U.S. manufacturing'
            ],
            'collaboration': {
                'focus': 'Advanced Imaging Integration',
                'integration': 'Aura Analytics leverages Elphel\'s cutting-edge camera technology '
                              'to deliver unparalleled image quality and analysis capabilities.',
                'products': [
                    'NC393 Camera Series',
                    'Multi-sensor Arrays',
                    'Custom Imaging Solutions'
                ]
            },
            'joint_solutions': [
                {
                    'name': 'Pipeline Inspection System',
                    'description': 'Combined Elphel cameras with Aura AI for 98% defect detection',
                    'benefit': '75-85% cost reduction'
                },
                {
                    'name': 'Infrastructure Monitoring',
                    'description': 'Real-time analysis of bridges, utilities, and structures',
                    'benefit': 'Prevent failures before they happen'
                }
            ]
        },
        'interproinvest': {
            'id': 'interproinvest',
            'name': 'InterProInvest',
            'logo': '/static/images/partners/interproinvest-logo.png',
            'type': 'Defense Systems Partner',
            'location': 'International',
            'website': 'https://www.interproinvest.com',
            'partnership_since': '2024',
            'description': 'InterProInvest brings 23+ years of defense experience and their proven '
                          'RIFF counter-drone platform to our Aegis Defense solution.',
            'highlights': [
                '23+ years defense experience',
                'RIFF system deployed in 15+ countries',
                'NATO-tested technology',
                'Battle-proven in real conflicts',
                'Comprehensive counter-drone expertise'
            ],
            'collaboration': {
                'focus': 'Counter-Drone Defense Systems',
                'integration': 'Aegis Defense integrates seamlessly with RIFF hardware for complete '
                              'drone threat detection and mitigation capabilities.',
                'products': [
                    'RIFF Counter-Drone Platform',
                    'Multi-sensor Detection Arrays',
                    'Jamming & Neutralization Systems'
                ]
            },
            'joint_solutions': [
                {
                    'name': 'Perimeter Defense System',
                    'description': 'AI-powered detection with automated countermeasures',
                    'benefit': '360° protection coverage'
                },
                {
                    'name': 'Critical Infrastructure Protection',
                    'description': 'Integrated defense for airports, power plants, and military bases',
                    'benefit': '100% threat detection rate'
                }
            ]
        }
    }


@partnerships_bp.route('/')
def index():
    """Partnerships overview page."""
    partnerships = get_partnerships_data()
    
    context = {
        'page_title': 'Strategic Partnerships - Adaptive Auto Hub',
        'meta_description': 'Our strategic partnerships with Elphel Inc. and InterProInvest enable cutting-edge drone solutions',
        'intro': {
            'title': 'Strategic Partnerships',
            'description': 'Collaborating with industry leaders to deliver exceptional AI-powered drone solutions',
            'benefits': [
                'Access to cutting-edge technology',
                'Combined expertise and innovation',
                'Accelerated product development',
                'Enhanced customer value'
            ]
        },
        'partnerships': partnerships,
        'collaboration_model': {
            'title': 'How We Collaborate',
            'steps': [  # Changed from 'items' to 'steps' to avoid conflict
                {
                    'phase': 'Technology Integration',
                    'description': 'Deep integration of partner technologies into our AI platforms'
                },
                {
                    'phase': 'Joint Development',
                    'description': 'Collaborative R&D to push the boundaries of what\'s possible'
                },
                {
                    'phase': 'Market Deployment',
                    'description': 'Combined go-to-market strategies for maximum impact'
                }
            ]
        },
        'partnership_benefits': {
            'for_customers': [
                'Best-in-class integrated solutions',
                'Proven, tested technologies',
                'Comprehensive support network',
                'Future-proof investments'
            ],
            'for_partners': [
                'Access to new markets',
                'Enhanced product capabilities',
                'Shared innovation resources',
                'Strategic growth opportunities'
            ]
        },
        'cta': {
            'title': 'Interested in Partnership?',
            'description': 'Join us in revolutionizing drone technology',
            'button_text': 'Explore Partnership Opportunities'
        }
    }
    
    return render_template('partnerships/index.html', **context)


@partnerships_bp.route('/<string:partner_id>')
def detail(partner_id):
    """Individual partner detail page."""
    partnerships = get_partnerships_data()
    
    if partner_id not in partnerships:
        abort(404)
    
    partner = partnerships[partner_id]
    
    # Get the other partner for cross-reference
    other_partner_id = 'interproinvest' if partner_id == 'elphel' else 'elphel'
    other_partner = partnerships[other_partner_id]
    
    # Build breadcrumbs
    breadcrumbs = [
        {'name': 'Home', 'url': '/'},
        {'name': 'Partnerships', 'url': '/partnerships/'},
        {'name': partner['name']}
    ]
    
    context = {
        'page_title': f"{partner['name']} Partnership - Adaptive Auto Hub",
        'meta_description': f"Strategic partnership with {partner['name']} - {partner['description'][:150]}",
        'partner': partner,
        'other_partner': {
            'id': other_partner_id,
            'name': other_partner['name'],
            'logo': other_partner['logo'],
            'description': other_partner['description']
        },
        'breadcrumbs': breadcrumbs,
        'integration_diagram': f"/static/images/partnerships/{partner_id}-integration.png"
    }
    
    return render_template('partnerships/detail.html', **context)
