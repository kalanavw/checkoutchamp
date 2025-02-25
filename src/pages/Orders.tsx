
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ClipboardList } from "lucide-react";

const mockOrders = [
  { id: "ORD-001", customer: "John Doe", total: 89.98, status: "completed", date: "2024-02-20" },
  { id: "ORD-002", customer: "Jane Smith", total: 159.97, status: "processing", date: "2024-02-20" },
  { id: "ORD-003", customer: "Bob Wilson", total: 29.99, status: "completed", date: "2024-02-19" },
  { id: "ORD-004", customer: "Alice Brown", total: 249.95, status: "pending", date: "2024-02-19" },
  { id: "ORD-005", customer: "Charlie Davis", total: 74.98, status: "completed", date: "2024-02-18" },
];

const Orders = () => {
  return (
    <div className="p-6 space-y-6 w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Orders</h1>
        <Badge variant="secondary" className="px-4 py-1">
          <ClipboardList className="mr-2 h-4 w-4" />
          Total Orders: {mockOrders.length}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={
                      order.status === "completed" ? "default" :
                      order.status === "processing" ? "secondary" :
                      "outline"
                    }>
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;
