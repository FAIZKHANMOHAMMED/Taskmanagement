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

export interface SearchFilters {
  priority?: "high" | "medium" | "low"
  status?: "todo" | "in-progress" | "completed"
  assignee?: string
  creator?: string
  overdue?: boolean
}
