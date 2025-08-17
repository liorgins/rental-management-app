"use client"

import type { Task } from "@/lib/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

async function fetchTasks(): Promise<Task[]> {
  const response = await fetch("/api/tasks")
  if (!response.ok) {
    throw new Error("Failed to fetch tasks")
  }
  return response.json()
}

async function fetchTask(id: string): Promise<Task> {
  const response = await fetch(`/api/tasks/${id}`)
  if (!response.ok) {
    throw new Error("Failed to fetch task")
  }
  return response.json()
}

async function createTask(
  task: Omit<Task, "id" | "createdDate">
): Promise<Task> {
  const response = await fetch("/api/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  })
  if (!response.ok) {
    throw new Error("Failed to create task")
  }
  return response.json()
}

async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const response = await fetch(`/api/tasks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  })
  if (!response.ok) {
    throw new Error("Failed to update task")
  }
  return response.json()
}

async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`/api/tasks/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    throw new Error("Failed to delete task")
  }
}

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
  })
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ["task", id],
    queryFn: () => fetchTask(id),
    enabled: !!id,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) =>
      updateTask(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      queryClient.invalidateQueries({ queryKey: ["task", id] })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    },
  })
}

// Helper hooks for filtering tasks
export function useTasksByUnit(unitId?: string) {
  const { data: tasks = [], ...rest } = useTasks()

  const filteredTasks = tasks.filter((task) => {
    if (!unitId) return task.scope === "Global"
    return task.scope === "Unit" && task.unitId === unitId
  })

  return {
    data: filteredTasks,
    ...rest,
  }
}

export function useTasksByStatus(status: Task["status"]) {
  const { data: tasks = [], ...rest } = useTasks()

  const filteredTasks = tasks.filter((task) => task.status === status)

  return {
    data: filteredTasks,
    ...rest,
  }
}

export function useUpcomingTasks(days: number = 7) {
  const { data: tasks = [], ...rest } = useTasks()

  const now = new Date()
  const futureDate = new Date()
  futureDate.setDate(now.getDate() + days)

  const filteredTasks = tasks.filter((task) => {
    if (task.status === "Completed") {
      return false
    }

    const dueDate = new Date(task.dueDate)
    return dueDate >= now && dueDate <= futureDate
  })

  return {
    data: filteredTasks.sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    ),
    ...rest,
  }
}

export function useOverdueTasks() {
  const { data: tasks = [], ...rest } = useTasks()

  const now = new Date()

  const filteredTasks = tasks.filter((task) => {
    if (task.status === "Completed") {
      return false
    }

    const dueDate = new Date(task.dueDate)
    return dueDate < now
  })

  return {
    data: filteredTasks.sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    ),
    ...rest,
  }
}
