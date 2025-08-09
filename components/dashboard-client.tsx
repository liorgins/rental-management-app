"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ChartCashflow, computeYearlyStats } from "@/components/chart-cashflow"
import { ExpensesForm } from "@/components/expenses-form"
import { RecentExpenses } from "@/components/recent-expenses"
import { UnitsTable } from "@/components/units-table"
import { initLocalData, loadExpenses, saveExpenses } from "@/lib/storage"
import { sampleUnits } from "@/lib/sample-data"
import type { Expense } from "@/lib/types"

export default function DashboardClient() {
  const year = new Date().getFullYear()
  const [expenses, setExpenses] = React.useState<Expense[]>([])

  React.useEffect(() => {
    initLocalData()
    setExpenses(loadExpenses())
  }, [])

  const { annualIncome, annualExpenses, annualNet } = React.useMemo(
    () => computeYearlyStats(year, sampleUnits, expenses),
    [year, expenses],
  )

  function handleAddExpense(exp: Expense) {
    const next = [exp, ...expenses]
    setExpenses(next)
    saveExpenses(next)
  }

  const monthlyRent = sampleUnits.reduce((s, u) => s + u.monthlyRent, 0)

  return (
    <div className="flex flex-1 flex-col gap-6 py-6">
      <div className="px-4 lg:px-6">
        <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Expected Yearly Revenue" value={`$${annualNet.toLocaleString()}`} badge="+ net" />
          <StatCard title="Gross Annual Rent" value={`$${annualIncome.toLocaleString()}`} badge="12× monthly" />
          <StatCard title="Annual Expenses" value={`$${annualExpenses.toLocaleString()}`} badge="taxes + expenses" />
          <StatCard
            title="Total Monthly Rent"
            value={`$${monthlyRent.toLocaleString()}`}
            badge={`${sampleUnits.length} units`}
          />
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Manage expenses that affect your yearly revenue</div>
          <ExpensesForm units={sampleUnits} onAdd={handleAddExpense} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 px-4 lg:grid-cols-3 lg:px-6">
        <div className="lg:col-span-2">
          <ChartCashflow year={year} units={sampleUnits} expenses={expenses} />
        </div>
        <div>
          <RecentExpenses expenses={expenses} units={sampleUnits} />
        </div>
      </div>

      <Separator className="mx-4 lg:mx-6" />

      <div className="px-4 lg:px-6">
        <UnitsTable units={sampleUnits} />
      </div>

      <div className="px-4 pb-2 text-xs text-muted-foreground lg:px-6">
        Note: Revenue calculations assume active contracts cover the shown months. Add global items like taxes/insurance
        as Yearly, and utilities/maintenance as Monthly for accurate projections.
      </div>
    </div>
  )
}

function StatCard({ title, value, badge }: { title: string; value: string; badge?: string }) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-end justify-between">
        <div className="text-3xl font-semibold tabular-nums @[250px]/card:text-4xl">{value}</div>
        {badge && (
          <Badge variant="outline" className="ml-2">
            {badge}
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}
