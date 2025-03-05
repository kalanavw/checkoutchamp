import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Notifications } from "@/utils/notifications";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Phone, User, Plus } from "lucide-react";

interface CustomerInfoProps {
  customerName: string;
  onNameChange: (value: string) => void;
}

export function CustomerInfo({
  customerName,
  onNameChange,
}: CustomerInfoProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const handleChange = (field: string, value: string) => {
    setNewCustomer(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCustomer.name || !newCustomer.phone) {
      Notifications.error("Name and phone are required fields.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const customerData = {
        ...newCustomer,
        registrationDate: new Date(),
      };
      
      await addDoc(collection(db, "customers"), customerData);
      
      Notifications.success("Customer added successfully.");
      
      onNameChange(newCustomer.name);
      setNewCustomer({
        name: "",
        phone: "",
        address: "",
      });
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error adding customer:", error);
      Notifications.error("Failed to add customer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="customerName" className="text-base">Customer Name</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsDialogOpen(true)}
              className="h-8 px-2 text-green-600"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Customer
            </Button>
          </div>
          <Input 
            id="customerName"
            value={customerName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Enter customer name"
            className="h-12 text-base"
          />
        </div>
      </div>

      {/* Add Customer Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Add New Customer
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleCreateCustomer} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Customer Name*
                </span>
              </Label>
              <Input
                id="name"
                value={newCustomer.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter customer name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">
                <span className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  Phone Number*
                </span>
              </Label>
              <Input
                id="phone"
                value={newCustomer.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="Enter phone number"
                required
              />
            </div>
            
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? "Adding..." : "Add Customer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
