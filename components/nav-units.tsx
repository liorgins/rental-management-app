"use client"

import { IconBuilding, IconHome } from "@tabler/icons-react"
import { usePathname } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { Unit } from "@/lib/types"

export function NavUnits({ units }: { units: Unit[] }) {
  const pathname = usePathname()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Units</SidebarGroupLabel>
      <SidebarMenu>
        {units.map((u) => {
          const isActive = pathname === `/units/${u.id}`
          return (
            <SidebarMenuItem key={u.id}>
              <SidebarMenuButton asChild tooltip={u.name} isActive={isActive}>
                <a href={`/units/${u.id}`}>
                  {u.property === "Commercial" ? (
                    <IconBuilding />
                  ) : (
                    <IconHome />
                  )}
                  <span>{u.name}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
