import {useEffect, useRef, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {auth, db, USER_COLLECTION} from "@/lib/firebase";
import {doc, getDoc, serverTimestamp, updateDoc} from "firebase/firestore";
import {ArrowLeft, Calendar, Image as ImageIcon, LogOut, Mail, Shield, User as UserIcon, X} from "lucide-react";
import {signOut} from "firebase/auth";
import {UserRole} from "@/types/user";
import {optimizeImageToBase64} from "@/utils/imageUtils";
import {Badge} from "@/components/ui/badge";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Switch} from "@/components/ui/switch";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Notifications} from "@/utils/notifications";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdDate: Date;
  photoURL?: string;
  lastLogin?: Date;
}

const UserProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<UserData>>({});
  const [isConfirmLogoutOpen, setIsConfirmLogoutOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Determine if we're viewing the current user's profile
        const currentUser = auth.currentUser;
        const localUser = JSON.parse(localStorage.getItem("user") || "{}");
        const userId = id || localUser.uid || currentUser?.uid;
        
        if (!userId) {
          Notifications.error("User ID not found")
          navigate("/");
          return;
        }
        
        // If no ID param is provided, this is the current user's profile
        if (!id) {
          setIsCurrentUser(true);
          if (!window.location.pathname.includes('/user/profile')) {
            navigate('/user/profile');
          }
        } else {
          setIsCurrentUser(userId === currentUser?.uid);
        }
        
        // Check if current user is an admin
        setIsAdmin(localUser.role === "admin");
        
        // Fetch user data
        const userRef = doc(db, USER_COLLECTION, userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const formattedUser: UserData = {
            id: userDoc.id,
            name: userData.name || userData.displayName || "",
            email: userData.email || "",
            role: userData.role || "cashier",
            active: userData.active ?? true,
            createdDate: userData.createdDate?.toDate() || new Date(),
            photoURL: userData.photoURL || "",
            lastLogin: userData.lastLogin?.toDate() || undefined,
          };
          
          setUser(formattedUser);
          setEditedUser(formattedUser);
          setImagePreview(formattedUser.photoURL || null);
        } else {
          Notifications.success("User not found");
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        Notifications.error("Failed to load user data")
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [id, navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("user");
      localStorage.removeItem("userRole");
      localStorage.removeItem("isLoggedIn");
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      Notifications.error("Failed to log out");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setImagePreview(user?.photoURL || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleInputChange = (field: keyof UserData, value: any) => {
    setEditedUser(prev => ({ ...prev, [field]: value }));
  };

  const saveChanges = async () => {
    if (!user || !editedUser.name) return;
    
    setSaving(true);
    try {
      let photoURL = user.photoURL;
      
      // Process image if a new one is selected
      if (selectedImage) {
        try {
          photoURL = await optimizeImageToBase64(selectedImage);
        } catch (error) {
          console.error("Error processing image:", error);
          Notifications.warning("Failed to process profile image");
        }
      }
      
      const updates: any = {
        ...editedUser,
        photoURL,
        updatedAt: serverTimestamp()
      };
      
      // Remove undefined values
      Object.keys(updates).forEach(key => {
        if (updates[key] === undefined) delete updates[key];
      });
      
      await updateDoc(doc(db, USER_COLLECTION, user.id), updates);
      
      // Update local state
      setUser(prev => prev ? { ...prev, ...updates, photoURL } : null);
      
      // If this is the current user, update local storage
      if (isCurrentUser) {
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = {
          ...currentUser,
          displayName: updates.name,
          photoURL
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        // Trigger a storage event for Layout component to update
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'user',
          newValue: JSON.stringify(updatedUser)
        }));
      }
      Notifications.success("Profile updated successfully");
      setEditMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      Notifications.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 w-full">
        <div className="flex items-center justify-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 space-y-6 w-full">
        <div className="flex flex-col items-center justify-center h-60">
          <UserIcon className="h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-medium">User not found</h2>
          <Button 
            onClick={() => navigate(-1)} 
            variant="outline" 
            className="mt-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 w-full">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-semibold text-primary">
            {isCurrentUser ? "My Profile" : "User Profile"}
          </h1>
        </div>
        
        {isCurrentUser && (
          <Button
            variant="destructive"
            onClick={() => setIsConfirmLogoutOpen(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1 bg-secondary/30 border-theme-light">
          <CardHeader className="bg-gradient-to-r from-secondary to-secondary/50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-primary" />
              {isCurrentUser ? "My Profile" : "User Profile"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                {imagePreview ? (
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={imagePreview} alt={user.name} className="object-cover" />
                    <AvatarFallback className="text-2xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar className="h-32 w-32">
                    <AvatarFallback className="text-2xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                )}
                
                {editMode && (
                  <div className="absolute -bottom-2 -right-2 flex">
                    <Button 
                      type="button"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-primary text-white"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    {imagePreview !== user.photoURL && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8 rounded-full ml-2"
                        onClick={clearSelectedImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                id="profile-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              
              <h2 className="text-xl font-semibold mt-4">{user.name}</h2>
              <p className="text-muted-foreground">{user.email}</p>
              
              <div className="mt-2">
                <Badge className={`
                  ${user.role === 'admin' ? 'bg-primary' : 
                    user.role === 'cashier' ? 'bg-blue-600' : 'bg-green-600'}
                `}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
                
                <Badge className={`ml-2 ${user.active ? 'bg-green-600' : 'bg-red-600'}`}>
                  {user.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              <div className="mt-6 w-full">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-muted-foreground">Joined</span>
                  <span>{user.createdDate.toLocaleDateString()}</span>
                </div>
                
                {user.lastLogin && (
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-muted-foreground">Last Login</span>
                    <span>{user.lastLogin.toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              
              {(isCurrentUser || isAdmin) && !editMode && (
                <Button 
                  className="mt-6 w-full"
                  onClick={() => setEditMode(true)}
                >
                  Edit Profile
                </Button>
              )}
              
              {editMode && (
                <div className="flex gap-2 mt-6 w-full">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setEditMode(false);
                      setEditedUser(user);
                      clearSelectedImage();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={saveChanges}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Details Card */}
        <Card className="lg:col-span-2 bg-secondary/30 border-theme-light">
          <CardHeader className="bg-gradient-to-r from-secondary to-secondary/50 rounded-t-lg">
            <CardTitle>User Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="personal">
              <TabsList className="mb-4">
                <TabsTrigger value="personal" className="flex items-center gap-1">
                  <UserIcon className="h-4 w-4" />
                  Personal Info
                </TabsTrigger>
                {isAdmin && (
                  <TabsTrigger value="admin" className="flex items-center gap-1">
                    <Shield className="h-4 w-4" />
                    Admin Controls
                  </TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="personal" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  {editMode ? (
                    <Input
                      id="name"
                      value={editedUser.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="border-primary/30"
                    />
                  ) : (
                    <div className="p-2 border rounded-md border-primary/20 bg-secondary/20">
                      {user.name}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <div className="p-2 border rounded-md border-primary/20 bg-secondary/20">
                    {user.email}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role" className="flex items-center gap-1">
                    <Shield className="h-4 w-4" />
                    Role
                  </Label>
                  {editMode && isAdmin && !isCurrentUser ? (
                    <Select
                      value={editedUser.role}
                      onValueChange={(value: UserRole) => handleInputChange("role", value)}
                    >
                      <SelectTrigger id="role" className="border-primary/30">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrator</SelectItem>
                        <SelectItem value="cashier">Cashier</SelectItem>
                        <SelectItem value="helper">Helper</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-2 border rounded-md border-primary/20 bg-secondary/20">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="joined" className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined Date
                  </Label>
                  <div className="p-2 border rounded-md border-primary/20 bg-secondary/20">
                    {user.createdDate.toLocaleDateString()}
                  </div>
                </div>
                
                {user.lastLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="lastLogin" className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Last Login
                    </Label>
                    <div className="p-2 border rounded-md border-primary/20 bg-secondary/20">
                      {user.lastLogin.toLocaleDateString()} {user.lastLogin.toLocaleTimeString()}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              {isAdmin && (
                <TabsContent value="admin" className="space-y-4">
                  <div className="p-4 border rounded-md border-yellow-300/30 bg-yellow-50/30 dark:bg-yellow-900/10 text-sm">
                    <p className="font-medium text-yellow-800 dark:text-yellow-400">
                      Admin Controls
                    </p>
                    <p className="mt-1 text-yellow-700 dark:text-yellow-300/80">
                      These controls allow you to manage this user's access and permissions.
                    </p>
                  </div>
                  
                  {isCurrentUser && (
                    <div className="p-4 border rounded-md border-red-300/30 bg-red-50/30 dark:bg-red-900/10 text-sm mb-4">
                      <p className="font-medium text-red-800 dark:text-red-400">
                        Warning
                      </p>
                      <p className="mt-1 text-red-700 dark:text-red-300/80">
                        You cannot modify your own admin status or deactivate your own account.
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-4 pt-2">
                    {!isCurrentUser && (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="active">Account Status</Label>
                            <p className="text-sm text-muted-foreground">
                              {editedUser.active ? 
                                "User can log in and access the system" : 
                                "User is prevented from logging in"}
                            </p>
                          </div>
                          <Switch 
                            id="active"
                            checked={editedUser.active} 
                            onCheckedChange={(checked) => handleInputChange("active", checked)}
                            disabled={!editMode}
                          />
                        </div>
                        
                        <div className="border-t pt-4 mt-4">
                          <Label className="mb-2 block">Administrative Actions</Label>
                          <div className="flex flex-wrap gap-2">
                            <Button 
                              variant="destructive"
                              size="sm"
                              disabled={!editMode}
                              onClick={() => {
                                if (editedUser.active) {
                                  handleInputChange("active", false);
                                  Notifications.success("User account has been deactivated")
                                }
                              }}
                            >
                              Deactivate Account
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Logout Confirmation Dialog */}
      <Dialog open={isConfirmLogoutOpen} onOpenChange={setIsConfirmLogoutOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to log out?
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmLogoutOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserProfile;
