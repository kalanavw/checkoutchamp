
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
import { SidebarHeader } from "./SidebarHeader";
import { SidebarNavItem } from "./SidebarNavItem";
import { SidebarSection } from "./SidebarSection";
import { SidebarFooter } from "./SidebarFooter";

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

  return (
    <div className="h-screen w-64 border-r bg-background flex flex-col z-30">
      <SidebarHeader onCloseSidebar={onCloseSidebar} isMobile={isMobile} />

      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        <SidebarNavItem 
          to="/" 
          icon={<LayoutDashboard className="mr-2 h-4 w-4" />} 
          label="Dashboard" 
          onClick={handleNavClick} 
          end 
        />

        <SidebarNavItem 
          to="/products" 
          icon={<Package className="mr-2 h-4 w-4" />} 
          label="Products" 
          onClick={handleNavClick} 
        />

        <SidebarNavItem 
          to="/checkout" 
          icon={<ShoppingCart className="mr-2 h-4 w-4" />} 
          label="Checkout" 
          onClick={handleNavClick} 
        />

        <SidebarNavItem 
          to="/orders" 
          icon={<FileSpreadsheet className="mr-2 h-4 w-4" />} 
          label="Orders" 
          onClick={handleNavClick} 
        />

        <SidebarSection title="Invoicing" />

        <SidebarNavItem 
          to="/store" 
          icon={<FileText className="mr-2 h-4 w-4" />} 
          label="Store" 
          onClick={handleNavClick} 
        />

        <SidebarNavItem 
          to="/invoice" 
          icon={<FileText className="mr-2 h-4 w-4" />} 
          label="Create Invoice" 
          onClick={handleNavClick} 
        />

        <SidebarNavItem 
          to="/invoice-list" 
          icon={<FileBarChart className="mr-2 h-4 w-4" />} 
          label="Invoice Records" 
          onClick={handleNavClick} 
        />

        <SidebarSection title="Inventory" />

        <SidebarNavItem 
          to="/grn" 
          icon={<Truck className="mr-2 h-4 w-4" />} 
          label="Create GRN" 
          onClick={handleNavClick} 
        />

        <SidebarNavItem 
          to="/grn-list" 
          icon={<ClipboardList className="mr-2 h-4 w-4" />} 
          label="GRN Records" 
          onClick={handleNavClick} 
        />

        <SidebarSection title="Management" />

        <SidebarNavItem 
          to="/customers" 
          icon={<Store className="mr-2 h-4 w-4" />} 
          label="Customers" 
          onClick={handleNavClick} 
        />

        <SidebarNavItem 
          to="/users" 
          icon={<Users className="mr-2 h-4 w-4" />} 
          label="Users" 
          onClick={handleNavClick} 
        />

        <SidebarNavItem 
          to="/settings" 
          icon={<Settings className="mr-2 h-4 w-4" />} 
          label="Settings" 
          onClick={handleNavClick} 
        />
      </nav>

      <SidebarFooter onLogout={handleLogout} />
    </div>
  );
};

export default Sidebar;
