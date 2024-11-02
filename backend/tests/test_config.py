# test_config.py
import unittest  # Import unittest for testing
import os  # Import os for environment variables
from datetime import timedelta  # Import timedelta for time durations
from app.config import Config  # Import the Config class


class TestConfig(unittest.TestCase):
    """
    Test suite for the application's configuration.
    """

    def test_secret_key(self):
        """Tests the SECRET_KEY configuration."""
        self.assertEqual(Config.SECRET_KEY, os.environ.get('SECRET_KEY') or 'dev')

    def test_sqlalchemy_database_uri(self):
        """Tests the SQLALCHEMY_DATABASE_URI configuration."""
        self.assertEqual(Config.SQLALCHEMY_DATABASE_URI, os.environ.get('DATABASE_URL') or 'sqlite:///todo.db')

    def test_sqlalchemy_track_modifications(self):
        """Tests the SQLALCHEMY_TRACK_MODIFICATIONS configuration."""
        self.assertFalse(Config.SQLALCHEMY_TRACK_MODIFICATIONS)

    def test_jwt_secret_key(self):
        """Tests the JWT_SECRET_KEY configuration."""
        self.assertEqual(Config.JWT_SECRET_KEY, os.environ.get('JWT_SECRET_KEY') or 'dev-jwt-secret')

    def test_jwt_access_token_expires(self):
        """Tests the JWT_ACCESS_TOKEN_EXPIRES configuration."""
        self.assertEqual(Config.JWT_ACCESS_TOKEN_EXPIRES, timedelta(hours=1))

    def test_permanent_session_lifetime(self):
        """Tests the PERMANENT_SESSION_LIFETIME configuration."""
        self.assertEqual(Config.PERMANENT_SESSION_LIFETIME, timedelta(days=30))

    def test_session_permanent(self):
        """Tests the SESSION_PERMANENT configuration."""
        self.assertTrue(Config.SESSION_PERMANENT)


if __name__ == '__main__':
    unittest.main()
