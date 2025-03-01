
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  Users,
  FileSpreadsheet,
  Receipt,
  Truck,
  ClipboardList,
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("user");
      localStorage.removeItem("userName");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="h-screen w-64 border-r bg-background flex flex-col">
      <div className="p-6">
        <h2 className="text-xl font-bold">POS System</h2>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        <NavLink to="/" end>
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

        <NavLink to="/products">
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

        <NavLink to="/checkout">
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

        <NavLink to="/orders">
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

        <NavLink to="/invoice">
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
              <Receipt className="mr-2 h-4 w-4" />
              Invoice
            </Button>
          )}
        </NavLink>

        <div className="py-1">
          <div className="px-3 text-xs uppercase text-muted-foreground tracking-wider">
            Inventory
          </div>
        </div>

        <NavLink to="/grn">
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

        <NavLink to="/grn-list">
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
            Administration
          </div>
        </div>

        <NavLink to="/users">
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

        <NavLink to="/settings">
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
