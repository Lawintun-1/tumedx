# tumedx_platform/app/__init__.py
from dotenv import load_dotenv
import os
from flask import Flask, redirect, url_for, flash, request, Blueprint
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, current_user
from flask_migrate import Migrate
import json

from .config import Config

db = SQLAlchemy()
login_manager = LoginManager()
migrate = Migrate()

# Load environment variables from .env at the very start
# .env should be at the project root (same level as run.py)
load_dotenv()
def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    login_manager.init_app(app)
    migrate.init_app(app, db)

    login_manager.login_view = 'auth.login'
    login_manager.login_message = "Please log in to access this page."
    login_manager.login_message_category = "warning"

    @login_manager.user_loader
    def load_user(user_id):
        from .models import User
        return User.query.get(int(user_id))

    def from_json_filter(value):
        try:
            return json.loads(value)
        except (json.JSONDecodeError, TypeError):
            return []
    app.jinja_env.filters['from_json'] = from_json_filter

    # Register Blueprints
    from app.auth import auth_bp
    from app.main import main_bp
    from app.admin import admin_bp
    from app.student import student_bp
    from app.teacher import teacher_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(admin_bp, url_prefix='/admin')
    app.register_blueprint(student_bp, url_prefix='/student')
    app.register_blueprint(teacher_bp, url_prefix='/teacher')

    @app.template_filter("truncate_words")
    def truncate_words_filter(s, num=30):
        words = s.split()
        return " ".join(words[:num]) + ("..." if len(words) > num else "")

    @app.before_request
    def check_user_role():
        if current_user.is_authenticated:
            allowed_blueprints = {
                'admin': ['main', 'auth', 'admin'],
                'student': ['main', 'auth', 'student'],
                'teacher': ['main', 'auth', 'teacher'],
            }
            blueprint = request.blueprint
            if blueprint and blueprint not in allowed_blueprints.get(current_user.role, []):
                flash(f"You do not have permission to access the {blueprint} area.", "danger")
                if current_user.role == 'admin':
                    return redirect(url_for('admin.admin_dashboard'))
                elif current_user.role == 'student':
                    return redirect(url_for('student.student_dashboard'))
                elif current_user.role == 'teacher':
                    return redirect(url_for('teacher.teacher_dashboard'))
                else:
                    return redirect(url_for('main.guest_page'))

    # Register CLI commands
    from app import cli
    app.cli.add_command(cli.create_admin)

    return app
