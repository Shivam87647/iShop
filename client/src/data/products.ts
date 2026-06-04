export interface Product {
  id: string;
  _id?: string;
  name: string;
  category: 'mac' | 'iphone' | 'ipad' | 'watch' | 'accessories';
  price: number;
  originalPrice?: number;
  rating: number;
  image: string;
  badge?: 'HOT' | 'NEW' | 'SALE';
  description: string;
  colors?: { name: string; hex: string }[];
  specs?: { label: string; value: string }[];
}

export const products: Product[] = [
  {
    id: "iphone-11-pro",
    name: "iPhone 11 Pro Max Space Gray",
    category: "iphone",
    price: 899,
    originalPrice: 999,
    rating: 5,
    image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=600&auto=format&fit=crop",
    badge: "HOT",
    description: "iPhone 11 Pro Max features a transformative triple-camera system that adds tons of capability without complexity. An unprecedented leap in battery life.",
    colors: [
      { name: "Space Gray", hex: "#4A4B4D" },
      { name: "Midnight Green", hex: "#4E5851" },
      { name: "Gold", hex: "#F5E0C8" },
      { name: "Silver", hex: "#E3E4E5" }
    ],
    specs: [
      { label: "Display", value: "6.5-inch Super Retina XDR OLED display" },
      { label: "Chip", value: "A13 Bionic chip with third-generation Neural Engine" },
      { label: "Camera", value: "Triple 12MP Ultra Wide, Wide, and Telephoto cameras" }
    ]
  },
  {
    id: "macbook-pro-13",
    name: "MacBook Pro 13-inch Core i5",
    category: "mac",
    price: 1199,
    originalPrice: 1299,
    rating: 5,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600&auto=format&fit=crop",
    badge: "NEW",
    description: "MacBook Pro elevates the laptop to a whole new level of performance and portability. Wherever your ideas take you, you'll get there faster than ever.",
    colors: [
      { name: "Space Gray", hex: "#5E6266" },
      { name: "Silver", hex: "#E3E4E5" }
    ],
    specs: [
      { label: "Processor", value: "1.4GHz quad-core Intel Core i5" },
      { label: "Memory", value: "8GB of 2133MHz LPDDR3 onboard memory" },
      { label: "Storage", value: "256GB or 512GB SSD storage" }
    ]
  },
  {
    id: "ipad-pro-11",
    name: "iPad Pro 11-inch Wi-Fi 128GB",
    category: "ipad",
    price: 799,
    rating: 4,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=600&auto=format&fit=crop",
    badge: "NEW",
    description: "It's all screen and all powerhouse. Completely redesigned and packed with Apple's most advanced technology.",
    colors: [
      { name: "Space Gray", hex: "#5E6266" },
      { name: "Silver", hex: "#E3E4E5" }
    ],
    specs: [
      { label: "Display", value: "11-inch Liquid Retina display with ProMotion and True Tone" },
      { label: "Chip", value: "A12X Bionic chip with Neural Engine" },
      { label: "Storage", value: "128GB, 256GB, 512GB, or 1TB SSD" }
    ]
  },
  {
    id: "apple-watch-s5",
    name: "Apple Watch Series 5 Space Black",
    category: "watch",
    price: 399,
    originalPrice: 429,
    rating: 5,
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=600&auto=format&fit=crop",
    badge: "HOT",
    description: "This watch has a display that never sleeps. With the new Always-On Retina display, you always see the time and your watch face.",
    colors: [
      { name: "Space Black", hex: "#222325" },
      { name: "Silver", hex: "#E3E4E5" },
      { name: "Gold", hex: "#E8D3C0" }
    ],
    specs: [
      { label: "Case Size", value: "40mm or 44mm aluminum, steel, titanium, or ceramic case" },
      { label: "Features", value: "Always-On Retina display, built-in compass, ECG app" },
      { label: "Water Resistance", value: "Water resistant to 50 meters" }
    ]
  },
  {
    id: "airpods-pro",
    name: "Apple AirPods Pro Wireless Case",
    category: "accessories",
    price: 249,
    originalPrice: 279,
    rating: 4,
    image: "https://images.unsplash.com/photo-1588449668338-d134ae213c4f?q=80&w=600&auto=format&fit=crop",
    badge: "SALE",
    description: "AirPods Pro have been designed to deliver Active Noise Cancellation for immersive sound, Transparency mode so you can hear your surroundings.",
    colors: [
      { name: "White", hex: "#FFFFFF" }
    ],
    specs: [
      { label: "Audio", value: "Active Noise Cancellation & Adaptive Transparency" },
      { label: "Charging Case", value: "Wireless MagSafe Charging Case" },
      { label: "Battery", value: "Up to 4.5 hours of listening time on one charge" }
    ]
  },
  {
    id: "iphone-11",
    name: "iPhone 11 128GB Product Red",
    category: "iphone",
    price: 699,
    rating: 4,
    image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=600&auto=format&fit=crop",
    description: "Just the right amount of everything. Dual-camera system, all-day battery life, toughest glass in a smartphone, and Apple's fastest chip.",
    colors: [
      { name: "Black", hex: "#1C1D21" },
      { name: "Green", hex: "#D4E8DC" },
      { name: "Yellow", hex: "#FCE8BA" },
      { name: "Purple", hex: "#E4D9EC" },
      { name: "Red", hex: "#D93646" }
    ],
    specs: [
      { label: "Display", value: "6.1-inch Liquid Retina HD LCD display" },
      { label: "Chip", value: "A13 Bionic chip" },
      { label: "Camera", value: "Dual 12MP Ultra Wide and Wide cameras" }
    ]
  },
  {
    id: "macbook-air-13",
    name: "MacBook Air 13-inch Core i3",
    category: "mac",
    price: 999,
    originalPrice: 1099,
    rating: 5,
    image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=600&auto=format&fit=crop",
    description: "The incredibly thin and light MacBook Air is now more powerful than ever. It features a brilliant Retina display, new Magic Keyboard, Touch ID.",
    colors: [
      { name: "Space Gray", hex: "#5E6266" },
      { name: "Gold", hex: "#E6CBB3" },
      { name: "Silver", hex: "#E3E4E5" }
    ],
    specs: [
      { label: "Processor", value: "1.1GHz dual-core Intel Core i3" },
      { label: "Memory", value: "8GB of 3733MHz LPDDR4X onboard memory" },
      { label: "Storage", value: "256GB PCIe-based SSD storage" }
    ]
  },
  {
    id: "ipad-air-10-5",
    name: "iPad Air 10.5-inch Wi-Fi 64GB",
    category: "ipad",
    price: 499,
    rating: 4,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=600&auto=format&fit=crop",
    description: "iPad Air brings more of our most powerful technologies to more people than ever. The A12 Bionic chip with Neural Engine. A 10.5-inch Retina display.",
    colors: [
      { name: "Space Gray", hex: "#5E6266" },
      { name: "Silver", hex: "#E3E4E5" },
      { name: "Gold", hex: "#E8D3C0" }
    ],
    specs: [
      { label: "Display", value: "10.5-inch Retina display with True Tone" },
      { label: "Chip", value: "A12 Bionic chip with Neural Engine" },
      { label: "Storage", value: "64GB or 256GB storage options" }
    ]
  },
  {
    id: "apple-watch-s3",
    name: "Apple Watch Series 3 GPS 38mm",
    category: "watch",
    price: 199,
    originalPrice: 229,
    rating: 4,
    image: "https://images.unsplash.com/photo-1517502884422-41eaaced0168?q=80&w=600&auto=format&fit=crop",
    badge: "SALE",
    description: "Track your workouts. Monitor your health. Get the motivation you need to crush your fitness goals. All right from your wrist.",
    colors: [
      { name: "Space Gray", hex: "#5E6266" },
      { name: "Silver", hex: "#E3E4E5" }
    ],
    specs: [
      { label: "Case Size", value: "38mm or 42mm case size" },
      { label: "Sensors", value: "Optical heart sensor, Barometric altimeter, Accelerometer" },
      { label: "Battery", value: "Up to 18 hours of battery life" }
    ]
  },
  {
    id: "beats-solo3",
    name: "Beats Solo3 Wireless Headphones",
    category: "accessories",
    price: 179,
    originalPrice: 199,
    rating: 4,
    image: "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?q=80&w=600&auto=format&fit=crop",
    description: "With up to 40 hours of battery life, Beats Solo3 Wireless is your perfect everyday headphone. Get the most out of your music with award-winning Beats sound.",
    colors: [
      { name: "Black", hex: "#1C1D21" },
      { name: "Rose Gold", hex: "#E1BAB3" },
      { name: "Red", hex: "#D93646" }
    ],
    specs: [
      { label: "Connectivity", value: "Class 1 Wireless Bluetooth connectivity" },
      { label: "Battery Life", value: "Up to 40 hours of battery life" },
      { label: "Features", value: "Fast Fuel charging (5 minutes charge = 3 hours playback)" }
    ]
  },
  {
    id: "leather-case-iphone-11",
    name: "iPhone 11 Pro Leather Case Black",
    category: "accessories",
    price: 49,
    rating: 5,
    image: "https://images.unsplash.com/photo-1622445262465-2481c4574875?q=80&w=600&auto=format&fit=crop",
    badge: "NEW",
    description: "These Apple-designed cases fit snugly over the curves of your iPhone without adding bulk. They're crafted from specially tanned and finished European leather.",
    colors: [
      { name: "Black", hex: "#1C1D21" },
      { name: "Saddle Brown", hex: "#8A5636" },
      { name: "Meyer Lemon", hex: "#ECD252" }
    ],
    specs: [
      { label: "Material", value: "Premium European leather lining" },
      { label: "Compatibility", value: "iPhone 11 Pro or iPhone 11 Pro Max" }
    ]
  },
  {
    id: "lightning-usb-cable",
    name: "Lightning to USB Cable (1m)",
    category: "accessories",
    price: 19,
    originalPrice: 25,
    rating: 4,
    image: "https://images.unsplash.com/photo-1588449668338-d134ae213c4f?q=80&w=600&auto=format&fit=crop",
    description: "This USB 2.0 cable connects your iPhone, iPad, or iPod with Lightning connector to your computer's USB port for syncing and charging.",
    colors: [
      { name: "White", hex: "#FFFFFF" }
    ],
    specs: [
      { label: "Length", value: "1 meter (3.2 feet)" },
      { label: "Connection", value: "Lightning to USB-A" }
    ]
  }
];
