"use client"

import * as React from "react"
import { notFound } from "next/navigation"
import { IconCalendar, IconMail, IconMapPin, IconPhone, IconWallet } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ExpensesForm } from "@/components/expenses-form"
import { initLocalData, loadExpenses, saveExpenses } from "@/lib/storage"
import { sampleUnits } from "@/lib/sample-data"
import type { Expense } from "@/lib/types"

export default function DashboardUnitClient({ id }: { id: string }) {
  const [expenses, setExpenses] = React.useState<Expense[]>([])
  const unit = sampleUnits.find((u) => u.id === id)

  React.useEffect(() => {
    initLocalData()
    setExpenses(loadExpenses())
  }, [])

  if (!unit) return notFound()

  const unitExpenses = React.useMemo(
    () => expenses.filter((e) => e.scope === "Unit" && e.unitId === unit.id),
    [expenses, unit.id],
  )
  const totalUnitExpensesYear = React.useMemo(() => {
    const y = new Date().getFullYear()
    return unitExpenses.reduce((s, e) => {
      const d = new Date(e.date)
      if (e.recurrence === "Monthly") return s + e.amount * 12
      if (e.recurrence === "Yearly") return s + e.amount
      return s + (d.getFullYear() === y ? e.amount : 0)
    }, 0)
  }, [unitExpenses])

  function handleAddExpense(exp: Expense) {
    const next = [exp, ...expenses]
    setExpenses(next)
    saveExpenses(next)
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {unit.name} <Badge variant="outline">{unit.property}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <IconMapPin className="size-4" />
                {unit.address} ({unit.location})
              </span>
              <span className="flex items-center gap-2">
                <IconWallet className="size-4" />${unit.monthlyRent.toLocaleString()} monthly rent
              </span>
              <span className="flex items-center gap-2">
                <IconCalendar className="size-4" />
                Start {new Date(unit.contractStart).toLocaleDateString()}
                {unit.contractEnd ? ` • Ends ${new Date(unit.contractEnd).toLocaleDateString()}` : " • Open-ended"}
              </span>
            </div>
            <Separator />
            <div className="grid gap-2">
              <div className="font-medium">Tenant</div>
              <div className="grid gap-1 text-sm">
                <div>{unit.tenant.name}</div>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                  {unit.tenant.phone && (
                    <a className="flex items-center gap-1 hover:underline" href={`tel:${unit.tenant.phone}`}>
                      <IconPhone className="size-4" />
                      {unit.tenant.phone}
                    </a>
                  )}
                  {unit.tenant.email && (
                    <a className="flex items-center gap-1 hover:underline" href={`mailto:${unit.tenant.email}`}>
                      <IconMail className="size-4" />
                      {unit.tenant.email}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Unit Financials</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Annual Rent</div>
              <div className="font-semibold">${(unit.monthlyRent * 12).toLocaleString()}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Annual Expenses</div>
              <div className="font-semibold">${totalUnitExpensesYear.toLocaleString()}</div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Net (Unit)</div>
              <div className="font-semibold">${(unit.monthlyRent * 12 - totalUnitExpensesYear).toLocaleString()}</div>
            </div>
            <div className="pt-2">
              <ExpensesForm units={sampleUnits} defaultUnitId={unit.id} onAdd={handleAddExpense} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expenses for {unit.name}</CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Recurrence</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unitExpenses.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{e.title}</TableCell>
                    <TableCell>{e.category}</TableCell>
                    <TableCell>{e.recurrence}</TableCell>
                    <TableCell>{new Date(e.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">${e.amount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                {unitExpenses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No expenses yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button asChild variant="outline" size="sm">
          <a href="/dashboard">Back to Dashboard</a>
        </Button>
      </div>
    </div>
  )
}
