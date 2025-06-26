import { create } from "zustand"
import { persist } from "zustand/middleware"
import { boardAPI, taskAPI } from "../services/api"

export interface Task {
  id: string
  title: string
  description: string
  creator: string
  priority: "high" | "medium" | "low"
  status: "todo" | "in-progress" | "completed"
  dueDate: string
  assignee: string
  columnId: string
  position: number
}

export interface Column {
  id: string
  title: string
  boardId: string
  position: number
}

export interface Board {
  id: string
  title: string
  description: string
  createdAt: string
  createdBy: string
}

interface TaskStore {
  boards: Board[]
  columns: Column[]
  tasks: Task[]

  // Board actions
  addBoard: (board: Omit<Board, "id" | "createdAt">) => void
  deleteBoard: (boardId: string) => void
  updateBoard: (boardId: string, updates: Partial<Board>) => void

  // Column actions
  addColumn: (column: Omit<Column, "id">) => void
  deleteColumn: (columnId: string) => void
  updateColumn: (columnId: string, updates: Partial<Column>) => void
  reorderColumns: (boardId: string, sourceIndex: number, destinationIndex: number) => void

  // Task actions
  addTask: (task: Omit<Task, "id">) => void
  deleteTask: (taskId: string) => void
  updateTask: (taskId: string, updates: Partial<Task>) => void
  updateTaskStatus: (taskId: string, status: "todo" | "in-progress" | "completed") => void
  moveTask: (taskId: string, sourceColumnId: string, destinationColumnId: string, destinationIndex: number) => void
  reorderTasks: (columnId: string, sourceIndex: number, destinationIndex: number) => void

  // Getters
  getBoardById: (boardId: string) => Board | undefined
  getColumnsByBoardId: (boardId: string) => Column[]
  getTasksByColumnId: (columnId: string) => Task[]
  getColumnById: (columnId: string) => Column | undefined
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      boards: [],
      columns: [],
      tasks: [],

      addBoard: (boardData) =>
        set((state) => ({
          boards: [
            ...state.boards,
            {
              ...boardData,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      deleteBoard: (boardId) =>
        set((state) => ({
          boards: state.boards.filter((board) => board.id !== boardId),
          columns: state.columns.filter((column) => column.boardId !== boardId),
          tasks: state.tasks.filter(
            (task) => !state.columns.some((col) => col.id === task.columnId && col.boardId === boardId),
          ),
        })),

      updateBoard: (boardId, updates) =>
        set((state) => ({
          boards: state.boards.map((board) => (board.id === boardId ? { ...board, ...updates } : board)),
        })),

      addColumn: (columnData) =>
        set((state) => ({
          columns: [
            ...state.columns,
            {
              ...columnData,
              id: crypto.randomUUID(),
            },
          ],
        })),

      deleteColumn: (columnId) =>
        set((state) => ({
          columns: state.columns.filter((column) => column.id !== columnId),
          tasks: state.tasks.filter((task) => task.columnId !== columnId),
        })),

      updateColumn: (columnId, updates) =>
        set((state) => ({
          columns: state.columns.map((column) => (column.id === columnId ? { ...column, ...updates } : column)),
        })),

      reorderColumns: (boardId, sourceIndex, destinationIndex) =>
        set((state) => {
          const boardColumns = state.columns
            .filter((col) => col.boardId === boardId)
            .sort((a, b) => a.position - b.position)

          const [movedColumn] = boardColumns.splice(sourceIndex, 1)
          boardColumns.splice(destinationIndex, 0, movedColumn)

          const updatedColumns = boardColumns.map((col, index) => ({
            ...col,
            position: index,
          }))

          return {
            columns: [...state.columns.filter((col) => col.boardId !== boardId), ...updatedColumns],
          }
        }),

      addTask: (taskData) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...taskData,
              id: crypto.randomUUID(),
            },
          ],
        })),

      deleteTask: (taskId) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== taskId),
        })),

      updateTask: (taskId, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task)),
        })),

      updateTaskStatus: (taskId, status) =>
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === taskId ? { ...task, status } : task)),
        })),

      moveTask: (taskId, sourceColumnId, destinationColumnId, destinationIndex) =>
        set((state) => {
          const task = state.tasks.find((t) => t.id === taskId)
          if (!task) return state

          const sourceTasks = state.tasks
            .filter((t) => t.columnId === sourceColumnId && t.id !== taskId)
            .sort((a, b) => a.position - b.position)

          const destinationTasks = state.tasks
            .filter((t) => t.columnId === destinationColumnId)
            .sort((a, b) => a.position - b.position)

          if (sourceColumnId === destinationColumnId) {
            destinationTasks.splice(destinationIndex, 0, task)
          } else {
            destinationTasks.splice(destinationIndex, 0, { ...task, columnId: destinationColumnId })
          }

          const updatedSourceTasks = sourceTasks.map((t, index) => ({
            ...t,
            position: index,
          }))

          const updatedDestinationTasks = destinationTasks.map((t, index) => ({
            ...t,
            position: index,
            columnId: destinationColumnId,
          }))

          return {
            tasks: [
              ...state.tasks.filter((t) => t.columnId !== sourceColumnId && t.columnId !== destinationColumnId),
              ...updatedSourceTasks,
              ...updatedDestinationTasks,
            ],
          }
        }),

      reorderTasks: (columnId, sourceIndex, destinationIndex) =>
        set((state) => {
          const columnTasks = state.tasks
            .filter((task) => task.columnId === columnId)
            .sort((a, b) => a.position - b.position)

          const [movedTask] = columnTasks.splice(sourceIndex, 1)
          columnTasks.splice(destinationIndex, 0, movedTask)

          const updatedTasks = columnTasks.map((task, index) => ({
            ...task,
            position: index,
          }))

          return {
            tasks: [...state.tasks.filter((task) => task.columnId !== columnId), ...updatedTasks],
          }
        }),

      getBoardById: (boardId) => get().boards.find((board) => board.id === boardId),

      getColumnsByBoardId: (boardId) =>
        get()
          .columns.filter((column) => column.boardId === boardId)
          .sort((a, b) => a.position - b.position),

      getTasksByColumnId: (columnId) =>
        get()
          .tasks.filter((task) => task.columnId === columnId)
          .sort((a, b) => a.position - b.position),

      getColumnById: (columnId) => get().columns.find((column) => column.id === columnId),
    }),
    {
      name: "taskboard-storage",
      version: 1,
    },
  ),
)
