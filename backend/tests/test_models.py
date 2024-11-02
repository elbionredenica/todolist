import unittest
from app import create_app, db
from app.models import User, TodoList, TodoItem


class TestModels(unittest.TestCase):
    """
    Test suite for database models.
    """

    def setUp(self):
        """Set up the test environment before each test."""
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'  # Use in-memory database
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()

    def tearDown(self):
        """Clean up the test environment after each test."""
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def test_user_creation(self):
        """Test user creation."""
        user = User(username='testuser', email='test@example.com', password='password')
        db.session.add(user)
        db.session.commit()
        retrieved_user = User.query.filter_by(username='testuser').first()
        self.assertIsNotNone(retrieved_user)
        self.assertEqual(retrieved_user.email, 'test@example.com') # Add extra check


    def test_todolist_creation(self):
        """Test to-do list creation."""
        user = User(username='testuser', email='test@example.com', password='password')
        db.session.add(user)
        db.session.commit()
        todolist = TodoList(title='Test List', owner=user)
        db.session.add(todolist)
        db.session.commit()
        retrieved_list = TodoList.query.filter_by(title='Test List').first()
        self.assertIsNotNone(retrieved_list)
        self.assertEqual(retrieved_list.owner, user) # Add extra check

    def test_todoitem_creation(self):
        """Test to-do item creation."""
        user = User(username='testuser', email='test@example.com', password='password')
        db.session.add(user)
        db.session.commit()
        todolist = TodoList(title='Test List', owner=user)
        db.session.add(todolist)
        db.session.commit()
        todoitem = TodoItem(content='Test Item', todo_list=todolist)
        db.session.add(todoitem)
        db.session.commit()

        retrieved_item = TodoItem.query.filter_by(content='Test Item').first()
        self.assertIsNotNone(retrieved_item)
        self.assertEqual(retrieved_item.todo_list, todolist)  # Add extra check


    def test_todoitem_hierarchy(self):
        """Test to-do item hierarchical relationships (parent-child)."""
        user = User(username='testuser', email='test@example.com', password='password')
        db.session.add(user)
        db.session.commit()
        todolist = TodoList(title='Test List', owner=user)
        db.session.add(todolist)
        db.session.commit()
        parent_item = TodoItem(content='Parent Item', todo_list=todolist)
        db.session.add(parent_item)
        db.session.commit()
        child_item = TodoItem(content='Child Item', todo_list=todolist, parent=parent_item)
        db.session.add(child_item)
        db.session.commit()

        # More comprehensive assertions:
        self.assertEqual(child_item.parent, parent_item)  # Check parent relationship
        self.assertIn(child_item, parent_item.children)  # Check child membership in parent's children


if __name__ == '__main__':
    unittest.main()
