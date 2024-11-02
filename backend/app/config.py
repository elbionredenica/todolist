import os
from datetime import timedelta


class Config:
    """
    Configuration settings for the Flask application.

    Loads configuration variables from environment variables or sets default values for development.
    """
    # Secret key for signing session cookies
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev'  # Use environment variable or 'dev' for development

    # Database connection URI
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///todo.db'  # Use environment variable or local SQLite database

    # Disable SQLAlchemy event tracking for performance improvement
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Secret key for JWT (JSON Web Token) authentication
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'dev-jwt-secret'  # Use environment variable or 'dev-jwt-secret' for development

    # JWT access token expiration time
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)

    # Permanent session lifetime (for "remember me" functionality)
    PERMANENT_SESSION_LIFETIME = timedelta(days=30)

    # Enable permanent sessions
    SESSION_PERMANENT = True
