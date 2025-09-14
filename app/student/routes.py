# tumedx_platform/app/student/routes.py
from flask import render_template, redirect, url_for, flash
from flask_login import login_required, current_user
from app.student import student_bp # Import the blueprint instance
from flask import render_template, url_for, flash, redirect, abort, request, jsonify, session
from flask_login import login_required, current_user
from sqlalchemy.orm import selectinload
from sqlalchemy import desc, asc
from app import db 
from . import student_bp
from flask_wtf.csrf import generate_csrf 
from flask_login import login_required, current_user
from app.teacher import teacher_bp
from app.models import db, User, Course, Chapter, Session, Material, Quiz , Enroll, Progress , LearningCurve 
import json
import os
from urllib.parse import urlparse, parse_qs
import requests
from flask import jsonify
import re  
from flask import render_template_string
from flask import current_app 
from datetime import datetime
import string 

JSON_FILE = os.path.join("app", "student", "enrollment.json")

PISTON_API_URL = "https://emkc.org/api/v2/piston/execute"

LANG_MAP = {
    'python': 'python',
    'clike': 'c++',  # Piston uses 'c++' for C++
    'javascript': 'javascript',
    'php': 'php',
    'java': 'java',
}

LETTER_TO_INDEX = {
    'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5
}


#this is I usage
def models_helper(student_id):
    print("student id = " ,student_id)
    enrollment = Enroll.query.filter_by(student_id = student_id).all()
    #print("enrollment  ===== " ,enrollment)
    course_id_list = []
    for e in enrollment:
        course_id_list.append(e.course_id)
    #print("course_temp ", course_id_list)
    
    course_chapter_id_dict = {}
    course_chapter_name_dict = {}
    chapter_obj_list = []
    for c in course_id_list:
        chapter = Chapter.query.filter_by(course_id=c).all()
        chapter_obj_list.append(chapter)
        course_chapter_id_dict[c] = []
        for ch in chapter:
            course_chapter_id_dict[c].append(ch.id)

    #print("course_id : [ chapter_id ]  ", course_chapter_id_dict)
    #print("chapter obj list ", chapter_obj_list)
    course_chapter_session_dict = {}
    for co,ch_obj_list in zip(course_chapter_id_dict,chapter_obj_list):
        course_chapter_session_dict[co] = {}
        for ch in ch_obj_list:
            course_chapter_session_dict[co][ch.id] = []
        for ch in ch_obj_list:
            session = Session.query.filter_by(chapter_id=ch.id).all()
            for s in session:
                course_chapter_session_dict[co][ch.id].append(s.id)

    return course_chapter_session_dict

def chapter_progress_session(chapter_id,student_id): #chapter view usage 
    print("this is chapter_progress_session, chapter id = ", chapter_id)

def course_progress_chapter(course_id,student_id): #learning room usage 
    print("this is course_progress_chapter , course id = " ,course_id)



@student_bp.route('/dashboard')
@login_required # Requires user to be logged in
def student_dashboard():
    """Renders the student dashboard."""
    # Ensure only student users can access this page
    if current_user.role != 'student':
        flash('You do not have permission to access the student dashboard.', 'danger')
        # Redirect to their respective dashboard or guest page
        if current_user.role == 'admin':
            return redirect(url_for('admin.admin_dashboard'))
        elif current_user.role == 'teacher':
            return redirect(url_for('teacher.teacher_dashboard'))
        else:
            return redirect(url_for('main.guest_page')) # Fallback for unknown roles or logged out
    student = User.query.get(current_user.id)
    name = student.username
    courses = Course.query.all()
    enroll = Enroll.query.all()

    enrolled_courses = (
        Course.query
        .join(Enroll)
        .filter(Enroll.student_id == current_user.id)
        .all()
    )
    enrollment_course_list = [course.id for course in enrolled_courses]
    num_enrollment_courses = len(enrollment_course_list)
    models_helper(current_user.id)



    course_description = [(c.title, c.description) for c in courses]

    return render_template('student_dashboard.html' , 
        num_enrollment_courses=num_enrollment_courses, 
        name=name , 
        enrollment_course_list=enrollment_course_list, 
        course=courses)



@student_bp.route("/enroll_course/<int:course_id>", methods=["POST"])
@login_required
def enroll_course(course_id):
    # Only students can enroll
    if current_user.role != 'student':
        return "Unauthorized", 403

    course = Course.query.get(course_id)
    if not course:
        return "Course not found", 404
    print("Enrollment is successful  ======================= ")
    enroll_course = Enroll(
        student_id=current_user.id,
        course_id=course_id,
        grade="O",
        status="Active"
        )
    db.session.add(enroll_course)
    db.session.commit()

    return render_template("partials/enrolled_message.html", course=course)




