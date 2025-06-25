"use client"

import type React from "react"
import { useState } from "react"
import {
  Calendar,
  User,
  MoreHorizontal,
  Trash2,
  Edit,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  Circle,
} from "lucide-react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import { useTaskStore, type Task } from "@/store/taskStore"
import { EditTaskDialog } from "./EditTaskDialog"
import { HighlightText } from "./HighlightText"
import { format, isPast, isToday } from "date-fns"
import { useIsMobile } from "@/hooks/use-mobile"

interface TaskCardProps {
  task: Task
  isOverlay?: boolean
  searchQuery?: string
}

const TaskCard: React.FC<TaskCardProps> = ({ task, isOverlay = false, searchQuery = "" }) => {
  const isMobile = useIsMobile()
  const { deleteTask, getColumnsByBoardId, moveTask, getTasksByColumnId, updateTaskStatus, getColumnById } =
    useTaskStore()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: "task",
      task,
      columnId: task.columnId,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleDeleteTask = () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTask(task.id)
      if (isMobile && "vibrate" in navigator) {
        navigator.vibrate(50)
      }
    }
  }

  const handleMoveTask = (targetColumnId: string) => {
    const targetTasks = getTasksByColumnId(targetColumnId)
    moveTask(task.id, task.columnId, targetColumnId, targetTasks.length)
    if (isMobile && "vibrate" in navigator) {
      navigator.vibrate(25)
    }
  }

  const handleStatusUpdate = (newStatus: "todo" | "in-progress" | "completed") => {
    updateTaskStatus(task.id, newStatus)
    if (isMobile && "vibrate" in navigator) {
      navigator.vibrate(25)
    }
  }

  // Get available columns for moving
  const currentColumn = getColumnById(task.columnId)
  const availableColumns = currentColumn
    ? getColumnsByBoardId(currentColumn.boardId).filter((col) => col.id !== task.columnId)
    : []

  const priorityColors = {
    high: "bg-red-500/20 text-red-400 border-red-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    low: "bg-green-500/20 text-green-400 border-green-500/30",
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return {
          icon: CheckCircle,
          color: "bg-green-500/20 text-green-400 border-green-500/30",
          label: "Completed",
          nextStatus: "todo" as const,
          nextLabel: "Mark as To Do",
        }
      case "in-progress":
        return {
          icon: Clock,
          color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
          label: "In Progress",
          nextStatus: "completed" as const,
          nextLabel: "Mark as Completed",
        }
      case "todo":
      default:
        return {
          icon: Circle,
          color: "bg-slate-500/20 text-slate-400 border-slate-500/30",
          label: "To Do",
          nextStatus: "in-progress" as const,
          nextLabel: "Start Progress",
        }
    }
  }

  const isOverdue = isPast(new Date(task.dueDate)) && task.status !== "completed"
  const isDueToday = isToday(new Date(task.dueDate))
  const statusConfig = getStatusConfig(task.status)
  const StatusIcon = statusConfig.icon

  if (isDragging && !isOverlay) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 bg-slate-700 border-2 border-dashed border-slate-600 rounded-lg h-24 sm:h-32"
      />
    )
  }

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`group cursor-grab active:cursor-grabbing transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105 ${
          isOverlay
            ? "rotate-6 shadow-2xl ring-2 ring-blue-400 bg-slate-700 border-blue-400 scale-110"
            : "bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600 hover:border-slate-500"
        } backdrop-blur-sm ${searchQuery ? "ring-1 ring-yellow-400/30" : ""} ${
          task.status === "completed" ? "opacity-75" : ""
        }`}
      >
        <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
          <div className="flex items-start justify-between space-x-2">
            <div className="flex-1 min-w-0">
              <h4
                className={`font-semibold text-slate-100 group-hover:text-blue-300 transition-colors duration-200 line-clamp-2 text-sm sm:text-base ${
                  task.status === "completed" ? "line-through opacity-75" : ""
                }`}
              >
                <HighlightText text={task.title} searchQuery={searchQuery} />
              </h4>
              {task.description && (
                <p
                  className={`text-xs sm:text-sm text-slate-400 mt-1 line-clamp-2 ${
                    task.status === "completed" ? "line-through opacity-60" : ""
                  }`}
                >
                  <HighlightText text={task.description} searchQuery={searchQuery} />
                </p>
              )}
            </div>
            {!isOverlay && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`${isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-all duration-200 hover:bg-slate-600 hover:rotate-90 h-6 w-6 sm:h-8 sm:w-8 p-0 text-slate-400 hover:text-white flex-shrink-0`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-slate-800 border-slate-700 text-white shadow-xl animate-in slide-in-from-top-2 z-50 w-48"
                >
                  <DropdownMenuItem
                    onClick={() => handleStatusUpdate(statusConfig.nextStatus)}
                    className="hover:bg-slate-700 focus:bg-slate-700 transition-colors"
                  >
                    <StatusIcon className="w-4 h-4 mr-2" />
                    {statusConfig.nextLabel}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-slate-700" />

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
                        <DropdownMenuSubTrigger className="hover:bg-slate-700 focus:bg-slate-700 transition-colors">
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Move to Column
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="bg-slate-800 border-slate-700 text-white shadow-xl">
                          {availableColumns.map((column) => (
                            <DropdownMenuItem
                              key={column.id}
                              onClick={() => handleMoveTask(column.id)}
                              className="hover:bg-slate-700 focus:bg-slate-700 transition-colors"
                            >
                              <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mr-2"></div>
                              <span className="truncate">{column.title}</span>
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

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <Badge
                variant="secondary"
                className={`text-xs px-2 py-0.5 border ${priorityColors[task.priority]} font-medium`}
              >
                {task.priority}
              </Badge>
              <Badge
                variant="secondary"
                className={`text-xs px-2 py-0.5 border ${statusConfig.color} font-medium flex items-center gap-1`}
              >
                <StatusIcon className="w-3 h-3" />
                {statusConfig.label}
              </Badge>
              {(isOverdue || isDueToday) && (
                <Badge
                  variant="secondary"
                  className={`text-xs px-2 py-0.5 border font-medium ${
                    isOverdue
                      ? "bg-red-500/20 text-red-400 border-red-500/30 animate-pulse"
                      : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                  }`}
                >
                  {isOverdue ? (
                    <>
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Overdue
                    </>
                  ) : (
                    "Due Today"
                  )}
                </Badge>
              )}
            </div>
          </div>

          {/* Quick Status Update Button */}
          {!isOverlay && (
            <Button
              onClick={(e) => {
                e.stopPropagation()
                handleStatusUpdate(statusConfig.nextStatus)
              }}
              size="sm"
              variant="outline"
              className={`w-full text-xs transition-all duration-200 border-slate-600 hover:border-slate-500 bg-slate-700/50 hover:bg-slate-600 text-slate-200 hover:text-white ${
                task.status === "completed" ? "opacity-75" : ""
              }`}
            >
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusConfig.nextLabel}
            </Button>
          )}

          <div className="flex flex-col space-y-1.5 sm:space-y-2 text-xs text-slate-400">
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">
                <HighlightText text={task.assignee} searchQuery={searchQuery} />
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              <span
                className={isOverdue ? "text-red-400 font-medium" : isDueToday ? "text-orange-400 font-medium" : ""}
              >
                {format(new Date(task.dueDate), "MMM dd, yyyy")}
              </span>
            </div>
            {task.creator && (
              <div className="text-xs text-slate-500">
                Created by{" "}
                <span className="text-slate-400">
                  <HighlightText text={task.creator} searchQuery={searchQuery} />
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <EditTaskDialog task={task} isOpen={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} />
    </>
  )
}

export default TaskCard
