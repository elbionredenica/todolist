import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoItem from './TodoItem';

// Mock todo item data
const mockTodo = {
  id: 1,
  content: 'Test Todo',
  completed: false,
  collapsed: false,
  children: [],
};

// Mock list data.  The title property should match the property 
// expected by the TodoItem component (e.g., 'title', 'name', etc.)
const mockLists = [
  { id: 'list1', title: 'List 1' },  
  { id: 'list2', title: 'List 2' },  
];

// Default props for the TodoItem component
const defaultProps = {
  item: mockTodo,
  level: 1,
  lists: mockLists,
  onToggle: jest.fn(),
  onDelete: jest.fn(),
  onUpdate: jest.fn(),
  onAddSubTask: jest.fn(),
  onMove: jest.fn(),
};

test('renders TodoItem component', () => {
  render(<TodoItem {...defaultProps} />);
  expect(screen.getByText(/test todo/i)).toBeInTheDocument();
});

test('allows the user to complete a todo', async () => {
  render(<TodoItem {...defaultProps} />);
  // Simulate clicking the toggle complete button
  await userEvent.click(screen.getByRole('button', { name: /toggle complete/i }));
  // Check if the onToggle prop was called with the correct arguments
  expect(defaultProps.onToggle).toHaveBeenCalledWith(mockTodo.id, { completed: true });
});

test('allows the user to edit a todo', async () => {
  render(<TodoItem {...defaultProps} />);
  // Simulate clicking the edit button
  await userEvent.click(screen.getByRole('button', { name: /edit/i }));

  // Find the input field and update the todo content
  const input = screen.getByRole('textbox');
  await userEvent.clear(input); // Clear existing input to prevent concatenation
  await userEvent.type(input, 'Updated Todo');

  // Trigger blur event (e.g., by pressing Tab) to simulate finishing editing
  await userEvent.tab(); 

  // Check if the onUpdate prop was called with the correct arguments
  expect(defaultProps.onUpdate).toHaveBeenCalledWith(mockTodo.id, { content: 'Updated Todo' });
});

test('allows the user to add a subtask', async () => {
  render(<TodoItem {...defaultProps} level={1} />);

  // Simulate clicking the add subtask button
  await userEvent.click(screen.getByRole('button', { name: /add/i }));

  // Find the input field within the "add subtask" dialog and enter text.  
  // This relies on a data-testid='add-subtask-input' on the input element. 
  const input = screen.getByTestId('add-subtask-input'); 
  await userEvent.type(input, 'New Subtask');

  // Click the "Add" button *inside* the add subtask dialog.  This assumes
  // the button has the text "Add". Adjust the query if different.
  await userEvent.click(screen.getByText('Add'));

  // Check if the onAddSubTask prop was called with the correct arguments
  expect(defaultProps.onAddSubTask).toHaveBeenCalledWith(mockTodo.id, 'New Subtask');
});