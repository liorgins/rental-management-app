"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Expense, Unit } from "@/lib/types"

export function RecentExpenses({ expenses, units, limit = 6 }: { expenses: Expense[]; units: Unit[]; limit?: number }) {
  const unitMap = new Map(units.map((u) => [u.id, u.name]))
  const recent = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, limit)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Expenses</CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>{e.title}</TableCell>
                  <TableCell>{e.scope === "Global" ? "Global" : unitMap.get(e.unitId || "") || "Unit"}</TableCell>
                  <TableCell>{e.category}</TableCell>
                  <TableCell>{new Date(e.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">${e.amount.toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {recent.length === 0 && (
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
  )
}
