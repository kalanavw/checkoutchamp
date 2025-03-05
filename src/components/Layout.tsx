
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "@/components/ui/sidebar";
import { collection, getDocs } from "firebase/firestore";
import {db, auth, STOREINFO_COLLECTION} from "@/lib/firebase";
import { StoreInfo } from "@/types/storeInfo";
import { useIsMobile } from "@/hooks/use-mobile";
import { AuthUser } from "@/types/authUser";
import { onAuthStateChanged } from "firebase/auth";
import { AppHeader } from "@/components/ui/AppHeader";
import {Notifications} from "@/utils/notifications.ts";

const Layout = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setLoading(true);
      
      if (currentUser) {
        const authUser: AuthUser = {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          role: localStorage.getItem("userRole") || "user",
        };
        
        setUser(authUser);
        localStorage.setItem("user", JSON.stringify(authUser));
        
        const cachedStoreInfo = localStorage.getItem("storeInfo");
        if (cachedStoreInfo) {
          try {
            setStoreInfo(JSON.parse(cachedStoreInfo));
          } catch (error) {
            console.error("Error parsing cached store info:", error);
          }
        }
      } else {
        localStorage.removeItem("user");
        setUser(null);
        navigate("/login");
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

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
      }
    };

    if (user) {
      fetchStoreInfo();
    }
  }, [user]);

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
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
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
        <AppHeader 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          storeInfo={storeInfo} 
          user={user} 
        />

        <main className="flex-1 overflow-auto bg-gradient-to-br from-green-50/50 to-white dark:from-gray-900 dark:to-green-950/30">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
