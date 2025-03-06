
import { Toast, toast } from "sonner";

// Re-export the toast function from sonner
export { toast };

// Create a custom hook that wraps the toast functionality
export const useToast = () => {
  return {
    toast: (props: Toast) => toast(props),
    // These are convenience methods to match the old toast API
    success: (message: string, options?: Toast) => 
      toast.success(message, options),
    error: (message: string, options?: Toast) => 
      toast.error(message, options),
    warning: (message: string, options?: Toast) => 
      toast.warning(message, options),
    info: (message: string, options?: Toast) => 
      toast.info(message, options),
  };
};
