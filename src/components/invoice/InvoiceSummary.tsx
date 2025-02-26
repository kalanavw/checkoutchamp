
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InvoiceSummaryProps {
  subtotal: number;
  tax: number;
  total: number;
}

export function InvoiceSummary({ subtotal, tax, total }: InvoiceSummaryProps) {
  return (
    <Card>
      <CardHeader className="p-6">
        <CardTitle>Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div className="flex justify-between text-base">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-base">
          <span>Tax (10%)</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="border-t pt-4">
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
