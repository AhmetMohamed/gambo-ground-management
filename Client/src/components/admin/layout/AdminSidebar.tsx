import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Award,
  BarChart3,
  Settings,
  UserCog,
  LogOut,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

// Update the interface
interface AdminSidebarProps {
  currentPage: string;
}

export function AdminSidebar({ currentPage }: AdminSidebarProps) {
  const navigate = useNavigate();

  const handleNavigation = (page: string) => {
    // Map page names to correct URL paths
    const pageToUrlMap: Record<string, string> = {
      Dashboard: "", // This will navigate to /admin
      Users: "users",
      Booking: "booking",
      "Premium Teams": "premium",
      Coaches: "coaches",
      Reports: "reports",
      Settings: "settings",
    };

    const urlPath = pageToUrlMap[page];
    navigate(`/admin${urlPath ? `/${urlPath}` : ""}`);
  };

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Show success message
    toast.success("Logged out successfully");
    
    // Redirect to login page
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <Sidebar className="border-r">
        <SidebarHeader className="px-6 py-3">
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => handleNavigation("Dashboard")}
                className={currentPage === "Dashboard" ? "bg-gray-200" : ""}
              >
                <LayoutDashboard className="mr-2" />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => handleNavigation("Users")}
                className={currentPage === "Users" ? "bg-gray-200" : ""}
              >
                <Users className="mr-2" />
                <span>Users</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => handleNavigation("Booking")}
                className={currentPage === "Booking" ? "bg-gray-200" : ""}
              >
                <Calendar className="mr-2" />
                <span>Booking</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => handleNavigation("Premium Teams")}
                className={currentPage === "Premium Teams" ? "bg-gray-200" : ""}
              >
                <Award className="mr-2" />
                <span>Premium Teams</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => handleNavigation("Coaches")}
                className={currentPage === "Coaches" ? "bg-gray-200" : ""}
              >
                <UserCog className="mr-2" />
                <span>Coaches</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => handleNavigation("Reports")}
                className={currentPage === "Reports" ? "bg-gray-200" : ""}
              >
                <BarChart3 className="mr-2" />
                <span>Reports</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => handleNavigation("Settings")}
                className={currentPage === "Settings" ? "bg-gray-200" : ""}
              >
                <Settings className="mr-2" />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <div className="mt-auto border-t py-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <UserCog className="mr-2" />
                <span>Account</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout}>
                <LogOut className="mr-2" />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </Sidebar>
    </SidebarProvider>
  );
}
