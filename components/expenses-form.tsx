"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type {
  Expense,
  ExpenseCategory,
  ExpenseRecurrence,
  ExpenseScope,
  Unit,
} from "@/lib/types"
import { IconPlus } from "@tabler/icons-react"
import * as React from "react"

type Props = {
  units: Unit[]
  defaultUnitId?: string
  onAdd(expense: Expense): void
}

export function ExpensesForm({ units, defaultUnitId, onAdd }: Props) {
  const [open, setOpen] = React.useState(false)
  const [scope, setScope] = React.useState<ExpenseScope>(
    defaultUnitId ? "Unit" : "Global"
  )
  const [title, setTitle] = React.useState("")
  const [amount, setAmount] = React.useState<number>(0)
  const [date, setDate] = React.useState<string>(
    new Date().toISOString().slice(0, 10)
  )
  const [category, setCategory] = React.useState<ExpenseCategory>("Repair")
  const [recurrence, setRecurrence] =
    React.useState<ExpenseRecurrence>("One-time")
  const [unitId, setUnitId] = React.useState<string | undefined>(defaultUnitId)
  const [notes, setNotes] = React.useState("")

  React.useEffect(() => {
    if (defaultUnitId) {
      setScope("Unit")
      setUnitId(defaultUnitId)
    }
  }, [defaultUnitId])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !amount || amount <= 0) return
    if (scope === "Unit" && !unitId) return

    const newExpense: Expense = {
      id: `exp-${crypto.randomUUID()}`,
      title,
      amount: Number(amount),
      date,
      category,
      scope,
      unitId: scope === "Unit" ? unitId : undefined,
      recurrence,
      notes: notes || undefined,
    }
    onAdd(newExpense)
    setOpen(false)
    // reset
    setTitle("")
    setAmount(0)
    setDate(new Date().toISOString().slice(0, 10))
    setCategory("Repair")
    setRecurrence("One-time")
    if (!defaultUnitId) setScope("Global")
    setNotes("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <IconPlus />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>
            Add a new expense. Choose Global for taxes/insurance, or Unit for a
            specific rental.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Property Tax"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={amount || ""}
                onChange={(e) => setAmount(Number.parseFloat(e.target.value))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Category</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as ExpenseCategory)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Repair",
                    "Upgrade",
                    "Plumbing",
                    "HVAC",
                    "Renovation",
                    "Insurance",
                    "Tax",
                    "Maintenance",
                    "Other",
                  ].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Scope</Label>
              <Select
                value={scope}
                onValueChange={(v) => setScope(v as ExpenseScope)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Global or Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Global">Global</SelectItem>
                  <SelectItem value="Unit">Unit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {scope === "Unit" && (
              <div className="flex flex-col gap-2">
                <Label>Unit</Label>
                <Select value={unitId} onValueChange={(v) => setUnitId(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label>Recurrence</Label>
              <Select
                value={recurrence}
                onValueChange={(v) => setRecurrence(v as ExpenseRecurrence)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recurrence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="One-time">One-time</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Optional notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="submit">Save Expense</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
