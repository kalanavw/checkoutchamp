
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "@/components/ui/sidebar";
import { collection, getDocs } from "firebase/firestore";
import {db, STOREINFO_COLLECTION} from "@/lib/firebase";
import { StoreInfo } from "@/types/storeInfo";
import { useIsMobile } from "@/hooks/use-mobile";
import { AppHeader } from "@/components/ui/AppHeader";
import {Notifications} from "@/utils/notifications.ts";
import { useAuth } from "@/contexts/AuthContext";

const Layout = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { currentUser, resetInactivityTimer } = useAuth();

  useEffect(() => {
    // Reset inactivity timer on route change
    resetInactivityTimer();
  }, [resetInactivityTimer, navigate]);

  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        const storeSnapshot = await getDocs(collection(db, STOREINFO_COLLECTION));
        if (!storeSnapshot.empty) {
          const storeData = storeSnapshot.docs[0].data() as StoreInfo;
          storeData.id = storeSnapshot.docs[0].id;
          setStoreInfo(storeData);
          
          localStorage.setItem("storeInfo", JSON.stringify(storeData));
        }
      } catch (error) {
        console.error("Error fetching store info:", error);
        Notifications.error("Failed to load store information");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchStoreInfo();
    }
  }, [currentUser]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "storeInfo" && e.newValue) {
        try {
          const newStoreInfo = JSON.parse(e.newValue);
          setStoreInfo(newStoreInfo);
        } catch (error) {
          console.error("Error parsing updated store info from storage:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    // Close sidebar by default on mobile
    setSidebarOpen(!isMobile);
    
    // Handle resize events
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile sidebar with overlay */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={handleCloseSidebar} />
      )}
      
      {/* Sidebar container */}
      <div 
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed md:relative inset-y-0 left-0 z-50 md:z-30 transition-transform duration-300 ease-in-out md:translate-x-0`}
      >
        <Sidebar onCloseSidebar={handleCloseSidebar} />
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        <AppHeader 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          storeInfo={storeInfo} 
          user={currentUser} 
        />

        <main className="flex-1 overflow-auto bg-gradient-to-br from-green-50/50 to-white dark:from-gray-900 dark:to-green-950/30">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
