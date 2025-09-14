# The application factory function from your `app` package.
# This assumes your main app factory function is named `create_app` in `app/__init__.py`.
from app import create_app

# The WSGI server will run the `create_app()` function to get the application object.
# The `application` variable is what the server looks for.
application = create_app()