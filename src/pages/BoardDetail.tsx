import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, MoreHorizontal, Trash2, Edit } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTaskStore, Task } from '@/store/taskStore';
import { TaskColumn } from '@/components/TaskColumn';
import { TaskCard } from '@/components/TaskCard';
import { CreateTaskDialog } from '@/components/CreateTaskDialog';
import { useIsMobile } from '@/hooks/use-mobile';

const BoardDetail = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const isMobile = useIsMobile();
  const {
    getBoardById,
    getColumnsByBoardId,
    addColumn,
    deleteColumn,
    updateColumn,
    moveTask,
    reorderTasks,
    reorderColumns,
  } = useTaskStore();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isCreateColumnDialogOpen, setIsCreateColumnDialogOpen] = useState(false);
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string>('');
  const [newColumnTitle, setNewColumnTitle] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: isMobile ? 10 : 3,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: isMobile ? 150 : 0,
        tolerance: isMobile ? 10 : 5,
      },
    })
  );

  if (!boardId) {
    return <div>Board not found</div>;
  }

  const board = getBoardById(boardId);
  const columns = getColumnsByBoardId(boardId);

  if (!board) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
        <div className="text-center animate-in fade-in-0 zoom-in-95 max-w-md mx-auto">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center text-3xl sm:text-4xl border border-slate-600">
            😔
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 mb-4">Board not found</h1>
          <Link 
            to="/" 
            className="text-blue-400 hover:text-blue-300 transition-colors hover:underline text-sm sm:text-base"
          >
            ← Back to Boards
          </Link>
        </div>
      </div>
    );
  }

  const handleCreateColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (newColumnTitle.trim()) {
      addColumn({
        title: newColumnTitle.trim(),
        boardId,
        position: columns.length,
      });
      setNewColumnTitle('');
      setIsCreateColumnDialogOpen(false);
      if (isMobile && 'vibrate' in navigator) {
        navigator.vibrate(25);
      }
    }
  };

  const handleDeleteColumn = (columnId: string) => {
    if (window.confirm('Are you sure you want to delete this column? All tasks in this column will also be deleted.')) {
      deleteColumn(columnId);
      if (isMobile && 'vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === 'task') {
      setActiveTask(active.data.current.task);
      
      // Add haptic feedback for mobile devices
      if (isMobile && 'vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType === 'task') {
      const activeTaskId = active.id as string;
      const activeColumnId = active.data.current?.columnId;

      if (overType === 'column') {
        const overColumnId = over.id as string;
        const overTasks = useTaskStore.getState().getTasksByColumnId(overColumnId);
        moveTask(activeTaskId, activeColumnId, overColumnId, overTasks.length);
      } else if (overType === 'task') {
        const overTask = over.data.current?.task;
        const overColumnId = overTask.columnId;
        const overTasks = useTaskStore.getState().getTasksByColumnId(overColumnId);
        const overIndex = overTasks.findIndex(task => task.id === overTask.id);
        moveTask(activeTaskId, activeColumnId, overColumnId, overIndex);
      }

      // Add success haptic feedback for mobile
      if (isMobile && 'vibrate' in navigator) {
        navigator.vibrate(25);
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType === 'task' && overType === 'task') {
      const activeTaskId = active.id as string;
      const overTask = over.data.current?.task;
      const activeColumnId = active.data.current?.columnId;
      const overColumnId = overTask.columnId;

      if (activeColumnId !== overColumnId) {
        const overTasks = useTaskStore.getState().getTasksByColumnId(overColumnId);
        const overIndex = overTasks.findIndex(task => task.id === overTask.id);
        moveTask(activeTaskId, activeColumnId, overColumnId, overIndex);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 animate-in fade-in-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0 animate-in slide-in-from-top-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <Link
              to="/"
              className="flex items-center text-slate-400 hover:text-blue-400 transition-all duration-200 hover:scale-105 group text-sm sm:text-base self-start"
            >
              <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
              Back to Boards
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent truncate">
                {board.title}
              </h1>
              {board.description && (
                <p className="text-sm sm:text-base text-slate-400 mt-1 animate-in slide-in-from-left-2 line-clamp-2" style={{ animationDelay: '200ms' }}>
                  {board.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 animate-in slide-in-from-right-4 w-full sm:w-auto">
            <Dialog open={isCreateColumnDialogOpen} onOpenChange={setIsCreateColumnDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline"
                  className="hover:bg-slate-700 hover:border-blue-400 transition-all duration-200 hover:scale-105 w-full sm:w-auto border-slate-600 text-slate-300 hover:text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Column
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md mx-4 animate-in fade-in-0 zoom-in-95 bg-slate-800 border-slate-700 text-white">
                <DialogHeader>
                  <DialogTitle className="text-slate-100">Create New Column</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateColumn} className="space-y-4">
                  <div>
                    <Label htmlFor="columnTitle" className="text-slate-300">Column Title</Label>
                    <Input
                      id="columnTitle"
                      value={newColumnTitle}
                      onChange={(e) => setNewColumnTitle(e.target.value)}
                      placeholder="Enter column title"
                      required
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsCreateColumnDialogOpen(false)}
                      className="hover:bg-slate-700 transition-colors w-full sm:w-auto border-slate-600 text-slate-300 hover:text-white"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-colors w-full sm:w-auto"
                    >
                      Create Column
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Button
              onClick={() => setIsCreateTaskDialogOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
        >
          <div className={`flex ${isMobile ? 'space-x-3' : 'space-x-4 sm:space-x-6'} overflow-x-auto pb-4 sm:pb-6 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8`}>
            <SortableContext items={columns.map(col => col.id)} strategy={horizontalListSortingStrategy}>
              {columns.map((column, index) => (
                <div 
                  key={column.id}
                  className="animate-in slide-in-from-bottom-4 flex-shrink-0"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <TaskColumn
                    column={column}
                    onDeleteColumn={handleDeleteColumn}
                    onCreateTask={(columnId) => {
                      setSelectedColumnId(columnId);
                      setIsCreateTaskDialogOpen(true);
                    }}
                  />
                </div>
              ))}
            </SortableContext>

            {columns.length === 0 && (
              <div className="flex-1 flex items-center justify-center py-12 sm:py-16 animate-in fade-in-0 zoom-in-95">
                <div className="text-center px-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center text-3xl sm:text-4xl animate-bounce border border-slate-600">
                    📋
                  </div>
                  <h3 className="text-lg font-medium text-slate-100 mb-2">No columns yet</h3>
                  <p className="text-sm sm:text-base text-slate-400 mb-4">Create your first column to start organizing tasks</p>
                  <Button 
                    onClick={() => setIsCreateColumnDialogOpen(true)} 
                    variant="outline"
                    className="hover:bg-slate-700 hover:border-blue-400 transition-all duration-200 hover:scale-105 border-slate-600 text-slate-300 hover:text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Column
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
          </DragOverlay>
        </DndContext>

        <CreateTaskDialog
          isOpen={isCreateTaskDialogOpen}
          onClose={() => {
            setIsCreateTaskDialogOpen(false);
            setSelectedColumnId('');
          }}
          boardId={boardId}
          preselectedColumnId={selectedColumnId}
        />
      </div>
    </div>
  );
};

export default BoardDetail;
