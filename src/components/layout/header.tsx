'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { SidebarTrigger } from '../ui/sidebar';
import { Home, CreditCard, Users, Settings, LogOut } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

function UserNav() {
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={userAvatar?.imageUrl}
              alt="Avatar do usuário"
              data-ai-hint={userAvatar?.imageHint}
            />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Usuário</p>
            <p className="text-xs leading-none text-muted-foreground">
              usuario@email.com
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurações</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
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
import { DropdownMenuGroup } from '@radix-ui/react-dropdown-menu';

function MobileNav() {
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');
  return (
    <Menubar className="border-none shadow-none bg-transparent">
      <MenubarMenu>
        <MenubarTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={userAvatar?.imageUrl}
                alt="Avatar do usuário"
                data-ai-hint={userAvatar?.imageHint}
              />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </Button>
        </MenubarTrigger>
        <MenubarContent align="end" forceMount>
          <MenubarItem>
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </MenubarItem>
          <MenubarItem>
            <CreditCard className="mr-2 h-4 w-4" />
            Cartões
          </MenubarItem>
          <MenubarItem>
            <Users className="mr-2 h-4 w-4" />
            Dívidas
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
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