@student_bp.route("/my_course", methods=["GET"])
@login_required
def my_course():
    # Get the courses the student is enrolled in
    enrolled_courses = (
        Course.query
        .join(Enroll)
        .filter(Enroll.student_id == current_user.id)
        .all()
    )

    # Build a list of course IDs for template logic (if needed)
    enrollment_course_list = [c.id for c in enrolled_courses]

    return render_template(
        "partials/my_course.html",
        courses=enrolled_courses,
        enrollment_course_list=enrollment_course_list
    )


#==================== quick ========================


@student_bp.route("/course/<int:course_id>/learning-room")
@login_required
def learning_room(course_id):
    course = Course.query.get_or_404(course_id)
    chapters = Chapter.query.filter_by(course_id=course_id).order_by(Chapter.order).all()
    chapter_id_dict = models_helper(current_user.id)[course_id]
    print("This is chapter_id_dict = ", chapter_id_dict )
    enrollment_list = Enroll.query.filter_by(student_id=current_user.id,course_id=course_id).all()
    enrollment_id = enrollment_list[0].id

    #first

    chapter_id_list = list(chapter_id_dict.keys())
    print("chapter id list ",chapter_id_list)

    for chapter_id in chapter_id_list:
        progress_ = Progress.query.filter_by(course_id=course_id,chapter_id=chapter_id,enrollment_id=enrollment_id).all()
        if len(progress_) == 0:
            print("len(progress) == ", 0)
            for c_id , s_id_list in chapter_id_dict.items():
                if c_id == chapter_id:
                    for s_id in s_id_list:
                        progress = Progress(enrollment_id=enrollment_id,course_id=course_id,chapter_id=c_id,session_id=s_id)
                        db.session.add(progress)
                        db.session.commit()
                        #print("s_id = ", s_id)
        else:
            detect_pg_uncomplete = []
            print("len(progress) != ", 0) 


    lock_chapter_list = []        
    check = Progress.query.filter_by(course_id=course_id,enrollment_id=enrollment_id).all()
    for c in check:
        if c.completed is False:
            lock_chapter_list.append(c.chapter_id)
    lock_chapter_list = list(set(lock_chapter_list))
    
    #test_temp = []
    #print(test_temp[1:])

    if len(chapter_id_list) != 0 and len(lock_chapter_list) != 0 :
        inter_set = set(lock_chapter_list) & set(lock_chapter_list)
        inter_list = sorted(list(inter_set))
        lock_chapter_id_list = inter_list[1:]
        print("intersection of chapter id list - lock chapter id list ", lock_chapter_id_list)
    elif len(chapter_id_list) != 0 and len(lock_chapter_list) == 0:
        lock_chapter_id_list = []
        chapter_id_list = chapter_id_list  
    elif len(chapter_id_list) == 0 and len(lock_chapter_list) != 0:
        lock_chapter_id_list = []
        chapter_id_list = []
    else:
        print("lock chapter id list ", lock_chapter_list)
        print("chapter id list ", chapter_id_list)


    return render_template(
        "partials/learning_room.html",
        course=course,
        chapters=chapters,
        lock_chapter_id_list=lock_chapter_id_list,
        chapter_id_list=chapter_id_list,
        enrollment_id=enrollment_id
    )
    


