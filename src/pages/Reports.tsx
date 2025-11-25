import { useState, useEffect } from "react";
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
import { apiRequest } from "@/lib/api";

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
  const [salesData, setSalesData] = useState<SalesReport[]>([]);
  const [productData, setProductData] = useState<ProductReport[]>([]);
  const [recentBills, setRecentBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all reports when date range changes
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        
        // Fetch sales report
        const salesResponse = await apiRequest(
          `/reports/sales/?from_date=${dateRange.from}&to_date=${dateRange.to}`
        );
        if (salesResponse.ok) {
          const salesData = await salesResponse.json();
          setSalesData(salesData);
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch sales report",
            variant: "destructive",
          });
        }

        // Fetch product report
        const productResponse = await apiRequest(
          `/reports/products/?from_date=${dateRange.from}&to_date=${dateRange.to}`
        );
        if (productResponse.ok) {
          const productData = await productResponse.json();
          setProductData(productData);
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch product report",
            variant: "destructive",
          });
        }

        // Fetch recent transactions (doesn't depend on date range)
        const transactionsResponse = await apiRequest('/reports/transactions/?limit=50');
        if (transactionsResponse.ok) {
          const transactionsData = await transactionsResponse.json();
          setRecentBills(transactionsData);
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch recent transactions",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch reports",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [dateRange.from, dateRange.to]);

  // Calculate summary statistics
  const totalSales = salesData.reduce((sum, day) => sum + day.totalSales, 0);
  const totalOrders = salesData.reduce((sum, day) => sum + day.totalOrders, 0);
  const averageOrderValue = totalSales / totalOrders || 0;
  const topProduct = productData.length > 0 ? productData[0] : null;

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

  const exportToPDF = async (reportType: string) => {
    try {
      // Build query parameters
      const params = new URLSearchParams({
        report_type: reportType,
      });

      // Add date range for sales and products reports
      if (reportType === 'sales' || reportType === 'products') {
        params.append('from_date', dateRange.from);
        params.append('to_date', dateRange.to);
      } else if (reportType === 'transactions') {
        params.append('limit', '50');
      }

      const response = await apiRequest(`/reports/export-pdf/?${params.toString()}`);
      
      if (response.ok) {
        // Check if response is actually a PDF
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('application/pdf')) {
          // Get the blob from response
          const blob = await response.blob();
          
          // Create download link
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          
          // Get filename from Content-Disposition header or use default
          const contentDisposition = response.headers.get('Content-Disposition');
          let filename = `${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`;
          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="(.+)"/);
            if (filenameMatch) {
              filename = filenameMatch[1];
            }
          }
          
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

          toast({
            title: "PDF Export Successful",
            description: `${reportType} report PDF has been downloaded`,
          });
        } else {
          // Try to parse as JSON error
          const errorData = await response.json().catch(() => ({}));
          toast({
            title: "Export Failed",
            description: errorData.detail || "Invalid response from server",
            variant: "destructive",
          });
        }
      } else {
        // Try to get error message, but handle non-JSON responses
        let errorMessage = "Failed to export PDF";
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch {
          errorMessage = `Server returned ${response.status}: ${response.statusText}`;
        }
        toast({
          title: "Export Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
    toast({
        title: "Export Failed",
        description: "An error occurred while exporting PDF",
        variant: "destructive",
    });
    }
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
          <Button 
            variant="outline" 
            onClick={() => {
              const data = reportType === 'sales' ? salesData : reportType === 'products' ? productData : recentBills;
              const filename = `${reportType}-report`;
              exportToCSV(data, filename);
            }}
            disabled={loading}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button 
            onClick={() => {
              const type = reportType === 'payments' ? 'transactions' : reportType;
              exportToPDF(type);
            }}
            disabled={loading}
          >
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
            <div className="text-2xl font-bold">{topProduct?.productName || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">Rs. {topProduct?.revenue.toLocaleString() || 0} revenue</p>
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="report-type">Report Type:</Label>
              <Select value={reportType} onValueChange={setReportType} disabled={loading}>
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
            {loading && (
              <div className="text-sm text-muted-foreground">Loading...</div>
            )}
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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Daily Sales Report</CardTitle>
              <Button variant="outline" size="sm" onClick={() => exportToPDF('sales')} disabled={loading}>
                <FileText className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
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
                    {loading && salesData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          Loading sales data...
                        </TableCell>
                      </TableRow>
                    ) : salesData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No sales data available for the selected date range
                        </TableCell>
                      </TableRow>
                    ) : (
                      salesData.map((day, index) => (
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
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Product Performance</CardTitle>
              <Button variant="outline" size="sm" onClick={() => exportToPDF('products')} disabled={loading}>
                <FileText className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
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
                    {loading && productData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          Loading product data...
                        </TableCell>
                      </TableRow>
                    ) : productData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No product data available for the selected date range
                        </TableCell>
                      </TableRow>
                    ) : (
                      productData.map((product, index) => (
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
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <Button variant="outline" size="sm" onClick={() => exportToPDF('transactions')} disabled={loading}>
                <FileText className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
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
                    {loading && recentBills.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading transactions...
                        </TableCell>
                      </TableRow>
                    ) : recentBills.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No recent transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentBills.map((bill, index) => (
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
                      ))
                    )}
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