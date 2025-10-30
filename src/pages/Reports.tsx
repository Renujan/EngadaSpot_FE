import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Download, FileText, DollarSign, TrendingUp, Users, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface SalesReport {
  date: string;
  totalSales: number;
  totalOrders: number;
  averageOrder: number;
  paymentMethod: 'cash' | 'card';
}

interface ProductReport {
  productName: string;
  unitsSold: number;
  revenue: number;
  category: string;
}

const Reports = () => {
  const [dateRange, setDateRange] = useState({
    from: format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd')
  });
  const [reportType, setReportType] = useState('sales');

  // Mock data
  const salesData: SalesReport[] = [
    { date: '2024-01-01', totalSales: 45680, totalOrders: 127, averageOrder: 360, paymentMethod: 'cash' },
    { date: '2024-01-02', totalSales: 52300, totalOrders: 145, averageOrder: 361, paymentMethod: 'card' },
    { date: '2024-01-03', totalSales: 38950, totalOrders: 108, averageOrder: 361, paymentMethod: 'cash' },
    { date: '2024-01-04', totalSales: 61200, totalOrders: 169, averageOrder: 362, paymentMethod: 'card' },
    { date: '2024-01-05', totalSales: 49750, totalOrders: 138, averageOrder: 360, paymentMethod: 'cash' },
    { date: '2024-01-06', totalSales: 71500, totalOrders: 198, averageOrder: 361, paymentMethod: 'card' },
    { date: '2024-01-07', totalSales: 58300, totalOrders: 162, averageOrder: 360, paymentMethod: 'cash' },
  ];

  const productData: ProductReport[] = [
    { productName: 'Chicken Biryani', unitsSold: 89, revenue: 57850, category: 'Main Dishes' },
    { productName: 'Masala Chai', unitsSold: 234, revenue: 42120, category: 'Beverages' },
    { productName: 'Vegetable Samosa', unitsSold: 156, revenue: 13260, category: 'Snacks' },
    { productName: 'Fish Curry', unitsSold: 67, revenue: 50250, category: 'Main Dishes' },
    { productName: 'Chicken Roll', unitsSold: 78, revenue: 17160, category: 'Snacks' },
    { productName: 'Coconut Rice', unitsSold: 92, revenue: 25760, category: 'Rice' },
    { productName: 'Fresh Lime Juice', unitsSold: 145, revenue: 17400, category: 'Beverages' },
    { productName: 'Watalappam', unitsSold: 43, revenue: 13760, category: 'Desserts' },
  ];

  const recentBills = [
    { billId: 'BILL001', date: '2024-01-07', amount: 1450, items: 4, paymentMethod: 'cash', status: 'completed' },
    { billId: 'BILL002', date: '2024-01-07', amount: 780, items: 2, paymentMethod: 'card', status: 'completed' },
    { billId: 'BILL003', date: '2024-01-07', amount: 2150, items: 6, paymentMethod: 'card', status: 'completed' },
    { billId: 'BILL004', date: '2024-01-07', amount: 650, items: 3, paymentMethod: 'cash', status: 'completed' },
    { billId: 'BILL005', date: '2024-01-07', amount: 920, items: 2, paymentMethod: 'card', status: 'completed' },
  ];

  const totalSales = salesData.reduce((sum, day) => sum + day.totalSales, 0);
  const totalOrders = salesData.reduce((sum, day) => sum + day.totalOrders, 0);
  const averageOrderValue = totalSales / totalOrders;
  const topProduct = productData.sort((a, b) => b.revenue - a.revenue)[0];

  const exportToCSV = (data: any[], filename: string) => {
    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: `${filename}.csv has been downloaded`,
    });
  };

  const exportToPDF = (reportType: string) => {
    // Simulate PDF generation
    toast({
      title: "PDF Export",
      description: `${reportType} report PDF generation started`,
    });
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground mt-2">
            Business insights and performance metrics
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportToCSV(salesData, 'sales-report')}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => exportToPDF('sales')}>
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {Math.round(averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground">Per order value</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Product</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topProduct?.productName}</div>
            <p className="text-xs text-muted-foreground">Rs. {topProduct?.revenue.toLocaleString()} revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Label htmlFor="from-date">From:</Label>
              <Input
                id="from-date"
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="w-40"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="to-date">To:</Label>
              <Input
                id="to-date"
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="w-40"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="report-type">Report Type:</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="products">Products</SelectItem>
                  <SelectItem value="payments">Payments</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Sales Report</TabsTrigger>
          <TabsTrigger value="products">Product Performance</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Daily Sales Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Total Sales</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Average Order</TableHead>
                      <TableHead>Primary Payment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesData.map((day, index) => (
                      <TableRow key={index}>
                        <TableCell>{format(new Date(day.date), 'PPP')}</TableCell>
                        <TableCell className="font-semibold">Rs. {day.totalSales.toLocaleString()}</TableCell>
                        <TableCell>{day.totalOrders}</TableCell>
                        <TableCell>Rs. {day.averageOrder}</TableCell>
                        <TableCell>
                          <Badge variant={day.paymentMethod === 'card' ? 'default' : 'secondary'}>
                            {day.paymentMethod}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Product Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Units Sold</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productData.sort((a, b) => b.revenue - a.revenue).map((product, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{product.productName}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{product.unitsSold}</TableCell>
                        <TableCell className="font-semibold">Rs. {product.revenue.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={index < 3 ? 'default' : index < 6 ? 'secondary' : 'outline'}>
                            {index < 3 ? 'Top' : index < 6 ? 'Good' : 'Average'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bill ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentBills.map((bill, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono">{bill.billId}</TableCell>
                        <TableCell>{format(new Date(bill.date), 'PPp')}</TableCell>
                        <TableCell className="font-semibold">Rs. {bill.amount}</TableCell>
                        <TableCell>{bill.items} items</TableCell>
                        <TableCell>
                          <Badge variant={bill.paymentMethod === 'card' ? 'default' : 'secondary'}>
                            {bill.paymentMethod}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">
                            {bill.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;