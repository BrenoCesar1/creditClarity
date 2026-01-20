'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { CreditCard, Home, Settings, Users, Wallet, ArrowLeftRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  const menuItems = [
    {
      href: '/',
      label: 'Dashboard',
      icon: Home,
    },
    {
      href: '/cards',
      label: 'Cartões',
      icon: CreditCard,
    },
    {
      href: '/transactions',
      label: 'Transações',
      icon: ArrowLeftRight,
    },
    {
      href: '/debts',
      label: 'Dívidas',
      icon: Users,
    },
    {
      href: '/settings',
      label: 'Configurações',
      icon: Settings,
    },
  ];

  if (!user) {
    return null;
  }

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2 justify-center group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wallet className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg text-primary group-data-[collapsible=icon]:hidden">
            CreditClarity
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                href={item.href}
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <a href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
