import { NextResponse } from "next/server"

import { getExpenses } from "@/lib/kv-service"

// GET /api/expenses/stats - Get expense statistics
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const yearParam = searchParams.get("year")
    const currentYear = yearParam
      ? parseInt(yearParam)
      : new Date().getFullYear()

    const expenses = await getExpenses()

    const yearlyExpenses = expenses.reduce((total, expense) => {
      const expenseDate = new Date(expense.date)

      if (expense.recurrence === "Monthly") {
        return total + expense.amount * 12
      } else if (expense.recurrence === "Yearly") {
        return total + expense.amount
      } else if (
        expense.recurrence === "One-time" &&
        expenseDate.getFullYear() === currentYear
      ) {
        return total + expense.amount
      }

      return total
    }, 0)

    const monthlyExpenses = expenses
      .filter((e) => e.recurrence === "Monthly")
      .reduce((total, expense) => total + expense.amount, 0)

    const yearlyRecurring = expenses
      .filter((e) => e.recurrence === "Yearly")
      .reduce((total, expense) => total + expense.amount, 0)

    const oneTimeThisYear = expenses
      .filter((e) => {
        const expenseDate = new Date(e.date)
        return (
          e.recurrence === "One-time" &&
          expenseDate.getFullYear() === currentYear
        )
      })
      .reduce((total, expense) => total + expense.amount, 0)

    const stats = {
      totalYearly: yearlyExpenses,
      monthlyRecurring: monthlyExpenses,
      yearlyRecurring,
      oneTimeThisYear,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Failed to fetch expense stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch expense stats" },
      { status: 500 }
    )
  }
}
