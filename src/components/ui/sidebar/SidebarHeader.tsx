import {Button} from "@/components/ui/button";
import {X} from "lucide-react";

interface SidebarHeaderProps {
  onCloseSidebar?: () => void;
  isMobile: boolean;
}

export const SidebarHeader = ({ onCloseSidebar, isMobile }: SidebarHeaderProps) => {
  return (
    <div className="p-4 flex justify-between items-center border-b">
      <h2 className="text-xl font-bold">PayBoss</h2>
      {isMobile && onCloseSidebar && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onCloseSidebar}
          className="md:hidden text-green-700 hover:bg-green-100/50"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};
