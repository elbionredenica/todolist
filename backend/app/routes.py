from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from .models import db, User, TodoList, TodoItem
from flask_cors import cross_origin
from . import bcrypt
from datetime import timedelta

main = Blueprint('main', __name__)


@main.route('/register', methods=['POST'])
@cross_origin()
def register():
    """
    Registers a new user.

    Receives user data (username, email, password) in JSON format.
    Hashes the password and stores the user information in the database.

    Returns:
        JSON response with success message and user data, or an error message.
        201 Created on successful registration.
        400 Bad Request if required fields are missing or username/email already exists.
        500 Internal Server Error if an unexpected error occurs.
    """
    try:
        data = request.get_json()
        print("Received registration data:", data)  # Debug print

        # Validate input
        if not data or 'username' not in data or 'email' not in data or 'password' not in data:
            return jsonify({'error': 'Missing required fields'}), 400

        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 400

        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 400

        # Hash the password using bcrypt
        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        new_user = User(
            username=data['username'],
            email=data['email'],
            password=hashed_password
        )

        db.session.add(new_user)
        db.session.commit()

        return jsonify({
            'message': 'User created successfully',
            'user': {
                'id': new_user.id,
                'username': new_user.username,
                'email': new_user.email
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error during registration: {str(e)}")
        return jsonify({'error': str(e)}), 500


@main.route('/login', methods=['POST'])
@cross_origin()
def login():
    """
    Logs in an existing user.

    Receives user data (username, password) in JSON format.
    Verifies the credentials against the database.

    Returns:
        JSON response with success message and user data, or an error message.
        200 OK on successful login.
        400 Bad Request if username or password are missing.
        401 Unauthorized if invalid credentials.
        500 Internal Server Error if an unexpected error occurs.
    """
    try:
        data = request.get_json()

        if not data or 'username' not in data or 'password' not in data:
            return jsonify({'error': 'Missing username or password'}), 400

        user = User.query.filter_by(username=data['username']).first()

        if user and bcrypt.check_password_hash(user.password, data['password']):
            login_user(user, remember=True, duration=timedelta(days=30))
            return jsonify({
                'message': 'Logged in successfully',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email
                }
            })

        return jsonify({'error': 'Invalid username or password'}), 401

    except Exception as e:
        print(f"Error during login: {str(e)}")
        return jsonify({'error': str(e)}), 500


@main.route('/logout')
@cross_origin()
@login_required
def logout():
    """
    Logs out the current user.

    Returns:
        JSON response with success message.
        200 OK on successful logout.
    """
    logout_user()
    return jsonify({'message': 'Logged out successfully'})


@main.route('/check-auth', methods=['GET'])
@cross_origin()
def check_auth():
    """
    Checks if the user is authenticated.

    Returns:
        JSON response indicating authentication status and user data if authenticated.
        200 OK if authenticated.
        401 Unauthorized if not authenticated.
    """
    if current_user.is_authenticated:
        return jsonify({
            'authenticated': True,
            'user': {
                'id': current_user.id,
                'username': current_user.username,
                'email': current_user.email
            }
        })
    return jsonify({'authenticated': False}), 401


# TodoList routes
@main.route('/lists', methods=['GET'])
@cross_origin()
@login_required
def get_lists():
    """
    Retrieves all todo lists for the current user.

    Returns:
        JSON response with an array of todo lists.
        200 OK.
    """
    lists = TodoList.query.filter_by(user_id=current_user.id).all()
    return jsonify([{
        'id': list.id,
        'title': list.title,
        'created_at': list.created_at
    } for list in lists])


@main.route('/lists', methods=['POST'])
@cross_origin()
@login_required
def create_list():
    """
    Creates a new todo list for the current user.

    Receives list title in JSON format.

    Returns:
        JSON response with the created list data.
        201 Created.
    """
    data = request.get_json()
    new_list = TodoList(
        title=data['title'],
        user_id=current_user.id
    )
    db.session.add(new_list)
    db.session.commit()
    return jsonify({
        'id': new_list.id,
        'title': new_list.title,
        'created_at': new_list.created_at
    }), 201


@main.route('/lists/<int:list_id>', methods=['PUT'])
@cross_origin()
@login_required
def update_list(list_id):
    """
    Updates a todo list.

    Receives list title in JSON format.

    Args:
        list_id: The ID of the list to update.

    Returns:
        JSON response with the updated list data, or an error message.
        200 OK.
        403 Forbidden if the list does not belong to the current user.
        404 Not Found if the list does not exist.
    """
    todo_list = TodoList.query.get_or_404(list_id)
    if todo_list.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    todo_list.title = data['title']
    db.session.commit()
    return jsonify({
        'id': todo_list.id,
        'title': todo_list.title,
        'created_at': todo_list.created_at
    })


@main.route('/lists/<int:list_id>', methods=['DELETE', 'OPTIONS'])
@cross_origin()
@login_required
def delete_list(list_id):
    """
    Deletes a todo list and all its items.

    Args:
        list_id: The ID of the list to delete.

    Returns:
        JSON response with a success message, or an error message.
        200 OK.
        403 Forbidden if the list does not belong to the current user.
        404 Not Found if the list does not exist.
        500 Internal Server Error if an unexpected error occurs.
    """
    if request.method == 'OPTIONS':  # Handle preflight request for DELETE
        return '', 200

    todo_list = TodoList.query.get_or_404(list_id)
    if todo_list.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403

    try:
        # Delete all items in the list first (cascading delete)
        TodoItem.query.filter_by(list_id=list_id).delete()
        # Then delete the list
        db.session.delete(todo_list)
        db.session.commit()
        return jsonify({'message': 'List deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# TodoItem routes
@main.route('/lists/<int:list_id>/items', methods=['GET'])
@cross_origin()
@login_required
def get_items(list_id):
    """
    Retrieves all todo items for a specific list.

    Args:
        list_id: The ID of the list.

    Returns:
        JSON response with an array of todo items, including nested subtasks.
        200 OK.
        403 Forbidden if the list does not belong to the current user.
        404 Not Found if the list does not exist.
    """
    todo_list = TodoList.query.get_or_404(list_id)
    if todo_list.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403

    # Get only top-level items (items with no parent)
    items = TodoItem.query.filter_by(list_id=list_id, parent_id=None).all()

    def serialize_item(item):
        """
        Recursively serializes a todo item and its children.

        Args:
            item: The TodoItem object.

        Returns:
            A dictionary representation of the item and its children.
        """
        return {
            'id': item.id,
            'content': item.content,
            'completed': item.completed,
            'collapsed': item.collapsed,
            'level': item.level,
            'created_at': item.created_at,
            'children': [serialize_item(child) for child in item.children]
        }

    return jsonify([serialize_item(item) for item in items])


@main.route('/lists/<int:list_id>/items', methods=['POST'])
@cross_origin()
@login_required
def create_item(list_id):
    """
    Creates a new todo item.

    Receives item content and optional parent ID in JSON format.

    Args:
        list_id: The ID of the list to add the item to.

    Returns:
        JSON response with the created item data, or an error message.
        201 Created.
        400 Bad Request if maximum nesting level is reached.
        403 Forbidden if the list does not belong to the current user.
        404 Not Found if the list does not exist.
    """
    todo_list = TodoList.query.get_or_404(list_id)
    if todo_list.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    parent_id = data.get('parent_id')

    # Calculate level based on parent
    level = 1
    if parent_id:
        parent = TodoItem.query.get(parent_id)
        if parent:
            level = parent.level + 1
            if level > 3:  # Limit to 3 levels of nesting
                return jsonify({'error': 'Maximum nesting level reached'}), 400

    new_item = TodoItem(
        content=data['content'],
        list_id=list_id,
        parent_id=parent_id,
        level=level
    )
    db.session.add(new_item)
    db.session.commit()

    return jsonify({
        'id': new_item.id,
        'content': new_item.content,
        'completed': new_item.completed,
        'collapsed': new_item.collapsed,
        'level': new_item.level,
        'created_at': new_item.created_at
    }), 201


@main.route('/items/<int:item_id>', methods=['PUT'])
@cross_origin()
@login_required
def update_item(item_id):
    """
    Updates a todo item.

    Receives updated item data (completed status, collapsed status, content, list_id) in JSON format.

    Args:
        item_id: The ID of the item to update.

    Returns:
        JSON response with the updated item data, or an error message.
        200 OK.
        403 Forbidden if the item does not belong to the current user.
        404 Not Found if the item does not exist.
        500 Internal Server Error if an unexpected error occurs.
    """
    try:
        item = TodoItem.query.get_or_404(item_id)
        if item.todo_list.user_id != current_user.id:
            return jsonify({'error': 'Unauthorized'}), 403

        data = request.get_json()

        if 'completed' in data:
            item.completed = data['completed']

        if 'collapsed' in data:
            item.collapsed = data['collapsed']

        if 'content' in data:
            item.content = data['content']

        # Handle moving to a different list
        new_list_id = data.get('list_id')
        if new_list_id and new_list_id != item.list_id:
            new_list = TodoList.query.get(new_list_id)
            if new_list and new_list.user_id == current_user.id:
                item.list_id = new_list_id

        db.session.commit()
        return jsonify({
            'id': item.id,
            'content': item.content,
            'completed': item.completed,
            'collapsed': item.collapsed,
            'level': item.level,
            'created_at': item.created_at
        })

    except Exception as e:
        db.session.rollback()
        print(f"Error updating item: {str(e)}")
        return jsonify({'error': str(e)}), 500


@main.route('/items/<int:item_id>', methods=['DELETE'])
@cross_origin()
@login_required
def delete_item(item_id):
    """
    Deletes a todo item and its subtasks.

    Args:
        item_id: The ID of the item to delete.

    Returns:
        JSON response with a success message, or an error message.
        200 OK.
        403 Forbidden if the item does not belong to the current user.
        404 Not Found if the item does not exist.
        500 Internal Server Error if an unexpected error occurs.
    """
    try:
        item = TodoItem.query.get_or_404(item_id)
        if item.todo_list.user_id != current_user.id:
            return jsonify({'error': 'Unauthorized'}), 403

        db.session.delete(item)  # Cascading delete will handle subtasks
        db.session.commit()
        return jsonify({'message': 'Item and all subtasks deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@main.route('/items/<int:item_id>/complete', methods=['PUT'])
@cross_origin()
@login_required
def complete_item(item_id):
    """
    Marks a todo item as complete. If the item has uncompleted subtasks, it will return an error.
    Deletes completed top-level tasks.

    Args:
        item_id: The ID of the item to complete.

    Returns:
        JSON response with a success message, or an error message.
        200 OK.
        400 Bad Request if the item has uncompleted subtasks.
        403 Forbidden if the item does not belong to the current user.
        404 Not Found if the item does not exist.
        500 Internal Server Error if an unexpected error occurs.
    """
    try:
        item = TodoItem.query.get_or_404(item_id)
        if item.todo_list.user_id != current_user.id:
            return jsonify({'error': 'Unauthorized'}), 403

        # Check for uncompleted subtasks
        uncompleted_subtasks = TodoItem.query.filter_by(parent_id=item_id, completed=False).count()
        if uncompleted_subtasks > 0:
            return jsonify({
                'error': 'Cannot complete this task. Some subtasks are not finished.',
                'uncompleted_subtasks': uncompleted_subtasks
            }), 400

        if item.level == 1:  # Delete completed top-level tasks
            db.session.delete(item)
        else:
            item.completed = True

        db.session.commit()
        return jsonify({
            'message': 'Task completed successfully',
            'deleted': item.level == 1
        })

    except Exception as e:
        db.session.rollback()
        print(f"Error completing item: {str(e)}")
        return jsonify({'error': str(e)}), 500
