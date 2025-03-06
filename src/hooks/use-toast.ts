
import { toast } from "sonner";

export type ToastProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
};

export function useToast() {
  return {
    toast: ({ title, description, action, variant }: ToastProps) => {
      toast(title, {
        description,
        action,
        className: variant === "destructive" ? "bg-destructive text-destructive-foreground" : undefined,
      });
    },
  };
}

export { toast };
