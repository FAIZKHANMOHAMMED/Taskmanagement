"use client"

import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import type React from "react"
import { useState } from "react"
import { Search, X, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

export interface SearchFilters {
  priority?: "high" | "medium" | "low"
  status?: "todo" | "in-progress" | "completed"
  assignee?: string
  creator?: string
  overdue?: boolean
}

interface SearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  availableAssignees: string[]
  availableCreators: string[]
  resultsCount?: number
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  availableAssignees,
  availableCreators,
  resultsCount,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const activeFiltersCount = Object.values(filters).filter(Boolean).length

  const clearSearch = () => {
    onSearchChange("")
    onFiltersChange({})
  }

  const removeFilter = (filterKey: keyof SearchFilters) => {
    const newFilters = { ...filters }
    delete newFilters[filterKey]
    onFiltersChange(newFilters)
  }

  const hasActiveSearch = searchQuery.length > 0 || activeFiltersCount > 0

  return (
    <div className="space-y-3">
      <div className="relative flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search tasks and columns..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            className="pl-10 pr-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500"
          />
          {hasActiveSearch && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-slate-400 hover:text-white hover:bg-slate-600"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="relative border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-blue-500 text-white">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700 text-white">
            <DropdownMenuLabel className="text-slate-300">Filter by Priority</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  priority: filters.priority === "high" ? undefined : "high",
                })
              }
              className="hover:bg-slate-700 focus:bg-slate-700"
            >
              <div className="flex items-center justify-between w-full">
                <span>High Priority</span>
                {filters.priority === "high" && <Badge className="bg-red-500 text-white">✓</Badge>}
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  priority: filters.priority === "medium" ? undefined : "medium",
                })
              }
              className="hover:bg-slate-700 focus:bg-slate-700"
            >
              <div className="flex items-center justify-between w-full">
                <span>Medium Priority</span>
                {filters.priority === "medium" && <Badge className="bg-amber-500 text-white">✓</Badge>}
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  priority: filters.priority === "low" ? undefined : "low",
                })
              }
              className="hover:bg-slate-700 focus:bg-slate-700"
            >
              <div className="flex items-center justify-between w-full">
                <span>Low Priority</span>
                {filters.priority === "low" && <Badge className="bg-green-500 text-white">✓</Badge>}
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuLabel className="text-slate-300">Filter by Status</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  status: filters.status === "todo" ? undefined : "todo",
                })
              }
              className="hover:bg-slate-700 focus:bg-slate-700"
            >
              <div className="flex items-center justify-between w-full">
                <span>To Do</span>
                {filters.status === "todo" && <Badge className="bg-gray-500 text-white">✓</Badge>}
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  status: filters.status === "in-progress" ? undefined : "in-progress",
                })
              }
              className="hover:bg-slate-700 focus:bg-slate-700"
            >
              <div className="flex items-center justify-between w-full">
                <span>In Progress</span>
                {filters.status === "in-progress" && <Badge className="bg-blue-500 text-white">✓</Badge>}
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  status: filters.status === "completed" ? undefined : "completed",
                })
              }
              className="hover:bg-slate-700 focus:bg-slate-700"
            >
              <div className="flex items-center justify-between w-full">
                <span>Completed</span>
                {filters.status === "completed" && <Badge className="bg-green-500 text-white">✓</Badge>}
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuLabel className="text-slate-300">Filter by Status</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  overdue: !filters.overdue,
                })
              }
              className="hover:bg-slate-700 focus:bg-slate-700"
            >
              <div className="flex items-center justify-between w-full">
                <span>Overdue Tasks</span>
                {filters.overdue && <Badge className="bg-red-500 text-white">✓</Badge>}
              </div>
            </DropdownMenuItem>

            {availableAssignees.length > 0 && (
              <>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuLabel className="text-slate-300">Filter by Assignee</DropdownMenuLabel>
                {availableAssignees.slice(0, 5).map((assignee) => (
                  <DropdownMenuItem
                    key={assignee}
                    onClick={() =>
                      onFiltersChange({
                        ...filters,
                        assignee: filters.assignee === assignee ? undefined : assignee,
                      })
                    }
                    className="hover:bg-slate-700 focus:bg-slate-700"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate">{assignee}</span>
                      {filters.assignee === assignee && <Badge className="bg-blue-500 text-white">✓</Badge>}
                    </div>
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.priority && (
            <Badge
              variant="secondary"
              className="bg-slate-700 text-slate-200 hover:bg-slate-600 cursor-pointer"
              onClick={() => removeFilter("priority")}
            >
              Priority: {filters.priority}
              <X className="w-3 h-3 ml-1" />
            </Badge>
          )}
          {filters.status && (
            <Badge
              variant="secondary"
              className="bg-slate-700 text-slate-200 hover:bg-slate-600 cursor-pointer"
              onClick={() => removeFilter("status")}
            >
              Status:{" "}
              {filters.status === "in-progress" ? "In Progress" : filters.status === "todo" ? "To Do" : "Completed"}
              <X className="w-3 h-3 ml-1" />
            </Badge>
          )}
          {filters.assignee && (
            <Badge
              variant="secondary"
              className="bg-slate-700 text-slate-200 hover:bg-slate-600 cursor-pointer"
              onClick={() => removeFilter("assignee")}
            >
              Assignee: {filters.assignee}
              <X className="w-3 h-3 ml-1" />
            </Badge>
          )}
          {filters.creator && (
            <Badge
              variant="secondary"
              className="bg-slate-700 text-slate-200 hover:bg-slate-600 cursor-pointer"
              onClick={() => removeFilter("creator")}
            >
              Creator: {filters.creator}
              <X className="w-3 h-3 ml-1" />
            </Badge>
          )}
          {filters.overdue && (
            <Badge
              variant="secondary"
              className="bg-red-700 text-red-200 hover:bg-red-600 cursor-pointer"
              onClick={() => removeFilter("overdue")}
            >
              Overdue
              <X className="w-3 h-3 ml-1" />
            </Badge>
          )}
        </div>
      )}

      {/* Results Count */}
      {hasActiveSearch && typeof resultsCount === "number" && (
        <div className="text-sm text-slate-400">
          {resultsCount === 0 ? "No results found" : `${resultsCount} result${resultsCount !== 1 ? "s" : ""} found`}
        </div>
      )}
    </div>
  )
}
