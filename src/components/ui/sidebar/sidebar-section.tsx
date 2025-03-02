
import { ReactNode } from "react";

interface SidebarSectionProps {
  title?: string;
  children: ReactNode;
}

const SidebarSection = ({ title, children }: SidebarSectionProps) => {
  return (
    <>
      {title && (
        <div className="py-1">
          <div className="px-3 text-xs uppercase text-muted-foreground tracking-wider">
            {title}
          </div>
        </div>
      )}
      {children}
    </>
  );
};

export default SidebarSection;
