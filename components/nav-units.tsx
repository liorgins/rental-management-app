"use client"

import { IconBuilding, IconHome } from "@tabler/icons-react"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { Unit } from "@/lib/types"

export function NavUnits({ units }: { units: Unit[] }) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Units</SidebarGroupLabel>
      <SidebarMenu>
        {units.map((u) => (
          <SidebarMenuItem key={u.id}>
            <SidebarMenuButton asChild tooltip={u.name}>
              <a href={`/units/${u.id}`}>
                {u.property === "Commercial" ? <IconBuilding /> : <IconHome />}
                <span>{u.name}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
