# /adaptive-auto-hub/passenger_wsgi.py
"""
Namecheap shared hosting entry point for Adaptive Auto Hub Flask application.
This file is required for Passenger WSGI deployment on shared hosting.
"""

import sys
import os

# Add the application directory to Python path
app_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, app_dir)

# Set production environment
os.environ.setdefault('FLASK_ENV', 'production')

# Import and create the Flask application
from app import create_app

# Create application instance for Passenger
application = create_app('production')

# Optional: Add logging for debugging deployment issues
if application.debug:
    import logging
    logging.basicConfig(level=logging.INFO)
    application.logger.info('Adaptive Auto Hub application started in production mode')