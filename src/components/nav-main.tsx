import { ChevronRight } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import type { NavItem } from "@/types"
import { Link, useLocation } from "react-router-dom"

export function NavMain({ items = [] }: { items: NavItem[] }) {
  const location = useLocation();
  const currentPath = location.pathname.replace(/\/+$/, '');

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          item.isDropdown ? (
            <Collapsible
              key={item.title}
              asChild
              className="group/collapsible"
              defaultOpen={currentPath.startsWith(item.href)}
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton isActive={currentPath.startsWith(item.href)} tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.subItems?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild size="md" isActive={currentPath.startsWith(subItem.href)} >
                          <Link to={subItem.href} prefetch="intent">
                            {subItem.icon && <subItem.icon />}
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : item.isGroup ? (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton tooltip={item.title} className="text-sm">
                {item.icon && <item.icon size={16} />}
                <span>{item.title}</span>
              </SidebarMenuButton>
              <SidebarMenuSub>
                {item.items?.map((subItem) => (
                  subItem.isGroup ? (
                    <SidebarMenuItem key={subItem.title} className="pr-0">
                      <SidebarMenuButton tooltip={subItem.title}>
                        {subItem.icon && <subItem.icon />}
                        <span>{subItem.title}</span>
                      </SidebarMenuButton>
                      <SidebarMenuSub>
                        {subItem.items?.map((nestedItem) => (
                          <SidebarMenuSubItem key={nestedItem.title}>
                            <SidebarMenuSubButton asChild isActive={currentPath.startsWith(nestedItem.href)}>
                              <Link to={nestedItem.href} prefetch="intent">
                                {nestedItem.icon && <nestedItem.icon />}
                                <span>{nestedItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </SidebarMenuItem>
                  ) : (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild size="md" isActive={currentPath.startsWith(subItem.href)}>
                        <Link to={subItem.href} prefetch="intent">
                          {subItem.icon && <subItem.icon className="text-sidebar-foreground" />}
                          <span>{subItem.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  )
                ))}
              </SidebarMenuSub>
            </SidebarMenuItem>
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={currentPath.startsWith(item.href)}>
                <Link to={item.href} prefetch="intent">
                  {item.icon && <item.icon className="text-sidebar-foreground" />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
