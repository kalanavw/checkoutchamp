
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface SidebarFooterProps {
  onLogout: () => Promise<void>;
}

export const SidebarFooter = ({ onLogout }: SidebarFooterProps) => {
  return (
    <div className="p-4 border-t">
      <Button
        variant="ghost"
        className="w-full justify-start text-muted-foreground hover:text-foreground"
        onClick={onLogout}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </div>
  );
};
