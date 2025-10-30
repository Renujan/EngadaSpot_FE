import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, ShoppingCart, TrendingUp, Package, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";

const Dashboard = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

  // Date state for filters
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  // KPI states
  const [totalSales, setTotalSales] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [averageOrder, setAverageOrder] = useState(0);
  const [kpiChanges, setKpiChanges] = useState({
    totalSales: 0,
    ordersCount: 0,
    averageOrder: 0,
  });

  // Low Stock state
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);

  // Helper to get yesterday's date string
  const getYesterday = (dateStr: string) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() - 1);
    return date.toISOString().split("T")[0];
  };

  // Calculate percentage change
  const calculateChange = (today: number, yesterday: number) => {
    if (!yesterday || yesterday === 0) return 0;
    return ((today - yesterday) / yesterday) * 100;
  };

  // Fetch Payments Summary for selected date and yesterday
  const fetchPaymentsSummary = async (date: string) => {
    try {
      const accessToken = localStorage.getItem("accessToken");

      // Today’s summary
      const resToday = await fetch(`${API_BASE_URL}/payments/summary/?date=${date}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!resToday.ok) throw new Error("Failed to fetch today's summary");
      const todayData = await resToday.json();

      // Yesterday’s summary
      const yesterdayDate = getYesterday(date);
      const resYesterday = await fetch(`${API_BASE_URL}/payments/summary/?date=${yesterdayDate}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const yesterdayData = resYesterday.ok ? await resYesterday.json() : { total_sales: 0, orders_count: 0, average_order: 0 };

      // Set today KPI values
      setTotalSales(todayData.total_sales || 0);
      setOrdersCount(todayData.orders_count || 0);
      setAverageOrder(todayData.average_order || 0);

      // Calculate percentage changes
      setKpiChanges({
        totalSales: calculateChange(todayData.total_sales, yesterdayData.total_sales),
        ordersCount: calculateChange(todayData.orders_count, yesterdayData.orders_count),
        averageOrder: calculateChange(todayData.average_order, yesterdayData.average_order),
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Low Stock
  const fetchLowStock = async (date: string) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE_URL}/stocks/low-stock-alert/?date=${date}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("Failed to fetch low stock data");
      const data = await res.json();
      setLowStockItems(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPaymentsSummary(selectedDate);
    fetchLowStock(selectedDate);
  }, [selectedDate]);

  // Dummy Recent Orders (can be replaced by API)
  const recentOrders = [
    { id: "ORD001", time: "2 mins ago", amount: "Rs. 450", items: "Chicken Biryani, Masala Chai", status: "completed" },
    { id: "ORD002", time: "5 mins ago", amount: "Rs. 180", items: "Samosa, Fresh Lime", status: "preparing" },
    { id: "ORD003", time: "8 mins ago", amount: "Rs. 750", items: "Fish Curry, Rice, Papadam", status: "completed" },
    { id: "ORD004", time: "12 mins ago", amount: "Rs. 220", items: "Chicken Roll", status: "completed" },
  ];

  const kpis = [
    {
      title: "Total Sales",
      value: `Rs. ${totalSales.toLocaleString()}`,
      description: `${kpiChanges.totalSales.toFixed(2)}% from yesterday`,
      icon: DollarSign,
      trend: kpiChanges.totalSales >= 0 ? "up" : "down",
    },
    {
      title: "Orders Count",
      value: ordersCount,
      description: `${kpiChanges.ordersCount.toFixed(2)}% from yesterday`,
      icon: ShoppingCart,
      trend: kpiChanges.ordersCount >= 0 ? "up" : "down",
    },
    {
      title: "Average Order",
      value: `Rs. ${averageOrder.toFixed(2)}`,
      description: `${kpiChanges.averageOrder.toFixed(2)}% from yesterday`,
      icon: TrendingUp,
      trend: kpiChanges.averageOrder >= 0 ? "up" : "down",
    },
    {
      title: "Low Stock Items",
      value: lowStockItems.length,
      description: "Needs attention",
      icon: Package,
      trend: "warning",
    },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome back! Here's what's happening at your restaurant today.</p>
        </div>
        {/* Date Picker */}
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="max-w-[200px]"
          />
        </div>
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
              <p className={`text-xs mt-1 ${kpi.trend === "up" ? "text-primary" : kpi.trend === "down" ? "text-destructive" : "text-muted-foreground"}`}>
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
                      <Badge variant={order.status === "completed" ? "default" : "secondary"}>{order.status}</Badge>
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
                    item.status === "low_stock" ? "bg-red-100 border-red-500" : "bg-green-100 border-green-500"
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
                      item.status === "low_stock" ? "bg-red-500 text-white border-red-600" : "bg-green-500 text-white border-green-600"
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
