# app/teacher/__init__.py

from flask import Blueprint # Import Blueprint here, where it's used

# Define the blueprint with the correct template_folder
# This tells Flask to look for templates in the 'templates' folder relative to this blueprint's location.
teacher_bp = Blueprint('teacher', __name__, template_folder='templates')

# You should also import your routes here to associate them with the blueprint
from . import routes
