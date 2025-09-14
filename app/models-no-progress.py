import json
from sqlalchemy.ext.mutable import MutableDict, MutableList
from datetime import datetime
from app import db
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.orm import relationship


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

    def __repr__(self):
        return f'<Course {self.title}>'


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

    def __repr__(self):
        return (f"<Enroll student_id={self.student_id} "
                f"course_id={self.course_id} "
                f"grade={self.grade} status={self.status}>")


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

    def __repr__(self):
        return f'<Chapter {self.title} (Course: {self.course_id}) Order: {self.order}>'


class Session(db.Model):
    """Represents a session within a chapter."""
    __tablename__ = 'sessions'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    session_type = db.Column(db.String(50), default='lecture', nullable=False)
    chapter_id = db.Column(db.Integer, db.ForeignKey('chapters.id'), nullable=False)
    order = db.Column(db.Integer, default=0, nullable=False)

    materials = db.relationship(
        'Material',
        backref='session',
        lazy='selectin',
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f'<Session {self.title}>'


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
        