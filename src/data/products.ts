export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  sku: string;
  active: boolean;
  stock: number;
}

// Asian food products with realistic pricing in LKR
export const demoProducts: Product[] = [
  // Beverages
  {
    id: '1',
    name: 'Masala Chai',
    price: 180,
    category: 'Beverages',
    description: 'Traditional spiced tea with milk and aromatic spices',
    image: '/images/masala-chai.jpg',
    sku: 'BEV001',
    active: true,
    stock: 50
  },
  {
    id: '2',
    name: 'Herbal Tea',
    price: 150,
    category: 'Beverages',
    description: 'Refreshing herbal tea blend with natural ingredients',
    image: '/placeholder-product.jpg',
    sku: 'BEV002',
    active: true,
    stock: 30
  },
  {
    id: '3',
    name: 'Fresh Lime Juice',
    price: 120,
    category: 'Beverages',
    description: 'Freshly squeezed lime juice with mint',
    image: '/placeholder-product.jpg',
    sku: 'BEV003',
    active: true,
    stock: 25
  },
  
  // Snacks & Appetizers
  {
    id: '4',
    name: 'Vegetable Samosa',
    price: 85,
    category: 'Snacks',
    description: 'Crispy triangular pastry filled with spiced vegetables',
    image: '/images/samosa.jpg',
    sku: 'SNK001',
    active: true,
    stock: 40
  },
  {
    id: '5',
    name: 'Chicken Roll',
    price: 220,
    category: 'Snacks',
    description: 'Flaky pastry wrapped around spiced chicken filling',
    image: '/placeholder-product.jpg',
    sku: 'SNK002',
    active: true,
    stock: 35
  },
  {
    id: '6',
    name: 'Fish Cutlet',
    price: 95,
    category: 'Snacks',
    description: 'Deep-fried fish patty with Sri Lankan spices',
    image: '/placeholder-product.jpg',
    sku: 'SNK003',
    active: true,
    stock: 45
  },
  {
    id: '7',
    name: 'Egg Roll',
    price: 180,
    category: 'Snacks',
    description: 'Golden pastry roll filled with spiced eggs',
    image: '/placeholder-product.jpg',
    sku: 'SNK004',
    active: true,
    stock: 20
  },
  
  // Main Dishes
  {
    id: '8',
    name: 'Chicken Biryani',
    price: 650,
    category: 'Main Dishes',
    description: 'Fragrant basmati rice with tender chicken and aromatic spices',
    image: '/images/biryani.jpg',
    sku: 'MAIN001',
    active: true,
    stock: 15
  },
  {
    id: '9',
    name: 'Mutton Curry',
    price: 850,
    category: 'Main Dishes',
    description: 'Slow-cooked mutton in rich coconut curry',
    image: '/placeholder-product.jpg',
    sku: 'MAIN002',
    active: true,
    stock: 12
  },
  {
    id: '10',
    name: 'Fish Curry',
    price: 750,
    category: 'Main Dishes',
    description: 'Fresh fish cooked in traditional Sri Lankan curry',
    image: '/images/fish-curry.jpg',
    sku: 'MAIN003',
    active: true,
    stock: 18
  },
  {
    id: '11',
    name: 'Vegetable Curry',
    price: 450,
    category: 'Main Dishes',
    description: 'Mixed vegetables in coconut milk curry',
    image: '/placeholder-product.jpg',
    sku: 'MAIN004',
    active: true,
    stock: 25
  },
  
  // Rice & Accompaniments
  {
    id: '12',
    name: 'Coconut Rice',
    price: 280,
    category: 'Rice',
    description: 'Fragrant rice cooked in coconut milk',
    image: '/placeholder-product.jpg',
    sku: 'RICE001',
    active: true,
    stock: 30
  },
  {
    id: '13',
    name: 'Plain Rice',
    price: 180,
    category: 'Rice',
    description: 'Steamed white basmati rice',
    image: '/placeholder-product.jpg',
    sku: 'RICE002',
    active: true,
    stock: 50
  },
  {
    id: '14',
    name: 'Papadam',
    price: 35,
    category: 'Rice',
    description: 'Crispy lentil wafer',
    image: '/placeholder-product.jpg',
    sku: 'RICE003',
    active: true,
    stock: 100
  },
  
  // Desserts
  {
    id: '15',
    name: 'Watalappam',
    price: 320,
    category: 'Desserts',
    description: 'Traditional Sri Lankan coconut custard pudding',
    image: '/placeholder-product.jpg',
    sku: 'DES001',
    active: true,
    stock: 8
  },
  {
    id: '16',
    name: 'Milk Rice',
    price: 150,
    category: 'Desserts',
    description: 'Sweet coconut milk rice with jaggery',
    image: '/placeholder-product.jpg',
    sku: 'DES002',
    active: true,
    stock: 15
  }
];

export const categories = [
  'All',
  'Beverages',
  'Snacks',
  'Main Dishes',
  'Rice',
  'Desserts'
];