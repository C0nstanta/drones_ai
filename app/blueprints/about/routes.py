# /app/blueprints/about/routes.py
"""
About blueprint routes for Adaptive Auto Hub website.
Handles company information, founder story, and contact functionality.
"""

from flask import Blueprint, render_template, request, flash, redirect, url_for, jsonify
from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, SelectField
from wtforms.validators import DataRequired, Email, Length
import os
from datetime import datetime

about_bp = Blueprint('about', __name__,
                    url_prefix='/about',
                    template_folder='templates',
                    static_folder='static')

class ContactForm(FlaskForm):
    """Contact form for inquiries."""
    name = StringField('Name', validators=[
        DataRequired(message='Please enter your name'),
        Length(min=2, max=100)
    ])
    email = StringField('Email', validators=[
        DataRequired(message='Please enter your email'),
        Email(message='Please enter a valid email address')
    ])
    company = StringField('Company', validators=[Length(max=100)])
    phone = StringField('Phone', validators=[Length(max=20)])
    interest = SelectField('Interest', choices=[
        ('general', 'General Inquiry'),
        ('aura', 'Aura Analytics'),
        ('aegis', 'Aegis Defense'),
        ('partnership', 'Partnership Opportunity'),
        ('investment', 'Investment Inquiry'),
        ('demo', 'Schedule Demo')
    ])
    message = TextAreaField('Message', validators=[
        DataRequired(message='Please enter your message'),
        Length(min=10, max=1000)
    ])

def get_company_data():
    """Get comprehensive company information."""
    return {
        'mission': 'To revolutionize infrastructure inspection and security through AI-powered drone solutions that save lives, protect assets, and drive economic growth.',
        'vision': 'A world where critical infrastructure is continuously monitored and protected by intelligent autonomous systems, preventing failures before they happen.',
        'core_values': [  # Changed from 'values' to 'core_values'
            {
                'title': 'Innovation First',
                'description': 'We push the boundaries of AI and drone technology to solve real-world challenges.',
                'icon': 'lightbulb'
            },
            {
                'title': 'Safety Above All',
                'description': 'Every solution we create is designed to protect people and critical assets.',
                'icon': 'shield'
            },
            {
                'title': 'Partnership Driven',
                'description': 'We believe in the power of collaboration to create exceptional solutions.',
                'icon': 'handshake'
            },
            {
                'title': 'Economic Impact',
                'description': 'We create high-skill jobs and drive economic growth in our community.',
                'icon': 'chart'
            }
        ],
        'founder': {
            'name': 'Adaptive Auto Hub Founder',
            'title': 'CEO & Founder',
            'image': '/static/images/about/founder.png',
            'bio': 'An experienced technology entrepreneur with a passion for applying AI to solve critical infrastructure challenges. E-2 Treaty Investor bringing cutting-edge drone technology to the US market.',
            'investment': '$120,000 personal investment',
            'experience': [
                'Deep expertise in AI and computer vision',
                'Background in aerospace and defense',
                'Proven track record in technology commercialization',
                'Committed to creating American jobs'
            ]
        },
        'company': {
            'founded': '2024',
            'headquarters': 'Salt Lake City, Utah',
            'employees': '7 high-skill positions (projected)',
            'investment': '$120,000 (E-2 Treaty Investor)',
            'revenue_projection': '$1.2M+ by Year 5',
            'markets': ['Infrastructure', 'Defense', 'Oil & Gas', 'Construction']
        },
        'milestones': [
            {
                'date': '2024 Q1',
                'title': 'Company Founded',
                'description': 'E-2 visa investment and company establishment'
            },
            {
                'date': '2024 Q2',
                'title': 'Strategic Partnerships',
                'description': 'Partnered with Elphel Inc. and InterProInvest'
            },
            {
                'date': '2024 Q3',
                'title': 'Product Development',
                'description': 'Aura Analytics and Aegis Defense platforms launched'
            },
            {
                'date': '2024 Q4',
                'title': 'First Deployments',
                'description': 'Initial customer deployments in oil & gas sector'
            },
            {
                'date': '2025',
                'title': 'Market Expansion',
                'description': 'Scaling to serve multiple industries'
            }
        ],
        'team_growth': {
            'current': 2,
            'year_1': 4,
            'year_2': 7,
            'positions': [
                'AI/ML Engineers',
                'Computer Vision Specialists',
                'Drone Operations Experts',
                'Business Development',
                'Customer Success'
            ]
        }
    }

