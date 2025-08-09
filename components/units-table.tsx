"use client"

import { IconChevronRight } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Unit } from "@/lib/types"

function statusLabel(u: Unit) {
  const today = new Date()
  const end = u.contractEnd ? new Date(u.contractEnd) : undefined
  if (!end) return "Active"
  const days = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (days < 0) return "Ended"
  if (days <= 60) return "Ending soon"
  return "Active"
}

export function UnitsTable({ units }: { units: Unit[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Units Overview</CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>Unit</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead className="text-right">Monthly Rent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {units.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.location}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{u.property}</Badge>
                  </TableCell>
                  <TableCell>{u.tenant.name}</TableCell>
                  <TableCell className="text-right">${u.monthlyRent.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        statusLabel(u) === "Active"
                          ? "secondary"
                          : statusLabel(u) === "Ending soon"
                            ? "outline"
                            : "destructive"
                      }
                    >
                      {statusLabel(u)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <a href={`/units/${u.id}`}>
                        View
                        <IconChevronRight />
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
