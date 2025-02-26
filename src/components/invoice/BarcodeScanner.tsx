
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Barcode } from "lucide-react";

interface BarcodeScannerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function BarcodeScanner({ value, onChange, onSubmit }: BarcodeScannerProps) {
  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Scan barcode or enter product code"
          className="pl-12 h-12"
        />
      </div>
      <Button type="submit" className="h-12">Add Item</Button>
    </form>
  );
}
