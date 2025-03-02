
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { EyeIcon, EyeOffIcon, LockKeyhole, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { auth, googleProvider, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, signInWithPopup, onAuthStateChanged, browserPopupRedirectResolver } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { AuthUser } from "@/types/authUser";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

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
    
    try {
      // For demo purposes, still allow admin/admin login
      if (formData.username === "admin" && formData.password === "admin") {
        const mockUser: AuthUser = {
          uid: "admin-mock-uid",
          email: "admin@example.com",
          displayName: "Admin User",
          photoURL: null,
          role: "admin"
        };
        
        localStorage.setItem("user", JSON.stringify(mockUser));
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userRole", "admin");
        navigate("/");
        return;
      }
      
      // Attempt Firebase email authentication
      await signInWithEmailAndPassword(auth, formData.username, formData.password);
      
      const user = auth.currentUser;
      if (user) {
        // Get user data from firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        let role = "cashier"; // Default role
        let isActive = true;
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          role = userData.role || "cashier";
          isActive = userData.active !== false; // Default to true if not specified
        }
        
        if (!isActive) {
          await auth.signOut();
          toast({
            title: "Account Disabled",
            description: "Your account has been disabled. Please contact an administrator.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        
        // Create AuthUser object and store it
        const authUser: AuthUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: role
        };
        
        localStorage.setItem("user", JSON.stringify(authUser));
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userRole", role);
        localStorage.setItem("userEmail", user.email || "");
        localStorage.setItem("userName", user.displayName || "");
        localStorage.setItem("userImage", user.photoURL || "");
        localStorage.setItem("userId", user.uid);
        
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Authentication Failed",
        description: "Invalid email or password. Try using admin/admin for the demo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    
    try {
      // Use browserPopupRedirectResolver to help with COOP issues
      const result = await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
      const user = result.user;
      
      // Check if user exists in our users collection
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      // Create or update user document
      if (!userDoc.exists()) {
        // New user, create document
        await setDoc(userDocRef, {
          id: user.uid,
          name: user.displayName || "User",
          email: user.email || "",
          role: "cashier", // Default role for new users
          active: true,
          photoURL: user.photoURL || "",
          createdAt: serverTimestamp()
        });
      } else {
        // Existing user, update their profile info in case it changed on Google's side
        const userData = userDoc.data();
        await setDoc(userDocRef, {
          ...userData,
          name: user.displayName || userData.name || "User",
          email: user.email || userData.email || "",
          photoURL: user.photoURL || userData.photoURL || "",
          lastLogin: serverTimestamp()
        }, { merge: true });
      }
      
      // Get user role from firestore
      const updatedUserDoc = await getDoc(userDocRef);
      const userData = updatedUserDoc.data();
      const userRole = userData && userData.role ? userData.role : "cashier";
      const isActive = userData && userData.active !== undefined ? userData.active : true;
      
      if (!isActive) {
        // User is disabled
        await auth.signOut();
        toast({
          title: "Account Disabled",
          description: "Your account has been disabled. Please contact an administrator.",
          variant: "destructive",
        });
        setGoogleLoading(false);
        return;
      }
      
      // Create AuthUser object and store it
      const authUser: AuthUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: userRole
      };
      
      // Store user info in localStorage
      localStorage.setItem("user", JSON.stringify(authUser));
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userRole", userRole);
      localStorage.setItem("userEmail", user.email || "");
      localStorage.setItem("userName", user.displayName || "");
      localStorage.setItem("userImage", user.photoURL || "");
      localStorage.setItem("userId", user.uid);
      
      toast({
        title: "Google Login Successful",
        description: "You've been logged in with Google.",
      });
      
      navigate("/");
    } catch (error) {
      console.error("Google login error:", error);
      toast({
        title: "Google Login Failed",
        description: "An error occurred during Google login.",
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
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
                <Label htmlFor="username">Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="username"
                    name="username"
                    placeholder="Enter your email"
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

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-gray-500 dark:text-gray-400">Or continue with</span>
                </div>
              </div>

              <Button 
                type="button" 
                variant="outline" 
                className="w-full h-10 flex items-center justify-center gap-2 border-gray-300 dark:border-gray-700"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                    Connecting...
                  </div>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
                      <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z" />
                      <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z" />
                      <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z" />
                      <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z" />
                    </svg>
                    <span>Sign in with Google</span>
                  </>
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