@student_bp.route("/chapter/<int:chapter_id>/<int:enrollment_id>")
@login_required
def chapter_view(chapter_id,enrollment_id):
    chapter = Chapter.query.get_or_404(chapter_id)
    # get sessions ordered by "order"
    sessions = Session.query.filter_by(chapter_id=chapter_id).order_by(Session.order).all()
    if not sessions:
        flash("This chapter has no sessions yet.", "warning")
        return redirect(url_for("student.learning_room", course_id=chapter.course_id))



    detect_completed = []
    detect_existing = []
    quiz_session_count = []

    for session in sessions:
        progress = Progress.query.filter_by(
        enrollment_id=enrollment_id,
        course_id=chapter.course_id,
        chapter_id=chapter_id,
        session_id=session.id).all()
        if len(progress) != 0:
            if progress[0].completed == 1:
                detect_completed.append(1)
            detect_existing.append(1)
        if session.session_type == "quiz_session":
            quiz_session_count.append(1)

    if len(detect_completed) == 0 and len(detect_existing) != 0:
        print("detect completed first debug", len(detect_completed), " vs ", len(detect_existing))
        
        learning_curve = LearningCurve.query.filter_by(
            enrollment_id=enrollment_id,
            course_id=chapter.course_id,
            chapter_id=chapter_id).first()

        if learning_curve == None :
            #error setting 
            error_count = 0
            curve_set = LearningCurve(
                enrollment_id=enrollment_id,
                course_id=chapter.course_id,
                chapter_id=chapter_id,
                attempt_number = 1,
                error_count = error_count)
            db.session.add(curve_set)
            db.session.commit()
            print("Before condition, attempt_number = ", curve_set.attempt_number)
        else:
            temp_attempt = []
            temp_error_count = []
            learning_curve = LearningCurve.query.filter_by(
                enrollment_id=enrollment_id,
                course_id=chapter.course_id).all()
            for lc in learning_curve:
                temp_attempt.append(lc.attempt_number)
                temp_error_count.append(lc.error_count)
            print("/ntemp_attempt == ", temp_attempt)
            print("/ntemp_error_count == ", temp_error_count) ######## 


    elif len(detect_completed) != 0 and len(detect_existing) != 0:
        print("detect completed second debug", len(detect_completed), " vs ", len(detect_existing))
        if len(detect_completed) == len(detect_existing):
            learning_curve = LearningCurve.query.filter_by(
            enrollment_id=enrollment_id,
            course_id=chapter.course_id,
            chapter_id=chapter_id).order_by(LearningCurve.chapter_id.desc()).first()
            temp_attempt = []
            temp_error_count = []
            learning_curve_check = LearningCurve.query.filter_by(
                enrollment_id=enrollment_id,
                course_id=chapter.course_id).all()
            for lc in learning_curve_check:
                temp_attempt.append(lc.attempt_number)
                temp_error_count.append(lc.error_count)
            print("/ntemp_attempt == ", temp_attempt)
            print("/ntemp_error_count == ", temp_error_count)
            if learning_curve != None: #existing row in LC and error is not zero , not any quiz
                latest_progress = Progress.query.filter_by(
                    enrollment_id=enrollment_id,
                    course_id=chapter.course_id,
                    chapter_id=chapter_id
                    ).order_by(Progress.id.desc()).first()
                print("latest progress extrace ", latest_progress)
                if latest_progress and latest_progress.completed == 1:
                    # get the latest LC row
                    learning_curve = LearningCurve.query.filter_by(
                    enrollment_id=enrollment_id,
                    course_id=chapter.course_id,
                    chapter_id=chapter_id).order_by(LearningCurve.id.desc()).first()
                    if learning_curve:
                        # create a NEW row with +1 attempt
                        new_lc = LearningCurve(
            enrollment_id=learning_curve.enrollment_id,
            course_id=learning_curve.course_id,
            chapter_id=learning_curve.chapter_id,
            attempt_number=learning_curve.attempt_number + 1,
            error_count=0  # reset or carry over? depends on your logic
        )
                        db.session.add(new_lc)
                        db.session.commit()
                        print("✅ New attempt created:", new_lc.attempt_number)





    # start with the first session
    first_session = sessions[0]
    return redirect(url_for("student.session_view", session_id=first_session.id, enrollment_id=enrollment_id))


#progress definition 
@student_bp.route("/session/<int:session_id>/<int:enrollment_id>")
@login_required
def session_view(session_id, enrollment_id):
    session = Session.query.get_or_404(session_id)
    enroll = Enroll.query.get_or_404(enrollment_id)
    course_id = enroll.course_id
    chapter_id = session.chapter_id
    progress = None

    #progress definition for learning session
    if session.session_type == "learning_session":
        progress = Progress.query.filter_by(
        enrollment_id=enrollment_id,
        course_id=course_id,
        chapter_id=chapter_id,
        session_id=session.id
    ).first()
        if progress:
            # Example: mark as completed
            progress.completed = True
            # or if you need to increment something numeric (not completed because it's bool):
            # progress.percentage = progress.percentage + 10  # for example
        else:
            # If not exist → create new
            progress = Progress(
            enrollment_id=enrollment_id,
            course_id=course_id,
            chapter_id=chapter_id,
            session_id=session.id,
            completed=True
        )
            db.session.add(progress)

        db.session.commit()

    # ✅ Find the next session
    next_session = (
        Session.query.filter(
            Session.chapter_id == session.chapter_id,
            Session.order > session.order
        )
        .order_by(Session.order)
        .first()
    )



    #progress definition for quiz 

    if session.session_type == "quiz_session":
        progress = Progress.query.filter_by(
        enrollment_id=enrollment_id,
        course_id=course_id,
        chapter_id=chapter_id,
        session_id=session_id
    ).first()

        if progress:
            progress.completed = True
            print("progress is existing ", progress)
            progress.percentage = None
        else:
            progress = Progress(
            enrollment_id=enrollment_id,
            course_id=course_id,
            chapter_id=chapter_id,
            session_id=session_id,
            completed=True,
            percentage=None
        )
        db.session.add(progress)
    db.session.commit()
    pg = Progress.query.filter_by(
        enrollment_id=enrollment_id,
        course_id=chapter_id,
        chapter_id=chapter_id,
        session_id=session_id,
        completed=True).first()
   




    alphabet = list(string.ascii_uppercase)  # ['A','B','C','D', ...]

    return render_template(
        "partials/session_view.html",
        session=session,
        materials=session.materials,
        quizzes=session.quizzes,
        next_session=next_session,
        enrollment_id=enrollment_id,
        alphabet=alphabet  # ✅ pass alphabet into template
    )


