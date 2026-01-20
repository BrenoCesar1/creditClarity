'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarTrigger } from '../ui/sidebar';
import { Home, CreditCard, Users, Settings, LogOut, ArrowLeftRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUser } from '@/firebase/auth/use-user';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';

function UserNav() {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
      router.push('/login');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={user?.photoURL || undefined}
              alt={user?.displayName || 'Avatar do usuário'}
            />
            <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push('/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurações</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from '@/components/ui/menubar';

function MobileNav() {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
      router.push('/login');
    }
  };

  return (
    <Menubar className="border-none shadow-none bg-transparent">
      <MenubarMenu>
        <MenubarTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={user?.photoURL || undefined}
                alt={user?.displayName || 'Avatar do usuário'}
              />
              <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
          </Button>
        </MenubarTrigger>
        <MenubarContent align="end" forceMount>
          <MenubarItem onClick={() => router.push('/')}>
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </MenubarItem>
          <MenubarItem onClick={() => router.push('/cards')}>
            <CreditCard className="mr-2 h-4 w-4" />
            Cartões
          </MenubarItem>
          <MenubarItem onClick={() => router.push('/transactions')}>
            <ArrowLeftRight className="mr-2 h-4 w-4" />
            Transações
          </MenubarItem>
          <MenubarItem onClick={() => router.push('/debts')}>
            <Users className="mr-2 h-4 w-4" />
            Dívidas
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem onClick={() => router.push('/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}

export function AppHeader() {
  const isMobile = useIsMobile();
  const { user, loading } = useUser();

  if (loading) return <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6"></header>;
  
  if (!user) {
    return (
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
        <div className="flex w-full items-center justify-end gap-4">
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex w-full items-center justify-end gap-4">
        {isMobile ? <MobileNav /> : <UserNav />}
      </div>
    </header>
  );
}
