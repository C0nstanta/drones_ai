# /app/utils/content.py
"""
Content management utilities for Adaptive Auto Hub website.
Handles static content loading, caching, and organization.
"""

import json
import os
from typing import Dict, List, Optional, Any
from functools import lru_cache
from datetime import datetime

class ContentManager:
    """Manages static content for the website."""
    
    # Content file paths (relative to app directory)
    CONTENT_DIR = 'static/data'
    PRODUCTS_FILE = 'products.json'
    TESTIMONIALS_FILE = 'testimonials.json'
    CASE_STUDIES_FILE = 'case_studies.json'
    TEAM_FILE = 'team.json'
    
    @classmethod
    @lru_cache(maxsize=32)
    def load_json_file(cls, filename: str) -> Dict:
        """
        Load and cache JSON content from file.
        
        Args:
            filename: Name of the JSON file
            
        Returns:
            Parsed JSON content
        """
        try:
            file_path = os.path.join(
                os.path.dirname(os.path.dirname(__file__)),
                cls.CONTENT_DIR,
                filename
            )
            
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            # Return empty dict if file doesn't exist
            return {}
        except json.JSONDecodeError:
            # Return empty dict if JSON is invalid
            return {}
    
    @classmethod
    def get_products(cls) -> List[Dict]:
        """Get all product information."""
        # For now, return hardcoded data
        # In production, this would load from JSON file
        return [
            {
                'id': 'aura',
                'name': 'Aura Analytics',
                'tagline': 'Intelligent Brain for Imaging Systems',
                'description': 'Transform infrastructure inspection with AI-powered analytics.',
                'features': [
                    'Real-time object recognition',
                    '3D scene reconstruction',
                    'Predictive maintenance',
                    'Multi-platform integration'
                ],
                'benefits': {
                    'cost_reduction': '75-85%',
                    'speed_increase': '10x',
                    'accuracy': '98%'
                },
                'markets': ['Oil & Gas', 'Infrastructure', 'Construction']
            },
            {
                'id': 'aegis',
                'name': 'Aegis Defense',
                'tagline': 'AI-Powered Counter-Drone System',
                'description': 'Protect critical assets with advanced threat detection.',
                'features': [
                    'Multi-sensor fusion',
                    'AI threat classification',
                    'RIFF integration',
                    'Automated response'
                ],
                'benefits': {
                    'detection_range': '10km',
                    'response_time': '<2s',
                    'false_positive_rate': '<0.1%'
                },
                'markets': ['Defense', 'Critical Infrastructure', 'Public Safety']
            }
        ]
    
    @classmethod
    def get_testimonials(cls, limit: Optional[int] = None) -> List[Dict]:
        """
        Get customer testimonials.
        
        Args:
            limit: Maximum number of testimonials to return
            
        Returns:
            List of testimonial dictionaries
        """
        testimonials = [
            {
                'id': 1,
                'client': 'Major Pipeline Operator',
                'industry': 'Oil & Gas',
                'quote': 'Aura reduced our inspection costs by 82% while improving defect detection. The ROI was achieved in just 6 months.',
                'author': 'Operations Director',
                'rating': 5
            },
            {
                'id': 2,
                'client': 'State DOT',
                'industry': 'Infrastructure',
                'quote': 'We can now monitor all our bridges continuously. Early detection has prevented two major incidents.',
                'author': 'Chief Engineer',
                'rating': 5
            },
            {
                'id': 3,
                'client': 'Defense Contractor',
                'industry': 'Defense',
                'quote': 'Aegis provides the most reliable drone detection we\'ve tested. Zero breaches since deployment.',
                'author': 'Security Director',
                'rating': 5
            }
        ]
        
        if limit:
            return testimonials[:limit]
        return testimonials
    
    @classmethod
    def get_case_studies(cls, product: Optional[str] = None) -> List[Dict]:
        """
        Get case studies, optionally filtered by product.
        
        Args:
            product: Product ID to filter by ('aura' or 'aegis')
            
        Returns:
            List of case study dictionaries
        """
        case_studies = [
            {
                'id': 'pipeline-500-miles',
                'product': 'aura',
                'title': '500-Mile Pipeline Network Transformation',
                'client': 'Major Energy Company',
                'industry': 'Oil & Gas',
                'challenge': 'Manual inspection of 500 miles of pipeline costing $5M annually',
                'solution': 'Deployed Aura with autonomous drone fleet',
                'results': {
                    'cost_reduction': '82%',
                    'inspection_time': '95% faster',
                    'incidents_prevented': 3,
                    'annual_savings': '$2.4M'
                },
                'quote': 'Aura has revolutionized our inspection program.',
                'image': '/static/images/case-studies/pipeline.jpg'
            },
            {
                'id': 'military-base-protection',
                'product': 'aegis',
                'title': 'Military Installation Security',
                'client': 'Defense Force',
                'industry': 'Defense',
                'challenge': 'Protect 50 sq km facility from drone threats',
                'solution': 'Aegis with RIFF integration for complete coverage',
                'results': {
                    'detection_rate': '100%',
                    'false_positives': '0',
                    'response_time': '1.8s average',
                    'coverage': 'Complete perimeter'
                },
                'quote': 'Best-in-class drone defense system.',
                'image': '/static/images/case-studies/defense.jpg'
            }
        ]
        
        if product:
            return [cs for cs in case_studies if cs['product'] == product]
        return case_studies
    
    @classmethod
    def get_metrics(cls) -> Dict[str, Any]:
        """Get key business metrics."""
        return {
            'jobs_created': 7,
            'cost_savings': '75-85%',
            'market_growth': '23% CAGR',
            'investment': '$120,000',
            'revenue_projection': '$1.2M+',
            'defense_experience': '23+ years',
            'deployment_countries': 15,
            'inspection_speed': '10x faster',
            'accuracy_rate': '98%',
            'uptime': '99.9%'
        }
    
    @classmethod
    def get_industries(cls) -> List[Dict]:
        """Get industry information."""
        return [
            {
                'id': 'oil-gas',
                'name': 'Oil & Gas',
                'icon': 'oil-rig',
                'market_size': '$2.3B',
                'growth_rate': '23% CAGR',
                'key_application': 'Pipeline Inspection',
                'roi_period': '6 months'
            },
            {
                'id': 'infrastructure',
                'name': 'Civil Infrastructure',
                'icon': 'bridge',
                'market_size': '$1.8B',
                'growth_rate': '19% CAGR',
                'key_application': 'Asset Monitoring',
                'roi_period': '9 months'
            },
            {
                'id': 'defense',
                'name': 'Defense & Security',
                'icon': 'shield',
                'market_size': '$4.2B',
                'growth_rate': '28% CAGR',
                'key_application': 'Threat Detection',
                'roi_period': 'Immediate'
            },
            {
                'id': 'construction',
                'name': 'Construction',
                'icon': 'crane',
                'market_size': '$890M',
                'growth_rate': '21% CAGR',
                'key_application': 'Progress Tracking',
                'roi_period': '3 months'
            }
        ]
    
    @classmethod
    def get_partners(cls) -> List[Dict]:
        """Get partner information."""
        return [
            {
                'id': 'elphel',
                'name': 'Elphel Inc.',
                'type': 'Technology Partner',
                'location': 'Salt Lake City, Utah',
                'description': 'Open hardware imaging solutions',
                'partnership_benefits': [
                    'Advanced camera integration',
                    'Multi-spectral imaging',
                    'Open-source collaboration'
                ]
            },
            {
                'id': 'interproinvest',
                'name': 'InterProInvest',
                'type': 'Defense Systems Partner',
                'location': 'International',
                'description': 'Counter-drone defense systems',
                'partnership_benefits': [
                    'RIFF system integration',
                    '23+ years experience',
                    'Global deployments'
                ]
            }
        ]
    
    @staticmethod
    def format_number(num: float, decimals: int = 0) -> str:
        """
        Format number with commas and optional decimals.
        
        Args:
            num: Number to format
            decimals: Number of decimal places
            
        Returns:
            Formatted number string
        """
        if decimals > 0:
            return f"{num:,.{decimals}f}"
        return f"{int(num):,}"
    
    @staticmethod
    def get_current_year() -> int:
        """Get current year for copyright notices."""
        return datetime.now().year