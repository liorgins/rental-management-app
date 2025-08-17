"use client"

import {
  IconArrowDown,
  IconArrowUp,
  IconBuilding,
  IconCoins,
  IconReceipt,
  IconTrendingDown,
  IconTrendingUp,
} from "@tabler/icons-react"
import { Receipt } from "lucide-react"

import { ExpensesForm } from "@/components/expenses-form"
import { IncomeForm } from "@/components/income-form"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useCreateExpense } from "@/hooks/use-expenses"
import { useCreateIncome } from "@/hooks/use-income"
import type { Expense, Income, Transaction, Unit } from "@/lib/types"
import { formatNIS } from "@/lib/utils"

interface Props {
  expenses: Expense[]
  incomes: Income[]
  units: Unit[]
}

export function RecentTransactions({ expenses, incomes, units }: Props) {
  // Convert expenses and incomes to transactions

  const createExpenseMutation = useCreateExpense()
  const createIncomeMutation = useCreateIncome()

  function handleAddExpense(exp: Expense) {
    createExpenseMutation.mutate(exp)
  }

  function handleAddIncome(inc: Income) {
    createIncomeMutation.mutate(inc)
  }

  const transactions: Transaction[] = [
    ...expenses.map(
      (expense): Transaction => ({
        id: expense.id,
        title: expense.title,
        amount: -expense.amount, // negative for expenses
        date: expense.date,
        type: "expense",
        category: expense.category,
        scope: expense.scope,
        unitId: expense.unitId,
        recurrence: expense.recurrence,
        notes: expense.notes,
      })
    ),
    ...incomes.map(
      (income): Transaction => ({
        id: income.id,
        title: income.title,
        amount: income.amount, // positive for income
        date: income.date,
        type: "income",
        category: income.category,
        scope: income.scope,
        unitId: income.unitId,
        recurrence: income.recurrence,
        notes: income.notes,
      })
    ),
  ]

  // Sort by date (most recent first)
  transactions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  // Take the most recent 10 transactions
  const recentTransactions = transactions.slice(0, 10)

  const getUnitName = (unitId?: string) => {
    if (!unitId) return null
    const unit = units.find((u) => u.id === unitId)
    return unit?.name || "Unknown Unit"
  }

  const getTransactionIcon = (transaction: Transaction) => {
    if (transaction.type === "income") {
      if (transaction.category === "Taxes") {
        return <IconBuilding className="h-4 w-4 text-emerald-500" />
      }
      return <IconCoins className="h-4 w-4 text-emerald-500" />
    } else {
      return <IconReceipt className="h-4 w-4 text-rose-600" />
    }
  }

  const getAmountDisplay = (amount: number) => {
    const isPositive = amount > 0
    return (
      <div
        className={`flex items-center gap-1 ${
          isPositive ? "text-emerald-500" : "text-rose-500"
        }`}
      >
        {isPositive ? (
          <IconArrowUp className="h-4 w-4" />
        ) : (
          <IconArrowDown className="h-4 w-4" />
        )}
        <span className="font-semibold">{formatNIS(Math.abs(amount))}</span>
      </div>
    )
  }

  // Calculate totals
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0)
  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  )
  const netAmount = totalIncome - totalExpenses

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base font-medium flex flex-wrap items-center gap-2">
            <Receipt className="h-4 w-4" />
            Recent Transactions
            <Badge variant="outline" className="ml-2 sm:ml-0 sm:hidden">
              {recentTransactions.length} items
            </Badge>
          </CardTitle>

          <div className="flex flex-wrap items-center gap-2 justify-end">
            <Badge variant="outline" className="hidden sm:inline-flex">
              {recentTransactions.length} items
            </Badge>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              <IncomeForm units={units} onAdd={handleAddIncome} />
              <ExpensesForm units={units} onAdd={handleAddExpense} />
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-wrap items-center gap-2 rounded-lg border p-3">
            <IconTrendingUp className="h-5 w-5 text-emerald-500" />
            <div>
              <div className="text-sm text-muted-foreground">Total Income</div>
              <div className="font-semibold text-emerald-500">
                {formatNIS(totalIncome)}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 rounded-lg border p-3">
            <IconTrendingDown className="h-5 w-5 text-rose-600" />
            <div>
              <div className="text-sm text-muted-foreground">
                Total Expenses
              </div>
              <div className="font-semibold text-rose-600">
                {formatNIS(totalExpenses)}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 rounded-lg border p-3">
            <IconCoins
              className={`h-5 w-5 ${
                netAmount >= 0 ? "text-emerald-500" : "text-rose-600"
              }`}
            />
            <div>
              <div className="text-sm text-muted-foreground">Net Amount</div>
              <div
                className={`font-semibold ${
                  netAmount >= 0 ? "text-emerald-500" : "text-rose-600"
                }`}
              >
                {formatNIS(netAmount)}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        {recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No transactions yet. Add some income or expenses to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Recurrence</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{getTransactionIcon(transaction)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{transaction.title}</div>
                        {transaction.notes && (
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {transaction.notes}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          transaction.type === "income"
                            ? "default"
                            : "secondary"
                        }
                        className={
                          transaction.type === "income"
                            ? "bg-green-100 text-emerald-800 hover:bg-green-100"
                            : "bg-rose-100 text-rose-500 hover:bg-rose-100"
                        }
                      >
                        {transaction.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getUnitName(transaction.unitId) || (
                        <span className="text-muted-foreground">Global</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{transaction.recurrence}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {getAmountDisplay(transaction.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
