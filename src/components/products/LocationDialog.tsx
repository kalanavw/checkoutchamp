
import { useState } from "react";
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Notifications } from "@/utils/notifications";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Location } from "@/types/product";

interface LocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationAdded: (location: Location) => void;
}

const LOCATIONS_COLLECTION = "locations";

export const LocationDialog = ({ open, onOpenChange, onLocationAdded }: LocationDialogProps) => {
  const [newLocation, setNewLocation] = useState({
    name: "",
    code: "",
    description: "",
  });

  const handleAddLocation = async () => {
    if (!newLocation.name || !newLocation.code) {
      Notifications.error("Location name and code are required");
      return;
    }
    
    try {
      // Check if code already exists
      const locationsRef = collection(db, LOCATIONS_COLLECTION);
      const q = query(locationsRef, where("code", "==", newLocation.code));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        Notifications.error("Location code already exists. Please use a unique code.");
        return;
      }
      
      const docRef = await addDoc(collection(db, LOCATIONS_COLLECTION), {
        ...newLocation,
        createdAt: serverTimestamp()
      });
      
      const newLocationWithId = {
        id: docRef.id,
        name: newLocation.name,
        code: newLocation.code,
        description: newLocation.description,
      };
      
      // Call the callback with the new location
      onLocationAdded(newLocationWithId);
      
      // Reset new location form
      setNewLocation({
        name: "",
        code: "",
        description: "",
      });
      
      // Close dialog
      onOpenChange(false);
      
      Notifications.success("Location added successfully");
    } catch (error) {
      console.error("Error adding location:", error);
      Notifications.error("Failed to add location");
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add New Location</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="location-name">
            Location Name <span className="text-red-500">*</span>
          </Label>
          <Input 
            id="location-name" 
            value={newLocation.name}
            onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter location name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location-code">
            Location Code <span className="text-red-500">*</span>
          </Label>
          <Input 
            id="location-code" 
            value={newLocation.code}
            onChange={(e) => setNewLocation(prev => ({ ...prev, code: e.target.value }))}
            placeholder="Enter location code"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location-description">Description</Label>
          <Textarea 
            id="location-description" 
            value={newLocation.description}
            onChange={(e) => setNewLocation(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter location description (optional)"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={handleAddLocation}>
          Add Location
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};
