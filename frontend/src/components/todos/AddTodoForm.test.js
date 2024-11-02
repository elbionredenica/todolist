import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AddTodoForm from './AddTodoForm';

describe('AddTodoForm Component', () => {
  const mockOnAdd = jest.fn();

  // Clear the mock before each test.
  beforeEach(() => {
    mockOnAdd.mockClear();
  });

  // Check if the form renders correctly.
  it('renders the form correctly', () => {
    render(<AddTodoForm listId="1" onAdd={mockOnAdd} />);

    expect(screen.getByPlaceholderText(/add new task/i)).toBeInTheDocument();
    expect(screen.getByText(/add/i)).toBeInTheDocument();
  });

  // Verify that the input value updates when typing.
  it('updates the input value when typing', () => {
    render(<AddTodoForm listId="1" onAdd={mockOnAdd} />);

    const input = screen.getByPlaceholderText(/add new task/i);
    fireEvent.change(input, { target: { value: 'New Task' } });

    expect(input.value).toBe('New Task');
  });

  // Check if onAdd is called with the correct arguments on form submission.
  it('calls the onAdd function with the correct arguments when the form is submitted', () => {
    render(<AddTodoForm listId="1" onAdd={mockOnAdd} />);

    const input = screen.getByPlaceholderText(/add new task/i);
    fireEvent.change(input, { target: { value: 'New Task' } });

    fireEvent.submit(screen.getByRole('button', { name: /add/i }));

    expect(mockOnAdd).toHaveBeenCalledWith('New Task', null);
  });

  // Verify that the input field is cleared after submission.
  it('clears the input field after submission', () => {
    render(<AddTodoForm listId="1" onAdd={mockOnAdd} />);

    const input = screen.getByPlaceholderText(/add new task/i);
    fireEvent.change(input, { target: { value: 'New Task' } });

    fireEvent.submit(screen.getByRole('button', { name: /add/i }));

    expect(input.value).toBe('');
  });
});