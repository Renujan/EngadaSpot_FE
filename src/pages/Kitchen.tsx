import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChefHat, Clock, CheckCircle, AlertCircle, Bell, Users, Utensils } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

// Interfaces
interface OrderItem {
  name: string;
  quantity: number;
  notes?: string;
}

interface KitchenOrder {
  id: string;
  billId: string;
  status: 'new' | 'in-progress' | 'done';
  items: OrderItem[];
  notes?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  estimatedTime?: number;
  priority: 'normal' | 'high' | 'urgent';
  section: 'client' | 'kitchen' | 'stock';
}

interface EmployeeConsumption {
  id: string;
  employeeName: string;
  employeeId: string;
  productName: string;
  quantity: number;
  consumedAt: string | Date;
  notes?: string;
}

interface Product {
  id: string;
  name: string;
}

// Utility to safely parse dates
const safeDate = (date: string | Date | undefined): Date | null => {
  if (!date) return null;
  const parsed = new Date(date);
  return isNaN(parsed.getTime()) ? null : parsed;
};

const Kitchen = () => {
  const { user } = useAuth();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  // State
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [filterDate, setFilterDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [filterSection, setFilterSection] = useState<string>('all');

  const [consumptions, setConsumptions] = useState<EmployeeConsumption[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [consumptionQuantity, setConsumptionQuantity] = useState<number>(1);
  const [consumptionNotes, setConsumptionNotes] = useState<string>('');

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/products/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        });
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data);
      } catch (err: any) {
        console.error(err);
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    };
    fetchProducts();
  }, [API_URL]);

  // Fetch consumptions
  useEffect(() => {
    if (!user) return;
    const fetchConsumptions = async () => {
      try {
        const res = await fetch(`${API_URL}/consumptions/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        });
        if (!res.ok) throw new Error("Failed to fetch consumptions");
        const data = await res.json();
        setConsumptions(data);
      } catch (err: any) {
        console.error(err);
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    };
    fetchConsumptions();
  }, [user, API_URL]);

  // Add consumption
 const addEmployeeConsumption = async () => {
  if (!selectedProduct) {
    toast({ 
      title: "Validation Error", 
      description: "Please select a product before logging consumption", 
      variant: "destructive" 
    });
    return;
  }

  if (consumptionQuantity <= 0 || !Number.isInteger(consumptionQuantity)) {
    toast({ 
      title: "Invalid Quantity", 
      description: "Quantity must be a positive whole number", 
      variant: "destructive" 
    });
    return;
  }

  try {
    const res = await fetch(`${API_URL}/consumptions/create/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: JSON.stringify({
        product: selectedProduct,
        quantity: consumptionQuantity,
        notes: consumptionNotes,
      }),
    });

    // Check content type before parsing
    const contentType = res.headers.get("content-type");
    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      throw new Error(text);
    }

    if (!res.ok) throw new Error(data.detail || "Failed to log consumption");

    setConsumptions(prev => [data, ...prev]);
    const productName = products.find(p => p.id === selectedProduct)?.name || "Product";
    setSelectedProduct("");
    setConsumptionQuantity(1);
    setConsumptionNotes("");
    toast({ 
      title: "Consumption logged successfully", 
      description: `${consumptionQuantity} unit(s) of ${productName} logged successfully` 
    });
  } catch (err: any) {
    console.error(err);
    toast({ title: "Error", description: err.message, variant: "destructive" });
  }
};

  // Filter orders
  const getFilteredOrders = (status: KitchenOrder['status']) => {
    return orders.filter(order => {
      const orderDate = safeDate(order.createdAt);
      const matchesStatus = order.status === status;
      const matchesDate = orderDate ? format(orderDate, 'yyyy-MM-dd') === filterDate : false;
      const matchesSection = filterSection === 'all' || order.section === filterSection;
      return matchesStatus && matchesDate && matchesSection;
    });
  };

  // Move order status
  const moveOrder = (orderId: string, newStatus: KitchenOrder['status']) => {
    setOrders(prev => prev.map(order => order.id === orderId ? { ...order, status: newStatus, updatedAt: new Date() } : order));
    const statusText = newStatus === 'new' ? 'New Orders' : newStatus === 'in-progress' ? 'In Progress' : 'Done';
    toast({ 
      title: "Order status updated", 
      description: `Order ${orderId} has been moved to ${statusText}` 
    });
  };

  // Priority badge colors
  const getPriorityColor = (priority: KitchenOrder['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-warning text-warning-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  // Order card component
  const OrderCard = ({ order }: { order: KitchenOrder }) => (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>{order.billId}</CardTitle>
          <Badge className={getPriorityColor(order.priority)}>{order.priority}</Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {safeDate(order.createdAt) ? formatDistanceToNow(safeDate(order.createdAt)!, { addSuffix: true }) : 'Invalid Date'}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between py-1 px-2 bg-muted/50 rounded">
            <span>{item.name}</span>
            <Badge variant="secondary">×{item.quantity}</Badge>
          </div>
        ))}
        {order.notes && <p className="text-sm italic text-muted-foreground">{order.notes}</p>}
        <div className="flex gap-2 pt-2">
          {order.status === 'new' && <Button onClick={() => moveOrder(order.id, 'in-progress')} size="sm" className="flex-1">Start Cooking</Button>}
          {order.status === 'in-progress' && <Button onClick={() => moveOrder(order.id, 'done')} size="sm" variant="default" className="flex-1">Mark Done</Button>}
          {order.status === 'done' && <Button onClick={() => moveOrder(order.id, 'new')} size="sm" variant="outline" className="flex-1">Reopen</Button>}
        </div>
      </CardContent>
    </Card>
  );

  const newOrders = getFilteredOrders('new');
  const inProgressOrders = getFilteredOrders('in-progress');
  const doneOrders = getFilteredOrders('done');

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ChefHat className="h-8 w-8" /> Kitchen Management
        </h1>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <Badge variant="outline">{newOrders.length} new orders</Badge>
        </div>
      </div>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="orders" className="flex items-center gap-2"><Clock className="h-4 w-4" /> Orders</TabsTrigger>
          <TabsTrigger value="consumption" className="flex items-center gap-2"><Users className="h-4 w-4" /> Employee Consumption</TabsTrigger>
        </TabsList>

        {/* Orders */}
        <TabsContent value="orders" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Card className="bg-accent/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <AlertCircle className="h-5 w-5 text-warning" /> New Orders <Badge variant="secondary">{newOrders.length}</Badge>
                  </CardTitle>
                </CardHeader>
              </Card>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">{newOrders.map(o => <OrderCard key={o.id} order={o} />)}</div>
            </div>
            <div>
              <Card className="bg-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <Clock className="h-5 w-5 text-primary" /> In Progress <Badge variant="secondary">{inProgressOrders.length}</Badge>
                  </CardTitle>
                </CardHeader>
              </Card>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">{inProgressOrders.map(o => <OrderCard key={o.id} order={o} />)}</div>
            </div>
            <div>
              <Card className="bg-success/10">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <CheckCircle className="h-5 w-5 text-success" /> Done <Badge variant="secondary">{doneOrders.length}</Badge>
                  </CardTitle>
                </CardHeader>
              </Card>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">{doneOrders.map(o => <OrderCard key={o.id} order={o} />)}</div>
            </div>
          </div>
        </TabsContent>

        {/* Employee Consumption */}
        <TabsContent value="consumption" className="space-y-6 mt-6">
          {/* Log Consumption Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Utensils className="h-5 w-5" /> Log Employee Consumption</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Product</Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                    <SelectContent>
                      {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input type="number" min={1} value={consumptionQuantity} onChange={(e) => setConsumptionQuantity(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Notes (Optional)</Label>
                  <Input value={consumptionNotes} onChange={(e) => setConsumptionNotes(e.target.value)} placeholder="e.g., breakfast" />
                </div>
                <div className="flex items-end">
                  <Button onClick={addEmployeeConsumption} disabled={!selectedProduct} className="w-full">Log Consumption</Button>
                </div>
              </div>
              {user && <p className="text-sm text-muted-foreground">Logging as: <strong>{user.username}</strong></p>}
            </CardContent>
          </Card>

          {/* Consumption History */}
          <Card>
            <CardHeader><CardTitle>Today's Consumption History</CardTitle></CardHeader>
            <CardContent>
              {consumptions.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No consumption logged today</p>
              ) : (
                consumptions.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{c.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {c.employeeName} • {safeDate(c.consumedAt) ? format(safeDate(c.consumedAt)!, 'HH:mm') : 'Invalid Time'}
                      </p>
                      {c.notes && <p className="text-sm italic text-muted-foreground">{c.notes}</p>}
                    </div>
                    <Badge variant="secondary">×{c.quantity}</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Kitchen;
