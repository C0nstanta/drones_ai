# /app/utils/__init__.py
"""
Utility package for Adaptive Auto Hub Flask application.
Provides image optimization, performance helpers, and common utilities.
"""

from .image_optimizer import (
    ImageOptimizer,
    get_optimizer,
    get_optimized_url,
    get_responsive_sizes
)

__version__ = '1.0.0'
__author__ = 'Adaptive Auto Hub'

# Export main utility classes and functions
__all__ = [
    'ImageOptimizer',
    'get_optimizer', 
    'get_optimized_url',
    'get_responsive_sizes'
]

# Package metadata
PACKAGE_INFO = {
    'name': 'Adaptive Auto Hub Utils',
    'version': __version__,
    'description': 'Utility package for Flask web application optimization',
    'features': [
        'Image optimization with WebP conversion',
        'Responsive image sizing',
        'Low Quality Image Placeholder (LQIP) generation',
        'Performance utilities',
        'Template helpers'
    ]
}


def get_package_info():
    """
    Get package information dictionary.
    
    Returns:
        dict: Package metadata and feature information
    """
    return PACKAGE_INFO.copy()


def check_dependencies():
    """
    Check if all required dependencies are available.
    
    Returns:
        dict: Dependency status information
    """
    dependencies = {
        'PIL': False,
        'hashlib': False,
        'base64': False,
        'os': False
    }
    
    try:
        from PIL import Image
        dependencies['PIL'] = True
    except ImportError:
        pass
    
    try:
        import hashlib
        dependencies['hashlib'] = True
    except ImportError:
        pass
    
    try:
        import base64
        dependencies['base64'] = True
    except ImportError:
        pass
    
    try:
        import os
        dependencies['os'] = True
    except ImportError:
        pass
    
    return dependencies


# Initialize logging for utils package
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Create console handler if none exists
if not logger.handlers:
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    
    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    console_handler.setFormatter(formatter)
    
    logger.addHandler(console_handler)

logger.info(f"Utils package initialized - Version {__version__}")

# Check dependencies on import
_dependencies = check_dependencies()
_missing = [dep for dep, available in _dependencies.items() if not available]

if _missing:
    logger.warning(f"Missing dependencies: {', '.join(_missing)}")
else:
    logger.info("All dependencies available")
