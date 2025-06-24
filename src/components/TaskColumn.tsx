
import React, { useState } from 'react';
import { Plus, MoreHorizontal, Trash2, Edit } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTaskStore, Column } from '@/store/taskStore';
import { TaskCard } from './TaskCard';

interface TaskColumnProps {
  column: Column;
  onDeleteColumn: (columnId: string) => void;
  onCreateTask: (columnId: string) => void;
}

export const TaskColumn: React.FC<TaskColumnProps> = ({
  column,
  onDeleteColumn,
  onCreateTask,
}) => {
  const { getTasksByColumnId, updateColumn } = useTaskStore();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);
  const [isHovered, setIsHovered] = useState(false);

  const tasks = getTasksByColumnId(column.id);

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  });

  const handleUpdateColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (editTitle.trim()) {
      updateColumn(column.id, { title: editTitle.trim() });
      setIsEditDialogOpen(false);
    }
  };

  return (
    <>
      <Card 
        ref={setNodeRef} 
        className={`w-80 flex-shrink-0 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl ${
          isOver ? 'bg-blue-50 border-blue-300 shadow-lg scale-105' : 'bg-gray-50 border-gray-200'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className={`font-semibold text-gray-900 transition-colors duration-200 ${
                isHovered ? 'text-blue-600' : ''
              }`}>
                {column.title}
              </h3>
              <span className={`text-xs px-2 py-1 rounded-full transition-all duration-200 ${
                tasks.length > 0 
                  ? 'bg-blue-100 text-blue-800 animate-pulse' 
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {tasks.length}
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`transition-all duration-200 hover:bg-gray-200 hover:rotate-90 ${
                    isHovered ? 'opacity-100' : 'opacity-70'
                  }`}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border shadow-lg animate-in slide-in-from-top-2">
                <DropdownMenuItem 
                  onClick={() => setIsEditDialogOpen(true)}
                  className="hover:bg-blue-50 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Column
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDeleteColumn(column.id)}
                  className="text-red-600 focus:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Column
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 min-h-[200px]">
          <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {tasks.map((task, index) => (
                <div 
                  key={task.id}
                  className="animate-in slide-in-from-left-1 fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <TaskCard task={task} />
                </div>
              ))}
            </div>
          </SortableContext>
          
          {tasks.length === 0 && (
            <div className="flex items-center justify-center h-32 text-gray-400 animate-pulse">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
                  📋
                </div>
                <p className="text-sm">No tasks yet</p>
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 group border-2 border-dashed border-transparent hover:border-blue-300"
            onClick={() => onCreateTask(column.id)}
          >
            <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
            Add a task
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md animate-in fade-in-0 zoom-in-95">
          <DialogHeader>
            <DialogTitle>Edit Column</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateColumn} className="space-y-4">
            <div>
              <Label htmlFor="editColumnTitle">Column Title</Label>
              <Input
                id="editColumnTitle"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter column title"
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
                className="hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Update Column
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
