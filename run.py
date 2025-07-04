# /adaptive-auto-hub/run.py
"""
Development server for Adaptive Auto Hub Flask application.
Use this file to run the application locally during development.
"""

import os
from app import create_app

# Set development environment if not specified
os.environ.setdefault('FLASK_ENV', 'development')

# Create application instance
app = create_app()

if __name__ == '__main__':
    # Development server configuration
    app.run(
        host='127.0.0.1',
        port=5000,
        debug=True,
        threaded=True
    )