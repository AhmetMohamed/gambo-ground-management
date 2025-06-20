import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AdminHeaderProps {
  currentPage: string;
}

export function AdminHeader({ currentPage }: AdminHeaderProps) {
  return (
    <header className="border-b bg-white p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{currentPage}</h1>
        <div className="flex items-center gap-2">
          <span className="bg-[#098846] text-white px-3 py-1 rounded-full text-sm font-medium">
            Admin
          </span>
        </div>
      </div>
    </header>
  );
}
