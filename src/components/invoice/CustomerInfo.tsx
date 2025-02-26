
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CustomerInfoProps {
  customerName: string;
  customerEmail: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
}

export function CustomerInfo({
  customerName,
  customerEmail,
  onNameChange,
  onEmailChange,
}: CustomerInfoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <Label htmlFor="customerName" className="text-base">Customer Name</Label>
        <Input 
          id="customerName"
          value={customerName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Enter customer name"
          className="h-12 text-base"
        />
      </div>
      <div className="space-y-3">
        <Label htmlFor="customerEmail" className="text-base">Customer Email</Label>
        <Input 
          id="customerEmail"
          type="email"
          value={customerEmail}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="Enter customer email"
          className="h-12 text-base"
        />
      </div>
    </div>
  );
}
