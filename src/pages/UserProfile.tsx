
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { db, USER_COLLECTION } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { UserRole } from "@/types/user";
import { ArrowLeft, Mail, Calendar, Shield } from "lucide-react";

interface UserProfileData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  photoURL?: string;
  createdAt?: Date | null;
}

const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      
      try {
        const userDoc = await getDoc(doc(db, USER_COLLECTION, id));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            id: userDoc.id,
            name: userData.name || userData.displayName || "Unknown User",
            email: userData.email || "No email",
            role: userData.role || "cashier",
            active: userData.active !== false,
            photoURL: userData.photoURL || "",
            createdAt: userData.createdAt?.toDate() || null,
          });
        } else {
          setError("User not found");
          toast({
            title: "Error",
            description: "User not found",
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to load user data");
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, toast]);

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "bg-purple-600";
      case "cashier":
        return "bg-blue-600";
      case "helper":
        return "bg-green-600";
      default:
        return "bg-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <div className="w-8 h-8 border-4 border-t-green-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <p className="text-lg text-red-500 mb-4">{error || "User not found"}</p>
        <Button asChild>
          <Link to="/users">Back to Users</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto animate-in">
      <div className="mb-6">
        <Button variant="outline" asChild className="mb-4">
          <Link to="/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Link>
        </Button>
        <h1 className="text-3xl font-semibold text-green-800 dark:text-green-300">User Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info Card */}
        <Card className="shadow-md lg:col-span-1">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-t-lg text-center pb-6">
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4 border-4 border-white shadow-md">
                {user.photoURL ? (
                  <AvatarImage src={user.photoURL} alt={user.name} />
                ) : (
                  <AvatarFallback className="text-2xl">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <CardTitle className="text-xl">{user.name}</CardTitle>
              <Badge className={`mt-2 ${getRoleBadgeColor(user.role)}`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
              <Badge className={`mt-2 ${user.active ? 'bg-green-600' : 'bg-red-600'}`}>
                {user.active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300">{user.email}</span>
              </div>
              
              {user.createdAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Joined: {user.createdAt.toLocaleDateString()}
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  Permissions: {user.role === 'admin' ? 'Full Access' : 
                               user.role === 'cashier' ? 'Checkout, Orders, Products' : 
                               'Basic Access'}
                </span>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="flex flex-col gap-2">
              <Button variant="outline" asChild>
                <Link to={`/users/edit/${user.id}`}>
                  Edit Profile
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Activity and Stats Card */}
        <Card className="shadow-md lg:col-span-2">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-t-lg">
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-gray-500">
              Activity history will be implemented in a future update.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;
