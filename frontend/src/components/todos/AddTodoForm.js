import React, { useState } from 'react';
import { TextField, Button } from '@mui/material';
import { Add } from '@mui/icons-material';

const AddTodoForm = ({ listId, parentId = null, onAdd }) => {
  // State for the new todo item content.
  const [content, setContent] = useState('');

  // Handles the form submission.
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent page reload.
    // Only add the todo if the content is not empty or whitespace.
    if (content.trim()) {
      onAdd(content, parentId); // Call the onAdd function with the content and parent ID.
      setContent(''); // Clear the input field after adding.
    }
  };

  return (
    // Form for adding new todo items.
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
      {/* Input field for the new todo item content. */}
      <TextField
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add new task..."
        fullWidth
        size="small"
      />
      {/* Button to submit the new todo item. */}
      <Button type="submit" variant="contained" startIcon={<Add />}>
        Add
      </Button>
    </form>
  );
};

export default AddTodoForm;