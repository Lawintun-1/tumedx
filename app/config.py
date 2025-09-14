# tumedx_platform/app/config.py

import os

class Config:
    SECRET_KEY='born25'
    SQLALCHEMY_DATABASE_URI='mysql+pymysql://tcuser:1234@localhost/tumedx_db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False # Disable tracking modifications for performance

    # Flask-Login configuration
    REMEMBER_COOKIE_DURATION = 3600 * 24 * 7 # Remember user for 7 days
    LOGIN_MESSAGE = "Please log in to access this page."
    LOGIN_MESSAGE_CATEGORY = "info" # Flash message category
    # config.py
    OPENROUTER_API_KEY = os.environ.get('Bearer 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')

   

