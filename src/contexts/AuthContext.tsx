
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { AuthUser } from '@/types/authUser';
import { clearAllAppCache } from '@/utils/cacheUtils';

// Default timeout in ms (10 minutes)
const INACTIVITY_TIMEOUT = 10 * 60 * 1000;

interface AuthContextType {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  resetInactivityTimer: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  
  // Function to handle logout
  const logout = async () => {
    try {
      await auth.signOut();
      clearAllAppCache(); // Clear all app-related data from localStorage
      setCurrentUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  // Reset inactivity timer
  const resetInactivityTimer = () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    
    const newTimer = setTimeout(() => {
      console.log('User inactive for 10 minutes, logging out...');
      logout();
    }, INACTIVITY_TIMEOUT);
    
    setInactivityTimer(newTimer);
  };
  
  // Setup auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(true);
      
      if (user) {
        // Get user data from localStorage
        const userRole = localStorage.getItem("userRole") || "user";
        
        const authUser: AuthUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: userRole,
        };
        
        setCurrentUser(authUser);
        resetInactivityTimer(); // Initialize timer when user is authenticated
      } else {
        setCurrentUser(null);
        // Clear timer if user is not authenticated
        if (inactivityTimer) {
          clearTimeout(inactivityTimer);
          setInactivityTimer(null);
        }
      }
      
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Setup event listeners for user activity
  useEffect(() => {
    if (!currentUser) return;
    
    const eventTypes = ['mousedown', 'keypress', 'scroll', 'touchstart'];
    
    const activityHandler = () => {
      resetInactivityTimer();
    };
    
    // Add event listeners for user activity
    eventTypes.forEach(type => {
      window.addEventListener(type, activityHandler);
    });
    
    // Initialize timer when component mounts
    resetInactivityTimer();
    
    // Clean up event listeners and timer
    return () => {
      eventTypes.forEach(type => {
        window.removeEventListener(type, activityHandler);
      });
      
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
    };
  }, [currentUser]);
  
  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    loading,
    logout,
    resetInactivityTimer,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
