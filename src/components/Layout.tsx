
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

  // Check authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setLoading(true);
      
      if (currentUser) {
        // User is logged in, create AuthUser object
        const authUser: AuthUser = {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          role: localStorage.getItem("userRole") || "user",
        };
        
        setUser(authUser);
        // Store user in localStorage for other components
        localStorage.setItem("user", JSON.stringify(authUser));
        
        // Try to load store info from local storage
        const cachedStoreInfo = localStorage.getItem("storeInfo");
        if (cachedStoreInfo) {
          try {
            setStoreInfo(JSON.parse(cachedStoreInfo));
          } catch (error) {
            console.error("Error parsing cached store info:", error);
          }
        }
      } else {
        // User is not logged in, redirect to login
        localStorage.removeItem("user");
        setUser(null);
        navigate("/login");
      }
      
      setLoading(false);
    });

    // Clean up subscription
    return () => unsubscribe();
  }, [navigate]);

  // Fetch store information
  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        const storeSnapshot = await getDocs(collection(db, STOREINFO_COLLECTION));
        if (!storeSnapshot.empty) {
          const storeData = storeSnapshot.docs[0].data() as StoreInfo;
          storeData.id = storeSnapshot.docs[0].id;
          setStoreInfo(storeData);
          
          // Save to localStorage for future use
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

  // Listen for storeInfo changes in localStorage (for updates from Settings page)
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

  // Update sidebar state when mobile state changes
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  // Show loading until authentication check completes
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is not authenticated, Layout component shouldn't render at all
  // The redirect happens in the useEffect above
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
            <Button
              variant="ghost"
              className="p-0 flex items-center gap-2"
              onClick={() => navigate("/user/profile")}
            >
              {user.photoURL ? (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL} alt={user.displayName || "User"} />
                  <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                  {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                </div>
              )}
              <span className="text-sm font-medium">{user.displayName || user.email}</span>
            </Button>
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
