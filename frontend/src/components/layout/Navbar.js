import React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box
} from '@mui/material';

const Navbar = () => {
  // Access user info and logout function from AuthContext.
  const { user, logout } = useAuth();
  // useNavigate hook for redirection.
  const navigate = useNavigate();

  // Handles user logout.
  const handleLogout = async () => {
    // Call the logout function from the context.
    await logout();
    // Redirect to the login page after logout.
    navigate('/login');
  };

  return (
    // App bar at the top of the page.
    <AppBar position="static">
      <Toolbar>
        {/* Title of the app. */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Todo App
        </Typography>

        {/* Conditionally render login/register or logout button based on authentication status. */}
        <Box>
          {user ? (
            // Display username and logout button if user is logged in.
            <>
              <Typography component="span" sx={{ mr: 2 }}>
                Welcome, {user.username}
              </Typography>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            // Display login and register buttons if user is not logged in.
            <>
              <Button color="inherit" component={RouterLink} to="/login">
                Login
              </Button>
              <Button color="inherit" component={RouterLink} to="/register">
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;