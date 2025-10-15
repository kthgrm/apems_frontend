"use client"

import * as React from "react"
import {
  Award,
  BookOpen,
  Building,
  Command,
  ComponentIcon,
  Cpu,
  Folder,
  Handshake,
  LayoutGrid,
  Printer,
  School,
  User2,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/AuthContext"
import type { NavItem } from "@/types"

const adminNavItems: NavItem[] = [
  {
    title: 'Dashboard', href: '/admin/dashboard', icon: LayoutGrid,
  },
  {
    title: 'Modules', href: '#', icon: ComponentIcon, isGroup: true,
    items: [
      { title: 'Technology Transfer', href: '/admin/technology-transfer', icon: Cpu },
      {
        title: 'Research Extension', href: '#', icon: Folder, isDropdown: true,
        subItems: [
          { title: 'Impact Assessment', href: '/admin/impact-assessment' },
          { title: 'Modalities', href: '/admin/modalities' },
        ]
      },
      { title: 'International Partner', href: '/admin/international-partner', icon: Handshake },
      { title: 'Awards & Recognition', href: '/admin/awards-recognition', icon: Award },
      { title: 'Resolution', href: '/admin/resolution', icon: BookOpen }
    ]
  },
  { title: 'Campus', href: '/admin/campus', icon: School },
  { title: 'College', href: '/admin/college', icon: Building },
  { title: 'Users', href: '/admin/users', icon: User2 },
  {
    title: 'Reports', href: '#', icon: Printer, isDropdown: true,
    subItems: [
      { title: 'Audit Trail', href: '/admin/report/audit-trail' },
      { title: 'Awards', href: '/admin/report/awards' },
      { title: 'Impact Assessments', href: '/admin/report/impact-assessments' },
      { title: 'International Partners', href: '/admin/report/international-partners' },
      { title: 'Modalities', href: '/admin/report/modalities' },
      { title: 'Technology Transfer', href: '/admin/report/technology-transfers' },
      { title: 'Resolutions', href: '/admin/report/resolutions' },
      { title: 'Users', href: '/admin/report/users' },
    ],
  },
];

const userNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/user/dashboard',
    icon: LayoutGrid,
  },
  {
    title: 'Technology Transfer',
    href: '/user/technology-transfer',
    icon: Cpu,
  },
  {
    title: 'Research Extension', href: '#', icon: Folder, isDropdown: true,
    subItems: [
      { title: 'Impact Assessment', href: '/user/impact-assessment' },
      { title: 'Modalities', href: '/user/modalities' },
    ],
  },
  {
    title: 'International Partners',
    href: '/user/international-partner',
    icon: Handshake,
  },
  {
    title: 'Awards & Recognition',
    href: '/user/awards-recognition',
    icon: Award,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

  // Determine nav items based on user role
  const mainNavItems = user?.role === 'admin' ? adminNavItems : userNavItems;

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href={user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'}>
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-black text-2xl text-red-800 italic">APEMS</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={mainNavItems} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
