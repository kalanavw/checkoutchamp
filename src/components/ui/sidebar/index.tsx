
import { useNavigate, useLocation } from "react-router-dom";
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
import NavLink from "./nav-link";
import SidebarSection from "./sidebar-section";

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
        <NavLink to="/" icon={LayoutDashboard} end>
          Dashboard
        </NavLink>

        <NavLink to="/products" icon={Package}>
          Products
        </NavLink>

        <NavLink to="/checkout" icon={ShoppingCart}>
          Checkout
        </NavLink>

        <NavLink to="/orders" icon={FileSpreadsheet}>
          Orders
        </NavLink>

        <NavLink to="/invoice" icon={Receipt}>
          Invoice
        </NavLink>

        <SidebarSection title="Inventory">
          <NavLink to="/grn" icon={Truck}>
            Create GRN
          </NavLink>

          <NavLink to="/grn-list" icon={ClipboardList}>
            GRN Records
          </NavLink>
        </SidebarSection>

        <SidebarSection title="Administration">
          <NavLink to="/users" icon={Users}>
            Users
          </NavLink>

          <NavLink to="/settings" icon={Settings}>
            Settings
          </NavLink>
        </SidebarSection>
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
