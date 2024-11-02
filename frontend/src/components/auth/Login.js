import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';

const Login = () => {
  // State variables for username, password, and error message.
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Access the login function from the AuthContext.
  const { login } = useAuth();
  
  // Hook for navigation.
  const navigate = useNavigate();

  // Handles form submission.
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload.

    try {
      // Attempt to log in using the provided credentials.
      await login(username, password);
      // Redirect to the /todos route on successful login.
      navigate('/todos');
    } catch (err) {
      // Display error message if login fails.
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="sm">
      {/* Center the content on the page. */}
      <Box sx={{ mt: 8 }}>
        {/* Add margin to the top. */}
        <Paper elevation={3} sx={{ p: 4 }}>
          {/* Use Paper component for styling and elevation. */}
          <Typography variant="h4" component="h1" gutterBottom>
            {/* Display the login title. */}
            Login
          </Typography>
          {error && (
            // Conditionally render an alert if there's an error.
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            {/* Form for user login. */}
            <TextField
              label="Username"
              fullWidth
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 3 }}
            >
              Login
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;