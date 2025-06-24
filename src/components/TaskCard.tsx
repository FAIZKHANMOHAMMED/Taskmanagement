
import React, { useState } from 'react';
import { Calendar, User, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Task, useTaskStore } from '@/store/taskStore';
import { format } from 'date-fns';
import { EditTaskDialog } from './EditTaskDialog';

interface TaskCardProps {
  task: Task;
  isOverlay?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, isOverlay = false }) => {
  const { deleteTask } = useTaskStore();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
      columnId: task.columnId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200 shadow-red-100';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 shadow-yellow-100';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200 shadow-green-100';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 shadow-gray-100';
    }
  };

  const handleDeleteTask = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id);
    }
  };

  const isOverdue = new Date(task.dueDate) < new Date();

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`bg-white border cursor-grab active:cursor-grabbing transition-all duration-300 group ${
          isOverlay ? 'rotate-5 shadow-2xl scale-110' : 'hover:shadow-lg hover:-translate-y-1'
        } ${isDragging ? 'z-50' : ''} ${isOverdue ? 'border-l-4 border-l-red-500' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <h4 className={`font-medium text-gray-900 text-sm leading-tight transition-colors duration-200 ${
              isHovered ? 'text-blue-600' : ''
            }`}>
              {task.title}
            </h4>
            {!isOverlay && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`h-6 w-6 p-0 transition-all duration-200 hover:bg-gray-100 hover:rotate-90 ${
                      isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border shadow-lg animate-in slide-in-from-top-2">
                  <DropdownMenuItem 
                    onClick={() => setIsEditDialogOpen(true)}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Task
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDeleteTask}
                    className="text-red-600 focus:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          {task.description && (
            <p className="text-xs text-gray-600 line-clamp-2 mt-1 transition-colors duration-200 hover:text-gray-800">
              {task.description}
            </p>
          )}
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          <div className="flex items-center justify-between">
            <Badge className={`text-xs px-2 py-0.5 transition-all duration-200 hover:shadow-md ${getPriorityColor(task.priority)}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Badge>
            {isOverdue && (
              <span className="text-xs text-red-600 font-medium animate-pulse">
                Overdue
              </span>
            )}
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center text-xs text-gray-500 hover:text-gray-700 transition-colors">
              <User className="w-3 h-3 mr-1" />
              <span className="truncate">{task.assignee}</span>
            </div>
            <div className={`flex items-center text-xs transition-colors ${
              isOverdue ? 'text-red-600' : 'text-gray-500 hover:text-gray-700'
            }`}>
              <Calendar className="w-3 h-3 mr-1" />
              <span>{format(new Date(task.dueDate), 'MMM dd')}</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-400 border-t pt-2 transition-colors hover:text-gray-600">
            Created by {task.creator}
          </div>
        </CardContent>
      </Card>

      {!isOverlay && (
        <EditTaskDialog
          task={task}
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
        />
      )}
    </>
  );
};
