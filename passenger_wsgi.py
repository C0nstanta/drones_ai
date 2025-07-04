# /home/adapmzvd/ai_drones_07.04.2025/passenger_wsgi.py

import sys
import os

# Add the project directory to the Python path
project_home = os.path.dirname(os.path.abspath(__file__))
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Import your Flask application
# Assuming your Flask app instance is in run.py or app/__init__.py
try:
    # If your Flask app instance is in run.py and named 'app'
    from run import app as application
except ImportError:
    try:
        # If your Flask app instance is in app/__init__.py
        from app import app as application
    except ImportError:
        # If your Flask app instance is created differently, adjust this import
        from app import create_app
        application = create_app()

# Passenger expects the application to be named 'application'
# Make sure it's accessible
if __name__ == "__main__":
    # This won't run under Passenger, but useful for testing
    application.run(debug=False)