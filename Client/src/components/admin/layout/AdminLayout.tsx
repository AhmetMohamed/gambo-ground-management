import { ReactNode, useEffect } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();

  // Debug children prop
  useEffect(() => {
    console.log("AdminLayout children:", children);
  }, [children]);

  // Derive current page from URL path
  const getPageFromPath = () => {
    const path = location.pathname;
    if (path === "/admin" || path === "/admin/") return "Dashboard";
    if (path === "/admin/users") return "Users";
    if (path === "/admin/booking") return "Booking";
    if (path === "/admin/premium") return "Premium Teams";
    if (path === "/admin/coaches") return "Coaches";
    if (path === "/admin/reports") return "Reports";
    if (path === "/admin/settings") return "Settings";
    return "Dashboard"; // Default
  };

  const currentPage = getPageFromPath();

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <AdminSidebar currentPage={currentPage} />
        <div className="flex flex-col flex-1 w-full">
          <AdminHeader currentPage={currentPage} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 w-full">
            <div className="w-full md:container md:mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
