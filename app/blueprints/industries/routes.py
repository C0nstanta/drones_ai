# /app/blueprints/industries/routes.py
"""
Industries blueprint routes for Adaptive Auto Hub website.
Handles industry-specific applications and use cases.
"""

from flask import Blueprint, render_template, redirect, url_for

industries_bp = Blueprint('industries', __name__,
                         url_prefix='/industries',
                         template_folder='templates',
                         static_folder='static')

def get_industries_data():
    """Get comprehensive industry application data."""
    return [
        {
            'id': 'oil-gas',
            'name': 'Oil & Gas',
            'title': 'Pipeline Inspection Revolution',
            'description': 'Transform pipeline monitoring with AI-powered drone analytics that reduce costs by 75-85% while improving safety and compliance.',
            'hero_image': '/static/images/industries/oil-gas-hero.jpg',
            'market_size': '$2.3B by 2028',
            'growth_rate': '23% CAGR',
            'challenges': [
                'Manual inspection costs exceeding $10,000/mile',
                'Safety risks to inspection personnel',
                'Difficulty accessing remote locations',
                'Delayed defect detection leading to spills'
            ],
            'solutions': {
                'aura': {
                    'benefits': [
                        '75-85% reduction in inspection costs',
                        'Real-time corrosion detection',
                        'Predictive maintenance alerts',
                        'Automated compliance reporting'
                    ],
                    'roi': '6-month payback period'
                }
            },
            'case_study': {
                'title': '500-Mile Pipeline Network',
                'result': '$2.4M annual savings',
                'metrics': ['82% cost reduction', '95% faster inspections', '3 disasters prevented']
            },
            'testimonial': {
                'quote': 'Aura has revolutionized our pipeline inspection program. We\'re finding issues weeks before they become problems.',
                'author': 'Pipeline Operations Director',
                'company': 'Major Energy Company'
            }
        },
        {
            'id': 'infrastructure',
            'name': 'Civil Infrastructure',
            'title': 'Smart Infrastructure Monitoring',
            'description': 'Protect public safety and reduce maintenance costs with continuous AI monitoring of bridges, utilities, and drainage systems.',
            'hero_image': '/static/images/industries/infrastructure-hero.jpg',
            'market_size': '$1.8B by 2027',
            'growth_rate': '19% CAGR',
            'challenges': [
                'Aging infrastructure requiring frequent inspection',
                'Limited inspection budgets',
                'Traffic disruption during inspections',
                'Missing early warning signs of failure'
            ],
            'solutions': {
                'aura': {
                    'benefits': [
                        '24/7 automated monitoring',
                        '3D structural analysis',
                        'Drainage system assessment',
                        'Emergency response coordination'
                    ],
                    'roi': '45% reduction in maintenance costs'
                }
            },
            'applications': [
                'Bridge structural monitoring',
                'Power line inspection',
                'Railway infrastructure',
                'Drainage and flood management'
            ],
            'impact': {
                'safety': 'Zero inspection-related accidents',
                'efficiency': '10x faster assessments',
                'savings': '$500K+ per major structure annually'
            }
        },
        {
            'id': 'defense-security',
            'name': 'Defense & Security',
            'title': 'Advanced Threat Protection',
            'description': 'Secure critical assets with AI-powered drone detection and classification systems proven in 15+ countries.',
            'hero_image': '/static/images/industries/defense-hero.jpg',
            'market_size': '$4.2B by 2029',
            'growth_rate': '28% CAGR',
            'challenges': [
                'Evolving drone threats',
                'Need for 24/7 autonomous protection',
                'Integration with existing systems',
                'Minimizing false positives'
            ],
            'solutions': {
                'aegis': {
                    'benefits': [
                        '360° perimeter protection',
                        'Multi-sensor threat fusion',
                        'RIFF system integration',
                        'Automated threat response'
                    ],
                    'coverage': 'Up to 10km detection radius'
                }
            },
            'applications': [
                'Military base protection',
                'Critical infrastructure security',
                'Border surveillance',
                'VIP protection'
            ],
            'credentials': {
                'experience': '23+ years via InterProInvest',
                'deployments': '15+ countries',
                'uptime': '99.9% operational availability'
            }
        },
        {
            'id': 'construction',
            'name': 'Construction & Development',
            'title': 'Project Intelligence Platform',
            'description': 'Optimize construction projects with daily aerial monitoring, progress tracking, and quality control.',
            'hero_image': '/static/images/industries/construction-hero.jpg',
            'market_size': '$890M by 2026',
            'growth_rate': '21% CAGR',
            'challenges': [
                'Project delays and cost overruns',
                'Quality control across large sites',
                'Safety monitoring',
                'Stakeholder communication'
            ],
            'solutions': {
                'aura': {
                    'benefits': [
                        'Daily progress documentation',
                        'Volume calculations',
                        'Safety compliance monitoring',
                        'Automated reporting'
                    ],
                    'roi': '30% efficiency improvement'
                }
            },
            'use_cases': [
                'Site progress tracking',
                'Inventory management',
                'Quality assurance',
                'Safety inspections'
            ],
            'results': {
                'time': '50% faster inspections',
                'accuracy': '99% measurement precision',
                'communication': 'Real-time stakeholder updates'
            }
        }
    ]


@industries_bp.route('/<slug>')
def detail(slug):
    # Render the industry detail template
    return render_template('industries/detail.html', slug=slug)


@industries_bp.route('/')
def index():
    """Industries overview page."""
    industries = get_industries_data()
    
    context = {
        'page_title': 'Industries We Serve - AI Drone Solutions',
        'meta_description': 'Adaptive Auto Hub serves oil & gas, infrastructure, defense, and construction industries with AI-powered drone analytics and security solutions.',
        'industries': industries,
        'stats': {
            'total_market': '$9.2B',
            'average_savings': '75%',
            'industries_served': 4,
            'growth_rate': '23%'
        },
        'cta': {
            'title': 'Find Your Industry Solution',
            'description': 'Discover how our AI-powered drone solutions can transform your operations.',
            'button_text': 'Schedule Industry Consultation'
        }
    }
    
    return render_template('industries/index.html', **context)

@industries_bp.route('/<industry>')
def industry_detail(industry):
    """Individual industry detail pages."""
    industries = {item['id']: item for item in get_industries_data()}
    
    if industry not in industries:
        # Redirect to industries overview if not found
        return redirect(url_for('industries.index'))
    
    industry_data = industries[industry]
    
    # Add related industries for cross-promotion
    related = [ind for ind in industries.values() if ind['id'] != industry][:2]
    
    context = {
        'page_title': f'{industry_data["name"]} - AI Drone Solutions',
        'meta_description': f'AI-powered drone solutions for {industry_data["name"].lower()}. {industry_data["description"]}',
        'industry': industry_data,
        'related_industries': related,
        'breadcrumbs': [
            {'name': 'Home', 'url': '/'},
            {'name': 'Industries', 'url': '/industries/'},
            {'name': industry_data['name'], 'url': f'/industries/{industry}'}
        ]
    }
    
    return render_template('industries/detail.html', **context)
