// src/components/Billing.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ProductCard, CartSummary } from "@/components/BillingComponents";
import { generateBillPDF, BillData } from "@/utils/pdfGenerator";
import { categories } from "@/data/products";
import { Search, ShoppingCart, Printer, Download } from "lucide-react";
// import { toast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import type { Product, CartItem } from "@/types/billing";

const Billing = () => {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sections, setSections] = useState({
    client: true,
    kitchen: false,
    stock: false,
  });
  const [paymentType, setPaymentType] = useState("cash");
  const [taxRate, setTaxRate] = useState(0.1);
  const [isEditingTax, setIsEditingTax] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // 🆕 date picker and stock
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [stockData, setStockData] = useState<Record<string, number>>({});

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

  // --- Fetch products and stock for selected date ---
  useEffect(() => {
  const fetchProductsByDate = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE_URL}/products/?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      console.log("API Response:", data); // Keep this for debugging
      const formattedProducts: Product[] = data.map((item: any) => ({
        id: item.id.toString(),
        name: item.name,
        price: parseFloat(item.price),
        category: item.category,
        active: true,
        sku: item.name.toLowerCase().replace(/\s+/g, "-"),
        // Check if image is a full URL; if not, prepend the base URL
        image: item.image
          ? item.image.startsWith("http")
            ? item.image
            : `${API_BASE_URL.replace("/api", "")}${item.image}`
          : undefined,
      }));
      setProducts(formattedProducts);
      // ... rest of the stock fetching logic
      const stockRes = await fetch(`${API_BASE_URL}/stocks/?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!stockRes.ok) throw new Error("Failed to fetch stock data");
      const stockItems = await stockRes.json();
      const stockMap: Record<string, number> = {};
      stockItems.forEach((item: any) => {
        stockMap[item.product.id] =
          item.starting_stock + item.added_stock - item.sold_quantity;
      });
      setStockData(stockMap);
    } catch (err: any) {
      toast.error("Payment failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchProductsByDate();
}, [isAuthenticated, selectedDate]);
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory && product.active;
  });

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, change: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const newQuantity = Math.max(0, item.quantity + change);
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const subtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

 const handleCreateBill = async () => {
  if (cart.length === 0) return;

  const selectedSections = Object.entries(sections)
    .filter(([_, selected]) => selected)
    .map(([section]) => section);

  const billData: BillData = {
    items: cart.map((item) => ({
      product: {
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        sku: item.product.sku,
      },
      quantity: item.quantity,
    })),
    subtotal,
    tax,
    taxRate,
    total,
    paymentMethod: paymentType,
    billNumber: `SPOT-${Date.now()}`,
    date: new Date().toLocaleDateString(),
    cashier: "Admin User",
  };

  try {
    await generateBillPDF(billData);
    printToMultiplePrinters(cart, selectedSections);
    setCart([]);
    setSections({ client: true, kitchen: false, stock: false });

    // ✅ Sonner toast
    toast.success(`Bill created! Sent to: ${selectedSections.join(", ")}`);
  } catch (error) {
    // ✅ Sonner toast
    toast.error("Error generating bill. Please try again.");
  }
};

const handlePay = async () => {
  if (cart.length === 0) return;

  try {
    const accessToken = localStorage.getItem("accessToken");
    const res = await fetch(`${API_BASE_URL}/payments/create/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        cart: cart.map((item) => ({ product_id: item.product.id, quantity: item.quantity })),
        payment_method: paymentType,
        date: selectedDate,
      }),
    });

    if (!res.ok) throw new Error("Payment failed");

    const data = await res.json();

    // ✅ Sonner toast
    toast.success(`Payment successful!`);

    // Update local stock immediately
    const newStockData = { ...stockData };
    cart.forEach((item) => {
      if (newStockData[item.product.id] !== undefined) {
        newStockData[item.product.id] -= item.quantity;
      }
    });
    setStockData(newStockData);

    setCart([]);
  } catch (err: any) {
    // ✅ Sonner toast
    toast.error(`Payment failed: ${err.message}`);
  }
};


  const printToMultiplePrinters = (billItems: CartItem[], sections: string[]) => {
    sections.forEach((section) => {
      setTimeout(() => {
        toast.success(
  ` ${section.charAt(0).toUpperCase() + section.slice(1)} Receipt printed successfully`
);

      }, Math.random() * 1000);
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
      {/* Left Side */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-brand bg-clip-text text-transparent">Billing</h1>
          <p className="text-muted-foreground mt-2">Select products to create a new order</p>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <Label htmlFor="billing-date" className="font-medium text-sm">Select Date:</Label>
          <Input
            type="date"
            id="billing-date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-40"
            disabled={loading}
          />
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              disabled={loading}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                disabled={loading}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading ? <p>Loading products...</p> : filteredProducts.length === 0 ? <p>No products found.</p> :
            filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={{ ...product, stock: stockData[product.id] ?? undefined }}
                onAddToCart={addToCart}
              />
            ))}
        </div>
      </div>

      {/* Right Side - Cart */}
      <div className="space-y-6">
        <Card className="shadow-2xl border-0 bg-gradient-card card-hover max-h-[calc(100vh-8rem)] overflow-y-auto">
          <CardHeader className="bg-gradient-brand text-white rounded-t-xl">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShoppingCart className="h-6 w-6" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 bg-white/50 backdrop-blur-sm rounded-b-xl">
            <CartSummary
              cart={cart}
              subtotal={subtotal}
              tax={tax}
              taxRate={taxRate}
              total={total}
              onUpdateQuantity={updateQuantity}
              onEditTax={(newRate: number) => setTaxRate(newRate)}
              isEditingTax={isEditingTax}
              onToggleEditTax={() => setIsEditingTax(!isEditingTax)}
            />

            <Separator className="my-4" />

            <div className="space-y-3">
              <Label className="text-sm font-medium">Send receipt to:</Label>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(sections).map(([section, checked]) => (
                  <div key={section} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                    <Checkbox
                      id={section}
                      checked={checked}
                      onCheckedChange={(checked) => setSections((prev) => ({ ...prev, [section]: !!checked }))}
                    />
                    <Label htmlFor={section} className="text-sm capitalize cursor-pointer flex-1">
                      {section === "client" ? "Customer Receipt" : section}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-3">
              <Label className="text-sm font-medium">Payment Method:</Label>
              <RadioGroup value={paymentType} onValueChange={setPaymentType} className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="text-sm cursor-pointer">Cash</Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="text-sm cursor-pointer">Visa/Card</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <Button
                variant="outline"
                onClick={handleCreateBill}
                disabled={cart.length === 0 || loading}
                className="hover-lift border-2 border-primary/30 hover:bg-primary/5"
              >
                <Printer className="h-4 w-4 mr-2" /> Print Bill
              </Button>
              <Button
                onClick={handleCreateBill}
                disabled={cart.length === 0 || loading}
                className="btn-professional hover-glow"
              >
                <Download className="h-4 w-4 mr-2" /> Generate PDF
              </Button>
              <Button
                onClick={handlePay}
                disabled={cart.length === 0 || loading}
                className="btn-primary hover-glow"
              >
                Pay
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Billing;
