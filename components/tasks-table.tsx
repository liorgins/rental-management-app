"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { useDeleteTask, useTasks, useUpdateTask } from "@/hooks/use-tasks"
import { useUnits } from "@/hooks/use-units"
import type { Task } from "@/lib/types"
import { format } from "date-fns"
import {
  AlertTriangle,
  Building,
  Calendar,
  CheckCircle,
  Circle,
  Clock,
  Edit,
  Globe,
  Trash2,
} from "lucide-react"
import { useState } from "react"
import { TaskForm } from "./task-form"

const priorityColors = {
  Low: "bg-green-100 text-emerald-800",
  Medium: "bg-yellow-100 text-yellow-800",
  High: "bg-orange-100 text-orange-800",
  Urgent: "bg-rose-100 text-red-500",
}

const statusColors = {
  Pending: "bg-gray-100 text-gray-800",

  Completed: "bg-green-100 text-emerald-800",
}

const categoryColors = {
  Maintenance: "bg-orange-100 text-orange-800",
  Inspection: "bg-purple-100 text-purple-800",
  Repair: "bg-rose-100 text-red-500",
  Administrative: "bg-blue-100 text-blue-800",
  Legal: "bg-indigo-100 text-indigo-800",
  Financial: "bg-green-100 text-emerald-800",
  Other: "bg-gray-100 text-gray-800",
}

interface TasksTableProps {
  unitId?: string
  showUnitColumn?: boolean
}

export function TasksTable({ unitId, showUnitColumn = true }: TasksTableProps) {
  const { data: tasks = [], isLoading } = useTasks()
  const { data: units = [] } = useUnits()
  const deleteTask = useDeleteTask()
  const updateTask = useUpdateTask()

  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)

  // Filter tasks by unit if specified
  const filteredTasks = tasks.filter((task) => {
    if (unitId) {
      return task.scope === "Unit" && task.unitId === unitId
    }
    return true
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
  }

  const handleDelete = async () => {
    if (deletingTask) {
      await deleteTask.mutateAsync(deletingTask.id)
      setDeletingTask(null)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading tasks...</div>
        </CardContent>
      </Card>
    )
  }

  if (filteredTasks.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-500">
            No tasks found. Create your first task to get started.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Tasks
            <Badge variant="outline" className="ml-auto">
              {filteredTasks.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  {showUnitColumn && <TableHead>Scope</TableHead>}
                  <TableHead>Due Date</TableHead>
                  <TableHead>Reminders</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks
                  .sort(
                    (a, b) =>
                      new Date(a.dueDate).getTime() -
                      new Date(b.dueDate).getTime()
                  )
                  .map((task) => (
                    <TableRow
                      key={task.id}
                      className={`
                      ${isOverdue(task) ? "bg-rose-50" : ""}
                      ${isDueSoon(task) ? "bg-yellow-50" : ""}
                    `}
                    >
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusToggle(task)}
                          className="p-1"
                        >
                          {task.status === "Completed" ? (
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
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
                                ? "line-through text-red-500"
                                : ""
                            }`}
                          >
                            {task.title}
                          </span>
                          {task.description && (
                            <span className="text-red-500 mt-1">
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

                      {showUnitColumn && (
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {task.scope === "Global" ? (
                              <Globe className="h-4 w-4 text-red-500" />
                            ) : (
                              <Building className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-sm">
                              {getUnitName(task.unitId)}
                            </span>
                          </div>
                        </TableCell>
                      )}

                      <TableCell>
                        <div className="flex items-center gap-1">
                          {isOverdue(task) && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                          {isDueSoon(task) && !isOverdue(task) && (
                            <Clock className="h-4 w-4 text-red-500" />
                          )}
                          <span
                            className={`text-sm ${
                              isOverdue(task)
                                ? "text-rose-600 font-medium"
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
                            className="p-1 text-rose-600 hover:text-rose-700"
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
        </CardContent>
      </Card>

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
    </>
  )
}
