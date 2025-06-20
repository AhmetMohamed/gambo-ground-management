import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  User,
  LogOut,
  Settings,
  Home,
  Calendar,
  Award,
  LayoutDashboard,
  Info,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  isAdmin?: boolean;
}

const Navbar = ({ isAdmin = false }: NavbarProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInitials, setUserInitials] = useState("");
  const [userName, setUserName] = useState("");
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();

  const getUserData = () => {
    const token = localStorage.getItem("token");
    const userDataStr = localStorage.getItem("user");

    setIsLoggedIn(!!token);

    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        const initials = userData.name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
        setUserInitials(initials);
        setUserName(userData.name);
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
  };

  useEffect(() => {
    // Refresh user data whenever location changes or component mounts
    getUserData();
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserInitials("");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const links = [
    { href: "/", label: "Home", icon: <Home className="h-4 w-4 mr-2" /> },
    { href: "/about", label: "About", icon: <Info className="h-4 w-4 mr-2" /> },
    {
      href: "/booking",
      label: "Book Ground",
      icon: <Calendar className="h-4 w-4 mr-2" />,
    },
    {
      href: "/premium",
      label: "Premium Training",
      icon: <Award className="h-4 w-4 mr-2" />,
    },
    ...(isLoggedIn
      ? [
          {
            href: "/dashboard",
            label: "Dashboard",
            icon: <LayoutDashboard className="h-4 w-4 mr-2" />,
          },
        ]
      : []),
    ...(isLoggedIn && isAdmin
      ? [
          {
            href: "/admin",
            label: "Admin",
            icon: <Settings className="h-4 w-4 mr-2" />,
          },
        ]
      : []),
  ];

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-gambo">Gambo Stadium</span>
          </Link>
        </div>

        {isMobile ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="mt-8 flex flex-col gap-4">
                {isLoggedIn && (
                  <div className="mb-4 flex items-center gap-3">
                    <Avatar className="h-8 w-8 bg-gambo">
                      <AvatarFallback className="text-black">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-black">My Account</span>
                  </div>
                )}

                {links.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`flex items-center font-medium transition-colors hover:text-gambo ${
                      location.pathname === link.href
                        ? "text-gambo"
                        : "text-gray-600"
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}

                {isLoggedIn ? (
                  <>
                    <div className="pt-4 pb-2">
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar className="h-8 w-8 bg-gambo">
                          <AvatarFallback className="bg-gambo text-white">
                            {userInitials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">My Account</span>
                      </div>
                      <div className="space-y-2">
                        <Link
                          to="/dashboard"
                          className="flex items-center text-gray-600 hover:text-gambo"
                        >
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                        <Link
                          to="/profile"
                          className="flex items-center text-gray-600 hover:text-gambo"
                        >
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Link>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="flex items-center justify-start p-0 font-medium text-gray-600 hover:bg-transparent hover:text-gambo"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link to="/login">
                      <Button variant="ghost" className="w-full justify-start">
                        Login
                      </Button>
                    </Link>
                    <Link to="/signup">
                      <Button className="w-full bg-gambo hover:bg-gambo-dark">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <div className="flex items-center gap-6">
            <nav className="flex gap-6">
              {links.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`flex items-center font-medium transition-colors hover:text-gambo ${
                    location.pathname === link.href
                      ? "text-gambo"
                      : "text-gray-600"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8 bg-gambo">
                        <AvatarFallback className="bg-gambo text-white">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          My Account
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {userName || userInitials}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        to="/dashboard"
                        className="flex w-full cursor-pointer"
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        to="/profile"
                        className="flex w-full cursor-pointer"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost">Login</Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="bg-gambo hover:bg-gambo-dark">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
