
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { AuthUser } from "@/types/authUser";
import LoginForm from "@/components/login/login-form";
import { useGoogleAuth } from "@/components/login/google-auth";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [googleLoading, setGoogleLoading] = useState(false);
  const { handleGoogleLogin } = useGoogleAuth();

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // If user is already authenticated, redirect to dashboard
        const authUser: AuthUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: localStorage.getItem("userRole") || "user",
        };
        
        localStorage.setItem("user", JSON.stringify(authUser));
        navigate("/");
      }
    });
    
    return () => unsubscribe();
  }, [navigate]);

  const handleGoogleLoginWrapper = async () => {
    setGoogleLoading(true);
    await handleGoogleLogin();
    setGoogleLoading(false);
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
            <LoginForm 
              onGoogleLogin={handleGoogleLoginWrapper}
              googleLoading={googleLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
