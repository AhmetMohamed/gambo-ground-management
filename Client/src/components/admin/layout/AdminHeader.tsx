import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface AdminHeaderProps {
  currentPage: string;
}

export function AdminHeader({ currentPage }: AdminHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <header className="border-b bg-white p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {isMobile && (
            <SidebarTrigger className="md:hidden" />
          )}
          <h1 className="text-2xl font-bold">{currentPage === "Coaches" ? "Coach" : currentPage}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-[#098846] text-white px-3 py-1 rounded-full text-sm font-medium">
            Admin
          </span>
        </div>
      </div>
    </header>
  );
}
