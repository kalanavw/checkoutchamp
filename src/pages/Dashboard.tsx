
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, DollarSign, ShoppingCart, Users } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="p-6 space-y-6 w-full">
      <h1 className="text-3xl font-semibold text-green-800 dark:text-green-300">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/70 dark:bg-green-900/30 border-green-100 dark:border-green-800/50 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 bg-gradient-to-r from-green-100/50 to-transparent dark:from-green-800/20 dark:to-transparent rounded-t-lg">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-300">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">$45,231.89</div>
            <p className="text-xs text-green-600/70 dark:text-green-400/70">+20.1% from last month</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/70 dark:bg-green-900/30 border-green-100 dark:border-green-800/50 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 bg-gradient-to-r from-green-100/50 to-transparent dark:from-green-800/20 dark:to-transparent rounded-t-lg">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-300">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">+573</div>
            <p className="text-xs text-green-600/70 dark:text-green-400/70">+201 since last hour</p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-green-900/30 border-green-100 dark:border-green-800/50 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 bg-gradient-to-r from-green-100/50 to-transparent dark:from-green-800/20 dark:to-transparent rounded-t-lg">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-300">Active Users</CardTitle>
            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">+2350</div>
            <p className="text-xs text-green-600/70 dark:text-green-400/70">+180 since last hour</p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-green-900/30 border-green-100 dark:border-green-800/50 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 bg-gradient-to-r from-green-100/50 to-transparent dark:from-green-800/20 dark:to-transparent rounded-t-lg">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-300">Daily Sales</CardTitle>
            <CalendarDays className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">+12,234</div>
            <p className="text-xs text-green-600/70 dark:text-green-400/70">+19% from last month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
