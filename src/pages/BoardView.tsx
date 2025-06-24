"use client"

import type React from "react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { Plus, Calendar, User, Trash2, Zap, Users, Target, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useTaskStore } from "@/store/taskStore"
import { format } from "date-fns"

const BoardView = () => {
  const { boards, addBoard, deleteBoard } = useTaskStore()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newBoard, setNewBoard] = useState({
    title: "",
    description: "",
    createdBy: "",
  })

  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault()
    if (newBoard.title.trim() && newBoard.createdBy.trim()) {
      addBoard({
        title: newBoard.title.trim(),
        description: newBoard.description.trim(),
        createdBy: newBoard.createdBy.trim(),
      })
      setNewBoard({ title: "", description: "", createdBy: "" })
      setIsCreateDialogOpen(false)
    }
  }

  const handleDeleteBoard = (boardId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (window.confirm("Are you sure you want to delete this board? This will also delete all columns and tasks.")) {
      deleteBoard(boardId)
    }
  }

  const stats = [
    {
      title: "Total Boards",
      value: boards.length,
      icon: Target,
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-gradient-to-br from-blue-900/20 to-cyan-900/20",
      iconColor: "text-blue-400",
    },
    {
      title: "Active Projects",
      value: boards.length,
      icon: Zap,
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-gradient-to-br from-purple-900/20 to-pink-900/20",
      iconColor: "text-purple-400",
    },
    {
      title: "Team Members",
      value: new Set(boards.map((b) => b.createdBy)).size,
      icon: Users,
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-gradient-to-br from-green-900/20 to-emerald-900/20",
      iconColor: "text-green-400",
    },
    {
      title: "Productivity",
      value: "98%",
      icon: TrendingUp,
      color: "from-orange-500 to-red-600",
      bgColor: "bg-gradient-to-br from-orange-900/20 to-red-900/20",
      iconColor: "text-orange-400",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="text-center space-y-4 sm:space-y-6 animate-in fade-in-0 slide-in-from-bottom-4">
            <div className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full bg-blue-900/30 text-blue-300 text-xs sm:text-sm font-medium animate-pulse border border-blue-700/30">
              ✨ Welcome to TaskBoard Pro
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-slate-100 via-blue-300 to-purple-300 bg-clip-text text-transparent leading-tight">
              Organize Your Work
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed px-4">
              Collaborate efficiently with your team using visual task boards. Create, manage, and track progress with
              powerful drag-and-drop functionality.
            </p>
            <div className="flex justify-center px-4">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 sm:px-8 py-3 text-sm sm:text-base lg:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto">
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Create Your First Board
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md mx-4 animate-in fade-in-0 zoom-in-95 bg-slate-800 border-slate-700 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      Create New Board
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateBoard} className="space-y-4 sm:space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-medium text-slate-300">
                        Board Title
                      </Label>
                      <Input
                        id="title"
                        value={newBoard.title}
                        onChange={(e) => setNewBoard({ ...newBoard, title: e.target.value })}
                        placeholder="Enter board title"
                        required
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium text-slate-300">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={newBoard.description}
                        onChange={(e) => setNewBoard({ ...newBoard, description: e.target.value })}
                        placeholder="Enter board description (optional)"
                        rows={3}
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="createdBy" className="text-sm font-medium text-slate-300">
                        Created By
                      </Label>
                      <Input
                        id="createdBy"
                        value={newBoard.createdBy}
                        onChange={(e) => setNewBoard({ ...newBoard, createdBy: e.target.value })}
                        placeholder="Your name"
                        required
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                      />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                        className="hover:bg-slate-700 transition-colors border-slate-600 text-slate-300 hover:text-white"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                      >
                        Create Board
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-4 sm:-mt-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-12">
          {stats.map((stat, index) => (
            <Card
              key={stat.title}
              className={`${stat.bgColor} border-slate-700 bg-slate-800/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-in slide-in-from-bottom-4`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div className="text-center sm:text-left">
                    <p className="text-xs sm:text-sm font-medium text-slate-400 mb-1">{stat.title}</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-100">{stat.value}</p>
                  </div>
                  <div className={`p-2 sm:p-3 rounded-lg ${stat.bgColor} border border-slate-600`}>
                    <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Boards Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">Your Boards</h2>
            <p className="text-sm sm:text-base text-slate-400">Manage and organize your team's work</p>
          </div>

          {boards.length > 0 && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  New Board
                </Button>
              </DialogTrigger>
            </Dialog>
          )}
        </div>

        {boards.length === 0 ? (
          <div className="text-center py-12 sm:py-20 animate-in fade-in-0 zoom-in-95 px-4">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 sm:p-12 max-w-lg mx-auto border border-slate-700">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center border border-slate-600">
                <Target className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-100 mb-3">No boards yet</h3>
              <p className="text-sm sm:text-base text-slate-400 mb-6 sm:mb-8 leading-relaxed">
                Create your first board to start organizing your tasks and collaborating with your team effectively.
              </p>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 sm:px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Create Your First Board
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {boards.map((board, index) => (
              <Link key={board.id} to={`/board/${board.id}`} className="group">
                <Card
                  className="h-full bg-slate-800/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 border border-slate-700 animate-in slide-in-from-bottom-4 hover:scale-105"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="pb-3 sm:pb-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1 min-w-0">
                        <CardTitle className="text-lg sm:text-xl font-bold text-slate-100 group-hover:text-blue-400 transition-colors duration-200 truncate">
                          {board.title}
                        </CardTitle>
                        <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full group-hover:w-16 sm:group-hover:w-20 transition-all duration-300"></div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteBoard(board.id, e)}
                        className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg shrink-0 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    {board.description && (
                      <CardDescription className="text-sm sm:text-base text-slate-400 line-clamp-2 leading-relaxed">
                        {board.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm space-y-2 sm:space-y-0">
                      <div className="flex items-center space-x-2 text-slate-400 hover:text-slate-300 transition-colors">
                        <div className="p-1.5 bg-slate-700 rounded-lg">
                          <User className="w-3 h-3 text-blue-400" />
                        </div>
                        <span className="font-medium truncate">{board.createdBy}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-400 hover:text-slate-300 transition-colors">
                        <div className="p-1.5 bg-slate-700 rounded-lg">
                          <Calendar className="w-3 h-3 text-green-400" />
                        </div>
                        <span>{format(new Date(board.createdAt), "MMM dd")}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-medium">CLICK TO OPEN</span>
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                          <Plus className="w-3 h-3 text-white rotate-0 group-hover:rotate-90 transition-transform duration-200" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default BoardView
