import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Register from './Register';

// Mock the necessary hooks.
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

describe('Register Component', () => {
  const mockRegister = jest.fn();
  const mockNavigate = jest.fn();

  // Set up mocks before each test.
  beforeEach(() => {
    useAuth.mockReturnValue({ register: mockRegister });
    useNavigate.mockReturnValue(mockNavigate);
  });

  // Clear mocks after each test.
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Check if the registration form renders correctly.
  it('renders the registration form correctly', () => {
    render(<Register />);

    expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  // Verify that an error message is displayed if registration fails.
  it('displays an error message when registration fails', async () => {
    mockRegister.mockRejectedValueOnce(new Error('Registration failed'));

    render(<Register />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'testuser@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText(/registration failed/i)).toBeInTheDocument();
    });
  });

  // Check if the register function is called with the correct arguments.
  it('calls the register function with the correct username, email, and password', async () => {
    mockRegister.mockResolvedValueOnce();

    render(<Register />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'testuser@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('testuser', 'testuser@example.com', 'password');
    });
  });


  // Ensure that the application navigates to /login after successful registration.
  it('navigates to /login on successful registration', async () => {
    mockRegister.mockResolvedValueOnce();

    render(<Register />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'testuser@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});