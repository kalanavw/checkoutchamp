
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
}

export const LoadingSpinner = ({ size = "md" }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-12 w-12",
    lg: "h-16 w-16"
  };

  return (
    <div className="flex justify-center items-center h-96">
      <div className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 border-primary`}></div>
    </div>
  );
};
