import click
from app.models import User
from app import db # Keep the db import, as it is a global object

@click.command('create-admin')
def create_admin():
    """Creates a default admin user if one does not exist."""
    admin_username = 'admin'
    admin_password = 'born25'

    admin_user = User.query.filter_by(username=admin_username).first()

    if admin_user:
        print(f"Admin user '{admin_username}' already exists.")
    else:
        new_admin = User(username=admin_username, role='admin', email=f"{admin_username}@example.com")
        new_admin.set_password(admin_password)

        db.session.add(new_admin)
        db.session.commit()

        print(f"Admin user '{admin_username}' created successfully!")