import { createTask, getTasks } from "@/lib/kv-service"
import type { Task, TaskReminder } from "@/lib/types"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const tasks = await getTasks()
    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (
      !body.title ||
      !body.category ||
      !body.priority ||
      !body.scope ||
      !body.dueDate
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: title, category, priority, scope, dueDate",
        },
        { status: 400 }
      )
    }

    // Validate scope and unitId
    if (body.scope === "Unit" && !body.unitId) {
      return NextResponse.json(
        { error: "unitId is required when scope is Unit" },
        { status: 400 }
      )
    }

    // Generate reminders based on due date
    const reminders: TaskReminder[] = []
    const dueDate = new Date(body.dueDate)

    // Add default reminders if specified
    if (body.reminderDays && Array.isArray(body.reminderDays)) {
      body.reminderDays.forEach((days: number, index: number) => {
        const reminderDate = new Date(dueDate)
        reminderDate.setDate(reminderDate.getDate() - days)

        reminders.push({
          id: `reminder-${Date.now()}-${index}`,
          period: days === 1 ? "1_day" : days === 2 ? "2_days" : "custom",
          customDays: days > 2 ? days : undefined,
          notificationSent: false,
          scheduledFor: reminderDate.toISOString(),
        })
      })
    }

    const task: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: body.title,
      description: body.description || "",
      category: body.category,
      priority: body.priority,
      status: "Pending",
      scope: body.scope,
      unitId: body.unitId,
      dueDate: body.dueDate,
      createdDate: new Date().toISOString(),
      reminders,
      notes: body.notes || "",
    }

    const createdTask = await createTask(task)
    return NextResponse.json(createdTask, { status: 201 })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    )
  }
}
