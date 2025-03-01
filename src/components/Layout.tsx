import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { StoreInfo } from "@/types/storeInfo";
import { useIsMobile } from "@/hooks/use-mobile";
import { AuthUser } from "@/types/authUser";

const Layout = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  // Check if user is logged in
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
    } else {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user:", error);
        localStorage.removeItem("user");
        navigate("/login");
      }
    }
  }, [navigate]);

  // Fetch store information
  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        const storeSnapshot = await getDocs(collection(db, "storeInfo"));
        if (!storeSnapshot.empty) {
          const storeData = storeSnapshot.docs[0].data() as StoreInfo;
          storeData.id = storeSnapshot.docs[0].id;
          setStoreInfo(storeData);
        }
      } catch (error) {
        console.error("Error fetching store info:", error);
      }
    };

    fetchStoreInfo();
  }, []);

  // Update sidebar state when mobile state changes
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  // Show loading until authentication check completes
  if (!user) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {sidebarOpen && (
        <div className="z-20 fixed md:relative">
          <Sidebar />
          {isMobile && (
            <div
              className="fixed inset-0 bg-black/50 z-10"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </div>
      )}

      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="h-16 border-b flex items-center px-6 sticky top-0 bg-background z-10">
          {!sidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="mr-4"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div className="flex items-center gap-3">
            {storeInfo?.logoUrl && (
              <img 
                src={storeInfo.logoUrl} 
                alt={storeInfo.businessName || "Business Logo"} 
                className="h-8 w-8 object-contain"
              />
            )}
            <h1 className="text-lg font-medium">
              {storeInfo?.businessName || "POS System"}
            </h1>
          </div>
          <div className="ml-auto flex items-center gap-4">
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || "User"} 
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                {user.displayName?.charAt(0) || "U"}
              </div>
            )}
            <span className="text-sm font-medium">{user.displayName || user.email}</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      <Toaster />
    </div>
  );
};

export default Layout;
