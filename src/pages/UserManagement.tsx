// Import the relevant components and hooks
import {useEffect, useRef, useState} from "react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {auth, db, USER_COLLECTION} from "@/lib/firebase";
import {collection, doc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc, where,} from "firebase/firestore";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {
  Eye,
  EyeOff,
  Image as ImageIcon,
  Lock,
  Mail,
  RefreshCw,
  Search,
  User as UserIcon,
  UserPlus,
  X
} from "lucide-react";
import {UserRole} from "@/types/user";
import {Switch} from "@/components/ui/switch";
import {createUserWithEmailAndPassword} from "firebase/auth";
import {getFromCache, isCacheValid, saveToCache} from "@/utils/cacheUtils";
import {
  COLLECTION_KEYS,
  saveCollectionFetchTime,
  saveCollectionUpdateTime,
  shouldFetchCollection
} from "@/utils/collectionUtils";
import UserManagementTable from "@/components/users/UserManagementTable";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {Badge} from "@/components/ui/badge";
import {Notifications} from "@/utils/notifications";
import {fileStorageService} from "@/services/FileStorageService.ts";

// Cache key
const USERS_CACHE_KEY = "users_cache";

interface UserData {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  active: boolean;
  createdDate: Date;
  photoURL?: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "cashier" as UserRole,
    active: true,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsRefreshing(true);
    try {
      // Check if we need to refresh based on collection timestamps
      const shouldRefresh = shouldFetchCollection(COLLECTION_KEYS.USERS);
      
      // Try to get from cache first if we don't need to refresh
      if (!shouldRefresh && isCacheValid(USERS_CACHE_KEY)) {
        const cachedUsers = getFromCache<UserData[]>(USERS_CACHE_KEY);
        if (cachedUsers) {
          setUsers(cachedUsers);
          setIsRefreshing(false);
          console.log("Using cached users");
          return;
        }
      }
      
      // Fetch from Firestore if cache is invalid or doesn't exist
      const usersQuery = query(collection(db, USER_COLLECTION), orderBy("createdDate", "desc"));
      const snapshot = await getDocs(usersQuery);
      
      const fetchedUsers: UserData[] = [];
      snapshot.forEach((doc) => {
        const userData = doc.data();
        fetchedUsers.push({
          id: doc.id,
          name: userData.name || userData.displayName || "",
          email: userData.email || "",
          password: userData.password || "",
          role: userData.role || "cashier",
          active: userData.active ?? true,
          createdDate: userData.createdDate?.toDate() || new Date(),
          photoURL: userData.photoURL || "",
        });
      });
      
      setUsers(fetchedUsers);
      
      // Save to cache and update fetch timestamp
      saveToCache(USERS_CACHE_KEY, fetchedUsers);
      saveCollectionFetchTime(COLLECTION_KEYS.USERS);
    } catch (error) {
      console.error("Error fetching users:", error);
      Notifications.error("Failed to load users. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadUserImage = async (): Promise<string | null> => {
    if (!selectedImage) return null;
    debugger
    try {
      // Convert to base64
      // return await optimizeImageToBase64(selectedImage);
      return await fileStorageService.uploadImage(selectedImage, "user")
    } catch (error) {
      console.error("Error processing image:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      Notifications.error("All fields are required.")
      return;
    }
    
    setLoading(true);
    
    try {
      const emailQuery = query(collection(db, USER_COLLECTION), where("email", "==", formData.email));
      const emailSnapshot = await getDocs(emailQuery);
      
      if (!emailSnapshot.empty) {
        Notifications.error("A user with this email already exists.")
        setLoading(false);
        return;
      }

      const authCreateUser = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const userDocRef = doc(db, USER_COLLECTION, authCreateUser.user.uid);
      const newUser = {
        ...formData,
        createdDate: serverTimestamp(),
        modifiedDate: serverTimestamp(),
        id: authCreateUser.user.uid
      };
      await setDoc(userDocRef, newUser)
      console.log("User created:", formData.email);
      
      let photoURL = "";
      if (selectedImage) {
        try {
          photoURL = await uploadUserImage() || "";
          await updateDoc(doc(db, USER_COLLECTION, newUser.id), {photoURL});
        } catch (error) {
          console.error("Error with user image:", error);
          Notifications.warning("User created but profile image upload failed.");
        }
      }
      
      const userWithId: UserData = {
        ...newUser,
        createdDate: new Date(),
        photoURL,
      };
      // Update the collection update timestamp
      saveCollectionUpdateTime(COLLECTION_KEYS.USERS);
      
      // Update users array and cache
      const updatedUsers = [userWithId, ...users];
      setUsers(updatedUsers);
      saveToCache(USERS_CACHE_KEY, updatedUsers);

      Notifications.success("User added successfully.");
      
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "cashier",
        active: true,
      });
      clearSelectedImage();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error adding user:", error);
      let errorMessage;
      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "This email is already in use. Please use a different one.";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email format. Please enter a valid email address.";
          break;
        case "auth/weak-password":
          errorMessage = "Password is too weak. Use at least 6 characters.";
          break;
        case "auth/network-request-failed":
          errorMessage = "Network error. Please check your internet connection.";
          break;
        case "auth/operation-not-allowed":
          errorMessage = "This operation is not allowed. Contact support.";
          break;
        default:
          errorMessage = error.message; // Fallback to Firebase's default message
      }

      Notifications.error(errorMessage);

    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUsers = (updatedUsers: UserData[]) => {
    setUsers(updatedUsers);
  };

  return (
    <div className="p-6 space-y-6 w-full animate-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-semibold text-primary">User Management</h1>
        <div className="flex gap-2">
          <Button 
            onClick={fetchUsers} 
            variant="outline"
            disabled={isRefreshing}
            className="border-primary/30 hover:bg-primary/10"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-primary hover:bg-primary/80">
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      <Card className="shadow-md bg-secondary/30 border-theme-light">
        <CardHeader className="bg-gradient-to-r from-secondary to-secondary/50 rounded-t-lg pb-2">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <CardTitle className="text-primary">System Users</CardTitle>
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-primary/30 focus:border-primary"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <UserManagementTable 
            users={users} 
            searchQuery={searchQuery} 
            onUpdateUsers={handleUpdateUsers} 
          />
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/40 dark:to-green-800/40 border-green-100 dark:border-green-900/50 shadow-xl">
          <DialogHeader className="space-y-1 pb-2">
            <DialogTitle className="text-2xl text-center text-green-800 dark:text-green-300 flex items-center justify-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add New User
            </DialogTitle>
            <p className="text-center text-gray-600 dark:text-gray-400">Enter user details to create an account</p>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-image" className="flex items-center">
                Profile Image
                <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 dark:bg-green-900/60 dark:text-green-300">
                  JPEG Base64
                </Badge>
              </Label>
              <div className="flex flex-col items-center gap-4">
                {imagePreview ? (
                  <div className="relative w-24 h-24">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-24 h-24 rounded-full object-cover border-2 border-green-300 dark:border-green-600"
                    />
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
                  <div className="flex items-center justify-center w-24 h-24 bg-green-100 dark:bg-green-800/40 rounded-full border-2 border-dashed border-green-300 dark:border-green-600">
                    <UserIcon className="h-10 w-10 text-green-600 dark:text-green-400" />
                  </div>
                )}
                
                <div className="flex items-center gap-2 w-full">
                  <input
                    ref={fileInputRef}
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 hover:bg-green-200/50 dark:hover:bg-green-800/50"
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    {selectedImage ? "Change Image" : "Upload Image"}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter user's full name"
                required
                className="border-green-200 dark:border-green-800 focus:border-green-400 dark:focus:border-green-600"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  Email Address
                </span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Enter email address"
                required
                className="border-green-200 dark:border-green-800 focus:border-green-400 dark:focus:border-green-600"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">
                <span className="flex items-center gap-1">
                  <Lock className="h-4 w-4" />
                  Password
                </span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="Enter password"
                  required
                  className="pr-10 border-green-200 dark:border-green-800 focus:border-green-400 dark:focus:border-green-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">User Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) => handleChange("role", value)}
              >
                <SelectTrigger id="role" className="border-green-200 dark:border-green-800 focus:border-green-400 dark:focus:border-green-600">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="cashier">Cashier</SelectItem>
                  <SelectItem value="helper">Helper</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="active"
                checked={formData.active} 
                onCheckedChange={(checked) => handleChange("active", checked)}
              />
              <Label htmlFor="active">Active account</Label>
            </div>
            
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" className="border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 hover:bg-green-200/50 dark:hover:bg-green-800/50" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading} 
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
