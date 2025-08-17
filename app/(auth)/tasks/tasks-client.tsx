"use client"

import {
  AlertTriangle,
  Bell,
  Building,
  Calendar,
  CheckCircle,
  Circle,
  Clock,
  Edit,
  Globe,
  Plus,
  Trash2,
} from "lucide-react"
import { useState } from "react"

import { FilterSection, type FilterGroup } from "@/components/filter-section"
import { PushNotificationSettings } from "@/components/push-notification-settings"
import { TaskForm } from "@/components/task-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFilters } from "@/hooks/use-filters"
import { useCreateNotification } from "@/hooks/use-notifications"
import { useDeleteTask, useTasks, useUpdateTask } from "@/hooks/use-tasks"
import { useUnits } from "@/hooks/use-units"
import type { Task } from "@/lib/types"
import { format } from "date-fns/format"

const priorityColors = {
  Low: "bg-green-100 text-green-800",
  Medium: "bg-yellow-100 text-yellow-800",
  High: "bg-orange-100 text-orange-800",
  Urgent: "bg-red-100 text-red-800",
}

const statusColors = {
  Pending: "bg-gray-100 text-gray-800",
  Completed: "bg-green-100 text-green-800",
}

const categoryColors = {
  Maintenance: "bg-orange-100 text-orange-800",
  Inspection: "bg-purple-100 text-purple-800",
  Repair: "bg-red-100 text-red-800",
  Administrative: "bg-blue-100 text-blue-800",
  Legal: "bg-indigo-100 text-indigo-800",
  Financial: "bg-green-100 text-green-800",
  Other: "bg-gray-100 text-gray-800",
}

