"use client"

import { IconEdit, IconFilter, IconTrash, IconX } from "@tabler/icons-react"
import { useState } from "react"
import { toast } from "sonner"

import { ExpensesForm } from "@/components/expenses-form"
import { Button } from "@/components/ui/button"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  useCreateExpense,
  useDeleteExpense,
  useExpenses,
  useUpdateExpense,
} from "@/hooks/use-expenses"
import { useUnits } from "@/hooks/use-units"
import type {
  Expense,
  ExpenseCategory,
  ExpenseRecurrence,
  ExpenseScope,
} from "@/lib/types"

export function ExpensesClient() {
  const { data: expenses = [], isLoading } = useExpenses()
  const { data: units = [] } = useUnits()
  const createExpenseMutation = useCreateExpense()
  const updateExpenseMutation = useUpdateExpense()
  const deleteExpenseMutation = useDeleteExpense()

  // Filter states
  const [unitFilter, setUnitFilter] = useState<string>("all")
  const [scopeFilter, setScopeFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [searchFilter, setSearchFilter] = useState("")

  // Edit modal states
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<Expense>>({})

  // Delete confirmation states
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null)

  // Filter expenses based on current filters
  const filteredExpenses = expenses.filter((expense) => {
    // Unit filter
    if (unitFilter !== "all" && expense.unitId !== unitFilter) return false

    // Scope filter
    if (scopeFilter !== "all" && expense.scope !== scopeFilter) return false

    // Category filter
    if (categoryFilter !== "all" && expense.category !== categoryFilter)
      return false

    // Search filter
    if (
      searchFilter &&
      !expense.title.toLowerCase().includes(searchFilter.toLowerCase()) &&
      !expense.notes?.toLowerCase().includes(searchFilter.toLowerCase())
    )
      return false

    return true
  })

  const handleCreateExpense = async (expense: Expense) => {
    try {
      await createExpenseMutation.mutateAsync(expense)
      toast.success("Expense created successfully")
    } catch (error) {
      toast.error("Failed to create expense")
      console.error(error)
    }
  }

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense)
    setEditFormData(expense)
  }

  const handleUpdateExpense = async () => {
    if (!editingExpense || !editFormData) return

    try {
      await updateExpenseMutation.mutateAsync({
        id: editingExpense.id,
        updates: editFormData,
      })
      toast.success("Expense updated successfully")
      setEditingExpense(null)
      setEditFormData({})
    } catch (error) {
      toast.error("Failed to update expense")
      console.error(error)
    }
  }

  const handleDeleteExpense = async (expense: Expense) => {
    setDeletingExpense(expense)
  }

  const confirmDeleteExpense = async () => {
    if (!deletingExpense) return

    try {
      await deleteExpenseMutation.mutateAsync(deletingExpense.id)
      toast.success("Expense deleted successfully")
      setDeletingExpense(null)
    } catch (error) {
      toast.error("Failed to delete expense")
      console.error(error)
    }
  }

  const resetFilters = () => {
    setUnitFilter("all")
    setScopeFilter("all")
    setCategoryFilter("all")
    setSearchFilter("")
  }

  const getUnitName = (unitId?: string) => {
    if (!unitId) return "N/A"
    const unit = units.find((u) => u.id === unitId)
    return unit?.name || "Unknown Unit"
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Expenses</h1>
        </div>
        <div className="text-center text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <ExpensesForm units={units} onAdd={handleCreateExpense} />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-lg border p-4">
        <div className="flex items-center gap-2">
          <IconFilter className="h-4 w-4" />
          <span className="text-sm font-medium">Filters</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="ml-auto h-8"
          >
            <IconX className="h-4 w-4" />
            Clear
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* Search */}
          <div>
            <Label htmlFor="search" className="text-xs">
              Search
            </Label>
            <Input
              id="search"
              placeholder="Search title or notes..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="h-8"
            />
          </div>

          {/* Unit Filter */}
          <div>
            <Label className="text-xs">Unit</Label>
            <Select value={unitFilter} onValueChange={setUnitFilter}>
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

          {/* Scope Filter */}
          <div>
            <Label className="text-xs">Scope</Label>
            <Select value={scopeFilter} onValueChange={setScopeFilter}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="All scopes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scopes</SelectItem>
                <SelectItem value="Global">Global</SelectItem>
                <SelectItem value="Unit">Unit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div>
            <Label className="text-xs">Category</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
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
                ].map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-muted-foreground">
            Total Expenses
          </div>
          <div className="text-2xl font-bold">
            {formatCurrency(
              filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
            )}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-muted-foreground">
            Total Items
          </div>
          <div className="text-2xl font-bold">{filteredExpenses.length}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-muted-foreground">
            Average Amount
          </div>
          <div className="text-2xl font-bold">
            {formatCurrency(
              filteredExpenses.length > 0
                ? filteredExpenses.reduce(
                    (sum, expense) => sum + expense.amount,
                    0
                  ) / filteredExpenses.length
                : 0
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Scope</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Recurrence</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExpenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No expenses found.
                </TableCell>
              </TableRow>
            ) : (
              filteredExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{expense.title}</TableCell>
                  <TableCell>{formatCurrency(expense.amount)}</TableCell>
                  <TableCell>{formatDate(expense.date)}</TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        expense.scope === "Global"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {expense.scope}
                    </span>
                  </TableCell>
                  <TableCell>{getUnitName(expense.unitId)}</TableCell>
                  <TableCell>{expense.recurrence}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {expense.notes || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditExpense(expense)}
                      >
                        <IconEdit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteExpense(expense)}
                      >
                        <IconTrash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Expense Dialog */}
      <Dialog
        open={!!editingExpense}
        onOpenChange={(open) => !open && setEditingExpense(null)}
      >
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>
              Update the expense details below.
            </DialogDescription>
          </DialogHeader>
          {editingExpense && (
            <form
              className="grid gap-4"
              onSubmit={(e) => {
                e.preventDefault()
                handleUpdateExpense()
              }}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editFormData.title || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        title: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-amount">Amount</Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editFormData.amount || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        amount: Number.parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-date">Date</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editFormData.date || ""}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, date: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Category</Label>
                  <Select
                    value={editFormData.category || ""}
                    onValueChange={(v) =>
                      setEditFormData({
                        ...editFormData,
                        category: v as ExpenseCategory,
                      })
                    }
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
                    value={editFormData.scope || ""}
                    onValueChange={(v) =>
                      setEditFormData({
                        ...editFormData,
                        scope: v as ExpenseScope,
                        unitId:
                          v === "Global" ? undefined : editFormData.unitId,
                      })
                    }
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
                {editFormData.scope === "Unit" && (
                  <div className="flex flex-col gap-2">
                    <Label>Unit</Label>
                    <Select
                      value={editFormData.unitId || ""}
                      onValueChange={(v) =>
                        setEditFormData({ ...editFormData, unitId: v })
                      }
                    >
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
                    value={editFormData.recurrence || ""}
                    onValueChange={(v) =>
                      setEditFormData({
                        ...editFormData,
                        recurrence: v as ExpenseRecurrence,
                      })
                    }
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
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={editFormData.notes || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, notes: e.target.value })
                  }
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingExpense(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateExpenseMutation.isPending}
                >
                  {updateExpenseMutation.isPending
                    ? "Saving..."
                    : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deletingExpense}
        onOpenChange={(open) => !open && setDeletingExpense(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Expense</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deletingExpense?.title}
              &quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingExpense(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteExpense}
              disabled={deleteExpenseMutation.isPending}
            >
              {deleteExpenseMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
