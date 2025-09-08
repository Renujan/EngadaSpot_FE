// src/components/Stock.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Package, AlertTriangle, Plus, Edit3, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

interface Product {
  id: string;
  name: string;
}

interface StockEntry {
  id: string;
  product: { id: string; name: string };
  stock_date: string;
  starting_stock: number;
  added_stock: number;
  sold_quantity: number;
  low_stock_value: number;
}

interface StockSummary {
  total_products: number;
  total_sold: number;
  total_remaining: number;
  low_stock_count: number;
}

const Stock = () => {
  const { isAuthenticated } = useAuth();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stockSummary, setStockSummary] = useState<StockSummary | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<StockEntry | null>(null);
  const [formData, setFormData] = useState({
    productId: "",
    starting_stock: "",
    added_stock: "",
    low_stock_value: "",
  });
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

  // --- Fetch products & stock on date change ---
  useEffect(() => {
    fetchProducts();
    fetchStockEntries();
    fetchStockSummary();
  }, [selectedDate]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE_URL}/products/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      setProducts(data);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchStockEntries = async () => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE_URL}/stocks/?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("Failed to fetch stock entries");
      const data = await res.json();
      setStockEntries(data);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchStockSummary = async () => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE_URL}/stocks/summary/?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      setStockSummary(data);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // --- Add Stock ---
  const addStockEntry = async () => {
    if (!formData.productId || !formData.starting_stock || !formData.low_stock_value) {
      toast({ title: "Missing fields", description: "Select product, starting stock & low stock value", variant: "destructive" });
      return;
    }

    // Prevent duplicate product on same date
    if (stockEntries.some((e) => e.product.id === formData.productId)) {
      toast({ title: "Duplicate product", description: "This product already added today", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const payload = {
        product: formData.productId,
        stock_date: selectedDate,
        starting_stock: parseInt(formData.starting_stock),
        added_stock: parseInt(formData.added_stock) || 0,
        sold_quantity: 0,
        low_stock_value: parseInt(formData.low_stock_value),
      };
      const res = await fetch(`${API_BASE_URL}/stocks/create/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to add stock");
      const newEntry = await res.json();
      setStockEntries((prev) => [...prev, newEntry]);
      setFormData({ productId: "", starting_stock: "", added_stock: "", low_stock_value: "" });
      setIsAddDialogOpen(false);
      toast({ title: "Stock added", description: `Stock added for ${newEntry.product.name}` });
      fetchStockSummary();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // --- Update Added Stock ---
  const updateStockEntry = async (id: string, added_stock: number) => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const payload = { added_stock };
      const res = await fetch(`${API_BASE_URL}/stocks/${id}/update/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update stock");
      const updatedEntry = await res.json();
      setStockEntries((prev) => prev.map((entry) => (entry.id === id ? updatedEntry : entry)));
      toast({ title: "Stock updated", description: "Added stock updated successfully" });
      fetchStockSummary();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // --- Delete Stock ---
  const deleteStockEntry = async (id: string) => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      await fetch(`${API_BASE_URL}/stocks/${id}/`, { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } });
      setStockEntries((prev) => prev.filter((entry) => entry.id !== id));
      toast({ title: "Stock deleted", description: "Stock entry deleted" });
      fetchStockSummary();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (entry: StockEntry) => {
    setEditingEntry(entry);
    setFormData({
      productId: entry.product.id,
      starting_stock: entry.starting_stock.toString(),
      added_stock: entry.added_stock.toString(),
      low_stock_value: entry.low_stock_value.toString(),
    });
    setIsAddDialogOpen(true);
  };

  // --- Low stock calculation ---
  const lowStockItems = stockEntries.filter(
    (e) => e.starting_stock + e.added_stock - e.sold_quantity <= e.low_stock_value
  );

  return (
    <div className="space-y-6 animate-slide-up">
      {/* --- Cards --- */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockSummary?.total_products || 0}</div>
            <p className="text-xs text-muted-foreground">Products in inventory</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">Items below low stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sold</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockSummary?.total_sold || 0}</div>
            <p className="text-xs text-muted-foreground">Items sold today</p>
          </CardContent>
        </Card>
      </div>

      {/* --- Add/Edit Stock Dialog --- */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) setEditingEntry(null); }}>
        <DialogTrigger asChild>
          <Button disabled={loading}><Plus className="h-4 w-4 mr-2" />{editingEntry ? "Edit Stock" : "Add Stock"}</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEntry ? "Edit Stock" : "Add Stock"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Product *</Label>
              <select
                value={formData.productId}
                onChange={(e) => setFormData((prev) => ({ ...prev, productId: e.target.value }))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={!!editingEntry || loading}
              >
                <option value="">Select a product</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            {!editingEntry && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Starting Stock *</Label>
                  <Input type="number" value={formData.starting_stock} onChange={(e) => setFormData((prev) => ({ ...prev, starting_stock: e.target.value }))} min={0} disabled={loading} />
                </div>
                <div>
                  <Label>Added Stock</Label>
                  <Input type="number" value={formData.added_stock} onChange={(e) => setFormData((prev) => ({ ...prev, added_stock: e.target.value }))} min={0} disabled={loading} />
                </div>
                <div>
                  <Label>Low Stock Value *</Label>
                  <Input type="number" value={formData.low_stock_value} onChange={(e) => setFormData((prev) => ({ ...prev, low_stock_value: e.target.value }))} min={0} disabled={loading} />
                </div>
              </div>
            )}
            {editingEntry && (
              <div>
                <Label>Added Stock</Label>
                <Input type="number" value={formData.added_stock} onChange={(e) => setFormData((prev) => ({ ...prev, added_stock: e.target.value }))} min={0} disabled={loading} />
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <Button className="flex-1" onClick={() => editingEntry ? updateStockEntry(editingEntry.id, parseInt(formData.added_stock)) : addStockEntry()} disabled={loading}>
                {editingEntry ? "Update Stock" : "Add Stock"}
              </Button>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={loading}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- Date Filter & Table --- */}
      <div className="space-y-4">
        <Card>
          <CardContent className="flex gap-4 items-center">
            <Label htmlFor="date">Date:</Label>
            <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-40" disabled={loading} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock Overview - {format(new Date(selectedDate), "PPP")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Starting Stock</TableHead>
                    <TableHead>Added Stock</TableHead>
                    <TableHead>Sold Quantity</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Low Stock Value</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockEntries.map((entry) => {
                    const remaining = entry.starting_stock + entry.added_stock - entry.sold_quantity;
                    const isLow = remaining <= entry.low_stock_value;
                    return (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.product.name}</TableCell>
                        <TableCell>{entry.starting_stock}</TableCell>
                        <TableCell>{entry.added_stock}</TableCell>
                        <TableCell>{entry.sold_quantity}</TableCell>
                        <TableCell className={isLow ? "text-red-600 font-bold" : ""}>{remaining}</TableCell>
                        <TableCell>{entry.low_stock_value}</TableCell>
                        <TableCell className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(entry)}> <Edit3 className="h-4 w-4" /> </Button>
                          <Button variant="outline" size="sm" onClick={() => deleteStockEntry(entry.id)}>Delete</Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Stock;
