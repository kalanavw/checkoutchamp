
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '@/components/login/login-form';
import { useGoogleAuth } from '@/components/login/google-auth';
import { useTheme } from '@/hooks/useTheme';
import { Notifications } from '@/utils/notifications';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Login = () => {
  const navigate = useNavigate();
  const [googleLoading, setGoogleLoading] = useState(false);
  const { theme, setTheme } = useTheme();
  const { handleGoogleLogin: GoogleAuth } = useGoogleAuth();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (isLoggedIn) {
      navigate("/");
    }
  }, [navigate]);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await GoogleAuth();
      navigate("/");
    } catch (error: any) {
      console.error("Google login error:", error);
      Notifications.error(error.message || "Google login failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/40 dark:to-green-800/40">
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-green-700 dark:text-green-300 hover:bg-green-200/50 dark:hover:bg-green-800/50"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white dark:bg-green-900/30 shadow-xl rounded-xl border border-green-100 dark:border-green-800/50 overflow-hidden backdrop-blur-sm">
            <div className="p-6 sm:p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-green-800 dark:text-green-300 mb-2">Welcome Back</h1>
                <p className="text-gray-600 dark:text-gray-300">Sign in to your account to continue</p>
              </div>
              
              <LoginForm
                onGoogleLogin={handleGoogleLogin}
                googleLoading={googleLoading}
              />
            </div>
          </div>
        </div>
      </div>
      
      <footer className="py-4 text-center text-gray-600 dark:text-gray-400 text-sm">
        <p>© {new Date().getFullYear()} StockChamp. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Login;