@about_bp.route('/')
def index():
    """About page with company information."""
    company_data = get_company_data()
    
    context = {
        'page_title': 'About Adaptive Auto Hub - AI Drone Innovation',
        'meta_description': 'Learn about Adaptive Auto Hub, our mission to revolutionize infrastructure inspection and defense with AI-powered drone solutions. E-2 investor creating 7 US jobs.',
        'company': company_data,
        'stats': {
            'investment': '$120K',
            'jobs': '7',
            'partnerships': '2',
            'market_size': '$9.2B'
        }
    }
    
    return render_template('about/index.html', **context)

@about_bp.route('/contact', methods=['GET', 'POST'])
def contact():
    """Contact page with form."""
    form = ContactForm()
    
    if form.validate_on_submit():
        # In production, this would send an email
        # For now, we'll just flash a success message
        
        # Log the contact (in production, save to database or send email)
        contact_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'name': form.name.data,
            'email': form.email.data,
            'company': form.company.data,
            'phone': form.phone.data,
            'interest': form.interest.data,
            'message': form.message.data
        }
        
        # In development, print to console
        if os.environ.get('FLASK_ENV') == 'development':
            print(f"Contact form submission: {contact_data}")
        
        flash('Thank you for your inquiry! We\'ll respond within 24 hours.', 'success')
        return redirect(url_for('about.contact'))
    
    context = {
        'page_title': 'Contact Us - Adaptive Auto Hub',
        'meta_description': 'Contact Adaptive Auto Hub for AI drone solutions, partnership opportunities, or investment inquiries. Located in Salt Lake City, Utah.',
        'form': form,
        'contact_info': {
            'location': {
                'city': 'Salt Lake City, Utah',
                'country': 'United States',
                'timezone': 'Mountain Time (MT)',
                'map_url': 'https://maps.google.com/?q=Salt+Lake+City+Utah'
            },
            'response_time': 'Within 24 hours',
            'business_hours': 'Monday - Friday, 9:00 AM - 6:00 PM MT',
            'email_note': 'For immediate assistance with deployed systems, please use your dedicated support channel.'
        },
        'inquiry_types': [
            {
                'type': 'Product Demo',
                'description': 'See Aura or Aegis in action',
                'icon': 'play'
            },
            {
                'type': 'Partnership',
                'description': 'Explore collaboration opportunities',
                'icon': 'handshake'
            },
            {
                'type': 'Investment',
                'description': 'Learn about investment opportunities',
                'icon': 'dollar'
            },
            {
                'type': 'Careers',
                'description': 'Join our growing team',
                'icon': 'users'
            }
        ]
    }
    
    return render_template('about/contact.html', **context)

@about_bp.route('/api/contact', methods=['POST'])
def api_contact():
    """API endpoint for contact form submissions."""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['name', 'email', 'message']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    
    # Process the contact (in production, send email or save to database)
    contact_data = {
        'timestamp': datetime.utcnow().isoformat(),
        'name': data.get('name'),
        'email': data.get('email'),
        'company': data.get('company', ''),
        'phone': data.get('phone', ''),
        'interest': data.get('interest', 'general'),
        'message': data.get('message')
    }
    
    # Log in development
    if os.environ.get('FLASK_ENV') == 'development':
        print(f"API Contact submission: {contact_data}")
    
    return jsonify({
        'success': True,
        'message': 'Thank you for your inquiry. We will respond within 24 hours.'
    })

@about_bp.route('/team')
def team():
    """Team page (optional expansion)."""
    # This could be expanded to show team members as the company grows
    return redirect(url_for('about.index'))
