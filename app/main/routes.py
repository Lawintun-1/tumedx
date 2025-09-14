# tumedx_platform/app/main/routes.py

from flask import render_template
from app.main import main_bp # Import the blueprint instance

@main_bp.route('/')
def guest_page():
    return render_template('guest_page.html')


# @main_bp.route('/about')
# def about():
#     return render_template('about.html')
