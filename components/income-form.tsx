"use client"

import { IconPlus } from "@tabler/icons-react"
import * as React from "react"

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
  ExpenseRecurrence,
  ExpenseScope,
  Income,
  IncomeCategory,
  Unit,
} from "@/lib/types"

type Props = {
  units: Unit[]
  defaultUnitId?: string
  prefillData?: Partial<Income>
  onAdd(income: Income): void
}

export function IncomeForm({ units, defaultUnitId, prefillData, onAdd }: Props) {
  const [open, setOpen] = React.useState(false)
  const [scope, setScope] = React.useState<ExpenseScope>(
    prefillData?.scope || (defaultUnitId ? "Unit" : "Global")
  )
  const [category, setCategory] = React.useState<IncomeCategory>(
    prefillData?.category || "Rent"
  )
  const [title, setTitle] = React.useState(prefillData?.title || "")
  const [amount, setAmount] = React.useState<number>(prefillData?.amount || 0)
  const [date, setDate] = React.useState<string>(
    prefillData?.date || new Date().toISOString().slice(0, 10)
  )
  const [recurrence, setRecurrence] = React.useState<ExpenseRecurrence>(
    prefillData?.recurrence || "One-time"
  )
  const [unitId, setUnitId] = React.useState<string | undefined>(
    prefillData?.unitId || defaultUnitId
  )
  const [notes, setNotes] = React.useState(prefillData?.notes || "")

  React.useEffect(() => {
    if (defaultUnitId) {
      setScope("Unit")
      setUnitId(defaultUnitId)
    }
  }, [defaultUnitId])

  React.useEffect(() => {
    if (prefillData) {
      setScope(prefillData.scope || (defaultUnitId ? "Unit" : "Global"))
      setCategory(prefillData.category || "Rent")
      setTitle(prefillData.title || "")
      setAmount(prefillData.amount || 0)
      setDate(prefillData.date || new Date().toISOString().slice(0, 10))
      setRecurrence(prefillData.recurrence || "One-time")
      setUnitId(prefillData.unitId || defaultUnitId)
      setNotes(prefillData.notes || "")
      setOpen(true) // Auto-open when prefilling data
    }
  }, [prefillData, defaultUnitId])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !amount || amount <= 0) return
    if (scope === "Unit" && !unitId) return

    const newIncome: Income = {
      id: `inc-${crypto.randomUUID()}`,
      title,
      amount: Number(amount),
      date,
      category,
      scope,
      unitId: scope === "Unit" ? unitId : undefined,
      recurrence,
      notes: notes || undefined,
    }
    onAdd(newIncome)
    setOpen(false)
    // reset (only if not prefilling data)
    if (!prefillData) {
      setTitle("")
      setAmount(0)
      setDate(new Date().toISOString().slice(0, 10))
      setCategory("Rent")
      setRecurrence("One-time")
      if (!defaultUnitId) setScope("Global")
      setNotes("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default">
          <IconPlus />
          Add Income
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Add Income</DialogTitle>
          <DialogDescription>
            Add a new income. Choose Global for business income, or Unit for
            income specific to a rental unit.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Monthly Rent Payment"
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
                onValueChange={(v) => setCategory(v as IncomeCategory)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rent">Rent</SelectItem>
                  <SelectItem value="Taxes">Taxes</SelectItem>
                  <SelectItem value="Fees">Fees</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
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
            <Button type="submit">Save Income</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
