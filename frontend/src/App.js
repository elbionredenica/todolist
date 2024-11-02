import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, CircularProgress } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import TodoList from './components/todos/TodoList';
import './index.css';

// Create a Material UI theme
const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

// Component for protected routes (requires authentication)
const ProtectedRoutes = () => {
  const { user, loading } = useAuth();

  // Show loading indicator while checking authentication status
  if (loading) return <CircularProgress />;
  // Redirect to login if not authenticated, otherwise render TodoList
  return user ? <TodoList /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            {/* Route for the login page */}
            <Route path="/login" element={<Login />} />
            {/* Route for the register page */}
            <Route path="/register" element={<Register />} />
            {/* Protected route for the todo list */}
            <Route path="/todos" element={<ProtectedRoutes />} />
            {/* Redirect to /todos from the root path */}
            <Route path="/" element={<Navigate to="/todos" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;