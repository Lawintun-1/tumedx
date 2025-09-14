# tumedx_platform/app/auth/__init__.py

from flask import Blueprint

# Create a Blueprint instance for authentication features
auth_bp = Blueprint('auth', __name__, template_folder='templates')

# Import routes here to associate them with the blueprint
from app.auth import routes
