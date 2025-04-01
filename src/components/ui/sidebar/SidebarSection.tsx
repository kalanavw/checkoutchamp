
interface SidebarSectionProps {
  title: string;
}

export const SidebarSection = ({ title }: SidebarSectionProps) => {
  return (
    <div className="py-1">
      <div className="px-3 text-xs uppercase text-muted-foreground tracking-wider">
        {title}
      </div>
    </div>
  );
};
