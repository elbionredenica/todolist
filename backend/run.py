from app import create_app  # Import the create_app factory function

# Create a Flask application instance using the factory function
app = create_app()


# Define a route for the root URL ("/")
@app.route('/')
def hello():
    """
    Root route handler.
    Returns a simple message to confirm the API is working.
    """
    return 'This is a test to check if the API is working.'


# Run the Flask development server if the script is executed directly
if __name__ == '__main__':
    app.run(debug=True, port=8080)  # Start the app in debug mode on port 8080
