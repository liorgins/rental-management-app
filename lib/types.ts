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

export type DocumentType =
  | "Contract"
  | "Insurance"
  | "Maintenance"
  | "Tax"
  | "Invoice"
  | "Receipt"
  | "Other"

export type Document = {
  id: string
  name: string
  originalName: string
  type: DocumentType
  mimeType: string
  size: number // in bytes
  uploadDate: string
  scope: "Global" | "Unit"
  unitId?: string // present when scope === "Unit"
  fileUrl: string // URL to access the file (Vercel Blob URL)
  blobKey: string // Vercel Blob key for deletion
  description?: string
  tags: string[] // Dynamic tags for categorization and filtering
}

export type TaskCategory =
  | "Maintenance"
  | "Inspection"
  | "Repair"
  | "Administrative"
  | "Legal"
  | "Financial"
  | "Other"

export type TaskPriority = "Low" | "Medium" | "High" | "Urgent"

export type TaskStatus = "Pending" | "Completed"

export type ReminderPeriod = "1_day" | "2_days" | "1_week" | "custom"

export type TaskReminder = {
  id: string
  period: ReminderPeriod
  customDays?: number // for custom reminder period
  notificationSent: boolean
  scheduledFor: string // ISO date when notification should be sent
}

export type Task = {
  id: string
  title: string
  description?: string
  category: TaskCategory
  priority: TaskPriority
  status: TaskStatus
  scope: "Global" | "Unit"
  unitId?: string // present when scope === "Unit"
  dueDate: string // ISO date
  createdDate: string // ISO date
  completedDate?: string // ISO date when marked as completed
  reminders: TaskReminder[]
  notes?: string
}

export type PushSubscription = {
  id: string
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  createdAt: string
}

export type NotificationType =
  | "task_reminder"
  | "task_overdue"
  | "task_completed"
  | "system"

export type AppNotification = {
  id: string
  type: NotificationType
  title: string
  message: string
  taskId?: string
  unitId?: string
  isRead: boolean
  createdAt: string
}
