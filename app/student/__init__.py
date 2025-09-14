# tumedx_platform/app/student/__init__.py

from flask import Blueprint

# Create a Blueprint instance for student features
student_bp = Blueprint('student', __name__, template_folder='templates')

# Import routes here to associate them with the blueprint
from app.student import routes
