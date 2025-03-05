import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import {db, auth, STOREINFO_COLLECTION} from "@/lib/firebase";
import { StoreInfo } from "@/types/storeInfo";
import { useIsMobile } from "@/hooks/use-mobile";
import { AuthUser } from "@/types/authUser";
import { onAuthStateChanged } from "firebase/auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
        toast({
          title: "Error",
          description: "Failed to load store information",
          variant: "destructive",
        });
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
        <header className="h-16 border-b border-green-100 dark:border-green-800/50 flex items-center px-6 sticky top-0 bg-white/90 dark:bg-green-900/90 backdrop-blur-sm z-10">
          {!sidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="mr-4 text-green-700 hover:bg-green-100/50 dark:text-green-300 dark:hover:bg-green-800/50"
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
                className="h-8 w-8 object-contain rounded-full border border-green-100 dark:border-green-700"
              />
            )}
            <h1 className="text-lg font-medium text-green-800 dark:text-green-300">
              {storeInfo?.businessName || "POS System"}
            </h1>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <Button
              variant="ghost"
              className="p-0 flex items-center gap-2 text-green-700 hover:bg-green-100/50 dark:text-green-300 dark:hover:bg-green-800/50"
              onClick={() => navigate("/user/profile")}
            >
              {user.photoURL ? (
                <Avatar className="h-8 w-8 border border-green-200 dark:border-green-700">
                  <AvatarImage src={user.photoURL} alt={user.displayName || "User"} />
                  <AvatarFallback className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200">{user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              ) : (
                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center text-green-800 dark:text-green-200 text-sm font-medium border border-green-200 dark:border-green-700">
                  {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                </div>
              )}
              <span className="text-sm font-medium">{user.displayName || user.email}</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-gradient-to-br from-green-50/50 to-white dark:from-gray-900 dark:to-green-950/30">
          <Outlet />
        </main>
      </div>

      <Toaster />
    </div>
  );
};

export default Layout;
