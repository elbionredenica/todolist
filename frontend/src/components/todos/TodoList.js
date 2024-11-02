import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Container, Paper, Typography, Button, List, ListItem, TextField,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  CircularProgress, Box, Alert, IconButton,
} from '@mui/material';
import { Add, ExpandMore, ExpandLess, Delete } from '@mui/icons-material';
import TodoItem from './TodoItem';
import api from '../../services/api';

const TodoList = () => {
  // State variables
  const [lists, setLists] = useState([]); // Array of todo lists
  const [currentList, setCurrentList] = useState(null); // Currently selected list
  const [items, setItems] = useState([]); // Items in the current list
  const [newListTitle, setNewListTitle] = useState(''); // Title for a new list
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(''); // Error message
  const [collapsedLists, setCollapsedLists] = useState({}); // Track collapsed lists
  const [showNewTaskInput, setShowNewTaskInput] = useState(false); // Show/hide new task input
  const [newTaskContent, setNewTaskContent] = useState(''); // Content of the new task
  const [listToDelete, setListToDelete] = useState(null); // List marked for deletion

  // Context and navigation
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch lists on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/lists');
        setLists(response.data);

        // Set the first list as the current list if available
        if (response.data.length > 0 && !currentList) {
          handleSelectList(response.data[0]);
        }

        setLoading(false);
      } catch (err) {
        setError('Failed to fetch lists. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to fetch todo lists
  const fetchLists = async () => {
    try {
      const response = await api.get('/lists');
      setLists(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch lists. Please try again.');
      setLoading(false);
    }
  };

  // Function to fetch todo items for a specific list
  const fetchItems = async (listId) => {
    try {
      const response = await api.get(`/lists/${listId}/items`);
      setItems(response.data);
    } catch (err) {
      setError('Failed to fetch items. Please try again.');
    }
  };

  // Function to create a new list
  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;

    try {
      const response = await api.post('/lists', { title: newListTitle });
      setLists([...lists, response.data]);
      setNewListTitle('');
    } catch (err) {
      setError('Failed to create list. Please try again.');
    }
  };


  // Function to delete a list
  const handleDeleteList = async () => {
    if (!listToDelete) return;

    try {
      await api.delete(`/lists/${listToDelete.id}`);
      setLists(lists.filter(list => list.id !== listToDelete.id));
      if (currentList?.id === listToDelete.id) {
        setCurrentList(null);
        setItems([]);
      }
      setListToDelete(null);
    } catch (err) {
      setError('Failed to delete list. Please try again.');
    }
  };


  // Function to select a list and fetch its items
  const handleSelectList = (list) => {
    setCurrentList(list);
    fetchItems(list.id);
  };

  // Function to add a new item to the current list
  const handleAddItem = async (content, parentId = null) => {
    if (!currentList) return;

    try {
      const response = await api.post(`/lists/${currentList.id}/items`, {
        content,
        parent_id: parentId,
      });
      await fetchItems(currentList.id);
      setNewTaskContent('');
      setShowNewTaskInput(false);
    } catch (err) {
      setError('Failed to add item. Please try again.');
    }
  };


  // Function to update an existing item
  const handleUpdateItem = async (itemId, updates) => {
    try {
      await api.put(`/items/${itemId}`, updates);
      await fetchItems(currentList.id);
    } catch (err) {
      setError('Failed to update item. Please try again.');
    }
  };

  // Function to delete an item
  const handleDeleteItem = async (itemId) => {
    try {
      await api.delete(`/items/${itemId}`);
      await fetchItems(currentList.id);
    } catch (err) {
      setError('Failed to delete item. Please try again.');
    }
  };


  // Helper function to check if an item has uncompleted direct subtasks
  const hasUncompletedDirectSubtasks = (item) => {
    if (!item.children || item.children.length === 0) {
      return false;
    }
    return item.children.some(child => !child.completed);
  };

  // Helper function to count uncompleted direct subtasks
  const countUncompletedDirectSubtasks = (item) => {
    if (!item.children) return 0;
    return item.children.filter(child => !child.completed).length;
  };


  // Function to mark an item as complete (and handle subtask completion logic)
  const handleCompleteItem = async (itemId, updates) => {
    const findItem = (items, id) => {
      for (const item of items) {
        if (item.id === id) return item;
        if (item.children) {
          const found = findItem(item.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const item = findItem(items, itemId);

    if (!item) return;


    if (updates.completed && hasUncompletedDirectSubtasks(item)) {
      const uncompleteCount = countUncompletedDirectSubtasks(item);
      const taskWord = uncompleteCount === 1 ? 'subtask' : 'subtasks';
      const areIs = uncompleteCount === 1 ? 'is' : 'are';
      setError(`Cannot mark this task as complete. ${uncompleteCount} ${taskWord} ${areIs} not finished.`);
      return;
    }


    try {
      const response = await api.put(`/items/${itemId}/complete`, updates);

      if (response.data.deleted) {
        await fetchItems(currentList.id);
      } else {
        await fetchItems(currentList.id);
      }
    } catch (err) {
      setError('Failed to complete item. Please try again.');
    }
  };

  // Function to move an item to a different list
  const handleMoveItem = async (itemId, newListId) => {
    try {
      await api.put(`/items/${itemId}`, { list_id: newListId });
      await fetchItems(currentList.id);
    } catch (err) {
      setError('Failed to move item. Please try again.');
    }
  };


  // Loading state
  if (loading) {
    return (
      <Box className="flex justify-center items-center h-64">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Display error message if any */}
      {error && (
        <Alert severity="error" className="mb-4" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Lists Panel */}
        <Paper
          sx={{
            width: 280, p: 2, height: 'fit-content', position: 'sticky', top: 16,
          }}
        >
          {/* Lists Panel Title */}
          <Typography variant="h6" sx={{ mb: 2 }}>
            My Lists
          </Typography>

          {/* New List Form */}
          <form onSubmit={handleCreateList} className="mb-4">
            <TextField
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              placeholder="New list title..."
              size="small"
              fullWidth
              sx={{ mb: 1 }}
            />
            <Button type="submit" variant="contained" startIcon={<Add />} fullWidth>
              Create List
            </Button>
          </form>

          {/* List of Lists */}
          <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {lists.map((list) => (
              <Paper
                key={list.id}
                elevation={currentList?.id === list.id ? 2 : 0}
                sx={{
                  bgcolor: currentList?.id === list.id ? 'primary.light' : 'background.paper',
                }}
              >
                <ListItem
                  sx={{
                    borderRadius: 1,
                    '&:hover': {
                      bgcolor: currentList?.id === list.id
                        ? 'primary.light'
                        : 'action.hover',
                    },
                  }}
                >
                  <Button
                    onClick={() => handleSelectList(list)}
                    fullWidth
                    sx={{
                      justifyContent: 'flex-start',
                      color: currentList?.id === list.id ? 'primary.contrastText' : 'text.primary',
                      '&:hover': {
                        bgcolor: 'transparent',
                      },
                    }}
                  >
                    {list.title}
                  </Button>
                  <IconButton size="small" onClick={() => setListToDelete(list)}>
                    <Delete />
                  </IconButton>
                </ListItem>
              </Paper>
            ))}
          </List>
        </Paper>


        {/* Delete List Confirmation Dialog */}
        <Dialog
          open={!!listToDelete} // Open if listToDelete is not null
          onClose={() => setListToDelete(null)} // Close when clicking outside or cancel
          PaperProps={{
            sx: {
              borderRadius: '8px',
              width: '400px',
            },
          }}
        >
          <DialogTitle>Delete List?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the list "{listToDelete?.title}"?
              All tasks in this list will be permanently removed.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1 }}>
            <Button onClick={() => setListToDelete(null)}>Cancel</Button>
            <Button onClick={handleDeleteList} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>


        {/* Tasks Panel */}
        <Paper sx={{ flexGrow: 1, p: 2 }}>
          {/* Display current list title and add task button */}
          {currentList ? (
            <>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3,
                }}
              >
                <Typography variant="h6">{currentList.title}</Typography>
                {!showNewTaskInput && (
                  <Button variant="contained" startIcon={<Add />} onClick={() => setShowNewTaskInput(true)}>
                    Add Task
                  </Button>
                )}
              </Box>

              {/* New Task Input */}
              {showNewTaskInput && (
                <Box sx={{ mb: 3 }}>
                  <TextField
                    value={newTaskContent}
                    onChange={(e) => setNewTaskContent(e.target.value)}
                    placeholder="Enter task content..."
                    size="small"
                    fullWidth
                    autoFocus
                    sx={{ mb: 1 }}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="contained" onClick={() => handleAddItem(newTaskContent)}>
                      Add Task
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setShowNewTaskInput(false);
                        setNewTaskContent('');
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              )}

              {/* List of Todo Items */}
              <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {items.map((item) => (
                  <TodoItem
                    key={item.id}
                    item={item}
                    onToggle={(itemId, updates) => (updates.completed
                      ? handleCompleteItem(itemId, updates)
                      : handleUpdateItem(itemId, updates))}
                    onDelete={handleDeleteItem}
                    onUpdate={handleUpdateItem}
                    onAddSubTask={(parentId, content) => handleAddItem(content, parentId)}
                    onMove={handleMoveItem}
                    lists={lists.filter((l) => l.id !== currentList.id)}
                    level={1}
                  />
                ))}
              </List>

            </>
          ) : (
            // Display message if no list is selected
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 200,
              }}
            >
              <Typography color="text.secondary">Select a list to view tasks</Typography>
            </Box>
          )}

          {/* Display message if the selected list has not tasks */}
          {currentList && items.length === 0 && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 200,
                textAlign: 'center',
              }}
            >
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                No tasks in this list
              </Typography>
            </Box>
          )}

        </Paper>
      </Box>
    </Container>
  );
};

export default TodoList;