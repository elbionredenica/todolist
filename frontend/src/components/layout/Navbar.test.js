import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from './Navbar';

// Mock the necessary hooks.
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  // Mock Link component to render as a regular <a> tag
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));


describe('Navbar Component', () => {
  const mockLogout = jest.fn();
  const mockNavigate = jest.fn();

  // Set up mocks before each test.
  beforeEach(() => {
    useAuth.mockReturnValue({ user: null, logout: mockLogout });
    useNavigate.mockReturnValue(mockNavigate);
  });

  // Clear mocks after each test.
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Verify that the Navbar renders correctly.
  it('renders the Navbar correctly', () => {
    render(<Navbar />);
    expect(screen.getByText(/todo app/i)).toBeInTheDocument();
  });

  // Check if the correct buttons are displayed when the user is not logged in.
  it('displays the correct buttons when the user is not logged in', () => {
    render(<Navbar />);

    expect(screen.getByText(/login/i)).toBeInTheDocument();
    expect(screen.getByText(/register/i)).toBeInTheDocument();
  });

  // Check if the correct buttons and username are displayed when logged in.
  it('displays the correct buttons and username when the user is logged in', () => {
    useAuth.mockReturnValue({ user: { username: 'testuser' }, logout: mockLogout });

    render(<Navbar />);

    expect(screen.getByText(/welcome, testuser/i)).toBeInTheDocument();
    expect(screen.getByText(/logout/i)).toBeInTheDocument();
  });

  // Verify logout functionality and navigation.
  it('calls the logout function and navigates to /login on logout', async () => {
    useAuth.mockReturnValue({ user: { username: 'testuser' }, logout: mockLogout });

    render(<Navbar />);

    fireEvent.click(screen.getByText(/logout/i));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});