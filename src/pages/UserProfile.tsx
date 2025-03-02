
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useToast } from "@/components/ui/use-toast";
import { User } from "@/types/user";
import { ArrowLeft, Mail, Calendar, UserCog } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      
      try {
        const userDoc = await getDoc(doc(db, "user", userId));
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as Omit<User, "id" | "createdAt">;
          setUser({
            id: userDoc.id,
            ...userData,
            createdAt: userData.createdAt?.toDate() || new Date(),
          });
        } else {
          toast({
            title: "User not found",
            description: "The requested user profile does not exist.",
            variant: "destructive",
          });
          navigate("/users");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        toast({
          title: "Error",
          description: "Failed to load user profile.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, navigate, toast]);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-purple-600">Admin</Badge>;
      case "cashier":
        return <Badge className="bg-blue-600">Cashier</Badge>;
      case "helper":
        return <Badge className="bg-green-600">Helper</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 w-full">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => navigate("/users")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold">User Profile</h1>
      </div>

      {loading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-60" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
      ) : user ? (
        <Card className="shadow-md overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 pb-6">
            <CardTitle className="flex items-center justify-between">
              <span>User Information</span>
              {getRoleBadge(user.role)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0">
                <Avatar className="h-32 w-32 border-4 border-white shadow-md">
                  {user.photoURL ? (
                    <AvatarImage src={user.photoURL} alt={user.name} />
                  ) : (
                    <AvatarFallback className="text-3xl">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
              
              <div className="space-y-6 flex-1">
                <div>
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                  <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Account Status</p>
                    <p className={`font-medium ${user.active ? 'text-green-600' : 'text-red-500'}`}>
                      {user.active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">User Role</p>
                    <p className="font-medium capitalize">{user.role}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Joined On</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">
                        {user.createdAt.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(`/users/edit/${user.id}`)}
                    className="flex items-center gap-2"
                  >
                    <UserCog className="h-4 w-4" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p>User not found</p>
            <Button 
              variant="link" 
              onClick={() => navigate("/users")}
              className="mt-2"
            >
              Go back to user management
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserProfile;
