
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SidebarNavItemProps {
  to: string;
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  end?: boolean;
}

export const SidebarNavItem = ({ to, icon, label, onClick, end }: SidebarNavItemProps) => {
  return (
    <NavLink to={to} end={end} onClick={onClick}>
      {({ isActive }) => (
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start",
            isActive
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent hover:text-accent-foreground"
          )}
        >
          {icon}
          {label}
        </Button>
      )}
    </NavLink>
  );
};
