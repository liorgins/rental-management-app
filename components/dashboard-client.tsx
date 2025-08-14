"use client"

import { IconFilter, IconX } from "@tabler/icons-react"
import * as React from "react"

import { computeYearlyStats } from "@/components/chart-cashflow"
import { ExpensesForm } from "@/components/expenses-form"
import { IncomeForm } from "@/components/income-form"
import { RecentTransactions } from "@/components/recent-transactions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { UnitsTable } from "@/components/units-table"
import { useCreateExpense, useExpenses } from "@/hooks/use-expenses"
import { useCreateIncome, useIncomes } from "@/hooks/use-income"
import { useUnits } from "@/hooks/use-units"
import type { Expense, Income } from "@/lib/types"
import { formatNIS } from "@/lib/utils"

export default function DashboardClient() {
  const currentYear = new Date().getFullYear()

  // Filter states
  const [selectedUnit, setSelectedUnit] = React.useState<string>("all")
  const [selectedYear, setSelectedYear] = React.useState<number>(currentYear)

  // Fetch data using react-query hooks
  const { data: units = [], isLoading: unitsLoading } = useUnits()
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses()
  const { data: incomes = [], isLoading: incomesLoading } = useIncomes()
  const createExpenseMutation = useCreateExpense()
  const createIncomeMutation = useCreateIncome()

  // Filter data based on selected filters
  const filteredUnits = React.useMemo(() => {
    if (selectedUnit === "all") return units
    return units.filter((unit) => unit.id === selectedUnit)
  }, [units, selectedUnit])

  const filteredExpenses = React.useMemo(() => {
    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date)
      const expenseYear = expenseDate.getFullYear()

      // Year filter
      if (expense.recurrence === "One-time" && expenseYear !== selectedYear) {
        return false
      }

      // Unit filter
      if (selectedUnit !== "all") {
        if (expense.scope === "Unit" && expense.unitId !== selectedUnit) {
          return false
        }
        if (expense.scope === "Global") {
          return false // Don't include global expenses when filtering by unit
        }
      }

      return true
    })
  }, [expenses, selectedUnit, selectedYear])

  const filteredIncomes = React.useMemo(() => {
    return incomes.filter((income) => {
      const incomeDate = new Date(income.date)
      const incomeYear = incomeDate.getFullYear()

      // Year filter
      if (income.recurrence === "One-time" && incomeYear !== selectedYear) {
        return false
      }

      // Unit filter
      if (selectedUnit !== "all") {
        if (income.scope === "Unit" && income.unitId !== selectedUnit) {
          return false
        }
        if (income.scope === "Global") {
          return false // Don't include global incomes when filtering by unit
        }
      }

      return true
    })
  }, [incomes, selectedUnit, selectedYear])

  const { annualIncome, annualExpenses, annualNet } = React.useMemo(
    () => computeYearlyStats(selectedYear, filteredUnits, filteredExpenses, filteredIncomes),
    [selectedYear, filteredUnits, filteredExpenses, filteredIncomes]
  )

  function handleAddExpense(exp: Expense) {
    createExpenseMutation.mutate(exp)
  }

  function handleAddIncome(inc: Income) {
    createIncomeMutation.mutate(inc)
  }

  const monthlyRent = filteredUnits.reduce((s, u) => s + u.monthlyRent, 0)

  const resetFilters = () => {
    setSelectedUnit("all")
    setSelectedYear(currentYear)
  }

  // Generate year options (current year and past 5 years)
  const yearOptions = React.useMemo(() => {
    const years = []
    for (let i = 0; i < 6; i++) {
      years.push(currentYear - i)
    }
    return years
  }, [currentYear])

  // Show loading state
  if (unitsLoading || expensesLoading || incomesLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 py-6">
        <div className="px-4 lg:px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div className="px-4 lg:px-6">
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 py-6">
      {/* Filters */}
      <div className="px-4 lg:px-6">
        <div className="flex flex-col gap-4 rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <IconFilter className="h-4 w-4" />
            <span className="text-sm font-medium">Dashboard Filters</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="ml-auto h-8"
            >
              <IconX className="h-4 w-4" />
              Reset
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Unit Filter */}
            <div>
              <Label className="text-xs">Unit</Label>
              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="All units" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Units</SelectItem>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year Filter */}
            <div>
              <Label className="text-xs">Year</Label>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Expected Yearly Revenue"
            value={formatNIS(annualNet)}
            badge="net income"
          />
          <StatCard
            title="Gross Annual Income"
            value={formatNIS(annualIncome)}
            badge="rent + incomes"
          />
          <StatCard
            title="Annual Expenses"
            value={formatNIS(annualExpenses)}
            badge="taxes + expenses"
          />
          <StatCard
            title="Total Monthly Rent"
            value={formatNIS(monthlyRent)}
            badge={`${filteredUnits.length} units`}
          />
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Manage your rental property finances
          </div>
          <div className="flex items-center gap-2">
            <IncomeForm units={units} onAdd={handleAddIncome} />
            <ExpensesForm units={units} onAdd={handleAddExpense} />
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <UnitsTable units={filteredUnits} />
      </div>

      {/* <Separator className="mx-4 lg:mx-6" /> */}

      <div className="px-4 lg:px-6">
        <RecentTransactions
          expenses={filteredExpenses}
          incomes={filteredIncomes}
          units={units}
          onAddIncome={handleAddIncome}
        />
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  badge,
}: {
  title: string
  value: string
  badge?: string
}) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-end justify-between">
        <div className="text-3xl font-semibold tabular-nums @[250px]/card:text-4xl">
          {value}
        </div>
        {badge && (
          <Badge variant="outline" className="ml-2">
            {badge}
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}
