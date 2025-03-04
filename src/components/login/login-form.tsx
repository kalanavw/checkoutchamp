
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, Image as ImageIcon, X } from "lucide-react";
import { auth, db, USER_COLLECTION } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { optimizeImageToBase64 } from "@/utils/imageUtils";

interface LoginFormProps {
  onGoogleLogin: () => Promise<void>;
  googleLoading: boolean;
}

const LoginForm = ({ onGoogleLogin, googleLoading }: LoginFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [userImage, setUserImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDocRef = doc(db, USER_COLLECTION, userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        if (userData.active === false) {
          await auth.signOut();
          toast({
            title: "Account Disabled",
            description: "Your account has been disabled. Please contact an administrator.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        
        // Store user info
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userRole", userData.role || "cashier");
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userName", userData.name || "");
        localStorage.setItem("userImage", userData.photoURL || "");
        localStorage.setItem("userId", userCredential.user.uid);
        
        // Update last login
        await setDoc(userDocRef, {
          lastLogin: serverTimestamp()
        }, { merge: true });
        
        navigate("/");
      } else {
        toast({
          title: "Error",
          description: "User record not found.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: "Invalid email or password.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast({
        title: "Error",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Check if user already exists with this email
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          toast({
            title: "Account Exists",
            description: "An account with this email already exists. Please log in.",
            variant: "destructive",
          });
          setShowRegister(false);
          return null;
        })
        .catch(async () => {
          // User doesn't exist, proceed with registration
          const { createUserWithEmailAndPassword } = await import("firebase/auth");
          return createUserWithEmailAndPassword(auth, email, password);
        });
      
      if (!userCredential) {
        setLoading(false);
        return;
      }
      
      // Process and upload user image if available
      let photoURL = null;
      if (userImage) {
        try {
          photoURL = await optimizeImageToBase64(userImage);
        } catch (error) {
          console.error("Error processing image:", error);
          toast({
            title: "Warning",
            description: "Failed to process profile image.",
          });
        }
      }
      
      // Create user document in Firestore
      const userDocRef = doc(db, USER_COLLECTION, userCredential.user.uid);
      await setDoc(userDocRef, {
        name,
        email,
        role: "cashier", // Default role for new users
        active: true,
        photoURL,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });
      
      // Store user info
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userRole", "cashier");
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userName", name);
      localStorage.setItem("userImage", photoURL || "");
      localStorage.setItem("userId", userCredential.user.uid);
      
      toast({
        title: "Success",
        description: "Account created successfully.",
      });
      
      navigate("/");
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUserImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSelectedImage = () => {
    setUserImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {!showRegister ? (
        // Login Form
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-green-100 dark:border-green-800"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-green-100 dark:border-green-800 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          
          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          
          <div className="relative flex items-center justify-center py-2">
            <div className="border-t border-gray-300 dark:border-gray-700 absolute w-full"></div>
            <span className="bg-white dark:bg-green-900/40 px-2 text-sm text-gray-500 dark:text-gray-400 relative">
              or
            </span>
          </div>
          
          <Button
            type="button"
            variant="outline"
            className="w-full border-green-200 dark:border-green-800"
            onClick={onGoogleLogin}
            disabled={googleLoading}
          >
            {googleLoading ? "Signing in with Google..." : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.3v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.08z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </>
            )}
          </Button>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <Button 
                variant="link" 
                className="p-0 h-auto text-green-600 dark:text-green-400"
                onClick={() => setShowRegister(true)}
              >
                Register
              </Button>
            </p>
          </div>
        </form>
      ) : (
        // Registration Form
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-image" className="flex items-center">
              Profile Image
              <Badge variant="outline" className="ml-2 bg-green-50 text-green-700">
                JPEG Base64
              </Badge>
            </Label>
            <div className="flex flex-col items-center gap-4">
              {imagePreview ? (
                <div className="relative w-24 h-24">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={imagePreview} alt="Preview" className="object-cover" />
                    <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={clearSelectedImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <Avatar className="w-24 h-24">
                  <AvatarFallback className="bg-green-100 text-green-800 text-xl">
                    {name ? name.charAt(0).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div className="flex items-center gap-2 w-full">
                <input
                  ref={fileInputRef}
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-green-200 dark:border-green-800"
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  {userImage ? "Change Image" : "Upload Image"}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="border-green-100 dark:border-green-800"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reg-email">Email</Label>
            <Input
              id="reg-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-green-100 dark:border-green-800"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reg-password">Password</Label>
            <div className="relative">
              <Input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-green-100 dark:border-green-800 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          
          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Button 
                variant="link" 
                className="p-0 h-auto text-green-600 dark:text-green-400"
                onClick={() => setShowRegister(false)}
              >
                Sign In
              </Button>
            </p>
          </div>
        </form>
      )}
    </div>
  );
};

export default LoginForm;
