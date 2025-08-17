"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { IconPlus } from "@tabler/icons-react"
import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

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
import type { Income, Unit } from "@/lib/types"

// Validation schema
const incomeFormSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    amount: z.number().min(0.01, "Amount must be greater than 0"),
    date: z.string().min(1, "Date is required"),
    category: z.enum(["Rent", "Taxes", "Fees", "Other"] as const),
    scope: z.enum(["Global", "Unit"] as const),
    unitId: z.string().optional(),
    recurrence: z.enum(["One-time", "Monthly", "Yearly"] as const),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      // If scope is "Unit", unitId is required
      if (data.scope === "Unit" && !data.unitId) {
        return false
      }
      return true
    },
    {
      message: "Unit is required when scope is Unit",
      path: ["unitId"],
    }
  )

type IncomeFormData = z.infer<typeof incomeFormSchema>

type Props = {
  units: Unit[]
  defaultUnitId?: string
  prefillData?: Partial<Income>
  onAdd(income: Income): void
}

export function IncomeForm({
  units,
  defaultUnitId,
  prefillData,
  onAdd,
}: Props) {
  const [open, setOpen] = React.useState(false)

  // Set up React Hook Form with default values
  const form = useForm<IncomeFormData>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: {
      title: "",
      amount: 0,
      date: new Date().toISOString().slice(0, 10),
      category: "Rent",
      scope: defaultUnitId ? "Unit" : "Global",
      unitId: defaultUnitId,
      recurrence: "One-time",
      notes: "",
    },
  })

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = form
  const scopeValue = watch("scope")

  // Handle prefill data
  React.useEffect(() => {
    if (prefillData) {
      setValue("title", prefillData.title || "")
      setValue("amount", prefillData.amount || 0)
      setValue(
        "date",
        prefillData.date || new Date().toISOString().slice(0, 10)
      )
      setValue("category", prefillData.category || "Rent")
      setValue(
        "scope",
        prefillData.scope || (defaultUnitId ? "Unit" : "Global")
      )
      setValue("unitId", prefillData.unitId || defaultUnitId)
      setValue("recurrence", prefillData.recurrence || "One-time")
      setValue("notes", prefillData.notes || "")
      setOpen(true) // Auto-open when prefilling data
    }
  }, [prefillData, defaultUnitId, setValue])

  // Handle default unit
  React.useEffect(() => {
    if (defaultUnitId) {
      setValue("scope", "Unit")
      setValue("unitId", defaultUnitId)
    }
  }, [defaultUnitId, setValue])

  const onSubmit = (data: IncomeFormData) => {
    const newIncome: Income = {
      id: `inc-${crypto.randomUUID()}`,
      title: data.title,
      amount: data.amount,
      date: data.date,
      category: data.category,
      scope: data.scope,
      unitId: data.scope === "Unit" ? data.unitId : undefined,
      recurrence: data.recurrence,
      notes: data.notes || undefined,
    }
    onAdd(newIncome)
    setOpen(false)

    // Reset form (only if not prefilling data)
    if (!prefillData) {
      reset({
        title: "",
        amount: 0,
        date: new Date().toISOString().slice(0, 10),
        category: "Rent",
        scope: defaultUnitId ? "Unit" : "Global",
        unitId: defaultUnitId,
        recurrence: "One-time",
        notes: "",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default" className="shrink-0">
          <IconPlus />
          <span className="hidden sm:inline">Add Income</span>
          <span className="sm:hidden">Income</span>
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

        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Title</Label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input
                    id="title"
                    placeholder="e.g., Monthly Rent Payment"
                    {...field}
                  />
                )}
              />
              {errors.title && (
                <span className="text-red-500">{errors.title.message}</span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) =>
                      field.onChange(Number.parseFloat(e.target.value) || 0)
                    }
                  />
                )}
              />
              {errors.amount && (
                <span className="text-red-500">{errors.amount.message}</span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="date">Date</Label>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <Input id="date" type="date" {...field} />
                )}
              />
              {errors.date && (
                <span className="text-red-500">{errors.date.message}</span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label>Category</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
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
                )}
              />
              {errors.category && (
                <span className="text-red-500">{errors.category.message}</span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label>Scope</Label>
              <Controller
                name="scope"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Global or Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Global">Global</SelectItem>
                      <SelectItem value="Unit">Unit</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.scope && (
                <span className="text-red-500">{errors.scope.message}</span>
              )}
            </div>
            {scopeValue === "Unit" && (
              <div className="flex flex-col gap-2">
                <Label>Unit</Label>
                <Controller
                  name="unitId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
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
                  )}
                />
                {errors.unitId && (
                  <span className="text-red-500">{errors.unitId.message}</span>
                )}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label>Recurrence</Label>
              <Controller
                name="recurrence"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recurrence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="One-time">One-time</SelectItem>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.recurrence && (
                <span className="text-red-500">
                  {errors.recurrence.message}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <Textarea id="notes" placeholder="Optional notes" {...field} />
              )}
            />
            {errors.notes && (
              <span className="text-red-500">{errors.notes.message}</span>
            )}
          </div>
          <DialogFooter>
            <Button type="submit">Save Income</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
