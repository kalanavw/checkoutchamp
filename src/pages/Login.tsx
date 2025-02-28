
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { EyeIcon, EyeOffIcon, LockKeyhole, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      toast({
        title: "Error",
        description: "Please enter both username and password.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    // Simulating authentication
    setTimeout(() => {
      setLoading(false);
      
      // Hardcoded demo login (replace with real authentication)
      if (formData.username === "admin" && formData.password === "admin") {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userRole", "admin");
        navigate("/");
      } else {
        toast({
          title: "Authentication Failed",
          description: "Invalid username or password. Try using admin/admin for the demo.",
          variant: "destructive",
        });
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/40 dark:to-green-800/40">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-700 dark:text-green-300">Inventory System</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Sign in to access your dashboard</p>
        </div>
        
        <Card className="shadow-xl border-green-100 dark:border-green-900/50">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-2xl text-center text-green-800 dark:text-green-300">Welcome back</CardTitle>
            <CardDescription className="text-center">Enter your credentials to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="username"
                    name="username"
                    placeholder="Enter your username"
                    className="pl-10"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a 
                    href="#" 
                    className="text-xs text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                    onClick={(e) => {
                      e.preventDefault();
                      toast({
                        title: "Password Reset",
                        description: "Password reset functionality will be added soon.",
                      });
                    }}
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-10 bg-green-600 hover:bg-green-700" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
              
              <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                Don't have an account?{" "}
                <a 
                  href="#" 
                  className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                  onClick={(e) => {
                    e.preventDefault();
                    toast({
                      title: "Registration",
                      description: "Registration functionality will be available soon.",
                    });
                  }}
                >
                  Contact admin
                </a>
              </div>
              
              {/* Demo credentials for ease of testing */}
              <div className="text-center mt-4 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Demo credentials: <strong>admin / admin</strong>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
