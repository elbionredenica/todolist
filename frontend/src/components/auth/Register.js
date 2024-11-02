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

const Register = () => {
  // State variables for user registration input and error messages.
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Access the register function from AuthContext.
  const { register } = useAuth();

  // Hook for navigation after successful registration.
  const navigate = useNavigate();

  // Handles form submission for user registration.
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior.

    try {
      // Log registration details to the console for debugging.
      console.log('Submitting registration...', { username, email, password });

      // Call the register function from AuthContext.
      await register(username, email, password);

      // Log success message to the console.
      console.log('Registration successful');
      
      // Redirect to the login page after successful registration.
      navigate('/login');

    } catch (err) {
      // Log registration errors to the console.
      console.error('Registration error in component:', err);

      // Display error message to the user.
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="sm">
      {/* Center the content on the page. */}
      <Box sx={{ mt: 8 }}>
        {/* Add margin to the top. */}
        <Paper elevation={3} sx={{ p: 4 }}>
          {/* Paper component for styling and elevation. */}
          <Typography variant="h4" component="h1" gutterBottom>
            {/* Page title. */}
            Register
          </Typography>
          {error && (
            // Display error message if any.
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit}>
            <TextField
              label="Username"
              fullWidth
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              Register
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;