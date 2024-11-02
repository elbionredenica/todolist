import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter as Router } from 'react-router-dom';
import TodoList from './TodoList';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

// Mock AuthContext and API service
jest.mock('../../contexts/AuthContext');
jest.mock('../../services/api');

// Mock user data
const mockUser = { uid: 'test-uid', email: 'test@example.com' };

// Mock lists data (ensure it matches your API response structure)
const mockLists = [
  { id: 1, title: 'List 1' },
  { id: 2, title: 'List 2' },
];

// Mock items data
const mockItems = [
  { id: 101, content: 'Item 1', completed: false, children: [] },
  { id: 102, content: 'Item 2', completed: true, children: [] },
];

describe('TodoList Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    useAuth.mockReturnValue({ user: mockUser });
    api.get.mockReset();
    api.post.mockReset();
    api.put.mockReset();
    api.delete.mockReset();
  });

  afterEach(() => {
    // Clear mocks after each test
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    render(<Router><TodoList /></Router>);
    // Check if a loading indicator is present
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders with an error if lists cannot be fetched', async () => {
    // Mock a rejected promise from the API call
    api.get.mockRejectedValueOnce(new Error('API Error'));
    render(<Router><TodoList /></Router>);
    // Wait for and check the error message visibility
    await waitFor(() => expect(screen.getByText('Failed to fetch lists. Please try again.')).toBeVisible());
  });

  test('renders with an empty message if lists are empty', async () => {
    // Mock empty list data
    api.get.mockResolvedValueOnce({ data: [] });
    render(<Router><TodoList /></Router>);
    // "My Lists" should render even with no list items
    await waitFor(() => expect(screen.getByText('My Lists')).toBeVisible());
    // Should display a message to add or select a list
    expect(screen.getByText('Select a list to view tasks')).toBeVisible();
  });

  test('creates a new list', async () => {
    api.get.mockResolvedValueOnce({ data: mockLists });
    api.post.mockResolvedValueOnce({ data: { id: 3, title: 'New List' } });

    render(<Router><TodoList /></Router>);

    // Wait for the create list button to be enabled
    await waitFor(() => expect(screen.getByRole('button', { name: /create list/i })).toBeEnabled(), { timeout: 5000 });

    // Wrap asynchronous user interactions within act
    await act(async () => {
      await userEvent.type(screen.getByPlaceholderText('New list title...'), 'New List');
      await userEvent.click(screen.getByRole('button', { name: /create list/i }));
    });

    // Check the API call and new list in the UI
    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/lists', { title: 'New List' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'New List' })).toBeInTheDocument());
  });

  test('selects a list and displays its items', async () => {
    // Mock API calls for lists and items
    api.get.mockResolvedValueOnce({ data: mockLists });
    api.get.mockResolvedValueOnce({ data: mockItems });

    render(<Router><TodoList /></Router>);

    // Find and click the second mock list button
    await screen.findByRole('button', { name: mockLists[1].title }, { timeout: 5000 });
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: mockLists[1].title }));
    });

    // Check the API endpoint call and rendered items
    await waitFor(() => expect(api.get).toHaveBeenCalledWith(`/lists/${mockLists[1].id}/items`), { timeout: 5000 });
    mockItems.forEach(item => expect(screen.getByText(item.content)).toBeInTheDocument());
  });

  test('adds a new task', async () => {
    api.get.mockResolvedValueOnce({ data: mockLists });
    api.post.mockResolvedValueOnce({ data: { id: 103, content: 'New Task', completed: false, children: [] } });
    api.get.mockResolvedValue({ data: [...mockItems, { id: 103, content: 'New Task', completed: false, children: [] }] });
    
    render(<Router><TodoList /></Router>);
    
    // Select the first list
    const firstListButton = await screen.findByRole('button', { name: mockLists[0].title });
    await act(async () => {
      await userEvent.click(firstListButton);
    });
    
    // Click "Add Task" button and add a new task
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /add task/i }));
    });
    
    await act(async () => {
      await userEvent.type(screen.getByPlaceholderText('Enter task content...'), 'New Task');
      await userEvent.click(screen.getByRole('button', { name: /add task/i }));
    });
    
    await waitFor(() => expect(api.post).toHaveBeenCalledWith(`/lists/1/items`, { content: 'New Task', parent_id: null }));
    await waitFor(() => expect(screen.getByText('New Task')).toBeVisible());
    });

  test('shows "No tasks" message when a list has no items', async () => {
    api.get.mockResolvedValueOnce({ data: mockLists });
    api.get.mockResolvedValueOnce({ data: [] }); // Mock empty items list

    render(<Router><TodoList /></Router>);

    // Select the first List
    const listButton = await screen.findByRole('button', { name: mockLists[0].title });
    await act(async () => {
      userEvent.click(listButton);
    });

    // Check for the "No tasks" message
    await waitFor(() => expect(screen.getByText('No tasks in this list')).toBeVisible());
  });
});