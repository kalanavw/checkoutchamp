
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AuthUser } from "@/types/authUser";
import { StoreInfo } from "@/types/storeInfo";

interface AppHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  storeInfo: StoreInfo | null;
  user: AuthUser | null;
}

export const AppHeader = ({ sidebarOpen, setSidebarOpen, storeInfo, user }: AppHeaderProps) => {
  const navigate = useNavigate();

  if (!user) return null;

  return (
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
  );
};
