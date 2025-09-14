from flask import Blueprint, render_template, request, redirect, url_for, flash
import json
from . import db
from app.models import Course, Chapter, Session, Material

# Define the Blueprint for the teacher module.
# You will need to make sure this blueprint is registered in your main application's __init__.py file.
teacher = Blueprint('teacher', __name__, template_folder='templates')

@teacher.route('/edit_course/<int:course_id>', methods=['GET', 'POST'])
def edit_course(course_id):
    """
    Handles both displaying the course edit form (GET) and processing
    the form submission (POST).
    """
    # This part handles the form submission (POST request)
    if request.method == 'POST':
        # Get the course object from the database
        course = db.session.get(Course, course_id)
        if course:
            # Update only the title and description from the form
            course.title = request.form.get('title')
            course.description = request.form.get('description')

            # Commit the changes to the database
            db.session.commit()
            
            # Send a success message back to the user
            flash('Course updated successfully!', 'success')
            
            # Redirect the user to the same page
            return redirect(url_for('teacher.edit_course', course_id=course_id))
        else:
            flash('Course not found.', 'danger')
            return redirect(url_for('teacher.teacher_dashboard'))

    # This part handles the initial page load (GET request)
    course = db.session.get(Course, course_id)
    if not course:
        return "Course not found", 404

    # We need to load the content of the course to display it in the form
    # This part loads existing chapters, sessions, and materials
    chapters_data = []
    # Fix: Use Python's sorted() to sort the chapters by their 'order' attribute
    for chapter in sorted(course.chapters, key=lambda c: c.order):
        sessions_data = []
        # Fix: Use Python's sorted() to sort the sessions by their 'order' attribute
        for session in sorted(chapter.sessions, key=lambda s: s.order):
            materials_data = []
            if session.session_type == 'learning_session':
                for material in session.materials:
                    materials_data.append({
                        'name': material.name,
                        'type': material.type,
                        'content': material.content
                    })
            
            sessions_data.append({
                'title': session.title,
                'type': session.session_type,
                'materials': materials_data
            })
        
        chapters_data.append({
            'title': chapter.title,
            'sessions': sessions_data
        })

    # Prepare a dictionary to be sent to the template
    course_data = {
        'title': course.title,
        'description': course.description,
        'content': {
            'chapters': chapters_data
        }
    }
    course_content_json_str = json.dumps(course_data['content'])

    return render_template(
        'edit_course.html', 
        course=course_data, 
        course_content_json=course_content_json_str, 
        csrf_token='dummy-token' # Assuming you're handling CSRF tokens elsewhere
    )
