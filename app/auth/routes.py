# tumedx_platform/app/auth/routes.py

from flask import render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, current_user, login_required
from werkzeug.security import generate_password_hash, check_password_hash
from app.auth import auth_bp # Import the blueprint instance
from app.models import db, User # Import db and User model

@auth_bp.route('/register', methods=['GET', 'POST']) # <-- ENSURE THIS IS '/register'
def register():
    """Handle user registration."""
    if current_user.is_authenticated:
        # If already logged in, redirect to appropriate dashboard
        if current_user.role == 'admin':
            return redirect(url_for('admin.admin_dashboard'))
        elif current_user.role == 'student':
            return redirect(url_for('student.student_dashboard'))
        elif current_user.role == 'teacher':
            return redirect(url_for('teacher.teacher_dashboard'))

    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        role = request.form.get('role', 'student') # Default role is student

        # Basic validation
        if not username or not email or not password or not confirm_password:
            flash('All fields are required.', 'danger')
            return render_template('register.html')

        if password != confirm_password:
            flash('Passwords do not match.', 'danger')
            return render_template('register.html')

        # Check if username or email already exists
        user_by_username = User.query.filter_by(username=username).first()
        user_by_email = User.query.filter_by(email=email).first()

        if user_by_username:
            flash('Username already exists. Please choose a different one.', 'danger')
            return render_template('register.html')
        if user_by_email:
            flash('Email already registered. Please use a different email or login.', 'danger')
            return render_template('register.html')

        # Create new user
        new_user = User(username=username, email=email, role=role)
        new_user.set_password(password) # Hash the password
        db.session.add(new_user)
        db.session.commit()

        flash('Registration successful! Please log in.', 'success')
        return redirect(url_for('auth.login'))

    return render_template('register.html')

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    """Handle user login."""
    if current_user.is_authenticated:
        # If already logged in, redirect to appropriate dashboard
        if current_user.role == 'admin':
            return redirect(url_for('admin.admin_dashboard'))
        elif current_user.role == 'student':
            return redirect(url_for('student.student_dashboard'))
        elif current_user.role == 'teacher':
            return redirect(url_for('teacher.teacher_dashboard'))

    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        remember = request.form.get('remember_me') == 'on' # Check if 'remember me' is checked

        user = User.query.filter_by(username=username).first()

        if user and user.check_password(password):
            login_user(user, remember=remember) # Log the user in
            flash(f'Welcome, {user.username}!', 'success')
            # Redirect based on user role
            if user.role == 'admin':
                return redirect(url_for('admin.admin_dashboard'))
            elif user.role == 'student':
                return redirect(url_for('student.student_dashboard'))
            elif user.role == 'teacher':
                return redirect(url_for('teacher.teacher_dashboard'))
            else:
                # Default fallback for unexpected roles
                return redirect(url_for('main.guest_page'))
        else:
            flash('Invalid username or password.', 'danger')

    return render_template('login.html')

@auth_bp.route('/logout')
@login_required # Ensures only logged-in users can access this
def logout():
    """Handle user logout."""
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('main.guest_page'))
