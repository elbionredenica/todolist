import React, { useState } from 'react';
import {
  ListItem, IconButton, Typography, TextField, Dialog,
  DialogTitle, DialogContent, DialogContentText, DialogActions,
  Button, Select, MenuItem, Chip, Box,
} from '@mui/material';
import {
  ExpandMore, ExpandLess, Delete, Add, CheckCircle,
  RadioButtonUnchecked, Edit, DragIndicator,
} from '@mui/icons-material';

const TodoItem = ({
  item, onToggle, onDelete, onUpdate, onAddSubTask,
  onMove, lists, level, parentTask = null,
}) => {
  // State for controlling the editing mode of the todo item.
  const [isEditing, setIsEditing] = useState(false);
  // State for storing the edited content of the todo item.
  const [editContent, setEditContent] = useState(item.content);
  // State for controlling the visibility of the move task dialog.
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  // State for controlling the visibility of the delete confirmation dialog.
  const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
  // State for the selected list ID in the move task dialog.
  const [selectedList, setSelectedList] = useState('');
  // State for showing/hiding the "add subtask" dialog.
  const [showAddSubtaskDialog, setShowAddSubtaskDialog] = useState(false);
  // State for managing the content of the new subtask.
  const [newSubtaskContent, setNewSubtaskContent] = useState('');

  // Handler function to update a todo item.
  const handleUpdate = () => {
    if (editContent.trim()) {
      onUpdate(item.id, { content: editContent });
      setIsEditing(false);
    }
  };

  // Handler function to move a todo item to a different list.
  const handleMove = () => {
    if (selectedList) {
      onMove(item.id, selectedList);
      setShowMoveDialog(false);
    }
  };

  // Handler function to open the delete confirmation dialog.
  const handleDelete = () => {
    setShowConfirmDeleteDialog(true);
  };

  // Handler function to confirm the deletion of a todo item.
  const confirmDelete = () => {
    onDelete(item.id);
    setShowConfirmDeleteDialog(false);
  };

  // Handles adding a subtask to a todo item.
  const handleAddSubTask = () => {
    if (newSubtaskContent.trim()) {
      onAddSubTask(item.id, newSubtaskContent);
      setNewSubtaskContent('');
      setShowAddSubtaskDialog(false);
    }
  };

  // Calculate left margin based on nesting level.
  const marginLeft = level * 24;

  return (
    <div className="mb-3">
      {/* Render a single todo item. */}
      <ListItem
        className="border rounded-lg hover:bg-gray-50 transition-colors duration-200"
        style={{
          marginLeft: `${marginLeft}px`,
          backgroundColor: item.completed ? '#f8f9fa' : 'white',
          borderLeft: `4px solid ${
            item.completed ? '#4caf50' : // Green if completed
              level === 1 ? '#1976d2' : // Blue for level 1
                level === 2 ? '#7b1fa2' : // Purple for level 2
                  '#c2185b' // Pink for level 3
          }`,
        }}
      >
        <div className="flex items-center gap-3 w-full py-2">
          {/* Left side controls (complete/collapse). */}
          <div className="flex items-center gap-2">
            {/* Toggle complete button. */}
            <IconButton
              aria-label="Toggle Complete"
              onClick={() => onToggle(item.id, { completed: !item.completed })}
              size="small"
              sx={{
                color: item.completed ? '#4caf50' : // Green when completed
                  level === 1 ? '#1976d2' : // Blue for level 1
                    level === 2 ? '#7b1fa2' : // Purple for level 2
                      '#c2185b', // Pink for level 3

              }}
            >
              {item.completed ? <CheckCircle /> : <RadioButtonUnchecked />}
            </IconButton>

            {/* Collapse/expand button for subtasks (if any and level < 3). */}
            {level < 3 && item.children?.length > 0 && (
              <IconButton
                aria-label="Toggle Collapse"
                onClick={() => onToggle(item.id, { collapsed: !item.collapsed })}
                size="small"
                sx={{
                  color: level === 1 ? 'rgba(25, 118, 210, 0.7)' :
                    level === 2 ? 'rgba(123, 31, 162, 0.7)' :
                      'rgba(194, 24, 91, 0.7)',


                }}
              >
                {item.collapsed ? <ExpandMore /> : <ExpandLess />}
              </IconButton>
            )}
          </div>

          {/* Main content area (editable text field or displayed text). */}
          <div className="flex-grow">
            {/* Conditionally render text field for editing or display the todo content. */}
            {isEditing ? (
              // Text field for editing the todo item content.
              <TextField
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                autoFocus
                size="small"
                fullWidth
                onBlur={handleUpdate}
                onKeyPress={(e) => e.key === 'Enter' && handleUpdate()}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    '& fieldset': {
                      borderColor: level === 1 ? 'rgba(25, 118, 210, 0.3)' :
                        level === 2 ? 'rgba(123, 31, 162, 0.3)' :
                          'rgba(194, 24, 91, 0.3)',
                    },
                  },
                }}
              />
            ) : (
              // Display the todo item content (with styling based on completion status).
              <div className="flex flex-col">

                <Typography
                  className={`${item.completed ? 'line-through text-gray-500' : 'text-gray-800'}
                             transition-all duration-200`}
                  sx={{
                    color: item.completed ? 'text.disabled' :
                      level === 1 ? 'text.primary' :
                        level === 2 ? '#7b1fa2' :
                          '#c2185b',
                  }}
                >
                  {item.content}
                </Typography>
                {/* If this is a subtask, display a chip indicating its parent. */}
                {parentTask && (
                  <Chip
                    label={`Subtask of: ${parentTask.content}`}
                    size="small"
                    variant="outlined"
                    className="mt-1 max-w-fit"
                    sx={{
                      backgroundColor: level === 2 ? 'rgba(123, 31, 162, 0.08)' :
                        level === 3 ? 'rgba(194, 24, 91, 0.08)' :
                          'rgba(25, 118, 210, 0.08)',
                      borderColor: level === 2 ? 'rgba(123, 31, 162, 0.3)' :
                        level === 3 ? 'rgba(194, 24, 91, 0.3)' :
                          'rgba(25, 118, 210, 0.3)',
                      fontSize: '0.75rem',
                    }}
                  />
                )}
              </div>
            )}
          </div>

          {/* Action buttons (add, edit, move, delete).  */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {/* Add subtask button (if allowed). */}
            {level < 3 && (
              <IconButton
                aria-label="Add"
                onClick={() => setShowAddSubtaskDialog(true)}
                size="small"
                title={level === 3 ? "Maximum nesting level reached" : "Add subtask"}
                sx={{
                  color: level === 1 ? '#1976d2' :
                    level === 2 ? '#7b1fa2' :
                      '#c2185b',
                  '&:hover': {
                    backgroundColor: level === 1 ? 'rgba(25, 118, 210, 0.04)' :
                      level === 2 ? 'rgba(123, 31, 162, 0.04)' :
                        'rgba(194, 24, 91, 0.04)',
                  },

                }}
              >
                <Add fontSize="small" />
              </IconButton>
            )}

            {/* Edit button. */}
            <IconButton
              aria-label="Edit"
              onClick={() => setIsEditing(true)}
              size="small"
              className="text-gray-600 hover:bg-gray-50"
            >
              <Edit fontSize="small" />
            </IconButton>

            {/* Move button (only for top-level items). */}
            {level === 1 && (
              <IconButton
                aria-label="Drag"
                onClick={() => setShowMoveDialog(true)}
                size="small"
                className="text-gray-600 hover:bg-gray-50"
              >
                <DragIndicator fontSize="small" />
              </IconButton>
            )}

            {/* Delete button. */}
            <IconButton
              aria-label="Delete"
              onClick={handleDelete}
              size="small"
              className="text-red-600 hover:bg-red-50"
            >
              <Delete fontSize="small" />
            </IconButton>
          </div>
        </div>
      </ListItem>

      
      {/* Confirmation dialog for deleting a task. */}
      <Dialog
        open={showConfirmDeleteDialog}
        onClose={() => setShowConfirmDeleteDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: '8px',
            width: '400px',
          },
        }}
      >
        <DialogTitle>Delete Task?</DialogTitle>
        <DialogContent>
          {/* Message in the delete confirmation dialog. */}
          <DialogContentText>
            Are you sure you want to delete this task
            {item.children?.length > 0 ? ' and its subtask(s)' : ''}?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          {/* "Cancel" button in the delete dialog. */}
          <Button onClick={() => setShowConfirmDeleteDialog(false)}>Cancel</Button>
          {/* "Delete" button in the delete dialog. */}
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Recursively render child todo items if not collapsed. */}
      {!item.collapsed && item.children?.map((child) => (
        <TodoItem
          key={child.id}
          item={child}
          onToggle={onToggle}
          onDelete={onDelete}
          onUpdate={onUpdate}
          onAddSubTask={onAddSubTask}
          onMove={onMove}
          lists={lists}
          level={level + 1}
          parentTask={item}
        />
      ))}

      {/* Dialog for adding a subtask (shown when the "Add" button is clicked). */}
      {level < 3 && showAddSubtaskDialog && (
        <Box
          className="flex gap-2 mt-2 p-3 rounded-lg"
          style={{
            marginLeft: `${marginLeft + 40}px`,
            backgroundColor: level === 1 ? 'rgba(25, 118, 210, 0.04)' :
              level === 2 ? 'rgba(123, 31, 162, 0.04)' :
                'rgba(194, 24, 91, 0.04)',
          }}
        >
          {/* Input field for the new subtask's content. */}
          <TextField
            inputProps={{ 'data-testid': 'add-subtask-input' }}
            value={newSubtaskContent}
            onChange={(e) => setNewSubtaskContent(e.target.value)}
            placeholder="New subtask..."
            size="small"
            autoFocus
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
                '& fieldset': {
                  borderColor: level === 1 ? 'rgba(25, 118, 210, 0.3)' :
                    level === 2 ? 'rgba(123, 31, 162, 0.3)' :
                      'rgba(194, 24, 91, 0.3)',
                },
              },
            }}
          />
          {/* Button to add the subtask. */}
          <Button
            onClick={handleAddSubTask}
            variant="contained"
            size="small"
            sx={{
              backgroundColor: level === 1 ? '#1976d2' :
                level === 2 ? '#7b1fa2' :
                  '#c2185b',
              '&:hover': {
                backgroundColor: level === 1 ? '#1565c0' :
                  level === 2 ? '#6a1b9a' :
                    '#ad1457',
              },
            }}
          >
            Add
          </Button>
          {/* Button to cancel adding a subtask. */}
          <Button
            onClick={() => {
              setShowAddSubtaskDialog(false);
              setNewSubtaskContent('');
            }}
            size="small"
          >
            Cancel
          </Button>
        </Box>
      )}

      {/* Dialog for moving the task to a different list. */}
      <Dialog
        open={showMoveDialog}
        onClose={() => setShowMoveDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: '8px',
            width: '400px',
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>Move Task to Different List</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {/* Dropdown to select the target list for moving the task. */}
          <Select
            value={selectedList}
            onChange={(e) => setSelectedList(e.target.value)}
            fullWidth
            size="small"
            inputProps={{ 'data-testid': 'move-task-select' }}
          >
            {lists.map((list) => (
              <MenuItem key={list.id} value={list.id}>
                {list.title}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={() => setShowMoveDialog(false)}>Cancel</Button>
          <Button
            data-testid="move-confirm-button"
            onClick={handleMove}
            variant="contained"
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0',
              },
            }}
          >
            Move
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TodoItem;