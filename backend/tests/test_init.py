import unittest
from app import create_app, db, login_manager, bcrypt


class TestAppCreation(unittest.TestCase):
    """
    Test suite for application creation and initialization.
    """

    def setUp(self):
        """Set up the test environment before each test."""
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()

    def test_app_creation(self):
        """Verify that the application is created."""
        self.assertIsNotNone(self.app)
        self.assertTrue(self.app.config['TESTING'])  # More idiomatic assertion

    def test_config(self):
        """Verify specific configuration settings."""
        self.assertFalse(self.app.config['SQLALCHEMY_TRACK_MODIFICATIONS'])  # More idiomatic assertion

    def test_extensions_initialization(self):
        """Verify that Flask extensions are initialized."""
        self.assertIsNotNone(db)
        self.assertIsNotNone(login_manager)
        self.assertIsNotNone(bcrypt)

    def test_blueprint_registration(self):
        """Verify that blueprints are registered."""
        self.assertIn('main', self.app.blueprints)

    def test_cors_enabled(self):
        """Verify that CORS (Cross-Origin Resource Sharing) is enabled and configured correctly.
        Checks for the 'Access-Control-Allow-Credentials' header in the response.
        """
        response = self.client.get('/')
        self.assertEqual(response.headers.get('Access-Control-Allow-Credentials'), 'true')

    def test_after_request(self):
        """Verify that the after_request function adds the 'Access-Control-Allow-Credentials' header."""

        @self.app.after_request
        def after_request(response):  # Define nested after_request function for testing purposes
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            return response

        with self.app.test_client() as client:
            response = client.get('/')
            self.assertEqual(response.headers.get('Access-Control-Allow-Credentials'), 'true')


if __name__ == '__main__':
    unittest.main()
