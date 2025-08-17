"use client"

import { IconFilter, IconX } from "@tabler/icons-react"
import {
  Coins,
  Home,
  Info,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from "lucide-react"
import * as React from "react"

import { computeYearlyStats } from "@/components/chart-cashflow"
import { RecentTasks } from "@/components/recent-tasks"
import { RecentTransactions } from "@/components/recent-transactions"
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { UnitsTable } from "@/components/units-table"
import { useExpenses } from "@/hooks/use-expenses"
import { useIncomes } from "@/hooks/use-income"
import { useUnits } from "@/hooks/use-units"
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
    () =>
      computeYearlyStats(
        selectedYear,
        filteredUnits,
        filteredExpenses,
        filteredIncomes
      ),
    [selectedYear, filteredUnits, filteredExpenses, filteredIncomes]
  )

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
      {/* Compact Filters */}
      <div className="px-4 lg:px-6">
        <div className="flex flex-wrap items-center gap-4 rounded-lg border px-4 py-2 bg-card">
          <div className="flex flex-wrap items-center gap-2">
            <IconFilter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            <Label className="text-xs text-muted-foreground">Unit:</Label>
            <Select value={selectedUnit} onValueChange={setSelectedUnit}>
              <SelectTrigger className="h-7 w-32 border-0 bg-transparent p-1 text-xs">
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

          <div className="flex flex-wrap items-center gap-1">
            <Label className="text-xs text-muted-foreground">Year:</Label>
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger className="h-7 w-20 border-0 bg-transparent p-1 text-xs">
                <SelectValue placeholder="Year" />
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

          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="ml-auto h-7 px-2 text-xs"
          >
            <IconX className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Expected Yearly Revenue"
            value={formatNIS(annualNet)}
            calculation="Annual Income - Annual Expenses"
            icon={TrendingUp}
          />
          <StatCard
            title="Gross Annual Income"
            value={formatNIS(annualIncome)}
            calculation="Total rent + recurring incomes × 12 + one-time incomes"
            icon={Coins}
          />
          <StatCard
            title="Annual Expenses"
            value={formatNIS(annualExpenses)}
            calculation="Recurring expenses × 12 + one-time expenses"
            icon={TrendingDown}
          />
          <StatCard
            title="Total Monthly Rent"
            value={formatNIS(monthlyRent)}
            calculation={`Sum of monthly rent from ${
              filteredUnits.length
            } unit${filteredUnits.length !== 1 ? "s" : ""}`}
            icon={Home}
          />
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <RecentTransactions
            expenses={filteredExpenses}
            incomes={filteredIncomes}
            units={units}
          />
          <RecentTasks />
        </div>
      </div>
      <div className="px-4 lg:px-6">
        <UnitsTable units={filteredUnits} />
      </div>

      {/* <Separator className="mx-4 lg:mx-6" /> */}
    </div>
  )
}

function StatCard({
  title,
  value,
  calculation,
  icon: Icon,
}: {
  title: string
  value: string
  calculation: string
  icon: LucideIcon
}) {
  return (
    <Card className="@container/card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex flex-wrap items-center gap-2">
          <Icon className="h-4 w-4" />
          {title}
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="ml-auto">
                <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{calculation}</p>
            </TooltipContent>
          </Tooltip>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tabular-nums @[250px]/card:text-4xl">
          {value}
        </div>
      </CardContent>
    </Card>
  )
}
