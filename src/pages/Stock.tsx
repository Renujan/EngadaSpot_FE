// src/components/Stock.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, AlertTriangle, Plus, Edit3, Calendar, Trash2 } from "lucide-react";
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
  low_stock_threshold: number;
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
    low_stock_threshold: "",
  });
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

  // --- Fetch products & stock on date change ---
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchProducts();
    fetchStockEntries();
    fetchStockSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, isAuthenticated]);

  const fetchProducts = async () => {
  setLoading(true);
  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast({ 
        title: "Authentication required", 
        description: "Please log in to view products", 
        variant: "destructive" 
      });
      return;
    }
    const res = await fetch(`${API_BASE_URL}/products/?date=${selectedDate}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || "Failed to fetch products for selected date");
    }
    const data = await res.json();
    const mapped: Product[] = data.map((entry: any) => ({
  id: String(entry.id),
  name: entry.name,
}));

    setProducts(mapped);
    if (mapped.length === 0) {
      toast({ 
        title: "No products found", 
        description: `No products available for ${selectedDate}. Please add products first.`,
        variant: "destructive" 
      });
    }
  } catch (err: any) {
    toast({ title: "Error loading products", description: err.message, variant: "destructive" });
  } finally {
    setLoading(false);
  }
};

  const fetchStockEntries = async () => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        toast({ 
          title: "Authentication required", 
          description: "Please log in to view stock entries", 
          variant: "destructive" 
        });
        return;
      }
      // Backend list endpoint doesn't filter by date; we filter client-side.
      const res = await fetch(`${API_BASE_URL}/stocks/?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to fetch stock entries");
      }
      const data = await res.json();
      const filtered = (Array.isArray(data) ? data : [])
        .filter((e: any) => e.stock_date === selectedDate)
        .map(
          (e: any): StockEntry => ({
            id: String(e.id),
            product: { id: String(e.product.id), name: e.product.name },
            stock_date: e.stock_date,
            starting_stock: Number(e.starting_stock) || 0,
            added_stock: Number(e.added_stock) || 0,
            sold_quantity: Number(e.sold_quantity) || 0,
            low_stock_threshold: Number(e.low_stock_threshold) || 0,
          })
        );
      setStockEntries(filtered);
      if (filtered.length === 0) {
        toast({ 
          title: "No stock entries", 
          description: `No stock entries found for ${selectedDate}. Add stock entries to get started.`,
        });
      }
    } catch (err: any) {
      toast({ title: "Error loading stock", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchStockSummary = async () => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) return;
      const res = await fetch(`${API_BASE_URL}/stocks/summary/?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to fetch stock summary");
      }
      const data = await res.json();
      setStockSummary(data);
    } catch (err: any) {
      toast({ title: "Error loading summary", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // --- Add Stock ---
  const addStockEntry = async () => {
    if (!formData.productId || !formData.starting_stock || !formData.low_stock_threshold) {
      toast({
        title: "Missing fields",
        description: "Select product, starting stock & low stock threshold",
        variant: "destructive",
      });
      return;
    }

    // Prevent duplicate product on same date (we already filtered entries to the selected date)
    if (stockEntries.some((e) => e.product.id === formData.productId)) {
      toast({
        title: "Duplicate product",
        description: "This product already has a stock entry for the selected date",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const payload = {
        product_id: Number(formData.productId), // backend expects product_id
        stock_date: selectedDate,
        starting_stock: Number(formData.starting_stock),
        added_stock: Number(formData.added_stock) || 0,
        sold_quantity: 0,
        low_stock_threshold: Number(formData.low_stock_threshold), // backend expects low_stock_threshold
      };
      const res = await fetch(`${API_BASE_URL}/stocks/create/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to add stock");
      }
      const newEntry = await res.json();
      // Only add to list if it's for the current selected date
      if (newEntry.stock_date === selectedDate) {
        setStockEntries((prev) => [
          ...prev,
          {
            id: String(newEntry.id),
            product: { id: String(newEntry.product.id), name: newEntry.product.name },
            stock_date: newEntry.stock_date,
            starting_stock: Number(newEntry.starting_stock) || 0,
            added_stock: Number(newEntry.added_stock) || 0,
            sold_quantity: Number(newEntry.sold_quantity) || 0,
            low_stock_threshold: Number(newEntry.low_stock_threshold) || 0,
          },
        ]);
      }
      setFormData({ productId: "", starting_stock: "", added_stock: "", low_stock_threshold: "" });
      setIsAddDialogOpen(false);
      toast({ 
        title: "Stock added successfully", 
        description: `Stock entry created for ${newEntry.product.name} on ${selectedDate}` 
      });
      fetchStockSummary();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // --- Update Added Stock ---
  const updateStockEntry = async (id: string, added_stock: number) => {
    if (Number.isNaN(added_stock) || added_stock < 0) {
      toast({ title: "Invalid value", description: "Added stock must be a non-negative number", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const payload = { added_stock };
      const res = await fetch(`${API_BASE_URL}/stocks/${id}/update/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to update stock");
      }
      const updatedEntry = await res.json();
      setStockEntries((prev) =>
        prev.map((entry) =>
          entry.id === id
            ? {
                id: String(updatedEntry.id),
                product: { id: String(updatedEntry.product.id), name: updatedEntry.product.name },
                stock_date: updatedEntry.stock_date,
                starting_stock: Number(updatedEntry.starting_stock) || 0,
                added_stock: Number(updatedEntry.added_stock) || 0,
                sold_quantity: Number(updatedEntry.sold_quantity) || 0,
                low_stock_threshold: Number(updatedEntry.low_stock_threshold) || 0,
              }
            : entry
        )
      );
      toast({ 
        title: "Stock updated successfully", 
        description: `Stock entry for ${updatedEntry.product.name} has been updated` 
      });
      setIsAddDialogOpen(false);
      setEditingEntry(null);
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
      const res = await fetch(`${API_BASE_URL}/stocks/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to delete stock entry");
      }
      const deletedEntry = stockEntries.find(e => e.id === id);
      setStockEntries((prev) => prev.filter((entry) => entry.id !== id));
      toast({ 
        title: "Stock deleted successfully", 
        description: deletedEntry ? `Stock entry for ${deletedEntry.product.name} has been removed` : "Stock entry deleted" 
      });
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
      low_stock_threshold: entry.low_stock_threshold.toString(),
    });
    setIsAddDialogOpen(true);
  };

  // --- Low stock calculation ---
  const lowStockItems = stockEntries.filter(
    (e) => e.starting_stock + e.added_stock - e.sold_quantity <= e.low_stock_threshold
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
      <Dialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) setEditingEntry(null);
        }}
      >
        <DialogTrigger asChild>
          <Button disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            {editingEntry ? "Edit Stock" : "Add Stock"}
          </Button>
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
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {!editingEntry && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Starting Stock *</Label>
                  <Input
                    type="number"
                    value={formData.starting_stock}
                    onChange={(e) => setFormData((prev) => ({ ...prev, starting_stock: e.target.value }))}
                    min={0}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label>Added Stock</Label>
                  <Input
                    type="number"
                    value={formData.added_stock}
                    onChange={(e) => setFormData((prev) => ({ ...prev, added_stock: e.target.value }))}
                    min={0}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label>Low Stock Threshold *</Label>
                  <Input
                    type="number"
                    value={formData.low_stock_threshold}
                    onChange={(e) => setFormData((prev) => ({ ...prev, low_stock_threshold: e.target.value }))}
                    min={0}
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {editingEntry && (
              <div>
                <Label>Added Stock</Label>
                <Input
                  type="number"
                  value={formData.added_stock}
                  onChange={(e) => setFormData((prev) => ({ ...prev, added_stock: e.target.value }))}
                  min={0}
                  disabled={loading}
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                className="flex-1"
                onClick={() =>
                  editingEntry
                    ? updateStockEntry(editingEntry.id, Number(formData.added_stock) || 0)
                    : addStockEntry()
                }
                disabled={loading}
              >
                {editingEntry ? "Update Stock" : "Add Stock"}
              </Button>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={loading}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- Date Filter & Table --- */}
      <div className="space-y-4">
        <Card>
          <CardContent className="flex gap-4 items-center">
            <Label htmlFor="date">Date:</Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40"
              disabled={loading}
            />
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
                    <TableHead>Low Stock Threshold</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockEntries.map((entry) => {
                    const remaining = entry.starting_stock + entry.added_stock - entry.sold_quantity;
                    const isLow = remaining <= entry.low_stock_threshold;
                    return (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.product.name}</TableCell>
                        <TableCell>{entry.starting_stock}</TableCell>
                        <TableCell>{entry.added_stock}</TableCell>
                        <TableCell>{entry.sold_quantity}</TableCell>
                        <TableCell className={isLow ? "text-red-600 font-bold" : ""}>{remaining}</TableCell>
                        <TableCell>{entry.low_stock_threshold}</TableCell>
                        <TableCell className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(entry)} disabled={loading}>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" disabled={loading}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Stock Entry</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-600">
                                  Are you sure you want to delete the stock entry for "{entry.product.name}" on {format(new Date(entry.stock_date), "PPP")}? 
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel disabled={loading} className="border-gray-300">Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteStockEntry(entry.id)} 
                                  disabled={loading} 
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
