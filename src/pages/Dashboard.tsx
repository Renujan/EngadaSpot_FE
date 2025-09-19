import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, ShoppingCart, TrendingUp, Package } from "lucide-react";

const Dashboard = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

  // KPI mock data
  const kpis = [
    { title: "Today's Sales", value: "Rs. 45,680", description: "+12% from yesterday", icon: DollarSign, trend: "up" },
    { title: "Orders Count", value: "127", description: "+8 from yesterday", icon: ShoppingCart, trend: "up" },
    { title: "Average Order", value: "Rs. 360", description: "+5% from yesterday", icon: TrendingUp, trend: "up" },
    { title: "Low Stock Items", value: "3", description: "Needs attention", icon: Package, trend: "warning" }
  ];

  // Recent Orders mock data
  const recentOrders = [
    { id: "ORD001", time: "2 mins ago", amount: "Rs. 450", items: "Chicken Biryani, Masala Chai", status: "completed" },
    { id: "ORD002", time: "5 mins ago", amount: "Rs. 180", items: "Samosa, Fresh Lime", status: "preparing" },
    { id: "ORD003", time: "8 mins ago", amount: "Rs. 750", items: "Fish Curry, Rice, Papadam", status: "completed" },
    { id: "ORD004", time: "12 mins ago", amount: "Rs. 220", items: "Chicken Roll", status: "completed" },
  ];

  // Low Stock State
  const [lowStockItems, setLowStockItems] = useState([]);

  const fetchLowStock = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE_URL}/stocks/low-stock-alert/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("Failed to fetch low stock data");
      const data = await res.json();
      setLowStockItems(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch once on mount
  useEffect(() => {
    fetchLowStock();
  }, []);

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back! Here's what's happening at your restaurant today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, index) => (
          <Card key={index} className="hover:shadow-md transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className={`text-xs mt-1 ${kpi.trend === 'up' ? 'text-primary' : kpi.trend === 'warning' ? 'text-destructive' : 'text-muted-foreground'}`}>
                {kpi.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Orders */}
        <Card className="hover:shadow-md transition-all duration-300">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders from your restaurant</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{order.id}</span>
                      <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>{order.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{order.items}</p>
                    <p className="text-xs text-muted-foreground">{order.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">{order.amount}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card className="hover:shadow-md transition-all duration-500">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Package className="h-5 w-5 text-destructive" />
      Low Stock Alert
    </CardTitle>
    <CardDescription>Items that need restocking soon</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {lowStockItems.map((item, index) => (
        <div
          key={index}
          className={`flex items-center justify-between p-3 border rounded-lg transform transition-transform duration-200 hover:scale-105 hover:shadow-lg ${
            item.status === "low_stock"
              ? "bg-red-100 border-red-500"
              : "bg-green-100 border-green-500"
          }`}
        >
          <div>
            <p className="font-medium text-black">{item.product_name}</p>
            <p className="text-sm text-black">
              Current stock: {item.current_stock} (Min: {item.low_stock_threshold})
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full font-semibold text-sm border ${
              item.status === "low_stock"
                ? "bg-red-500 text-white border-red-600"
                : "bg-green-500 text-white border-green-600"
            }`}
          >
            {item.status === "low_stock" ? "Low Stock" : "In Stock"}
          </span>
        </div>
      ))}
    </div>
  </CardContent>
</Card>

      </div>
    </div>
  );
};

export default Dashboard;
