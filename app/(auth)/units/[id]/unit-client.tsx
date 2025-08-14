"use client"

import {
  IconCalendar,
  IconCopy,
  IconEdit,
  IconMail,
  IconMapPin,
  IconPhone,
  IconWallet,
} from "@tabler/icons-react"
import { notFound } from "next/navigation"
import * as React from "react"
import { toast } from "sonner"

import { ExpensesForm } from "@/components/expenses-form"
import { IncomeForm } from "@/components/income-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useCreateExpense, useUnitExpenses } from "@/hooks/use-expenses"
import { useCreateIncome, useUnitIncomes } from "@/hooks/use-income"
import { useUnit, useUnits, useUpdateUnit } from "@/hooks/use-units"
import type { Expense, Income, Unit } from "@/lib/types"
import { formatNIS, isContractEndingSoon } from "@/lib/utils"

export default function DashboardUnitClient({ id }: { id: string }) {
  // Fetch data using react-query hooks
  const { data: unit, isLoading: unitLoading } = useUnit(id)
  const { data: units = [], isLoading: unitsLoading } = useUnits()
  const { data: unitExpenses = [], isLoading: expensesLoading } =
    useUnitExpenses(id)
  const { data: unitIncomes = [], isLoading: incomesLoading } =
    useUnitIncomes(id)
  const createExpenseMutation = useCreateExpense()
  const createIncomeMutation = useCreateIncome()
  const updateUnitMutation = useUpdateUnit()

  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
  const [editFormData, setEditFormData] = React.useState<Partial<Unit>>({})

  // Duplicate states
  const [duplicateIncome, setDuplicateIncome] = React.useState<Income | null>(null)

  const totalUnitExpensesYear = React.useMemo(() => {
    const y = new Date().getFullYear()
    return unitExpenses.reduce((s, e) => {
      const d = new Date(e.date)
      if (e.recurrence === "Monthly") return s + e.amount * 12
      if (e.recurrence === "Yearly") return s + e.amount
      return s + (d.getFullYear() === y ? e.amount : 0)
    }, 0)
  }, [unitExpenses])

  const totalUnitIncomesYear = React.useMemo(() => {
    const y = new Date().getFullYear()
    return unitIncomes.reduce((s, i) => {
      const d = new Date(i.date)
      if (i.recurrence === "Monthly") return s + i.amount * 12
      if (i.recurrence === "Yearly") return s + i.amount
      return s + (d.getFullYear() === y ? i.amount : 0)
    }, 0)
  }, [unitIncomes])

  function handleAddExpense(exp: Expense) {
    createExpenseMutation.mutate(exp)
  }

  function handleAddIncome(inc: Income) {
    createIncomeMutation.mutate(inc)
  }

  const handleDuplicateIncome = (income: Income) => {
    setDuplicateIncome(income)
  }

  function handleEditUnit() {
    if (!unit) return
    setEditFormData({
      name: unit.name,
      property: unit.property,
      location: unit.location,
      address: unit.address,
      monthlyRent: unit.monthlyRent,
      tenant: {
        name: unit.tenant.name,
        phone: unit.tenant.phone || "",
        email: unit.tenant.email || "",
      },
      contractStart: unit.contractStart,
      contractEnd: unit.contractEnd || "",
    })
    setIsEditModalOpen(true)
  }

  async function handleUpdateUnit() {
    if (!unit || !editFormData) return

    try {
      await updateUnitMutation.mutateAsync({
        id: unit.id,
        updates: {
          ...editFormData,
          tenant: {
            name: editFormData.tenant?.name || "",
            phone: editFormData.tenant?.phone || undefined,
            email: editFormData.tenant?.email || undefined,
          },
          contractEnd: editFormData.contractEnd || undefined,
        },
      })
      toast.success("Unit updated successfully")
      setIsEditModalOpen(false)
    } catch (error) {
      toast.error("Failed to update unit")
      console.error(error)
    }
  }

  // Show loading state
  if (unitLoading || unitsLoading || expensesLoading || incomesLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!unit) return notFound()

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {unit.name}
                <Badge variant="outline">{unit.property}</Badge>
                {isContractEndingSoon(unit.contractEnd) && (
                  <Badge
                    variant="outline"
                    className="bg-yellow-50 text-yellow-800 border-yellow-200"
                  >
                    Ending Soon
                  </Badge>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditUnit}
                className="ml-auto"
              >
                <IconEdit className="h-4 w-4" />
                Edit Unit
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <IconMapPin className="size-4" />
                {unit.address} ({unit.location})
              </span>
              <span className="flex items-center gap-2">
                <IconWallet className="size-4" />
                {formatNIS(unit.monthlyRent)} monthly rent
              </span>
              <span className="flex items-center gap-2">
                <IconCalendar className="size-4" />
                Start {new Date(unit.contractStart).toLocaleDateString()}
                {unit.contractEnd ? (
                  <>
                    {" • Ends "}
                    {new Date(unit.contractEnd).toLocaleDateString()}
                    {isContractEndingSoon(unit.contractEnd) && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 ml-2">
                        {(() => {
                          const today = new Date()
                          const endDate = new Date(unit.contractEnd)
                          const daysLeft = Math.ceil(
                            (endDate.getTime() - today.getTime()) /
                              (1000 * 60 * 60 * 24)
                          )
                          return daysLeft > 0
                            ? `${daysLeft} days left`
                            : "Expired"
                        })()}
                      </span>
                    )}
                  </>
                ) : (
                  " • Open-ended"
                )}
              </span>
            </div>
            <Separator />
            <div className="grid gap-2">
              <div className="font-medium">Tenant</div>
              <div className="grid gap-1 text-sm">
                <div>{unit.tenant.name}</div>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                  {unit.tenant.phone && (
                    <a
                      className="flex items-center gap-1 hover:underline"
                      href={`tel:${unit.tenant.phone}`}
                    >
                      <IconPhone className="size-4" />
                      {unit.tenant.phone}
                    </a>
                  )}
                  {unit.tenant.email && (
                    <a
                      className="flex items-center gap-1 hover:underline"
                      href={`mailto:${unit.tenant.email}`}
                    >
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
              <div className="font-semibold">
                {formatNIS(unit.monthlyRent * 12)}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Annual Incomes
              </div>
              <div className="font-semibold">
                {formatNIS(totalUnitIncomesYear)}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Annual Expenses
              </div>
              <div className="font-semibold">
                {formatNIS(totalUnitExpensesYear)}
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Net (Unit)</div>
              <div className="font-semibold">
                {formatNIS(
                  unit.monthlyRent * 12 +
                    totalUnitIncomesYear -
                    totalUnitExpensesYear
                )}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <IncomeForm
                units={units}
                defaultUnitId={unit.id}
                prefillData={duplicateIncome ? {
                  title: `${duplicateIncome.title} (Copy)`,
                  amount: duplicateIncome.amount,
                  category: duplicateIncome.category,
                  scope: duplicateIncome.scope,
                  unitId: duplicateIncome.unitId,
                  recurrence: duplicateIncome.recurrence,
                  notes: duplicateIncome.notes,
                } : undefined}
                onAdd={(income) => {
                  handleAddIncome(income)
                  setDuplicateIncome(null)
                }}
              />
              <ExpensesForm
                units={units}
                defaultUnitId={unit.id}
                onAdd={handleAddExpense}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Income for {unit.name}</CardTitle>
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
                {unitIncomes.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell>{i.title}</TableCell>
                    <TableCell>{i.category}</TableCell>
                    <TableCell>{i.recurrence}</TableCell>
                    <TableCell>
                      {new Date(i.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNIS(i.amount)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDuplicateIncome(i)}
                        title="Duplicate income"
                      >
                        <IconCopy className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {unitIncomes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No income yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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
                    <TableCell>
                      {new Date(e.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNIS(e.amount)}
                    </TableCell>
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

      {/* Edit Unit Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Unit</DialogTitle>
            <DialogDescription>
              Update the unit details and tenant information.
            </DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              handleUpdateUnit()
            }}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Unit Name */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-name">Unit Name</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  placeholder="e.g., House A - Unit 1"
                />
              </div>

              {/* Property Type */}
              <div className="flex flex-col gap-2">
                <Label>Property Type</Label>
                <Select
                  value={editFormData.property || ""}
                  onValueChange={(v) =>
                    setEditFormData({
                      ...editFormData,
                      property: v as "Commercial" | "Residential",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                    <SelectItem value="Residential">Residential</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="flex flex-col gap-2">
                <Label>Location</Label>
                <Select
                  value={editFormData.location || ""}
                  onValueChange={(v) =>
                    setEditFormData({
                      ...editFormData,
                      location: v as "Downtown" | "Northside" | "Southside",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Downtown">Downtown</SelectItem>
                    <SelectItem value="Northside">Northside</SelectItem>
                    <SelectItem value="Southside">Southside</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Monthly Rent */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-rent">Monthly Rent</Label>
                <Input
                  id="edit-rent"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editFormData.monthlyRent || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      monthlyRent: Number.parseFloat(e.target.value),
                    })
                  }
                  placeholder="0.00"
                />
              </div>

              {/* Address */}
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  value={editFormData.address || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      address: e.target.value,
                    })
                  }
                  placeholder="Full address"
                />
              </div>

              {/* Contract Start */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-contract-start">Contract Start</Label>
                <Input
                  id="edit-contract-start"
                  type="date"
                  value={editFormData.contractStart || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      contractStart: e.target.value,
                    })
                  }
                />
              </div>

              {/* Contract End */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-contract-end">
                  Contract End (Optional)
                </Label>
                <Input
                  id="edit-contract-end"
                  type="date"
                  value={editFormData.contractEnd || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      contractEnd: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Tenant Information */}
            <Separator />
            <div className="grid gap-4">
              <h3 className="text-lg font-medium">Tenant Information</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Tenant Name */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-tenant-name">Tenant Name</Label>
                  <Input
                    id="edit-tenant-name"
                    value={editFormData.tenant?.name || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        tenant: {
                          ...editFormData.tenant,
                          name: e.target.value,
                        },
                      })
                    }
                    placeholder="Full name"
                  />
                </div>

                {/* Tenant Phone */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-tenant-phone">Phone (Optional)</Label>
                  <Input
                    id="edit-tenant-phone"
                    type="tel"
                    value={editFormData.tenant?.phone || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        tenant: {
                          name: editFormData.tenant?.name || "",
                          phone: e.target.value,
                          email: editFormData.tenant?.email,
                        },
                      })
                    }
                    placeholder="Phone number"
                  />
                </div>

                {/* Tenant Email */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-tenant-email">Email (Optional)</Label>
                  <Input
                    id="edit-tenant-email"
                    type="email"
                    value={editFormData.tenant?.email || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        tenant: {
                          name: editFormData.tenant?.name || "",
                          phone: editFormData.tenant?.phone,
                          email: e.target.value,
                        },
                      })
                    }
                    placeholder="Email address"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateUnitMutation.isPending}>
                {updateUnitMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
