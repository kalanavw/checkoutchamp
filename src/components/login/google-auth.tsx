
import { useNavigate } from "react-router-dom";
import { auth, db, googleProvider, USER_COLLECTION } from "@/lib/firebase";
import { browserPopupRedirectResolver, signInWithPopup } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { Notifications } from "@/utils/notifications";
import { AuthUser } from "@/types/authUser";
import { useAuth } from "@/contexts/AuthContext";

export const useGoogleAuth = () => {
  const navigate = useNavigate();
  const { resetInactivityTimer } = useAuth();
  
  const handleGoogleLogin = async () => {
    try {
      // Use browserPopupRedirectResolver to help with COOP issues
      const result = await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
      const user = result.user;
      
      // Check if user exists in our users collection
      const userDocRef = doc(db, USER_COLLECTION, user.uid);
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
          createdDate: serverTimestamp()
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
        Notifications.error("Your account has been disabled. Please contact an administrator.");
        return false;
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
      
      Notifications.success("You've been logged in with Google.");
      resetInactivityTimer(); // Reset inactivity timer after successful login
      
      navigate("/");
      return true;
    } catch (error) {
      console.error("Google login error:", error);
      Notifications.error("An error occurred during Google login.");
      return false;
    }
  };

  return { handleGoogleLogin };
};
