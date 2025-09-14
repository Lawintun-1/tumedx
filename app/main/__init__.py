# tumedx_platform/app/main/__init__.py

from flask import Blueprint

# Create a Blueprint instance for general public pages
main_bp = Blueprint('main', __name__, template_folder='templates')

# Import routes here to associate them with the blueprint
from app.main import routes
