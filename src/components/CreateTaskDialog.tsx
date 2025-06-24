import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTaskStore } from '@/store/taskStore';

interface CreateTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  preselectedColumnId?: string;
}

export const CreateTaskDialog: React.FC<CreateTaskDialogProps> = ({
  isOpen,
  onClose,
  boardId,
  preselectedColumnId = '',
}) => {
  const { getColumnsByBoardId, getTasksByColumnId, addTask } = useTaskStore();
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    creator: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    dueDate: '',
    assignee: '',
    columnId: preselectedColumnId,
  });

  const columns = getColumnsByBoardId(boardId);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.title.trim() && newTask.creator.trim() && newTask.assignee.trim() && newTask.columnId) {
      const columnTasks = getTasksByColumnId(newTask.columnId);
      addTask({
        ...newTask,
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        creator: newTask.creator.trim(),
        assignee: newTask.assignee.trim(),
        position: columnTasks.length,
      });
      setNewTask({
        title: '',
        description: '',
        creator: '',
        priority: 'medium',
        dueDate: '',
        assignee: '',
        columnId: preselectedColumnId,
      });
      onClose();
    }
  };

  const handleClose = () => {
    setNewTask({
      title: '',
      description: '',
      creator: '',
      priority: 'medium',
      dueDate: '',
      assignee: '',
      columnId: preselectedColumnId,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-slate-100">Create New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <Label htmlFor="taskTitle" className="text-slate-300">Task Title</Label>
            <Input
              id="taskTitle"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="Enter task title"
              required
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <Label htmlFor="taskDescription" className="text-slate-300">Description</Label>
            <Textarea
              id="taskDescription"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="Enter task description"
              rows={3}
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="taskCreator" className="text-slate-300">Creator</Label>
              <Input
                id="taskCreator"
                value={newTask.creator}
                onChange={(e) => setNewTask({ ...newTask, creator: e.target.value })}
                placeholder="Your name"
                required
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <Label htmlFor="taskAssignee" className="text-slate-300">Assignee</Label>
              <Input
                id="taskAssignee"
                value={newTask.assignee}
                onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                placeholder="Assigned to"
                required
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="taskPriority" className="text-slate-300">Priority</Label>
              <Select value={newTask.priority} onValueChange={(value: 'high' | 'medium' | 'low') => setNewTask({ ...newTask, priority: value })}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="taskDueDate" className="text-slate-300">Due Date</Label>
              <Input
                id="taskDueDate"
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                required
                className="bg-slate-700 border-slate-600 text-white focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="taskColumn" className="text-slate-300">Column</Label>
            <Select value={newTask.columnId} onValueChange={(value) => setNewTask({ ...newTask, columnId: value })}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Select a column" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                {columns.map((column) => (
                  <SelectItem key={column.id} value={column.id}>
                    {column.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
