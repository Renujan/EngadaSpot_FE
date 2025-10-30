// src/components/BillingComponents.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, Edit, Save, X } from "lucide-react";
import { Product } from "@/data/products";

interface CartItem {
  product: Product;
  quantity: number;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  // Get real food images from Unsplash with proper food-related search terms
  const getFoodImage = (productName: string, category: string) => {
    const foodImageMap = {
      'Masala Chai': 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop&auto=format&q=80',
      'Herbal Tea': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop&auto=format&q=80',
      'Fresh Lime Juice': 'https://images.unsplash.com/photo-1622473590773-f588134b6ce7?w=400&h=400&fit=crop&auto=format&q=80',
      'Vegetable Samosa': 'https://images.unsplash.com/photo-1601050690117-94f5f6fa7cabnd?w=400&h=400&fit=crop&auto=format&q=80',
      'Chicken Roll': 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=400&fit=crop&auto=format&q=80',
      'Fish Cutlet': 'https://images.unsplash.com/photo-1485962398705-ef6a13c41e8f?w=400&h=400&fit=crop&auto=format&q=80',
      'Egg Roll': 'https://images.unsplash.com/photo-1563379091339-03246963d7d6?w=400&h=400&fit=crop&auto=format&q=80',
      'Chicken Biryani': 'https://images.unsplash.com/photo-1563379091339-03246963d7d6?w=400&h=400&fit=crop&auto=format&q=80',
      'Mutton Curry': 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&h=400&fit=crop&auto=format&q=80',
      'Fish Curry': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop&auto=format&q=80',
      'Vegetable Curry': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=400&fit=crop&auto=format&q=80',
      'Coconut Rice': 'https://images.unsplash.com/photo-1516684669134-de6f7c473a2a?w=400&h=400&fit=crop&auto=format&q=80',
      'Plain Rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop&auto=format&q=80',
      'Papadam': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=400&fit=crop&auto=format&q=80',
      'Watalappam': 'https://images.unsplash.com/photo-1488477304112-4944851de03d?w=400&h=400&fit=crop&auto=format&q=80',
      'Milk Rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop&auto=format&q=80'
    };

    return foodImageMap[productName as keyof typeof foodImageMap] || 
           `https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop&auto=format&q=80`;
  };

  // Use server-provided image if available, else fallback to getFoodImage or placeholder
  const imageSrc = product.image || getFoodImage(product.name, product.category);

  return (
    <Card className="card-hover group border-0 shadow-lg bg-gradient-card">
      <CardContent className="p-0">
        <div className="aspect-square bg-gradient-subtle rounded-t-xl overflow-hidden relative">
          <img
            src={imageSrc}
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:rotate-1"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.png"; // Fallback to local placeholder
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Badge variant="secondary" className="bg-white/90 text-primary shadow-lg">
              {product.category}
            </Badge>
          </div>
        </div>
        
        <div className="p-4">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-sm leading-tight text-foreground group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                {product.description}
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-bold text-primary text-lg">Rs. {product.price}</span>
              <Badge 
                variant={product.stock > 10 ? "secondary" : product.stock > 0 ? "outline" : "destructive"} 
                className="text-xs"
              >
                Stock: {product.stock}
              </Badge>
            </div>
            
            <Button
              size="sm"
              className="w-full btn-professional group-hover:scale-105 transition-all duration-200"
              onClick={() => onAddToCart(product)}
              disabled={product.stock === 0}
            >
              <Package className="h-4 w-4 mr-2" />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// CartSummary component remains unchanged
interface CartSummaryProps {
  cart: CartItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  onUpdateQuantity: (productId: string, change: number) => void;
  onEditTax: (newRate: number) => void;
  isEditingTax: boolean;
  onToggleEditTax: () => void;
}

export const CartSummary = ({
  cart,
  subtotal,
  tax,
  taxRate,
  total,
  onUpdateQuantity,
  onEditTax,
  isEditingTax,
  onToggleEditTax
}: CartSummaryProps) => {
  const [tempTaxRate, setTempTaxRate] = useState(taxRate * 100);

  const handleSaveTax = () => {
    onEditTax(tempTaxRate / 100);
    onToggleEditTax();
  };

  const handleCancelTax = () => {
    setTempTaxRate(taxRate * 100);
    onToggleEditTax();
  };

  return (
    <div className="space-y-4">
      {/* Cart Items */}
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {cart.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Cart is empty</p>
            <p className="text-sm">Add items to get started</p>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.product.id} className="flex items-center justify-between p-4 bg-gradient-card rounded-xl border border-primary/10 card-hover">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate text-primary">{item.product.name}</p>
                <p className="text-xs text-muted-foreground">Rs. {item.product.price} each</p>
                <p className="text-xs font-medium text-foreground">Rs. {(item.product.price * item.quantity).toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0 rounded-full hover:bg-destructive hover:text-destructive-foreground hover-scale border-2"
                  onClick={() => onUpdateQuantity(item.product.id, -1)}
                >
                  -
                </Button>
                <span className="w-8 text-center text-sm font-bold bg-primary/10 py-1 px-2 rounded-lg">{item.quantity}</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0 rounded-full hover:bg-primary hover:text-primary-foreground hover-scale border-2"
                  onClick={() => onUpdateQuantity(item.product.id, 1)}
                >
                  +
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Separator />

      {/* Totals with Editable Tax */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>Subtotal:</span>
          <span>Rs. {subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <span>Tax:</span>
            {isEditingTax ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={tempTaxRate}
                  onChange={(e) => setTempTaxRate(Number(e.target.value))}
                  className="w-16 h-6 text-xs"
                  step="0.1"
                  min="0"
                  max="50"
                />
                <span className="text-xs">%</span>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={handleSaveTax}>
                  <Save className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={handleCancelTax}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <span>({(taxRate * 100).toFixed(1)}%)</span>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={onToggleEditTax}>
                  <Edit className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          <span>Rs. {tax.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between font-bold text-lg border-t pt-3">
          <span>Total:</span>
          <span className="text-primary">Rs. {total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};