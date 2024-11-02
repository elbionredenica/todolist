// App.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import App from './App';

// Mocking the AuthContext to control the user state
jest.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => <div>{children}</div>,
  useAuth: jest.fn(),
}));

describe('App Component', () => {
  const renderApp = () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );
  };

  it('renders the login page when user is not authenticated', () => {
    useAuth.mockReturnValue({ user: null, loading: false });

    renderApp();

    // Use getByRole to find the specific login heading
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
  });

  it('redirects to /login if user is not authenticated and tries to access /todos', () => {
    useAuth.mockReturnValue({ user: null, loading: false });

    renderApp();

    // Ensure TodoList is not rendered
    expect(screen.queryByRole('heading', { name: /todo app/i })).not.toBeInTheDocument();
    
    // Ensure login link is rendered
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
  });
});