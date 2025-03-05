
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, USER_COLLECTION } from "@/lib/firebase";
import { UserRole } from "@/types/user";
import { saveCollectionUpdateTime } from "@/utils/collectionUtils";
import { COLLECTION_KEYS } from "@/utils/collectionUtils";
import { saveToCache } from "@/utils/cacheUtils";
import {Notifications} from "@/utils/notifications.ts";

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

interface UserManagementTableProps {
  users: UserData[];
  searchQuery: string;
  onUpdateUsers: (updatedUsers: UserData[]) => void;
}

const UserManagementTable = ({ users, searchQuery, onUpdateUsers }: UserManagementTableProps) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");

  // Filter users based on search query
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
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

  const startEditing = (userId: string, userName: string) => {
    setEditingName(userId);
    setEditedName(userName);
  };

  const updateUserName = async (userId: string) => {
    if (!editedName.trim()) {
      Notifications.error("Name cannot be empty");
      return;
    }

    try {
      await updateDoc(doc(db, USER_COLLECTION, userId), {
        name: editedName,
        updatedAt: serverTimestamp()
      });
      
      // Update the collection update timestamp
      saveCollectionUpdateTime(COLLECTION_KEYS.USERS);
      
      // Update local state
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, name: editedName } : user
      );
      
      onUpdateUsers(updatedUsers);
      
      // Update cache
      saveToCache("users_cache", updatedUsers);

      Notifications.success("User name updated successfully");
      setEditingName(null);
    } catch (error) {
      console.error("Error updating user name:", error);
      Notifications.error("Failed to update user name");
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, USER_COLLECTION, userId), {
        active: !currentStatus,
        updatedAt: serverTimestamp()
      });
      
      // Update the collection update timestamp
      saveCollectionUpdateTime(COLLECTION_KEYS.USERS);
      
      // Update local state
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, active: !currentStatus } : user
      );
      
      onUpdateUsers(updatedUsers);
      
      // Update cache
      saveToCache("users_cache", updatedUsers);

      Notifications.success(`User has been ${currentStatus ? "deactivated" : "activated"}.`);
    } catch (error) {
      console.error("Error updating user status:", error);
      Notifications.error("Failed to update user status");
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      await updateDoc(doc(db, USER_COLLECTION, userId), {
        role: newRole,
        updatedAt: serverTimestamp()
      });
      
      // Update the collection update timestamp
      saveCollectionUpdateTime(COLLECTION_KEYS.USERS);
      
      // Update local state
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      );
      
      onUpdateUsers(updatedUsers);
      
      // Update cache
      saveToCache("users_cache", updatedUsers);

      Notifications.success(`User role has been changed to ${newRole}.`);
    } catch (error) {
      console.error("Error updating user role:", error);

      Notifications.error("Failed to update user role");
    }
  };

  return (
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
                </div>
              </TableCell>
            </TableRow>
          ) : filteredUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                No users match your search
              </TableCell>
            </TableRow>
          ) : paginatedUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                No users on this page
              </TableCell>
            </TableRow>
          ) : (
            paginatedUsers.map((user) => (
              <TableRow key={user.id} className="hover:bg-secondary/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full overflow-hidden">
                      {user.photoURL ? (
                        <Avatar>
                          <AvatarImage src={user.photoURL + "?sz=200"} alt={user.name} />
                        </Avatar>
                      ) : (
                        <Avatar>
                          <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                    {editingName === user.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="border rounded px-2 py-1 text-sm w-40 border-primary/30"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') updateUserName(user.id);
                            if (e.key === 'Escape') setEditingName(null);
                          }}
                        />
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="px-2 h-7 text-green-600"
                            onClick={() => updateUserName(user.id)}
                          >
                            Save
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="px-2 h-7 text-red-500"
                            onClick={() => setEditingName(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="link" 
                          className="p-0 h-auto font-medium text-primary underline-offset-4" 
                          onClick={() => navigate(`/user/${user.id}`)}
                        >
                          {user.name}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="px-2 h-7 ml-1"
                          onClick={() => startEditing(user.id, user.name)}
                        >
                          Edit
                        </Button>
                      </div>
                    )}
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
                  {user.createdAt instanceof Date
                    ? user.createdAt.toLocaleDateString()
                    : new Date(user.createdAt).toLocaleDateString()}
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
      
      {/* Pagination controls */}
      {filteredUsers.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-primary/30 bg-secondary/30">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-20 border-primary/30">
                <SelectValue placeholder={itemsPerPage} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-primary/30"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-primary/30"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="mx-2 text-sm">
              Page {currentPage} of {totalPages || 1}
            </span>
            
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-primary/30"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-primary/30"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Showing {paginatedUsers.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} entries
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementTable;
