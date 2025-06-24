import React, { useState } from 'react';
import { Calendar, User, MoreHorizontal, Edit, Trash2, ArrowRight, Move } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from '@/components/ui/dropdown-menu';
import { Task, useTaskStore } from '@/store/taskStore';
import { format } from 'date-fns';
import { EditTaskDialog } from './EditTaskDialog';
import { useIsMobile } from '@/hooks/use-mobile';

interface TaskCardProps {
  task: Task;
  isOverlay?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, isOverlay = false }) => {
  const { deleteTask, columns, moveTask, getTasksByColumnId } = useTaskStore();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useIsMobile();

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
        return 'bg-gradient-to-r from-red-500 to-pink-500 text-white border-red-200 shadow-red-100';
      case 'medium':
        return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-200 shadow-amber-100';
      case 'low':
        return 'bg-gradient-to-r from-emerald-500 to-green-500 text-white border-green-200 shadow-green-100';
      default:
        return 'bg-gradient-to-r from-slate-500 to-gray-500 text-white border-gray-200 shadow-gray-100';
    }
  };

  const handleDeleteTask = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id);
      if (isMobile && 'vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }
  };

  const handleMoveTask = (targetColumnId: string) => {
    if (targetColumnId !== task.columnId) {
      const targetTasks = getTasksByColumnId(targetColumnId);
      moveTask(task.id, task.columnId, targetColumnId, targetTasks.length);
      if (isMobile && 'vibrate' in navigator) {
        navigator.vibrate(25);
      }
    }
  };

  const isOverdue = new Date(task.dueDate) < new Date();
  const currentColumn = columns.find(col => col.id === task.columnId);
  const availableColumns = columns.filter(col => col.boardId === currentColumn?.boardId && col.id !== task.columnId);

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-white transition-all duration-300 group ${
          isMobile 
            ? 'cursor-grab active:cursor-grabbing touch-manipulation' 
            : 'cursor-grab active:cursor-grabbing'
        } ${
          isOverlay ? 'rotate-2 shadow-2xl scale-110 ring-2 ring-blue-400' : 'hover:shadow-xl hover:-translate-y-2 hover:scale-105'
        } ${isDragging ? 'z-50' : ''} ${isOverdue ? 'border-l-4 border-l-red-400' : ''} ${
          isMobile ? 'min-h-[140px]' : ''
        } backdrop-blur-sm`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader className={`pb-3 ${isMobile ? 'px-4 py-4' : ''}`}>
          <div className="flex items-start justify-between">
            <h4 className={`font-semibold text-slate-100 leading-tight transition-colors duration-200 ${
              isMobile ? 'text-sm' : 'text-sm'
            } ${isHovered ? 'text-blue-300' : ''}`}>
              {task.title}
            </h4>
            {!isOverlay && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`transition-all duration-200 hover:bg-slate-700 hover:rotate-90 text-slate-300 hover:text-white ${
                      isMobile ? 'h-8 w-8 p-0' : 'h-6 w-6 p-0'
                    } ${isHovered || isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                  >
                    <MoreHorizontal className={`${isMobile ? 'w-4 h-4' : 'w-3 h-3'}`} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 text-white shadow-xl animate-in slide-in-from-top-2">
                  <DropdownMenuItem 
                    onClick={() => setIsEditDialogOpen(true)}
                    className="hover:bg-slate-700 focus:bg-slate-700 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Task
                  </DropdownMenuItem>
                  
                  {availableColumns.length > 0 && (
                    <>
                      <DropdownMenuSeparator className="bg-slate-700" />
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="hover:bg-slate-700 focus:bg-slate-700">
                          <Move className="w-4 h-4 mr-2" />
                          Move to Column
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="bg-slate-800 border-slate-700 text-white shadow-xl">
                          {availableColumns.map((column) => (
                            <DropdownMenuItem
                              key={column.id}
                              onClick={() => handleMoveTask(column.id)}
                              className="hover:bg-slate-700 focus:bg-slate-700 transition-colors"
                            >
                              <ArrowRight className="w-4 h-4 mr-2" />
                              {column.title}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    </>
                  )}
                  
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem
                    onClick={handleDeleteTask}
                    className="text-red-400 focus:text-red-300 hover:bg-red-900/20 focus:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          {task.description && (
            <p className={`text-slate-300 line-clamp-2 mt-2 transition-colors duration-200 hover:text-slate-200 ${
              isMobile ? 'text-xs' : 'text-xs'
            }`}>
              {task.description}
            </p>
          )}
        </CardHeader>
        <CardContent className={`pt-0 space-y-3 ${isMobile ? 'px-4 pb-4' : ''}`}>
          <div className="flex items-center justify-between">
            <Badge className={`text-xs px-3 py-1 transition-all duration-200 hover:shadow-lg font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Badge>
            {isOverdue && (
              <span className="text-xs text-red-400 font-medium animate-pulse bg-red-900/20 px-2 py-1 rounded-full">
                Overdue
              </span>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center text-xs text-slate-400 hover:text-slate-300 transition-colors">
              <div className="p-1.5 bg-slate-700 rounded-lg mr-2">
                <User className="w-3 h-3 text-blue-400" />
              </div>
              <span className="truncate">{task.assignee}</span>
            </div>
            <div className={`flex items-center text-xs transition-colors ${
              isOverdue ? 'text-red-400' : 'text-slate-400 hover:text-slate-300'
            }`}>
              <div className="p-1.5 bg-slate-700 rounded-lg mr-2">
                <Calendar className="w-3 h-3 text-emerald-400" />
              </div>
              <span>{format(new Date(task.dueDate), 'MMM dd')}</span>
            </div>
          </div>
          
          <div className="text-xs text-slate-500 border-t border-slate-700 pt-3 transition-colors hover:text-slate-400">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mr-2"></div>
              Created by {task.creator}
            </div>
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
