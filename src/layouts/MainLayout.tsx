import { Outlet, useLocation } from 'react-router-dom';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";

export default function MainLayout() {
  const location = useLocation();

  const pathTitleMap: Record<string, string> = {
    '/': 'Dashboard',
    '/product': 'Products',
    "/production": "Production",
    "/material": "Material",
    "/invoice": "Invoice",
    "/dispatch": "Dispatch",
    "/return": "Return",
    "/inventory": "Inventory",
    // add more mappings as needed
  };

  const currentTitle = pathTitleMap[location.pathname] || 'Page';

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={currentTitle} />
        <div className="flex flex-1 flex-col p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}