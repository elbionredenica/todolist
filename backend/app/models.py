from . import db, login_manager  # Import database instance and login manager
from flask_login import UserMixin  # Import UserMixin for Flask-Login integration
from datetime import datetime  # Import datetime for timestamps


@login_manager.user_loader
def load_user(user_id):
    """
    User loader function for Flask-Login.
    Loads a user object from the database given a user ID.
    """
    return User.query.get(int(user_id))


class User(db.Model, UserMixin):
    """
    Represents a user in the database.
    """
    id = db.Column(db.Integer, primary_key=True)  # Primary key
    username = db.Column(db.String(80), unique=True, nullable=False)  # Unique username
    email = db.Column(db.String(120), unique=True, nullable=False)  # Unique email
    password = db.Column(db.String(60), nullable=False)  # Password hash
    lists = db.relationship('TodoList', backref='owner', lazy=True)  # Relationship with TodoList


class TodoList(db.Model):
    """
    Represents a to-do list in the database.
    """
    id = db.Column(db.Integer, primary_key=True)  # Primary key
    title = db.Column(db.String(100), nullable=False)  # Title of the list
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # Foreign key referencing the owner (User)
    items = db.relationship('TodoItem', backref='todo_list', lazy=True)  # Relationship with TodoItem
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # Creation timestamp


class TodoItem(db.Model):
    """
    Represents a to-do item in the database.
    Supports hierarchical structure (parent-child relationships).
    """
    id = db.Column(db.Integer, primary_key=True)  # Primary key
    content = db.Column(db.String(200), nullable=False)  # Content of the item
    completed = db.Column(db.Boolean, default=False)  # Completion status
    collapsed = db.Column(db.Boolean, default=False) # collapse status
    list_id = db.Column(db.Integer, db.ForeignKey('todo_list.id'), nullable=False)  # Foreign key referencing the list (TodoList)
    parent_id = db.Column(db.Integer, db.ForeignKey('todo_item.id'), nullable=True)  # Foreign key referencing the parent item (self-referential)
    children = db.relationship('TodoItem',
                               backref=db.backref('parent', remote_side=[id]),
                               lazy=True,
                               cascade="all, delete-orphan")  # Cascade delete for children
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # Creation timestamp
    level = db.Column(db.Integer, default=1)  # Hierarchy level
