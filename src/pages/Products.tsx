// src/components/Products.tsx
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
import { Search, Plus, Edit, Trash2, Package } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Product {
  id: string;
  name: string;
  price: string;
  category: string;
  stock_type: "on_demand" | "daily_stock";
  image: string;
  total_sold: number;
}

const categories = ["All", "Beverages", "Desserts", "Main Dishes", "Snacks"];
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
    category: "Beverages",
    stock_type: "on_demand" as "on_demand" | "daily_stock",
  });
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // 🔹 Fetch all products
  const fetchProducts = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(`${API_BASE_URL}/products/`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch single product
  const fetchProductDetails = async (productId: string) => {
    if (!isAuthenticated) return null;
    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(`${API_BASE_URL}/products/${productId}/`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) throw new Error("Failed to fetch product details");
      return await response.json();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Add product
  const handleAddProduct = async () => {
    if (!formData.name || !formData.price) {
      toast({ title: "Missing fields", description: "Name and Price are required", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const formPayload = new FormData();
      formPayload.append("name", formData.name);
      formPayload.append("price", formData.price);
      formPayload.append("category", formData.category);
      formPayload.append("stock_type", formData.stock_type);
      if (selectedFile) formPayload.append("image", selectedFile);

      const response = await fetch(`${API_BASE_URL}/products/create/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formPayload,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to add product");
      }

      const newProduct = await response.json();
      setProducts([...products, newProduct]);
      setFormData({ name: "", price: "", category: "Beverages", stock_type: "on_demand" });
      setSelectedFile(null);
      setIsAddDialogOpen(false);
      toast({ title: "Product added", description: `${newProduct.name} has been added successfully` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Edit product
  const handleEditProduct = async () => {
    if (!editingProduct) return;

    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const formPayload = new FormData();
      formPayload.append("name", formData.name);
      formPayload.append("price", formData.price);
      formPayload.append("category", formData.category);
      formPayload.append("stock_type", formData.stock_type);
      if (selectedFile) formPayload.append("image", selectedFile);

      const response = await fetch(`${API_BASE_URL}/products/${editingProduct.id}/`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formPayload,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update product");
      }

      const updatedProduct = await response.json();
      setProducts(products.map((p) => (p.id === editingProduct.id ? updatedProduct : p)));
      setEditingProduct(null);
      setFormData({ name: "", price: "", category: "Beverages", stock_type: "on_demand" });
      setSelectedFile(null);
      setIsAddDialogOpen(false);
      toast({ title: "Product updated", description: `${updatedProduct.name} has been updated successfully` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Delete product
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
      toast({ title: "Product deleted", description: "Product has been deleted successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Open edit dialog
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

  // 🔹 Handle image input
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setSelectedFile(file);
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
            setFormData({ name: "", price: "", category: "Beverages", stock_type: "on_demand" });
            setSelectedFile(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button disabled={loading}><Plus className="h-4 w-4 mr-2" /> Add Product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
              <DialogDescription>{editingProduct ? "Update product info" : "Create a new product"}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} disabled={loading} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (Rs) *</Label>
                  <Input id="price" type="number" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))} disabled={loading} />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))} disabled={loading}>
                    <SelectTrigger id="category"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c !== "All").map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="stock_type">Stock Type</Label>
                <Select value={formData.stock_type} onValueChange={(value) => setFormData(prev => ({ ...prev, stock_type: value as "on_demand"|"daily_stock" }))} disabled={loading}>
                  <SelectTrigger id="stock_type"><SelectValue /></SelectTrigger>
                  <SelectContent>{stockTypes.map(t => <SelectItem key={t} value={t}>{t === "on_demand" ? "On Demand" : "Daily Stock"}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="image">Product Image</Label>
                <Input id="image" type="file" accept="image/*" onChange={handleImageUpload} disabled={loading} />
              </div>
              <div className="flex gap-3 pt-4">
                <Button onClick={editingProduct ? handleEditProduct : handleAddProduct} className="flex-1" disabled={loading}>
                  {editingProduct ? "Update Product" : "Add Product"}
                </Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={loading}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" disabled={loading} />
            </div>
            <div className="flex gap-2">{categories.map(c => <Button key={c} variant={selectedCategory===c?"default":"outline"} size="sm" onClick={()=>setSelectedCategory(c)} disabled={loading}>{c}</Button>)}</div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" />Products ({filteredProducts.length})</CardTitle></CardHeader>
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
                          src={product.image.startsWith('http') ? product.image : `${API_BASE_URL.replace('/api', '')}${product.image}`} 
                          alt={product.name} 
                          className="h-12 w-12 rounded-lg object-cover" 
                          onError={(e)=>{e.currentTarget.src="/placeholder-product.jpg"}} 
                        />
                        <div><div className="font-medium">{product.name}</div></div>
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="font-semibold">Rs. {product.price}</TableCell>
                    <TableCell><Badge variant="secondary">{product.total_sold}</Badge></TableCell>
                    <TableCell><Badge variant={product.stock_type==="on_demand"?"secondary":"default"}>{product.stock_type==="on_demand"?"On Demand":"Daily Stock"}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={()=>openEditDialog(product)} disabled={loading}><Edit className="h-4 w-4"/></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" disabled={loading}><Trash2 className="h-4 w-4"/></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Product</AlertDialogTitle>
                              <AlertDialogDescription>Are you sure you want to delete "{product.name}"?</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={()=>handleDeleteProduct(product.id)} disabled={loading}>Delete</AlertDialogAction>
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