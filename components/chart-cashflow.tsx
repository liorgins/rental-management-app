"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Expense, Income, Unit } from "@/lib/types"

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

function monthsOfYear(year: number) {
  return Array.from({ length: 12 }).map((_, i) => new Date(year, i, 1))
}

function isActiveInMonth(unit: Unit, d: Date) {
  const start = new Date(unit.contractStart)
  const end = unit.contractEnd ? new Date(unit.contractEnd) : undefined
  const monthStart = new Date(d.getFullYear(), d.getMonth(), 1)
  const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  const started = start <= monthEnd
  const notEnded = !end || end >= monthStart
  return started && notEnded
}

function expenseAmountInMonth(exp: Expense, d: Date) {
  const expDate = new Date(exp.date)
  if (exp.recurrence === "Monthly") return exp.amount
  if (exp.recurrence === "Yearly") {
    return expDate.getMonth() === d.getMonth() ? exp.amount : 0
  }
  // One-time
  return expDate.getFullYear() === d.getFullYear() && expDate.getMonth() === d.getMonth() ? exp.amount : 0
}

function incomeAmountInMonth(inc: Income, d: Date) {
  const incDate = new Date(inc.date)
  if (inc.recurrence === "Monthly") return inc.amount
  if (inc.recurrence === "Yearly") {
    return incDate.getMonth() === d.getMonth() ? inc.amount : 0
  }
  // One-time
  return incDate.getFullYear() === d.getFullYear() && incDate.getMonth() === d.getMonth() ? inc.amount : 0
}

export function computeYearlyStats(year: number, units: Unit[], expenses: Expense[], incomes: Income[] = []) {
  const monthly = monthsOfYear(year).map((d) => {
    const rentalIncome = units.filter((u) => isActiveInMonth(u, d)).reduce((sum, u) => sum + u.monthlyRent, 0)
    const additionalIncomes = incomes
      .filter((i) => i.scope === "Global" || i.scope === "Unit")
      .reduce((sum, i) => sum + incomeAmountInMonth(i, d), 0)
    const totalIncome = rentalIncome + additionalIncomes
    const monthExpenses = expenses
      .filter((e) => e.scope === "Global" || e.scope === "Unit")
      .reduce((sum, e) => sum + expenseAmountInMonth(e, d), 0)
    const net = totalIncome - monthExpenses
    return {
      date: monthKey(d),
      income: totalIncome,
      expenses: monthExpenses,
      net,
    }
  })
  const annualIncome = monthly.reduce((s, m) => s + m.income, 0)
  const annualExpenses = monthly.reduce((s, m) => s + m.expenses, 0)
  const annualNet = annualIncome - annualExpenses
  return { monthly, annualIncome, annualExpenses, annualNet }
}

export function ChartCashflow({ units, expenses, year }: { units: Unit[]; expenses: Expense[]; year: number }) {
  const { monthly } = React.useMemo(() => computeYearlyStats(year, units, expenses), [year, units, expenses])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Cashflow</CardTitle>
        <CardDescription>Income vs expenses for {year}</CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <div className="h-[280px] w-full">
          <AreaChart data={monthly}>
            <defs>
              <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.6} />
                <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" tickMargin={8} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="income" stroke="hsl(var(--primary))" fill="url(#fillIncome)" />
            <Area type="monotone" dataKey="expenses" stroke="hsl(var(--destructive))" fill="url(#fillExpenses)" />
            <Area type="monotone" dataKey="net" stroke="hsl(var(--muted-foreground))" fillOpacity={0} />
          </AreaChart>
        </div>
      </CardContent>
    </Card>
  )
}
