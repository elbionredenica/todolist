from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from .config import Config
from flasgger import Swagger

# Initialize extensions outside the create_app function
db = SQLAlchemy()
login_manager = LoginManager()
bcrypt = Bcrypt()


def create_app():
    """
    Creates and configures the Flask application.

    Initializes extensions, registers blueprints, and sets up CORS.

    Returns:
        The configured Flask app instance.
    """
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for all routes
    CORS(app)

    # Initialize extensions with the app instance
    db.init_app(app)
    login_manager.init_app(app)
    bcrypt.init_app(app)

    # Initialize Swagger UI for API documentation
    swagger = Swagger(app, template_file='../openapi.yaml')

    # Register blueprints
    from .routes import main
    app.register_blueprint(main)

    @app.after_request
    def after_request(response):
        """
        Modifies the response after each request.

        Adds 'Access-Control-Allow-Credentials' header to allow cookies to be sent
        cross-origin. This is important for handling user authentication via cookies with CORS.

        Args:
            response: The Flask response object.

        Returns:
            The modified response object.
        """
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

    with app.app_context():
        """
        Creates all database tables defined in the models.

        This is done within the application context to ensure that the database connection
        is available.
        """
        db.create_all()

    return app
