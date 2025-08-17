"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useOverdueTasks, useTasks, useUpcomingTasks } from "@/hooks/use-tasks"
import type { Task } from "@/lib/types"
import { format } from "date-fns/format"
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
} from "lucide-react"
import Link from "next/link"

const priorityColors = {
  Low: "bg-secondary text-secondary-foreground",
  Medium: "bg-secondary text-secondary-foreground",
  High: "bg-secondary text-secondary-foreground",
  Urgent: "bg-secondary text-secondary-foreground",
}

export function RecentTasks() {
  const { data: allTasks = [] } = useTasks()
  const { data: upcomingTasks = [] } = useUpcomingTasks(7)
  const { data: overdueTasks = [] } = useOverdueTasks()

  const pendingTasks = allTasks.filter((task) => task.status === "Pending")

  const recentTasks = [...upcomingTasks, ...overdueTasks]
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    )
    .slice(0, 5)

  const isOverdue = (task: Task) => {
    if (task.status === "Completed") return false
    return new Date(task.dueDate) < new Date()
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-wrap flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-medium flex flex-wrap items-center gap-2">
          <Calendar className="h-4 w-4" />
          Task Overview
        </CardTitle>
        <Button asChild variant="ghost" size="sm">
          <Link href="/tasks" className="flex flex-wrap items-center gap-1">
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {pendingTasks.length}
            </div>
            <div className="text-xs text-gray-600">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {upcomingTasks.length}
            </div>
            <div className="text-xs text-gray-600">Due Soon</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-rose-600">
              {overdueTasks.length}
            </div>
            <div className="text-xs text-gray-600">Overdue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {allTasks.filter((t) => t.status === "Completed").length}
            </div>
            <div className="text-xs text-gray-600">Completed</div>
          </div>
        </div>

        {/* Recent/Upcoming Tasks */}
        {recentTasks.length > 0 ? (
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700 flex flex-wrap items-center gap-2">
              <Clock className="h-4 w-4" />
              Upcoming & Overdue Tasks
            </div>
            <div className="space-y-2">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-wrap items-center justify-between p-3 rounded-lg border border-border bg-muted/50 dark:bg-muted/30"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {isOverdue(task) && (
                        <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      )}
                      {task.status === "Completed" && (
                        <CheckCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      )}
                      <span
                        className={`text-sm font-medium truncate ${
                          task.status === "Completed"
                            ? "line-through text-red-500"
                            : ""
                        }`}
                      >
                        {task.title}
                      </span>
                      <Badge
                        className={`${priorityColors[task.priority]} text-xs`}
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                      <Calendar className="h-3 w-3" />
                      <span
                        className={
                          isOverdue(task) ? "text-rose-600 font-medium" : ""
                        }
                      >
                        Due: {format(new Date(task.dueDate), "MMM d, yyyy")}
                      </span>
                      {task.scope === "Unit" && (
                        <Badge variant="outline" className="text-xs">
                          Unit Task
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-red-500">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No upcoming tasks</p>
            <p className="text-xs">You&apos;re all caught up!</p>
          </div>
        )}

        {overdueTasks.length > 0 && (
          <div className="mt-4 p-3 bg-muted/50 dark:bg-muted/30 border border-border rounded-lg">
            <div className="flex flex-wrap items-center gap-2 text-foreground font-medium text-sm">
              <AlertTriangle className="h-4 w-4" />
              {overdueTasks.length} overdue task
              {overdueTasks.length > 1 ? "s" : ""}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Review and update your overdue tasks to stay on track.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
