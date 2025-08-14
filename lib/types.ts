export type Tenant = {
  name: string
  phone?: string
  email?: string
}

export type Unit = {
  id: string
  name: string // e.g., "Commercial Store", "House A - Unit 1"
  property: "Commercial" | "Residential"
  location: "Downtown" | "Northside" | "Southside"
  address: string
  monthlyRent: number
  tenant: Tenant
  contractStart: string // ISO date
  contractEnd?: string // ISO date
}

export type ExpenseCategory =
  | "Repair"
  | "Upgrade"
  | "Plumbing"
  | "HVAC"
  | "Renovation"
  | "Insurance"
  | "Tax"
  | "Maintenance"
  | "Other"

export type ExpenseScope = "Global" | "Unit"

export type ExpenseRecurrence = "One-time" | "Monthly" | "Yearly"

export type Expense = {
  id: string
  title: string
  amount: number // in your currency
  date: string // ISO date
  category: ExpenseCategory
  scope: ExpenseScope
  unitId?: string // present when scope === "Unit"
  recurrence: ExpenseRecurrence
  notes?: string
}

export type IncomeCategory = "Rent" | "Taxes" | "Fees" | "Other"

export type Income = {
  id: string
  title: string
  amount: number // in your currency
  date: string // ISO date
  category: IncomeCategory
  scope: ExpenseScope // "Global" or "Unit" - reusing existing scope types
  unitId?: string // present when scope === "Unit"
  recurrence: ExpenseRecurrence // reusing the same recurrence options
  notes?: string
}

export type Transaction = {
  id: string
  title: string
  amount: number // positive for income, negative for expense
  date: string
  type: "income" | "expense"
  category?: ExpenseCategory | IncomeCategory // for both expenses and income
  scope?: ExpenseScope // for both expenses and income
  unitId?: string
  recurrence: ExpenseRecurrence
  notes?: string
}
