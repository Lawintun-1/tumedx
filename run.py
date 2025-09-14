# tumedx_platform/run.py

from app import create_app

# Create the Flask application instance using the application factory
app = create_app()

if __name__ == '__main__':
    # Run the application in debug mode for development
    # In a production environment, you would use a WSGI server like Gunicorn or uWSGI
    # For example: gunicorn -w 4 "run:app"
    app.run(debug=True)
