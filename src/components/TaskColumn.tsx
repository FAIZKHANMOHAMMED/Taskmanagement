"use client"

import type React from "react"
import { useState } from "react"
import { Plus, MoreHorizontal, Trash2, Edit } from 'lucide-react'
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTaskStore, type Column, type Task } from "@/store/taskStore"
import { TaskCard } from "./TaskCard"
import { HighlightText } from "./HighlightText"

interface TaskColumnProps {
  column: Column
  tasks: Task[]
  onDeleteColumn: (columnId: string) => void
  onCreateTask: (columnId: string) => void
  searchQuery?: string
  isFiltered?: boolean
}

export const TaskColumn: React.FC<TaskColumnProps> = ({
  column,
  tasks,
  onDeleteColumn,
  onCreateTask,
  searchQuery = "",
  isFiltered = false,
}) => {
  const { updateColumn } = useTaskStore()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editTitle, setEditTitle] = useState(column.title)
  const [isHovered, setIsHovered] = useState(false)

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "column",
      column,
    },
  })

  const handleUpdateColumn = (e: React.FormEvent) => {
    e.preventDefault()
    if (editTitle.trim()) {
      updateColumn(column.id, { title: editTitle.trim() })
      setIsEditDialogOpen(false)
    }
  }

  return (
    <>
      <Card
        ref={setNodeRef}
        className={`w-72 sm:w-80 flex-shrink-0 transition-all duration-300 ease-in-out transform hover:scale-105 ${
          isOver
            ? "bg-gradient-to-br from-slate-700 to-slate-800 border-blue-400 shadow-2xl scale-105 ring-2 ring-blue-400"
            : "bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700"
        } backdrop-blur-sm shadow-xl ${searchQuery && !isFiltered ? "opacity-50" : ""} ${
          searchQuery && isFiltered ? "ring-1 ring-yellow-400/50" : ""
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader className="pb-4 px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex-shrink-0"></div>
              <h3
                className={`font-bold text-slate-100 transition-colors duration-200 truncate text-sm sm:text-base ${
                  isHovered ? "text-blue-300" : ""
                }`}
              >
                <HighlightText text={column.title} searchQuery={searchQuery} />
              </h3>
              <span
                className={`text-xs px-2 py-1 rounded-full transition-all duration-200 shrink-0 font-medium ${
                  tasks.length > 0
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white animate-pulse shadow-lg"
                    : "bg-slate-700 text-slate-300"
                }`}
              >
                {tasks.length}
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`transition-all duration-200 hover:bg-slate-700 hover:rotate-90 shrink-0 h-8 w-8 p-0 text-slate-400 hover:text-white ${
                    isHovered ? "opacity-100" : "opacity-70"
                  }`}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-slate-800 border-slate-700 text-white shadow-xl animate-in slide-in-from-top-2 z-50"
              >
                <DropdownMenuItem
                  onClick={() => setIsEditDialogOpen(true)}
                  className="hover:bg-slate-700 focus:bg-slate-700 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Column
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDeleteColumn(column.id)}
                  className="text-red-400 focus:text-red-300 hover:bg-red-900/20 focus:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Column
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 min-h-[200px] px-4 sm:px-6">
          <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {tasks.map((task, index) => (
                <div
                  key={task.id}
                  className="animate-in slide-in-from-left-1 fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <TaskCard task={task} searchQuery={searchQuery} />
                </div>
              ))}
            </div>
          </SortableContext>

          {tasks.length === 0 && (
            <div className="flex items-center justify-center h-32 text-slate-400 animate-pulse">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center text-xl sm:text-2xl border border-slate-600">
                  📋
                </div>
                <p className="text-xs sm:text-sm font-medium">
                  {searchQuery ? "No matching tasks" : "No tasks yet"}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {searchQuery ? "Try adjusting your search" : "Drag tasks here or create new ones"}
                </p>
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            className="w-full justify-start text-slate-400 hover:text-blue-300 hover:bg-slate-700/50 transition-all duration-200 group border-2 border-dashed border-slate-600 hover:border-blue-400 text-sm py-3"
            onClick={() => onCreateTask(column.id)}
          >
            <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
            Add a task
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md mx-4 animate-in fade-in-0 zoom-in-95 bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-slate-100">Edit Column</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateColumn} className="space-y-4">
            <div>
              <Label htmlFor="editColumnTitle" className="text-slate-300">
                Column Title
              </Label>
              <Input
                id="editColumnTitle"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter column title"
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="hover:bg-slate-700 transition-colors w-full sm:w-auto border-slate-600 text-slate-300 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-colors w-full sm:w-auto"
              >
                Update Column
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
