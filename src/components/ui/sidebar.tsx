
import {NavLink, useLocation, useNavigate} from "react-router-dom";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {
  ClipboardList,
  FileBarChart,
  FileSpreadsheet,
  FileText,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Store,
  Truck,
  Users,
  X
} from "lucide-react";
import {auth} from "@/lib/firebase";
import {signOut} from "firebase/auth";
import {clearAllAppCache} from "@/utils/cacheUtils";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  onCloseSidebar?: () => void;
}

const Sidebar = ({ onCloseSidebar }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      
      // Clear all cache data
      clearAllAppCache();
      
      // These are still needed for complete cleanup
      localStorage.removeItem("user");
      localStorage.removeItem("userName");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userImage");
      localStorage.removeItem("userId");
      localStorage.removeItem("isLoggedIn");
      
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleNavClick = () => {
    if (isMobile && onCloseSidebar) {
      onCloseSidebar();
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="h-screen w-64 border-r bg-background flex flex-col z-30">
      <div className="p-6 flex justify-between items-center">
        <h2 className="text-xl font-bold">POS System</h2>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onCloseSidebar}
            className="md:hidden text-green-700 hover:bg-green-100/50"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        <NavLink to="/" end onClick={handleNavClick}>
          {({ isActive }) => (
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          )}
        </NavLink>

        <NavLink to="/products" onClick={handleNavClick}>
          {({ isActive }) => (
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Package className="mr-2 h-4 w-4" />
              Products
            </Button>
          )}
        </NavLink>

        <NavLink to="/checkout" onClick={handleNavClick}>
          {({ isActive }) => (
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Checkout
            </Button>
          )}
        </NavLink>

        <NavLink to="/orders" onClick={handleNavClick}>
          {({ isActive }) => (
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Orders
            </Button>
          )}
        </NavLink>

        <div className="py-1">
          <div className="px-3 text-xs uppercase text-muted-foreground tracking-wider">
            Invoicing
          </div>
        </div>

        <NavLink to="/store" onClick={handleNavClick}>
          {({isActive}) => (
              <Button
                  variant="ghost"
                  className={cn(
                      "w-full justify-start",
                      isActive
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent hover:text-accent-foreground"
                  )}
              >
                <FileText className="mr-2 h-4 w-4"/>
                Store
              </Button>
          )}
        </NavLink>

        <NavLink to="/invoice" onClick={handleNavClick}>
          {({ isActive }) => (
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <FileText className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          )}
        </NavLink>

        <NavLink to="/invoice-list" onClick={handleNavClick}>
          {({ isActive }) => (
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <FileBarChart className="mr-2 h-4 w-4" />
              Invoice Records
            </Button>
          )}
        </NavLink>

        <div className="py-1">
          <div className="px-3 text-xs uppercase text-muted-foreground tracking-wider">
            Inventory
          </div>
        </div>

        <NavLink to="/grn" onClick={handleNavClick}>
          {({ isActive }) => (
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Truck className="mr-2 h-4 w-4" />
              Create GRN
            </Button>
          )}
        </NavLink>

        <NavLink to="/grn-list" onClick={handleNavClick}>
          {({ isActive }) => (
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              GRN Records
            </Button>
          )}
        </NavLink>

        <div className="py-1">
          <div className="px-3 text-xs uppercase text-muted-foreground tracking-wider">
            Management
          </div>
        </div>

        <NavLink to="/customers" onClick={handleNavClick}>
          {({ isActive }) => (
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Store className="mr-2 h-4 w-4" />
              Customers
            </Button>
          )}
        </NavLink>

        <NavLink to="/users" onClick={handleNavClick}>
          {({ isActive }) => (
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Users className="mr-2 h-4 w-4" />
              Users
            </Button>
          )}
        </NavLink>

        <NavLink to="/settings" onClick={handleNavClick}>
          {({ isActive }) => (
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          )}
        </NavLink>
      </nav>

      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
