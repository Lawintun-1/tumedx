# tumedx_platform/app/admin/__init__.py

from flask import Blueprint

# Create a Blueprint instance for admin features
admin_bp = Blueprint('admin', __name__, template_folder='templates')

# Import routes here to associate them with the blueprint
from app.admin import routes
