
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { User } from "lucide-react";

const Login = () => {
  const { toast } = useToast();

  const handleLogin = () => {
    toast({
      title: "Authentication",
      description: "Google authentication will be implemented here.",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full h-12"
            onClick={handleLogin}
            variant="outline"
          >
            <User className="mr-2 h-5 w-5" />
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
