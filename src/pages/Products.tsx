import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, Edit, Trash2, Package, CalendarIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { apiRequest } from "@/lib/api";

interface Product {
  id: string;
  name: string;
  price: string;
  category: string;
  stock_type: "on_demand" | "daily_stock";
  image: string;
  total_sold: number;
  daily_sold?: number;
  sold_quantity?: number;
}

const categories = [
  "All",
  "Ice Creams",
  "Milkshakes",
  "Drinks",
  "Fresh Juice",
  "குடிக்க",
  "கடிக்க",
];
const stockTypes = ["on_demand", "daily_stock"];

const Products = () => {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    stock_type: "" as "on_demand" | "daily_stock" | "",
  });
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedDailyProducts, setSelectedDailyProducts] = useState<string[]>([]);
  const [isDailyProductDialogOpen, setIsDailyProductDialogOpen] = useState(false);
  const [dailyProducts, setDailyProducts] = useState<Product[]>([]);
  const [dropdownValue, setDropdownValue] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchDailyProducts(selectedDate);
    }
  }, [selectedDate]);

  const fetchProducts = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const response = await apiRequest('/products/', { method: 'GET' });
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyProducts = async (date: Date) => {
  if (!isAuthenticated) return;
  setLoading(true);
  try {
    const dateStr = format(date, "yyyy-MM-dd");
    const response = await apiRequest(`/products/?date=${dateStr}`, { method: 'GET' });
    if (!response.ok) throw new Error("Failed to fetch daily products");
    const data = await response.json();
    setDailyProducts(data);
  } catch (error: any) {
    toast({ title: "Error", description: error.message, variant: "destructive" });
  } finally {
    setLoading(false);
  }
};

  const fetchProductDetails = async (productId: string) => {
    if (!isAuthenticated) return null;
    setLoading(true);
    try {
      const response = await apiRequest(`/products/${productId}/`, { method: 'GET' });
      if (!response.ok) throw new Error("Failed to fetch product details");
      return await response.json();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!formData.name || !formData.price || !formData.category || !formData.stock_type) {
      toast({ title: "Missing fields", description: "All fields are required", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const formPayload = new FormData();
      formPayload.append("name", formData.name);
      formPayload.append("price", formData.price);
      formPayload.append("category", formData.category);
      formPayload.append("stock_type", formData.stock_type);
      if (selectedFile) formPayload.append("image", selectedFile);

      const response = await apiRequest('/products/create/', { method: 'POST', body: formPayload });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to add product");
      }

      const newProduct = await response.json();
      setProducts([...products, newProduct]);
      setFormData({ name: "", price: "", category: "", stock_type: "" });
      setSelectedFile(null);
      setIsAddDialogOpen(false);
      toast({ title: "Product added", description: `${newProduct.name} has been added successfully` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = async () => {
    if (!editingProduct) return;

    setLoading(true);
    try {
      const formPayload = new FormData();
      formPayload.append("name", formData.name);
      formPayload.append("price", formData.price);
      formPayload.append("category", formData.category);
      formPayload.append("stock_type", formData.stock_type);
      if (selectedFile) formPayload.append("image", selectedFile);

      const response = await apiRequest(`/products/${editingProduct.id}/`, { method: 'PUT', body: formPayload });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update product");
      }

      const updatedProduct = await response.json();
      setProducts(products.map((p) => (p.id === editingProduct.id ? updatedProduct : p)));
      setEditingProduct(null);
      setFormData({ name: "", price: "", category: "", stock_type: "" });
      setSelectedFile(null);
      setIsAddDialogOpen(false);
      toast({ title: "Product updated", description: `${updatedProduct.name} has been updated successfully` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(`${API_BASE_URL}/products/${productId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) throw new Error("Failed to delete product");
      setProducts(products.filter((p) => p.id !== productId));
      setDailyProducts(dailyProducts.filter((p) => p.id !== productId));
      toast({ title: "Product deleted", description: "Product has been deleted successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDailyProduct = async (productId: string) => {
    if (!isAuthenticated || !selectedDate) return;
    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const response = await fetch(`${API_BASE_URL}/daily-products/delete/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product_id: productId, date: dateStr }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to remove product");
      }
      setDailyProducts(dailyProducts.filter((p) => p.id !== productId));
      toast({ title: "Success", description: "Product removed from daily featured list" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = async (product: Product) => {
    setLoading(true);
    const productDetails = await fetchProductDetails(product.id);
    if (productDetails) {
      setEditingProduct(productDetails);
      setFormData({
        name: productDetails.name,
        price: productDetails.price.toString(),
        category: productDetails.category,
        stock_type: productDetails.stock_type,
      });
      setSelectedFile(null);
      setIsAddDialogOpen(true);
    }
    setLoading(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleDailyProductSelection = async () => {
    if (!selectedDate || selectedDailyProducts.length === 0) {
      toast({ title: "Missing selection", description: "Please select a date and at least one product", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const dateStr = format(selectedDate, "yyyy-MM-dd");

      for (const productId of selectedDailyProducts) {
        const response = await fetch(`${API_BASE_URL}/daily-products/create/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ product_id: productId, date: dateStr }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `Failed to assign product to ${dateStr}`);
        }
      }

      setSelectedDailyProducts([]);
      setIsDailyProductDialogOpen(false);
      await fetchDailyProducts(selectedDate);
      toast({ title: "Success", description: `Products featured for ${format(selectedDate, "PPP")}` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-2">Manage your restaurant's menu items</p>
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            setEditingProduct(null);
            setFormData({ name: "", price: "", category: "", stock_type: "" });
            setSelectedFile(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button disabled={loading} className="mt-1 border-gray-300 focus:border-green-500 focus:ring-green-500"><Plus className="h-4 w-4 mr-2" /> Add Product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white rounded-lg shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
              <DialogDescription className="text-gray-600">{editingProduct ? "Update the details of this product." : "Create a new product for your menu."}</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">Product Name *</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} disabled={loading} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price" className="text-sm font-medium">Price (Rs) *</Label>
                  <Input id="price" type="number" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))} disabled={loading} />
                </div>
                <div>
                  <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))} 
                    disabled={loading}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder={editingProduct ? formData.category : "Select Category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c !== "All").map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="stock_type" className="text-sm font-medium">Stock Type</Label>
                <Select 
                  value={formData.stock_type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, stock_type: value as "on_demand"|"daily_stock" }))} 
                  disabled={loading}
                >
                  <SelectTrigger id="stock_type">
                    <SelectValue placeholder={editingProduct ? (formData.stock_type === "on_demand" ? "On Demand" : "Daily Stock") : "Select Stock Type"} />
                  </SelectTrigger>
                  <SelectContent>
                    {stockTypes.map(t => (
                      <SelectItem key={t} value={t}>
                        {t === "on_demand" ? "On Demand" : "Daily Stock"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="image" className="text-sm font-medium">Product Image</Label>
                <Input id="image" type="file" accept="image/*" onChange={handleImageUpload} disabled={loading} className="mt-1" />
              </div>
              <div className="flex gap-3 pt-4">
                <Button onClick={editingProduct ? handleEditProduct : handleAddProduct} disabled={loading}>
                  {editingProduct ? "Update Product" : "Add Product"}
                </Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={loading} className="border-gray-300">Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Today's Featured Products Section */}
      <Card className="bg-white shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <CalendarIcon className="h-5 w-5 text-green-600" /> Today's Featured Products
            </CardTitle>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 border-gray-300">
                  <CalendarIcon className="h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate || undefined}
                  onSelect={(date) => setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          <Dialog open={isDailyProductDialogOpen} onOpenChange={setIsDailyProductDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={loading} className="mt-1 border-gray-300 focus:border-green-500 focus:ring-green-500">Pick Products for This Day</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg bg-white rounded-lg shadow-lg">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">Feature Products for the Day</DialogTitle>
                <DialogDescription className="text-gray-600">Select products to feature in the stock for the chosen day.</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium">Select Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal mt-1 border-gray-300">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate || undefined}
                        onSelect={(date) => setSelectedDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label className="text-sm font-medium">Select Products</Label>
                  <Select
                    value={dropdownValue}
                    onValueChange={(value) => {
                      const product = products.find(p => p.id === value);
                      if (!product) return;
                      if (selectedDailyProducts.includes(value) || dailyProducts.some(p => p.id === value)) {
                        toast({ title: "Duplicate", description: `${product.name} is already added for ${format(selectedDate || new Date(), "PPP")}`, variant: "destructive" });
                        return;
                      }
                      setSelectedDailyProducts([...selectedDailyProducts, value]);
                      setDropdownValue("");
                    }}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose products" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id} className="flex items-center gap-2">
                          <img
                            src={product.image ? 
                              (product.image.startsWith('http') ? product.image : `${API_BASE_URL.replace('/api', '')}${product.image}`) 
                              : "/placeholder-product.jpg"} 
                            alt={product.name}
                            className="h-6 w-6 rounded object-cover"
                            onError={(e) => { e.currentTarget.src = "/placeholder-product.jpg" }}
                          />
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedDailyProducts.map((productId) => {
                      const product = products.find(p => p.id === productId);
                      return product ? (
                        <Badge key={productId} variant="secondary" className="flex items-center gap-2 bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
                          <img
                            src={product.image ? 
                              (product.image.startsWith('http') ? product.image : `${API_BASE_URL.replace('/api', '')}${product.image}`) 
                              : "/placeholder-product.jpg"} 
                            alt={product.name}
                            className="h-5 w-5 rounded-full object-cover"
                            onError={(e) => { e.currentTarget.src = "/placeholder-product.jpg" }}
                          />
                          {product.name}
                          <button
                            onClick={() => setSelectedDailyProducts(selectedDailyProducts.filter(id => id !== productId))}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleDailyProductSelection} className="mt-1 border-gray-300 focus:border-green-500 focus:ring-green-500" disabled={loading}>
                    Confirm Selection
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedDailyProducts([]);
                      setIsDailyProductDialogOpen(false);
                    }}
                    disabled={loading}
                    className="border-gray-300"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <div className="mt-4">
            {dailyProducts.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Daily Sold</TableHead>
                      <TableHead>Stock Type</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dailyProducts.map(product => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img 
                              src={product.image ? 
                                (product.image.startsWith('http') ? product.image : `${API_BASE_URL.replace('/api', '')}${product.image}`) 
                                : "/placeholder-product.jpg"} 
                              alt={product.name} 
                              className="h-12 w-12 rounded-lg object-cover" 
                              onError={(e) => { e.currentTarget.src = "/placeholder-product.jpg" }} 
                            />
                            <div className="font-medium">{product.name}</div>
                          </div>
                        </TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell className="font-semibold">Rs. {product.price}</TableCell>
                        <TableCell><Badge variant="secondary">{product.sold_quantity || 0}</Badge></TableCell>
                        <TableCell><Badge variant={product.stock_type==="on_demand"?"secondary":"default"}>{product.stock_type==="on_demand"?"On Demand":"Daily Stock"}</Badge></TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" disabled={loading} className="border-gray-300"><Trash2 className="h-4 w-4"/></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Product</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-600">Are you sure you want to remove "{product.name}" from the daily featured list?</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel disabled={loading} className="border-gray-300">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleRemoveDailyProduct(product.id)} disabled={loading} className="bg-red-600 hover:bg-red-700">
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-gray-500 text-center">No products featured for {selectedDate ? format(selectedDate, "PPP") : "the selected date"}.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-md">
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 border-gray-300 focus:border-green-500 focus:ring-green-500" disabled={loading} />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map(c => (
                <Button 
                  key={c} 
                  size="sm" 
                  onClick={() => setSelectedCategory(c)} 
                  disabled={loading}
                  className={`
                    text-sm font-medium px-3 py-1 rounded
                    ${selectedCategory === c 
                      ? "bg-green-600 text-white hover:bg-green-700" 
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-green-500 focus:border-green-500"
                    }
                  `}
                >
                  {c}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <Package className="h-5 w-5 text-green-600" /> All Products ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Total Sold</TableHead>
                  <TableHead>Stock Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map(product => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img 
                          src={product.image ? 
                            (product.image.startsWith('http') ? product.image : `${API_BASE_URL.replace('/api', '')}${product.image}`) 
                            : "/placeholder-product.jpg"} 
                          alt={product.name} 
                          className="h-12 w-12 rounded-lg object-cover" 
                          onError={(e) => { e.currentTarget.src = "/placeholder-product.jpg" }} 
                        />
                        <div className="font-medium">{product.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="font-semibold">Rs. {product.price}</TableCell>
                    <TableCell><Badge variant="secondary">{product.total_sold}</Badge></TableCell>
                    <TableCell><Badge variant={product.stock_type==="on_demand"?"secondary":"default"}>{product.stock_type==="on_demand"?"On Demand":"Daily Stock"}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={()=>openEditDialog(product)} disabled={loading} className="border-gray-300"><Edit className="h-4 w-4"/></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" disabled={loading} className="border-gray-300"><Trash2 className="h-4 w-4"/></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Product</AlertDialogTitle>
                              <DialogDescription className="text-gray-600">Are you sure you want to delete "{product.name}"?</DialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel disabled={loading} className="border-gray-300">Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteProduct(product.id)} disabled={loading} className="bg-red-600 hover:bg-red-700">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Products;
