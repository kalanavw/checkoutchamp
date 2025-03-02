
import { NavLink as RouterNavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface NavLinkProps {
  to: string;
  icon: LucideIcon;
  children: React.ReactNode;
  end?: boolean;
}

const NavLink = ({ to, icon: Icon, children, end }: NavLinkProps) => {
  return (
    <RouterNavLink to={to} end={end}>
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
          <Icon className="mr-2 h-4 w-4" />
          {children}
        </Button>
      )}
    </RouterNavLink>
  );
};

export default NavLink;
