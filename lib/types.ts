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
