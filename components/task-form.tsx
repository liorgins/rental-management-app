"use client"

import { Button } from "@/components/ui/button"
import { DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useCreateTask, useUpdateTask } from "@/hooks/use-tasks"
import { useUnits } from "@/hooks/use-units"
import type { Task, TaskCategory, TaskPriority } from "@/lib/types"
import { Calendar, Clock, Plus, X } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"

interface TaskFormProps {
  task?: Task
  onSuccess?: () => void
  onCancel?: () => void
}

interface TaskFormData {
  title: string
  description: string
  category: TaskCategory
  priority: TaskPriority
  scope: "Global" | "Unit"
  unitId?: string
  dueDate: string
  notes: string
  reminderDays: number[]
}

const taskCategories: TaskCategory[] = [
  "Maintenance",
  "Inspection",
  "Repair",
  "Administrative",
  "Legal",
  "Financial",
  "Other",
]

const taskPriorities: TaskPriority[] = ["Low", "Medium", "High", "Urgent"]

// Priority colors are defined in the parent component where they're used

export function TaskForm({ task, onSuccess, onCancel }: TaskFormProps) {
  const { data: units = [] } = useUnits()
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const [reminderDays, setReminderDays] = useState<number[]>(
    task?.reminders.map(
      (r) =>
        r.customDays ||
        (r.period === "1_day" ? 1 : r.period === "2_days" ? 2 : 7)
    ) || [1]
  )

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TaskFormData>({
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      category: task?.category || "Maintenance",
      priority: task?.priority || "Medium",
      scope: task?.scope || "Global",
      unitId: task?.unitId || "",
      dueDate: task?.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : "",
      notes: task?.notes || "",
      reminderDays,
    },
  })

  const watchScope = watch("scope")

  const onSubmit = async (data: TaskFormData) => {
    try {
      const { reminderDays: _, ...formData } = data
      const taskData = {
        ...formData,
        status: "Pending" as const,
        reminders: reminderDays.map((days, _index) => {
          const dueDate = new Date(data.dueDate)
          const scheduledDate = new Date(dueDate)
          scheduledDate.setDate(scheduledDate.getDate() - days)

          return {
            id: crypto.randomUUID(),
            period: "custom" as const,
            customDays: days,
            notificationSent: false,
            scheduledFor: scheduledDate.toISOString(),
          }
        }),
        unitId: data.scope === "Unit" ? data.unitId : undefined,
      }

      if (task) {
        await updateTask.mutateAsync({
          id: task.id,
          updates: taskData,
        })
      } else {
        await createTask.mutateAsync(taskData)
      }

      onSuccess?.()
    } catch (error) {
      console.error("Error saving task:", error)
    }
  }

  const addReminderDay = () => {
    setReminderDays([...reminderDays, 1])
  }

  const removeReminderDay = (index: number) => {
    setReminderDays(reminderDays.filter((_, i) => i !== index))
  }

  const updateReminderDay = (index: number, days: number) => {
    const newReminders = [...reminderDays]
    newReminders[index] = days
    setReminderDays(newReminders)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {task ? "Edit Task" : "Create New Task"}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
        {/* Basic Information */}
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              {...register("title", { required: "Title is required" })}
              placeholder="Enter task title"
            />
            {errors.title && (
              <p className="text-sm text-rose-600 mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe the task details"
              rows={3}
            />
          </div>
        </div>

        {/* Category and Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              onValueChange={(value) =>
                setValue("category", value as TaskCategory)
              }
              defaultValue={task?.category || "Maintenance"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {taskCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="priority">Priority *</Label>
            <Select
              onValueChange={(value) =>
                setValue("priority", value as TaskPriority)
              }
              defaultValue={task?.priority || "Medium"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {taskPriorities.map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {priority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Scope and Unit */}
        <div className="space-y-4">
          <div>
            <Label>Scope *</Label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="Global"
                  {...register("scope")}
                  className="text-blue-600"
                />
                <span>Global</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="Unit"
                  {...register("scope")}
                  className="text-blue-600"
                />
                <span>Specific Unit</span>
              </label>
            </div>
          </div>

          {watchScope === "Unit" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="unitId">Unit *</Label>
              <Select
                onValueChange={(value) => setValue("unitId", value)}
                defaultValue={task?.unitId || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name} - {unit.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Due Date */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="dueDate">Due Date *</Label>
          <Input
            id="dueDate"
            type="date"
            {...register("dueDate", { required: "Due date is required" })}
          />
          {errors.dueDate && (
            <p className="text-sm text-rose-600 mt-1">
              {errors.dueDate.message}
            </p>
          )}
        </div>

        {/* Reminders */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Reminders</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addReminderDay}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Reminder
            </Button>
          </div>

          {reminderDays.map((days, index) => (
            <div key={index} className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-red-500" />
              <Input
                type="number"
                min="1"
                max="30"
                value={days}
                onChange={(e) =>
                  updateReminderDay(index, parseInt(e.target.value) || 1)
                }
                className="w-20"
              />
              <span className="text-sm text-gray-600">
                day{days !== 1 ? "s" : ""} before due date
              </span>
              {reminderDays.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeReminderDay(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            {...register("notes")}
            placeholder="Additional notes or instructions"
            rows={2}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button
            type="submit"
            disabled={createTask.isPending || updateTask.isPending}
          >
            {createTask.isPending || updateTask.isPending
              ? "Saving..."
              : task
              ? "Update Task"
              : "Create Task"}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </>
  )
}
