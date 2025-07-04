# /app/utils/seo.py
"""
SEO utility functions for Adaptive Auto Hub website.
Handles meta tags, structured data, and SEO optimization.
"""

from typing import Dict, List, Optional
from datetime import datetime
from flask import url_for

class SEOHelper:
    """Helper class for SEO-related functionality."""
    
    # Default meta values
    DEFAULT_TITLE = "Adaptive Auto Hub - AI-Driven Drone Solutions"
    DEFAULT_DESCRIPTION = "Revolutionary AI-powered drone analytics and defense systems. 75-85% cost savings for infrastructure inspection. E-2 investor creating 7 US jobs."
    DEFAULT_KEYWORDS = "drone analytics, AI inspection, counter-drone, infrastructure monitoring, pipeline inspection, defense technology"
    DEFAULT_IMAGE = "/static/images/og-default.jpg"
    
    @staticmethod
    def generate_meta_tags(
        title: Optional[str] = None,
        description: Optional[str] = None,
        keywords: Optional[str] = None,
        image: Optional[str] = None,
        page_type: str = "website",
        canonical_url: Optional[str] = None
    ) -> Dict[str, str]:
        """
        Generate comprehensive meta tags for a page.
        
        Args:
            title: Page title (will be appended to site name)
            description: Meta description
            keywords: Meta keywords (comma-separated)
            image: Open Graph image URL
            page_type: Open Graph type (website, article, product)
            canonical_url: Canonical URL for the page
            
        Returns:
            Dictionary of meta tags
        """
        # Use defaults if not provided
        final_title = f"{title} | Adaptive Auto Hub" if title else SEOHelper.DEFAULT_TITLE
        final_description = description or SEOHelper.DEFAULT_DESCRIPTION
        final_keywords = keywords or SEOHelper.DEFAULT_KEYWORDS
        final_image = image or SEOHelper.DEFAULT_IMAGE
        
        # Ensure absolute URLs
        if final_image.startswith('/'):
            final_image = f"https://adaptiveautohub.com{final_image}"
            
        meta_tags = {
            # Basic meta tags
            'title': final_title,
            'description': final_description,
            'keywords': final_keywords,
            'robots': 'index, follow',
            'author': 'Adaptive Auto Hub',
            
            # Open Graph tags
            'og:title': final_title,
            'og:description': final_description,
            'og:type': page_type,
            'og:image': final_image,
            'og:site_name': 'Adaptive Auto Hub',
            'og:locale': 'en_US',
            
            # Twitter Card tags
            'twitter:card': 'summary_large_image',
            'twitter:title': final_title,
            'twitter:description': final_description,
            'twitter:image': final_image,
            
            # Additional tags
            'viewport': 'width=device-width, initial-scale=1.0',
            'charset': 'UTF-8',
            'language': 'en',
            'generator': 'Flask/Python'
        }
        
        # Add canonical URL if provided
        if canonical_url:
            meta_tags['canonical'] = canonical_url
            meta_tags['og:url'] = canonical_url
            
        return meta_tags
    
    @staticmethod
    def generate_breadcrumb_schema(breadcrumbs: List[Dict[str, str]]) -> Dict:
        """
        Generate schema.org BreadcrumbList structured data.
        
        Args:
            breadcrumbs: List of breadcrumb items with 'name' and 'url'
            
        Returns:
            Schema.org BreadcrumbList object
        """
        items = []
        for i, crumb in enumerate(breadcrumbs, 1):
            item = {
                "@type": "ListItem",
                "position": i,
                "name": crumb['name']
            }
            
            # Only add URL if not the last item
            if 'url' in crumb and i < len(breadcrumbs):
                item['item'] = f"https://adaptiveautohub.com{crumb['url']}"
                
            items.append(item)
            
        return {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": items
        }
    
    @staticmethod
    def generate_product_schema(
        name: str,
        description: str,
        brand: str = "Adaptive Auto Hub",
        category: Optional[str] = None,
        image: Optional[str] = None
    ) -> Dict:
        """
        Generate schema.org Product structured data.
        
        Args:
            name: Product name
            description: Product description
            brand: Brand name
            category: Product category
            image: Product image URL
            
        Returns:
            Schema.org Product object
        """
        schema = {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": name,
            "description": description,
            "brand": {
                "@type": "Brand",
                "name": brand
            },
            "manufacturer": {
                "@type": "Organization",
                "name": "Adaptive Auto Hub"
            }
        }
        
        if category:
            schema["category"] = category
            
        if image:
            if image.startswith('/'):
                image = f"https://adaptiveautohub.com{image}"
            schema["image"] = image
            
        # Add aggregate rating (placeholder - would be dynamic in production)
        schema["aggregateRating"] = {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "12"
        }
        
        return schema
    
    @staticmethod
    def generate_organization_schema() -> Dict:
        """Generate schema.org Organization structured data."""
        return {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Adaptive Auto Hub",
            "description": "AI-driven drone solutions for infrastructure inspection and defense",
            "url": "https://adaptiveautohub.com",
            "logo": "https://adaptiveautohub.com/static/images/logo.png",
            "foundingDate": "2024",
            "founder": {
                "@type": "Person",
                "name": "Adaptive Auto Hub Founder"
            },
            "location": {
                "@type": "Place",
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Salt Lake City",
                    "addressRegion": "UT",
                    "addressCountry": "US"
                }
            },
            "numberOfEmployees": {
                "@type": "QuantitativeValue",
                "value": 7
            },
            "sameAs": [
                # Social media profiles would go here
            ]
        }
    
    @staticmethod
    def generate_local_business_schema() -> Dict:
        """Generate schema.org LocalBusiness structured data."""
        return {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Adaptive Auto Hub",
            "description": "AI-driven drone solutions provider",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": "Salt Lake City",
                "addressRegion": "UT",
                "postalCode": "84101",
                "addressCountry": "US"
            },
            "priceRange": "$$$$",
            "telephone": "+1-XXX-XXX-XXXX",  # To be updated
            "openingHours": "Mo-Fr 09:00-18:00"
        }
    
    @staticmethod
    def clean_text_for_meta(text: str, max_length: int = 160) -> str:
        """
        Clean and truncate text for meta descriptions.
        
        Args:
            text: Input text
            max_length: Maximum length (default 160 for meta descriptions)
            
        Returns:
            Cleaned and truncated text
        """
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        # Truncate if needed
        if len(text) > max_length:
            text = text[:max_length-3].rsplit(' ', 1)[0] + '...'
            
        return text