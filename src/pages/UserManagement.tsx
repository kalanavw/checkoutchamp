
// Import the relevant components and hooks
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { db, USER_COLLECTION } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  orderBy, 
  serverTimestamp, 
  where
} from "firebase/firestore";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Search,
  UserPlus, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Image as ImageIcon,
  X,
  User as UserIcon
} from "lucide-react";
import { UserRole } from "@/types/user";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { optimizeImageToBase64 } from "@/utils/imageUtils";
import { isCacheValid, saveToCache, getFromCache } from "@/utils/cacheUtils";

// Cache key
const USERS_CACHE_KEY = "users_cache";

interface UserData {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  active: boolean;
  createdAt: Date;
  photoURL?: string;
}

const UserManagement = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
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
      // Try to get from cache first
      if (isCacheValid(USERS_CACHE_KEY)) {
        const cachedUsers = getFromCache<UserData[]>(USERS_CACHE_KEY);
        if (cachedUsers) {
          setUsers(cachedUsers);
          setIsRefreshing(false);
          console.log("Using cached users");
          return;
        }
      }
      
      // Fetch from Firestore if cache is invalid or doesn't exist
      const usersQuery = query(collection(db, USER_COLLECTION), orderBy("createdAt", "desc"));
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
          createdAt: userData.createdAt?.toDate() || new Date(),
          photoURL: userData.photoURL || "",
        });
      });
      
      setUsers(fetchedUsers);
      
      // Save to cache
      saveToCache(USERS_CACHE_KEY, fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      });
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
    
    try {
      // Convert to base64
      return await optimizeImageToBase64(selectedImage);
    } catch (error) {
      console.error("Error processing image:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "All fields are required.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const emailQuery = query(collection(db, USER_COLLECTION), where("email", "==", formData.email));
      const emailSnapshot = await getDocs(emailQuery);
      
      if (!emailSnapshot.empty) {
        toast({
          title: "Error",
          description: "A user with this email already exists.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      const newUser = {
        ...formData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, USER_COLLECTION), newUser);
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      console.log("User created:", userCredential.user.email);
      
      let photoURL = "";
      if (selectedImage) {
        try {
          photoURL = await uploadUserImage() || "";
          await updateDoc(doc(db, USER_COLLECTION, docRef.id), { photoURL });
        } catch (error) {
          console.error("Error with user image:", error);
          toast({
            title: "Warning",
            description: "User created but profile image upload failed.",
          });
        }
      }
      
      const userWithId: UserData = { 
        id: docRef.id, 
        ...newUser,
        createdAt: new Date(),
        photoURL,
      };
      
      // Update users array and cache
      const updatedUsers = [userWithId, ...users];
      setUsers(updatedUsers);
      saveToCache(USERS_CACHE_KEY, updatedUsers);
      
      toast({
        title: "Success",
        description: "User added successfully.",
      });
      
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
      toast({
        title: "Error",
        description: "Failed to add user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-primary">Admin</Badge>;
      case "cashier":
        return <Badge className="bg-blue-600">Cashier</Badge>;
      case "helper":
        return <Badge className="bg-green-600">Helper</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, USER_COLLECTION, userId), {
        active: !currentStatus,
        updatedAt: serverTimestamp()
      });
      
      // Update local state and cache
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, active: !currentStatus } : user
      );
      setUsers(updatedUsers);
      saveToCache(USERS_CACHE_KEY, updatedUsers);
      
      toast({
        title: "User Status Updated",
        description: `User has been ${currentStatus ? "deactivated" : "activated"}.`,
      });
    } catch (error) {
      console.error("Error updating user status:", error);
      toast({
        title: "Error",
        description: "Failed to update user status.",
        variant: "destructive",
      });
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      await updateDoc(doc(db, USER_COLLECTION, userId), {
        role: newRole,
        updatedAt: serverTimestamp()
      });
      
      // Update local state and cache
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      );
      setUsers(updatedUsers);
      saveToCache(USERS_CACHE_KEY, updatedUsers);
      
      toast({
        title: "User Role Updated",
        description: `User role has been changed to ${newRole}.`,
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <div className="rounded-md border overflow-hidden border-primary/30">
            <Table>
              <TableHeader className="bg-secondary">
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <p>No users found</p>
                        <Button 
                          variant="link" 
                          onClick={() => setIsDialogOpen(true)} 
                          className="mt-2 text-primary"
                        >
                          Add your first user
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No users match your search
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-secondary/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full overflow-hidden">
                            {user.photoURL ? (
                              <Avatar>
                                <AvatarImage src={user.photoURL} alt={user.name} />
                                <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                              </Avatar>
                            ) : (
                              <Avatar>
                                <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                          <Button variant="link" className="p-0 h-auto font-medium text-primary" onClick={() => navigate(`/user/${user.id}`)}>
                            {user.name}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(value: UserRole) => updateUserRole(user.id, value)}
                        >
                          <SelectTrigger className="h-8 w-32 border-primary/30">
                            <SelectValue placeholder={getRoleBadge(user.role)} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="cashier">Cashier</SelectItem>
                            <SelectItem value="helper">Helper</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={user.active} 
                            onCheckedChange={() => toggleUserStatus(user.id, user.active)}
                          />
                          <span className={`text-sm ${user.active ? 'text-primary' : 'text-red-500'}`}>
                            {user.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.createdAt.toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/user/${user.id}`)}
                          className="hover:bg-primary/10 text-primary"
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-secondary/30 border-theme-light">
          <DialogHeader className="bg-gradient-to-r from-secondary to-secondary/50 rounded-t-lg p-4 -mt-4 -mx-4 mb-4">
            <DialogTitle className="flex items-center gap-2 text-primary">
              <UserPlus className="h-5 w-5" />
              Add New User
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
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
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-24 h-24 rounded-full object-cover border-2 border-primary/30"
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
                  <div className="flex items-center justify-center w-24 h-24 bg-secondary rounded-full border-2 border-dashed border-primary/30">
                    <UserIcon className="h-10 w-10 text-primary/40" />
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
                    className="w-full border-primary/30 text-primary hover:bg-primary/10"
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
                className="border-primary/30 focus:border-primary"
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
                className="border-primary/30 focus:border-primary"
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
                  className="pr-10 border-primary/30 focus:border-primary"
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
                <SelectTrigger id="role" className="border-primary/30">
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
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading} 
                className="bg-primary hover:bg-primary/80"
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
