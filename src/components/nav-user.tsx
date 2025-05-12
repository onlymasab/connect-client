"use client";
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';

import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

// Simple spinner component
function Spinner() {
  return (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-600"></div>
  );
}

export function NavUser() {
  const { isMobile } = useSidebar();
  const { signOut, fetchProfile } = useAuth();

  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const currentUser = await fetchProfile();
        console.log('Current user:', currentUser);
        setUserData(currentUser);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [fetchProfile]);

  const handleSignOut = async () => {
    try {
      await signOut();
      console.log('Signed out');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger className='w-full'>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                {userData?.avatar_url ? (
                  <AvatarImage src={userData.avatar_url} alt={userData.email} />
                ) : (
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                )}
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <Spinner />
                    <span>Loading user...</span>
                  </div>
                ) : (
                  <>
                    <span className="truncate font-medium">{userData?.email || 'Unknown User'}</span>
                    <span className="text-muted-foreground truncate text-xs">
                      {userData?.id || 'No ID'}
                    </span>
                  </>
                )}
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {userData?.avatar_url ? (
                    <AvatarImage src={userData.avatar_url} alt={userData.email} />
                  ) : (
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  )}
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{userData?.email || 'Unknown User'}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {userData?.id || 'No ID'}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <IconUserCircle />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconCreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconNotification />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <IconLogout />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}