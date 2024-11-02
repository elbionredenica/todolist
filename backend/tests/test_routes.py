import unittest
from app import create_app, db
from app.models import User, TodoList, TodoItem
from flask import url_for


class TestRoutes(unittest.TestCase):
    """
    Test suite for application routes.
    """

    def setUp(self):
        """Set up the test environment before each test."""
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.app.config['SERVER_NAME'] = 'localhost'  # Required for url_for
        self.app_context = self.app.app_context()
        self.app_context.push()
        self.client = self.app.test_client()
        db.create_all()

        # Create a test user and log them in
        self.user = User(username='testuser', email='test@example.com', password='password')
        db.session.add(self.user)
        db.session.commit()
        with self.client.session_transaction() as sess:
            sess['_user_id'] = self.user.id

    def tearDown(self):
        """Clean up the test environment after each test."""
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def test_complete_item(self):
        """Test completing a regular to-do item."""
        todolist = TodoList(title='Test List', owner=self.user)
        todoitem = TodoItem(content='Test Item', todo_list=todolist, level=2)  # Level 2 item
        db.session.add(todolist)
        db.session.add(todoitem)
        db.session.commit()

        response = self.client.put(url_for('main.complete_item', item_id=todoitem.id))
        data = response.get_json()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['message'], 'Task completed successfully')
        self.assertFalse(data['deleted'])  # Regular items are not deleted when completed
        self.assertTrue(todoitem.completed) # Check database state

    def test_complete_item_with_uncompleted_subtasks(self):
        """Test completing a to-do item that has uncompleted subtasks."""
        todolist = TodoList(title='Test List', owner=self.user)
        parent_item = TodoItem(content='Parent Item', todo_list=todolist, level=2)
        child_item = TodoItem(content='Child Item', todo_list=todolist, parent=parent_item, completed=False)
        db.session.add_all([todolist, parent_item, child_item])
        db.session.commit()

        response = self.client.put(url_for('main.complete_item', item_id=parent_item.id))
        data = response.get_json()

        self.assertEqual(response.status_code, 400)  # Expect a 400 error
        self.assertEqual(data['error'], 'Cannot complete this task. Some subtasks are not finished.')
        self.assertEqual(data['uncompleted_subtasks'], 1)
        self.assertFalse(parent_item.completed) # Check database state

    def test_complete_top_level_item(self):
        """Test completing a top-level to-do item (level 1)."""
        todolist = TodoList(title='Test List', owner=self.user)
        top_level_item = TodoItem(content='Top Level Item', todo_list=todolist, level=1)
        db.session.add_all([todolist, top_level_item])
        db.session.commit()

        response = self.client.put(url_for('main.complete_item', item_id=top_level_item.id))
        data = response.get_json()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['message'], 'Task completed successfully')
        self.assertTrue(data['deleted'])  # Top-level items are deleted when completed


if __name__ == '__main__':
    unittest.main()
