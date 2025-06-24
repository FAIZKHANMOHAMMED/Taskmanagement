
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Task, useTaskStore } from '@/store/taskStore';

interface EditTaskDialogProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export const EditTaskDialog: React.FC<EditTaskDialogProps> = ({
  task,
  isOpen,
  onClose,
}) => {
  const { updateTask, columns } = useTaskStore();
  const [editTask, setEditTask] = useState({
    title: task.title,
    description: task.description,
    creator: task.creator,
    priority: task.priority,
    dueDate: task.dueDate,
    assignee: task.assignee,
    columnId: task.columnId,
  });

  useEffect(() => {
    setEditTask({
      title: task.title,
      description: task.description,
      creator: task.creator,
      priority: task.priority,
      dueDate: task.dueDate,
      assignee: task.assignee,
      columnId: task.columnId,
    });
  }, [task]);

  const taskColumn = columns.find(col => col.id === task.columnId);
  const boardColumns = columns.filter(col => col.boardId === taskColumn?.boardId);

  const handleUpdateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (editTask.title.trim() && editTask.creator.trim() && editTask.assignee.trim()) {
      updateTask(task.id, {
        ...editTask,
        title: editTask.title.trim(),
        description: editTask.description.trim(),
        creator: editTask.creator.trim(),
        assignee: editTask.assignee.trim(),
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleUpdateTask} className="space-y-4">
          <div>
            <Label htmlFor="editTaskTitle">Task Title</Label>
            <Input
              id="editTaskTitle"
              value={editTask.title}
              onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
              placeholder="Enter task title"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="editTaskDescription">Description</Label>
            <Textarea
              id="editTaskDescription"
              value={editTask.description}
              onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
              placeholder="Enter task description"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="editTaskCreator">Creator</Label>
              <Input
                id="editTaskCreator"
                value={editTask.creator}
                onChange={(e) => setEditTask({ ...editTask, creator: e.target.value })}
                placeholder="Creator name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="editTaskAssignee">Assignee</Label>
              <Input
                id="editTaskAssignee"
                value={editTask.assignee}
                onChange={(e) => setEditTask({ ...editTask, assignee: e.target.value })}
                placeholder="Assigned to"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="editTaskPriority">Priority</Label>
              <Select value={editTask.priority} onValueChange={(value: 'high' | 'medium' | 'low') => setEditTask({ ...editTask, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="editTaskDueDate">Due Date</Label>
              <Input
                id="editTaskDueDate"
                type="date"
                value={editTask.dueDate}
                onChange={(e) => setEditTask({ ...editTask, dueDate: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="editTaskColumn">Column</Label>
            <Select value={editTask.columnId} onValueChange={(value) => setEditTask({ ...editTask, columnId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a column" />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg">
                {boardColumns.map((column) => (
                  <SelectItem key={column.id} value={column.id}>
                    {column.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Update Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
