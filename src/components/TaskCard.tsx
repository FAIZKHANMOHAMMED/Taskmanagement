"use client"

import type React from "react"
import { useState } from "react"
import { Calendar, User, MoreHorizontal, Edit, Trash2, ArrowRight, Move, CheckCircle, Clock, Circle, AlertCircle } from 'lucide-react'
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
import { type Task, useTaskStore } from "@/store/taskStore"
import { format } from "date-fns"
import { EditTaskDialog } from "./EditTaskDialog"
import { HighlightText } from "./HighlightText"
import { useIsMobile } from "@/hooks/use-mobile"

interface TaskCardProps {
  task: Task
  isOverlay?: boolean
  searchQuery?: string
  isDragging?: boolean
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, isOverlay = false, searchQuery = "", isDragging = false }) => {
  const { deleteTask, columns, moveTask, getTasksByColumnId, updateTaskStatus, getColumnsByBoardId } = useTaskStore()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const isMobile = useIsMobile()

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
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
    opacity: isDragging ? 0.5 : 1,
  }

  const taskColumn = columns.find((col) => col.id === task.columnId)
  const boardColumns = taskColumn ? getColumnsByBoardId(taskColumn.boardId) : []

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-gradient-to-r from-red-500 to-pink-500 text-white border-red-200 shadow-red-100"
      case "medium":
        return "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-200 shadow-amber-100"
      case "low":
        return "bg-gradient-to-r from-emerald-500 to-green-500 text-white border-green-200 shadow-green-100"
      default:
        return "bg-gradient-to-r from-slate-500 to-gray-500 text-white border-gray-200 shadow-gray-100"
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return {
          icon: CheckCircle,
          color: "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-200",
          label: "Completed",
          nextStatus: "todo" as const,
          nextLabel: "Mark as To Do",
        }
      case "in-progress":
        return {
          icon: Clock,
          color: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-200",
          label: "In Progress",
          nextStatus: "completed" as const,
          nextLabel: "Mark as Completed",
        }
      case "todo":
      default:
        return {
          icon: Circle,
          color: "bg-gradient-to-r from-slate-500 to-gray-500 text-white border-gray-200",
          label: "To Do",
          nextStatus: "in-progress" as const,
          nextLabel: "Start Progress",
        }
    }
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
    if (targetColumnId !== task.columnId) {
      const targetTasks = getTasksByColumnId(targetColumnId)
      moveTask(task.id, task.columnId, targetColumnId, targetTasks.length)
      if (isMobile && "vibrate" in navigator) {
        navigator.vibrate(25)
      }
    }
  }

  const handleStatusUpdate = (newStatus: "todo" | "in-progress" | "completed") => {
    updateTaskStatus(task.id, newStatus)
    if (isMobile && "vibrate" in navigator) {
      navigator.vibrate(25)
    }
  }

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "completed"
  const currentColumn = columns.find((col) => col.id === task.columnId)
  const availableColumns = columns.filter((col) => col.boardId === currentColumn?.boardId && col.id !== task.columnId)
  const statusConfig = getStatusConfig(task.status)
  const StatusIcon = statusConfig.icon

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-white transition-all duration-300 group ${
          isMobile ? "cursor-grab active:cursor-grabbing touch-manipulation" : "cursor-grab active:cursor-grabbing"
        } ${
          isOverlay
            ? "rotate-2 shadow-2xl scale-110 ring-2 ring-blue-400"
            : "hover:shadow-xl hover:-translate-y-2 hover:scale-105"
        } ${isDragging ? "z-50 opacity-50 rotate-2 scale-105" : ""} ${isOverdue ? "border-l-4 border-l-red-400" : ""} ${
          task.status === "completed" ? "border-l-4 border-l-green-400" : ""
        } ${isMobile ? "min-h-[140px]" : ""} backdrop-blur-sm ${searchQuery ? "ring-1 ring-yellow-400/50" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader className={`pb-3 ${isMobile ? "px-4 py-4" : ""}`}>
          <div className="flex items-start justify-between">
            <h4
              className={`font-semibold text-slate-100 leading-tight transition-colors duration-200 ${
                isMobile ? "text-sm" : "text-sm"
              } ${isHovered ? "text-blue-300" : ""} ${task.status === "completed" ? "line-through opacity-75" : ""}`}
            >
              <HighlightText text={task.title} searchQuery={searchQuery} />
            </h4>
            {!isOverlay && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`transition-all duration-200 hover:bg-slate-700 hover:rotate-90 text-slate-300 hover:text-white ${
                      isMobile ? "h-8 w-8 p-0" : "h-6 w-6 p-0"
                    } ${isHovered || isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                  >
                    <MoreHorizontal className={`${isMobile ? "w-4 h-4" : "w-3 h-3"}`} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-slate-800 border-slate-700 text-white shadow-xl animate-in slide-in-from-top-2"
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

                  {boardColumns.length > 1 && (
                    <>
                      {boardColumns
                        .filter((col) => col.id !== task.columnId)
                        .map((column) => (
                          <DropdownMenuItem
                            key={column.id}
                            onClick={() => handleMoveTask(column.id)}
                            className="hover:bg-slate-700 cursor-pointer flex items-center gap-2"
                          >
                            <ArrowRight className="w-4 h-4" />
                            Move to {column.title}
                          </DropdownMenuItem>
                        ))}
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
            <p
              className={`text-slate-300 line-clamp-2 mt-2 transition-colors duration-200 hover:text-slate-200 ${
                isMobile ? "text-xs" : "text-xs"
              } ${task.status === "completed" ? "line-through opacity-60" : ""}`}
            >
              <HighlightText text={task.description} searchQuery={searchQuery} />
            </p>
          )}
        </CardHeader>
        <CardContent className={`pt-0 space-y-3 ${isMobile ? "px-4 pb-4" : ""}`}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Badge
              className={`text-xs px-3 py-1 transition-all duration-200 hover:shadow-lg font-medium ${getPriorityColor(task.priority)}`}
            >
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Badge>

            <div className="flex items-center gap-2">
              <Badge
                className={`text-xs px-3 py-1 transition-all duration-200 hover:shadow-lg font-medium flex items-center gap-1 ${statusConfig.color}`}
              >
                <StatusIcon className="w-3 h-3" />
                {statusConfig.label}
              </Badge>

              {isOverdue && task.status !== "completed" && (
                <span className="text-xs text-red-400 font-medium animate-pulse bg-red-900/20 px-2 py-1 rounded-full">
                  Overdue
                </span>
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

          <div className="space-y-2">
            <div className="flex items-center text-xs text-slate-400 hover:text-slate-300 transition-colors">
              <div className="p-1.5 bg-slate-700 rounded-lg mr-2">
                <User className="w-3 h-3 text-blue-400" />
              </div>
              <span className="truncate">
                <HighlightText text={task.assignee} searchQuery={searchQuery} />
              </span>
            </div>
            <div
              className={`flex items-center text-xs transition-colors ${
                isOverdue && task.status !== "completed" ? "text-red-400" : "text-slate-400 hover:text-slate-300"
              }`}
            >
              <div className="p-1.5 bg-slate-700 rounded-lg mr-2">
                <Calendar className="w-3 h-3 text-emerald-400" />
              </div>
              <span>{format(new Date(task.dueDate), "MMM dd")}</span>
            </div>
          </div>

          <div className="text-xs text-slate-500 border-t border-slate-700 pt-3 transition-colors hover:text-slate-400">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mr-2"></div>
              Created by <HighlightText text={task.creator} searchQuery={searchQuery} className="ml-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {!isOverlay && (
        <EditTaskDialog task={task} isOpen={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} />
      )}
    </>
  )
}
