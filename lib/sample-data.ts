import type { Expense, Unit } from "./types"

export const sampleUnits: Unit[] = [
  {
    id: "unit-1",
    name: "Commercial Store",
    property: "Commercial",
    location: "Downtown",
    address: "12 Market St",
    monthlyRent: 8900, // ~2400 USD * 3.7
    tenant: {
      name: "Blueberry Books",
      phone: "555-301-1001",
      email: "info@blueberrybooks.co",
    },
    contractStart: "2024-01-01",
  },
  {
    id: "unit-2",
    name: "House A - Unit 1",
    property: "Residential",
    location: "Northside",
    address: "101 Maple Ave, Unit 1",
    monthlyRent: 5500, // ~1500 USD * 3.7
    tenant: {
      name: "Alex Carter",
      phone: "555-301-2001",
      email: "alex.carter@example.com",
    },
    contractStart: "2024-03-01",
  },
  {
    id: "unit-3",
    name: "House A - Unit 2",
    property: "Residential",
    location: "Northside",
    address: "101 Maple Ave, Unit 2",
    monthlyRent: 5700, // ~1550 USD * 3.7
    tenant: {
      name: "Jamie Lee",
      phone: "555-301-2002",
      email: "jamie.lee@example.com",
    },
    contractStart: "2024-02-15",
  },
  {
    id: "unit-4",
    name: "House B - Unit 1",
    property: "Residential",
    location: "Southside",
    address: "220 Pine St, Unit 1",
    monthlyRent: 5200, // ~1400 USD * 3.7
    tenant: {
      name: "Morgan Ruiz",
      phone: "555-301-3001",
      email: "morgan.ruiz@example.com",
    },
    contractStart: "2024-01-15",
  },
  {
    id: "unit-5",
    name: "House B - Unit 2",
    property: "Residential",
    location: "Southside",
    address: "220 Pine St, Unit 2",
    monthlyRent: 5300, // ~1425 USD * 3.7
    tenant: {
      name: "Taylor Smith",
      phone: "555-301-3002",
      email: "taylor.smith@example.com",
    },
    contractStart: "2024-05-01",
  },
]

export const seedExpenses: Expense[] = [
  {
    id: "exp-1",
    title: "Property Tax",
    amount: 8900, // ~2400 USD * 3.7
    date: `${new Date().getFullYear()}-01-05`,
    category: "Tax",
    scope: "Global",
    recurrence: "Yearly",
  },
  {
    id: "exp-2",
    title: "Insurance",
    amount: 4400, // ~1200 USD * 3.7
    date: `${new Date().getFullYear()}-02-01`,
    category: "Insurance",
    scope: "Global",
    recurrence: "Yearly",
  },
  {
    id: "exp-3",
    title: "HVAC Maintenance",
    amount: 220, // ~60 USD * 3.7
    date: `${new Date().getFullYear()}-01-01`,
    category: "Maintenance",
    scope: "Global",
    recurrence: "Monthly",
  },
  {
    id: "exp-4",
    title: "Plumbing Fix - House A Unit 2",
    amount: 800, // ~220 USD * 3.7
    date: `${new Date().getFullYear()}-03-15`,
    category: "Plumbing",
    scope: "Unit",
    unitId: "unit-3",
    recurrence: "One-time",
  },
  {
    id: "exp-5",
    title: "Signage Upgrade - Commercial Store",
    amount: 1700, // ~450 USD * 3.7
    date: `${new Date().getFullYear()}-04-10`,
    category: "Upgrade",
    scope: "Unit",
    unitId: "unit-1",
    recurrence: "One-time",
  },
]
