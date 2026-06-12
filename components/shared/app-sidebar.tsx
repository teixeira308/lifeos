"use client";

import * as React from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  CalendarDays,
  Briefcase,
  CheckCircle2,
  Zap,
  BookOpen,
  GraduationCap,
  Inbox,
  Library,
  Settings,
  LogOut,
  User as UserIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/features/auth/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Temporadas", href: "/seasons", icon: CalendarDays },
  { title: "Projetos", href: "/projects", icon: Briefcase },
  { title: "Tarefas", href: "/tasks", icon: CheckCircle2 },
  { title: "Hábitos", href: "/habits", icon: Zap },
  { title: "Diário", href: "/journal", icon: BookOpen },
  { title: "Aprendizado", href: "/learning", icon: GraduationCap },
  { title: "Inbox", href: "/inbox", icon: Inbox },
  { title: "Recursos", href: "/resources", icon: Library },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-3">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo-nome-direita.png"
            alt="tideOS"
            width={120}
            height={65}
            priority
          />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.title}
                    className="data-active:bg-primary data-active:text-primary-foreground data-active:hover:bg-primary data-active:hover:text-primary-foreground"
                    render={<Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>}
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || ""} />
                    <AvatarFallback className="rounded-lg">
                      {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.displayName || "Usuário"}</span>
                    <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                  </div>
                </SidebarMenuButton>
              } />
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem render={<Link href="/profile" className="flex items-center gap-2">
                  <UserIcon className="size-4" />
                  Perfil
                </Link>} />
                <DropdownMenuItem render={<Link href="/settings" className="flex items-center gap-2">
                  <Settings className="size-4" />
                  Configurações
                </Link>} />
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:text-destructive">
                  <LogOut className="size-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
