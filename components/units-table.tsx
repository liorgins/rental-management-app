"use client"

import { IconChevronRight } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Unit } from "@/lib/types"
import { formatNIS, getContractStatus } from "@/lib/utils"

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
                  <TableCell className="text-right">
                    {formatNIS(u.monthlyRent)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        getContractStatus(u) === "Active"
                          ? "secondary"
                          : getContractStatus(u) === "Ending soon"
                          ? "outline"
                          : "destructive"
                      }
                      className={
                        getContractStatus(u) === "Ending soon"
                          ? "bg-yellow-50 text-yellow-800 border-yellow-200"
                          : ""
                      }
                    >
                      {getContractStatus(u)}
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
