# tumedx_platform/app/admin/routes.py

from flask import render_template, redirect, url_for, flash
from flask_login import login_required, current_user
from app.admin import admin_bp # Import the blueprint instance

@admin_bp.route('/dashboard')
@login_required # Requires user to be logged in
def admin_dashboard():
    """Renders the admin dashboard."""
    # Ensure only admin users can access this page
    if current_user.role != 'admin':
        flash('You do not have permission to access the admin dashboard.', 'danger')
        # Redirect to their respective dashboard or guest page
        if current_user.role == 'student':
            return redirect(url_for('student.student_dashboard'))
        elif current_user.role == 'teacher':
            return redirect(url_for('teacher.teacher_dashboard'))
        else:
            return redirect(url_for('main.guest_page')) # Fallback for unknown roles or logged out

    return render_template('admin_dashboard.html')

# You would add more admin-specific routes here, e.g.:
# @admin_bp.route('/manage_users')
# @login_required
# def manage_users():
#     if current_user.role != 'admin':
#         flash('Access denied.', 'danger')
#         return redirect(url_for('main.guest_page'))
#     # Logic to fetch and display users
#     return render_template('manage_users.html')
