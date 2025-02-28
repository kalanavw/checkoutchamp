
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  ClipboardList, 
  BarChart2, 
  Settings, 
  FileText, 
  User, 
  LogOut, 
  Users, 
  Truck,
  Moon,
  Sun
} from "lucide-react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarProvider, 
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: Package, label: "Products", path: "/products" },
    { icon: Truck, label: "GRN", path: "/grn" },
    { icon: ClipboardList, label: "Orders", path: "/orders" },
    { icon: FileText, label: "Invoice", path: "/invoice" },
    { icon: Users, label: "Customers", path: "/customers" },
    { icon: BarChart2, label: "Reports", path: "/reports" },
    { icon: User, label: "User Management", path: "/users" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];
  
  const handleSignOut = () => {
    // Clear user session
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    
    toast({
      title: "Signed Out",
      description: "You have been signed out successfully.",
    });
    
    // Redirect to login
    navigate("/login");
  };
  
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
    
    toast({
      title: isDarkMode ? "Light Mode" : "Dark Mode",
      description: `Switched to ${isDarkMode ? "light" : "dark"} mode.`,
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarContent>
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-green-600 flex items-center justify-center text-white font-bold">
                  IS
                </div>
                <div className="flex flex-col">
                  <h1 className="font-semibold text-sm text-green-800 dark:text-green-300">Inventory System</h1>
                  <p className="text-xs text-muted-foreground">Administrator</p>
                </div>
              </div>
            </div>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton asChild>
                        <a 
                          href={item.path} 
                          className="flex items-center gap-2 text-green-900 dark:text-green-200 hover:bg-green-50 dark:hover:bg-green-900/30"
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1">
          <div className="flex items-center justify-between p-4 border-b border-border bg-green-50 dark:bg-green-900/20 h-16">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span className="font-medium text-green-800 dark:text-green-300">Inventory Management System</span>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleDarkMode}
                className="rounded-full"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="bg-green-600 text-white">
                      AD
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium">Admin User</p>
                    <p className="text-xs text-muted-foreground">admin@example.com</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-500 hover:text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
