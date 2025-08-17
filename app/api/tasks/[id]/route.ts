import { deleteTask, getTask, updateTask } from "@/lib/kv-service"
import type { TaskReminder } from "@/lib/types"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const task = await getTask(id)

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("Error fetching task:", error)
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // If status is being changed to completed, add completion date and reset notification tracking
    if (body.status === "Completed" && !body.completedDate) {
      body.completedDate = new Date().toISOString()
      // Reset notification tracking when task is completed
      body.overdueNotificationSent = false
      // Reset reminder notifications as well in case task is reopened
      if (body.reminders) {
        body.reminders = body.reminders.map((reminder: TaskReminder) => ({
          ...reminder,
          notificationSent: false,
        }))
      }
    }

    // If status is being changed from completed, remove completion date
    if (body.status !== "Completed" && body.completedDate !== undefined) {
      body.completedDate = undefined
    }

    const updatedTask = await updateTask(id, body)

    if (!updatedTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const success = await deleteTask(id)

    if (!success) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    )
  }
}