@student_bp.route("/submit_quiz/<int:quiz_id>", methods=["POST"])
@login_required
def submit_quiz(quiz_id):
    data = request.get_json()
    enrollment_id = data.get("enrollment_id")
    answers = data.get("answers", {})
    print("Enrollment id ", enrollment_id)
    print("📩 Received answers:", answers)

    # Example: calculate error_count
    quiz = Quiz.query.get_or_404(quiz_id)
    error_count = 0
    index = {"A" : 0 , "B": 1 , "C" : 2 , "D" : 3, "True": 0, "False": 1}

    #user_answer to index
    print("==================== quiz.option ================= ", quiz.option)
    index_list = []

    if quiz.type == "MCQ" or quiz.type == "TF": 
        for key,val in quiz.key.items():
            if isinstance(val, list):
                for v in val:
                    print("key ",index[v])
                    index_list.append(index[v])
            else:
                print("key ", index[val])
                index_list.append(index[val])

        print("index_list ", index_list)
    
        for val,l,a in zip(quiz.option.values(),index_list,answers.values()):
            if val[l] != a:
                error_count += 1
    else:
        for a,key in zip(answers.values(),quiz.key.values()):
            if a != key:
                error_count += 1

    

    print("error count ===== ....... ", error_count)

    session = Session.query.get_or_404(quiz.session_id)
    chapter = Chapter.query.get_or_404(session.chapter_id)
    course = Course.query.get_or_404(chapter.course_id)
    learning_curve = LearningCurve.query.filter_by(
        enrollment_id=enrollment_id,
        course_id=course.id,
        chapter_id=chapter.id).order_by(LearningCurve.attempt_number.desc()).first()

    learning_curve.error_count += error_count
    attempt_number = learning_curve.attempt_number

    db.session.commit()
    
    

    progress = Progress.query.filter_by(
        enrollment_id=enrollment_id,
        course_id=course.id).all()
    
    completed_detect = []
    for pg in progress:
        if pg.completed == False:
            completed_detect.append(1)
        print("This is pg === ", pg)

    if len(completed_detect) == 0:
        learning_curve_updated = LearningCurve(
        enrollment_id=enrollment_id,
        course_id=course.id,
        chapter_id=chapter.id,
        attempt_number= attempt_number+1,
        error_count=0)







    return jsonify({"status": "ok", "error_count": error_count})



#=========================== end quiz ================================


@student_bp.route("/session_finish/<int:enrollment_id>/<int:chapter_id>", methods=["POST"])
@login_required
def session_finish(enrollment_id, chapter_id):
    # Mark all sessions in this chapter as completed for this enrollment
    sessions = Session.query.filter_by(chapter_id=chapter_id).all()
    for sess in sessions:
        progress = Progress.query.filter_by(
            enrollment_id=enrollment_id,
            course_id=sess.chapter.course_id,
            chapter_id=chapter_id,
            session_id=sess.id
        ).first()
        if progress:
            progress.completed = True
        else:
            progress = Progress(
                enrollment_id=enrollment_id,
                course_id=sess.chapter.course_id,
                chapter_id=chapter_id,
                session_id=sess.id,
                completed=True
            )
            db.session.add(progress)
    db.session.commit()

    return render_template("partials/chapter_completed.html", chapter_id=chapter_id)


#==================== endquick ==================

@student_bp.route("/editor")
@login_required
def editor():
    return render_template('partials/editor.html')

@student_bp.route("/run", methods=["POST"])
@login_required
def run_code():
    data = request.json
    code = data.get('code')
    lang = data.get('lang')
    
    # Check if the requested language is supported
    if lang not in LANG_MAP:
        return jsonify({'output': f"Unsupported language: {lang}"}), 400

    piston_payload = {
        "language": LANG_MAP[lang],
        "version": "*",
        "files": [{"content": code}]
    }

    try:
        response = requests.post(PISTON_API_URL, json=piston_payload, timeout=15)
        response.raise_for_status()
        
        result = response.json()
        
        # Extract output and error from Piston's response format
        output = result.get('run', {}).get('stdout', '')
        error = result.get('run', {}).get('stderr', '')
        
        return jsonify({'output': output + error})
        
    except requests.exceptions.Timeout:
        return jsonify({'output': 'Execution request timed out.'}), 408
    except requests.exceptions.RequestException as e:
        return jsonify({'output': f"Error connecting to code execution service: {str(e)}"}), 502
    except Exception as e:
        return jsonify({'output': f"An unexpected error occurred: {str(e)}"}), 500