export function TasksClient() {
  const { data: units = [] } = useUnits()
  const { data: tasks = [], isLoading } = useTasks()
  const deleteTask = useDeleteTask()
  const updateTask = useUpdateTask()
  const createNotification = useCreateNotification()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)
  const [sortBy, setSortBy] = useState<"dueDate" | "priority">("dueDate")
  const [hideCompleted, setHideCompleted] = useState(false)

  // Filter management
  const {
    filters,
    searchTerm,
    activeFilters,
    updateFilter,
    setSearchTerm,
    removeFilter,
    clearAllFilters,
  } = useFilters({
    getDisplayValue: (key, value) => {
      if (key === "unitId") {
        const unit = units.find((u) => u.id === value)
        return unit?.name || "Unknown Unit"
      }
      return value
    },
  })

  // Apply filters and search
  const filteredTasks = tasks.filter((task) => {
    // Hide completed filter
    if (hideCompleted && task.status === "Completed") {
      return false
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      if (
        !task.title.toLowerCase().includes(searchLower) &&
        !task.description?.toLowerCase().includes(searchLower)
      ) {
        return false
      }
    }

    // Other filters
    if (filters.status && task.status !== filters.status) return false
    if (filters.priority && task.priority !== filters.priority) return false
    if (filters.category && task.category !== filters.category) return false
    if (filters.scope && task.scope !== filters.scope) return false
    if (filters.unitId && task.unitId !== filters.unitId) return false

    return true
  })

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "dueDate") {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    } else if (sortBy === "priority") {
      const priorityOrder = { Urgent: 0, High: 1, Medium: 2, Low: 3 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    }
    return 0
  })

  const getUnitName = (unitId?: string) => {
    if (!unitId) return "Global"
    const unit = units.find((u) => u.id === unitId)
    return unit ? unit.name : "Unknown Unit"
  }

  const isOverdue = (task: Task) => {
    if (task.status === "Completed") return false
    return new Date(task.dueDate) < new Date()
  }

  const isDueSoon = (task: Task) => {
    if (task.status === "Completed") return false
    const dueDate = new Date(task.dueDate)
    const threeDaysFromNow = new Date()
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
    return dueDate <= threeDaysFromNow && dueDate >= new Date()
  }

  const handleStatusToggle = async (task: Task) => {
    const newStatus = task.status === "Completed" ? "Pending" : "Completed"
    await updateTask.mutateAsync({
      id: task.id,
      updates: { status: newStatus },
    })

    // Create notification when task is completed
    if (newStatus === "Completed") {
      createNotification.mutate({
        type: "task_completed",
        title: `Task Completed: ${task.title}`,
        message: `Task &quot;${task.title}&quot; has been marked as completed`,
        taskId: task.id,
        unitId: task.unitId,
        isRead: false,
      })
    }
  }

  const handleDelete = async () => {
    if (deletingTask) {
      await deleteTask.mutateAsync(deletingTask.id)
      setDeletingTask(null)
    }
  }

  // Filter configuration
  const filterGroups: FilterGroup[] = [
    {
      title: "Basic Filters",
      fields: [
        {
          key: "status",
          label: "Status",
          type: "select",
          options: [
            { value: "Pending", label: "Pending" },
            { value: "Completed", label: "Completed" },
          ],
        },
        {
          key: "priority",
          label: "Priority",
          type: "select",
          options: [
            { value: "Low", label: "Low" },
            { value: "Medium", label: "Medium" },
            { value: "High", label: "High" },
            { value: "Urgent", label: "Urgent" },
          ],
        },
        {
          key: "category",
          label: "Category",
          type: "select",
          options: [
            { value: "Maintenance", label: "Maintenance" },
            { value: "Inspection", label: "Inspection" },
            { value: "Repair", label: "Repair" },
            { value: "Administrative", label: "Administrative" },
            { value: "Legal", label: "Legal" },
            { value: "Financial", label: "Financial" },
            { value: "Other", label: "Other" },
          ],
        },
        {
          key: "scope",
          label: "Scope",
          type: "select",
          options: [
            { value: "Global", label: "Global" },
            { value: "Unit", label: "Unit" },
          ],
        },
        {
          key: "unitId",
          label: "Unit",
          type: "select",
          options: units.map((unit) => ({
            value: unit.id,
            label: unit.name,
          })),
        },
      ],
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">
            Manage your rental property tasks and reminders
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Simple Tabs */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">All Tasks</TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          {/* Filters */}
          <FilterSection
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search tasks..."
            filterGroups={filterGroups}
            filters={filters}
            activeFilters={activeFilters}
            onFilterChange={updateFilter}
            onRemoveFilter={removeFilter}
            onClearAllFilters={clearAllFilters}
          />

          {/* Sort and Hide Completed Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "dueDate" | "priority")
                }
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="hideCompleted"
                checked={hideCompleted}
                onCheckedChange={(checked) => setHideCompleted(!!checked)}
              />
              <label htmlFor="hideCompleted" className="text-sm font-medium">
                Hide completed
              </label>
            </div>
          </div>

          {/* Tasks Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Tasks
                <Badge variant="outline">{sortedTasks.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading tasks...</div>
              ) : sortedTasks.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  {searchTerm ||
                  Object.keys(filters).length > 0 ||
                  hideCompleted
                    ? "No tasks match your filters."
                    : "No tasks found. Create your first task to get started."}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8"></TableHead>
                        <TableHead>Task</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Scope</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Reminders</TableHead>
                        <TableHead className="w-20">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedTasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusToggle(task)}
                              className="p-1"
                            >
                              {task.status === "Completed" ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <Circle className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                          </TableCell>

                          <TableCell>
                            <div className="flex flex-col">
                              <span
                                className={`font-medium ${
                                  task.status === "Completed"
                                    ? "line-through text-gray-500"
                                    : ""
                                }`}
                              >
                                {task.title}
                              </span>
                              {task.description && (
                                <span className="text-sm text-gray-500 mt-1">
                                  {task.description}
                                </span>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge className={categoryColors[task.category]}>
                              {task.category}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <Badge className={priorityColors[task.priority]}>
                              {task.priority}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <Badge className={statusColors[task.status]}>
                              {task.status}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-1">
                              {task.scope === "Global" ? (
                                <Globe className="h-4 w-4 text-gray-500" />
                              ) : (
                                <Building className="h-4 w-4 text-blue-500" />
                              )}
                              <span className="text-sm">
                                {getUnitName(task.unitId)}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-1">
                              {isOverdue(task) && (
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                              )}
                              {isDueSoon(task) && !isOverdue(task) && (
                                <Clock className="h-4 w-4 text-yellow-500" />
                              )}
                              <span
                                className={`text-sm ${
                                  isOverdue(task)
                                    ? "text-red-600 font-medium"
                                    : isDueSoon(task)
                                    ? "text-yellow-600 font-medium"
                                    : ""
                                }`}
                              >
                                {format(new Date(task.dueDate), "MMM d, yyyy")}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {task.reminders.length}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingTask(task)}
                                className="p-1"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeletingTask(task)}
                                className="p-1 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <PushNotificationSettings />
        </TabsContent>
      </Tabs>

      {/* Create Task Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <TaskForm
            onSuccess={() => setShowCreateForm(false)}
            onCancel={() => setShowCreateForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {editingTask && (
            <TaskForm
              task={editingTask}
              onSuccess={() => setEditingTask(null)}
              onCancel={() => setEditingTask(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Task Dialog */}
      <Dialog open={!!deletingTask} onOpenChange={() => setDeletingTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deletingTask?.title}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingTask(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteTask.isPending}
            >
              {deleteTask.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
