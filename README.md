# Hierarchical To-Do List Application

This project implements a full-stack to-do list application with user authentication, allowing users to create, manage, and organize their tasks. It uses a React frontend, a Flask backend, and a relational database (SQLite) for persistence.

## Features

* **User Authentication:** Secure user registration and login with password hashing (bcrypt).
* **Todo List Management:** Create, update, and delete todo lists.
* **Hierarchical Tasks:** Create tasks and subtasks with nested structure (up to 3 levels).
* **Task Completion:** Mark tasks as complete, preventing completion if subtasks are unfinished. Completed top-level tasks are automatically deleted.
* **Task Editing:** Edit task content.
* **Collapsible Tasks:** Collapse and expand task hierarchies for better organization.
* **API Documentation:** OpenAPI specification (Swagger UI) for backend API documentation (can be found at `localhost:8080/apidocs`).
* **Testing:** Comprehensive unit tests for both backend and frontend.


## Project Structure

The project is divided into two main parts: frontend and backend.

### Backend (`backend/`)

* **`app/`:** Contains the Flask application logic.
    * **`__init__.py`:** Initializes the Flask app and extensions.
    * `config.py`: Configuration settings for the application.
    * `models.py`: Defines database models (User, TodoList, TodoItem).
    * `routes.py`: Defines API routes and request handlers.
* **`instance/`:** Holds instance-specific files.
    * `openapi.yaml`: OpenAPI specification for API documentation.
* **`requirements.txt`:** Lists the required Python packages.
* **`run.py`:** Entry point to run the Flask development server.
* **`tests/`:** Contains backend unit tests.
    * `test_config.py`: Tests for configuration settings.
    * `test_init.py`: Tests for app initialization.
    * `test_models.py`: Tests for database models.
    * `test_routes.py`: Tests for API routes.
* **`venv/`:** (Optional) Virtual environment directory.


### Frontend (`frontend/`)

* **`.gitignore`:** Specifies files and directories ignored by Git.
* **`babel.config.js`:** Babel configuration file.
* **`jest-config.js`:** Jest configuration for testing.
* **`package.json`:** Project metadata and dependencies.
* **`public/`:** Static assets.
    * `index.html`: Main HTML file.
* **`README.md`:** This file.
* **`src/`:** Contains the React application source code.
    * `App.css`: Styles for the App component.
    * `App.js`: Main App component.
    * `App.test.js`: Tests for the App component.
    * `components/`: React components (e.g., Navbar, Login, Register, TodoList, TodoItem).
    * `contexts/`: React context providers (e.g., AuthContext).
    * `index.css`: Global styles.
    * `index.js`: Entry point for the React application.



## Getting Started

### Backend

1. **Set up a virtual environment:** 
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # Activate the environment (Linux/macOS)
   venv\Scripts\activate  # Activate the environment (Windows)
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the development server:**
   ```bash
   python run.py
   ```

### Frontend

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm start
   ```

## Testing

### Backend

1. **Activate the virtual environment (if used).**

2. **Run tests:**
   ```bash
   python -m unittest discover tests
   ```

### Frontend

1. **Navigate to the frontend directory.**

2. **Run tests:**
   ```bash
   npm test
   ```

## Contributing
Contributions are welcome! Please create issues for bug reports or feature requests. If you'd like to submit a pull request, follow the usual GitHub flow: fork the repository, create a new branch, make your changes, and submit a pull request.

## License
This project is licensed under the [MIT License](LICENSE).  You are free to use, modify, and distribute the code.
