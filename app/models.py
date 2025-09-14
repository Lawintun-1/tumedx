import json
from sqlalchemy.ext.mutable import MutableDict, MutableList
from datetime import datetime
from app import db
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.orm import relationship

# ------------------------
# User
# ------------------------
class User(UserMixin, db.Model):
    """Represents a user in the system."""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, index=True, nullable=False)
    email = db.Column(db.String(120), unique=True, index=True, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)
    role = db.Column(db.String(64), default='student', nullable=False)

    # Relationships
    courses_taught = db.relationship(
        'Course',
        backref='teacher',
        lazy='dynamic',
        foreign_keys='Course.teacher_id'
    )
    enrollments = db.relationship(
        "Enroll",
        back_populates="student",
        cascade="all, delete-orphan"
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.username}>'


# ------------------------
# Course
# ------------------------
class Course(db.Model):
    __tablename__ = 'courses'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    teacher_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    chapters = db.relationship(
        'Chapter',
        backref='course',
        lazy='selectin',
        cascade="all, delete-orphan",
        order_by="Chapter.order"
    )
    enrollments = db.relationship(
        "Enroll",
        back_populates="course",
        cascade="all, delete-orphan"
    )

    progress_records = db.relationship(
        "Progress",
        back_populates="course",
        cascade="all, delete-orphan"
    )
    learning_curves = db.relationship(
        "LearningCurve",
        back_populates="course",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f'<Course {self.title}>'


# ------------------------
# Enroll
# ------------------------
class Enroll(db.Model):
    """Represents the enrollment of a student in a course."""
    __tablename__ = "enrollments"

    id = db.Column(db.Integer, primary_key=True)

    # Foreign keys
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)

    # Enrollment details
    enrolled_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    progress = db.Column(db.Float, default=0.0)  # percentage completed
    status = db.Column(db.String(32), default="active")  # active, completed, dropped

    # Assessment / achievements
    grade = db.Column(db.String(10))   # e.g. "A+", "B", "Pass", "Fail"
    certificate_url = db.Column(db.String(255))  # link to PDF/issued cert

    # Relationships
    student = db.relationship("User", back_populates="enrollments")
    course = db.relationship("Course", back_populates="enrollments")

    progress_records = db.relationship(
        "Progress",
        back_populates="enrollment",
        cascade="all, delete-orphan"
    )
    learning_curves = db.relationship(
        "LearningCurve",
        back_populates="enrollment",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return (f"<Enroll student_id={self.student_id} "
                f"course_id={self.course_id} "
                f"grade={self.grade} status={self.status}>")


# ------------------------
# Chapter
# ------------------------
class Chapter(db.Model):
    """Represents a chapter within a course."""
    __tablename__ = 'chapters'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    order = db.Column(db.Integer, default=0, nullable=False)

    sessions = db.relationship(
        'Session',
        backref='chapter',
        lazy='selectin',
        cascade="all, delete-orphan",
        order_by="Session.order"
    )

    progress_records = db.relationship(
        "Progress",
        back_populates="chapter",
        cascade="all, delete-orphan"
    )
    learning_curves = db.relationship(
        "LearningCurve",
        back_populates="chapter",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f'<Chapter {self.title} (Course: {self.course_id}) Order: {self.order}>'


# ------------------------
# Session
# ------------------------
class Session(db.Model):
    """Represents a session within a chapter."""
    __tablename__ = 'sessions'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    session_type = db.Column(db.String(50), default='learning_session', nullable=False)
    chapter_id = db.Column(db.Integer, db.ForeignKey('chapters.id'), nullable=False)
    order = db.Column(db.Integer, default=0, nullable=False)

    materials = db.relationship(
        'Material',
        backref='session',
        lazy='selectin',
        cascade="all, delete-orphan"
    )

    progress_records = db.relationship(
        "Progress",
        back_populates="session",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f'<Session {self.title}>'


# ------------------------
# Material
# ------------------------
class Material(db.Model):
    """Represents learning material within a session."""
    __tablename__ = 'materials'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(50), nullable=False, default='text')
    content = db.Column(db.Text)
    session_id = db.Column(db.Integer, db.ForeignKey('sessions.id'), nullable=False)

    def __repr__(self):
        return f'<Material {self.name}>'


# ------------------------
# Quiz
# ------------------------
class Quiz(db.Model):
    __tablename__ = 'quizzes'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # mcq, TF, Blank

    question = db.Column(MutableDict.as_mutable(db.JSON), nullable=False, default={})
    option = db.Column(MutableDict.as_mutable(db.JSON), nullable=False, default={})
    key = db.Column(MutableDict.as_mutable(db.JSON), nullable=False, default={})

    difficulty = db.Column(MutableDict.as_mutable(db.JSON), nullable=False, default={})
    blooms_level = db.Column(MutableDict.as_mutable(db.JSON), nullable=False, default={})

    session_id = db.Column(db.Integer, db.ForeignKey('sessions.id'), nullable=False)
    session = db.relationship(
        'Session',
        backref=db.backref('quizzes', lazy='selectin', cascade='all, delete-orphan')
    )

    def __repr__(self):
        return f'<Quiz {self.name} Type: {self.type} Session_id: {self.session_id} Session: {self.session}>'


# ------------------------
# Progress Table
# ------------------------
class Progress(db.Model):
    """Tracks the student's UI progress per session/chapter/course."""
    __tablename__ = "progress"

    id = db.Column(db.Integer, primary_key=True)
    enrollment_id = db.Column(db.Integer, db.ForeignKey("enrollments.id", ondelete="CASCADE"), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    chapter_id = db.Column(db.Integer, db.ForeignKey("chapters.id", ondelete="CASCADE"), nullable=False)
    session_id = db.Column(db.Integer, db.ForeignKey("sessions.id", ondelete="CASCADE"), nullable=True)

    completed = db.Column(db.Boolean, default=False)
    percentage = db.Column(db.Float, default=0.0)

    # Relationships
    enrollment = db.relationship("Enroll", back_populates="progress_records")
    course = db.relationship("Course", back_populates="progress_records")
    chapter = db.relationship("Chapter", back_populates="progress_records")
    session = db.relationship("Session", back_populates="progress_records")

    __table_args__ = (
        db.UniqueConstraint('enrollment_id', 'course_id', 'chapter_id', 'session_id', name='uix_progress'),
    )


# ------------------------
# LearningCurve Table
# ------------------------
class LearningCurve(db.Model):
    """Tracks per-attempt errors for learning curve analytics per chapter."""
    __tablename__ = "learning_curve"

    id = db.Column(db.Integer, primary_key=True)

    # Foreign keys
    enrollment_id = db.Column(
        db.Integer,
        db.ForeignKey("enrollments.id", ondelete="CASCADE"),
        nullable=False
    )
    course_id = db.Column(
        db.Integer,
        db.ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False
    )


    chapter_id = db.Column(
        db.Integer,
        db.ForeignKey("chapters.id", ondelete="CASCADE"),
        nullable=False
    )

    # Attempt tracking
    attempt_number = db.Column(db.Integer, nullable=False)  # 1, 2, 3, ...
    error_count = db.Column(db.Integer, default=0)          # errors in this attempt
    last_attempted_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    enrollment = db.relationship(
        "Enroll",
        back_populates="learning_curves"
    )
    course = db.relationship(
        "Course",
        back_populates="learning_curves"
    )
    chapter = db.relationship(
        "Chapter",
        back_populates="learning_curves"
    )

    # Ensure unique attempt per enrollment/course/chapter
    __table_args__ = (
        db.UniqueConstraint(
            'enrollment_id', 'course_id', 'chapter_id', 'attempt_number',
            name='uix_learning_curve_attempt'
        ),
    )

    def __repr__(self):
        return (f"<LearningCurve enrollment={self.enrollment_id} "
                f"course={self.course_id} chapter={self.chapter_id} "
                f"attempt={self.attempt_number} errors={self.error_count}>")
