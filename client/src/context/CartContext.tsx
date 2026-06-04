"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { Product, products } from "@/data/products";
import { apiRequest } from "@/utils/api";
import { useAuth } from "./AuthContext";

export interface CartItem {
  _id?: string; // MongoDB cart item ID
  product: Product;
  quantity: number;
  selectedColor?: string;
}

interface CartContextType {
  cart: CartItem[];
  wishlist: string[];
  addToCart: (productId: string, quantity?: number, color?: string) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  cartCount: number;
  cartSubtotal: number;
  shippingCost: number;
  couponDiscount: number;
  couponCode: string;
  applyCoupon: (code: string) => Promise<boolean>;
  cartTotal: number;
  syncCartWithBackend: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [couponCode, setCouponCode] = useState<string>("");
  const [couponDiscount, setCouponDiscount] = useState<number>(0); // as amount, not percentage
  const [shippingThreshold, setShippingThreshold] = useState<number>(500);

  useEffect(() => {
    const val = localStorage.getItem("site_free_shipping_threshold");
    if (val) {
      setShippingThreshold(Number(val));
    }
  }, []);

  const updateCartStateFromBackend = useCallback((backendCartData: any) => {
    if (backendCartData) {
      const mappedItems: CartItem[] = (backendCartData.items || [])
        .filter((item: any) => item.product)
        .map((item: any) => ({
          _id: item._id,
          product: item.product,
          quantity: item.quantity,
          selectedColor: item.selectedColor,
        }));
      setCart(mappedItems);
      setCouponCode(backendCartData.couponCode || "");
      setCouponDiscount(backendCartData.discountAmount || 0);
    }
  }, []);

  const syncCartWithBackend = useCallback(async () => {
    try {
      // Get current backend cart
      await apiRequest("/cart");
      
      // If we have items in guest cart, push them to the backend to merge
      const localCartStr = localStorage.getItem("ishop_cart");
      const localCart: CartItem[] = localCartStr ? JSON.parse(localCartStr) : [];
      
      if (localCart.length > 0) {
        console.log("Merging local guest cart with backend database...");
        for (const item of localCart) {
          await apiRequest("/cart/items", {
            method: "POST",
            body: JSON.stringify({
              productId: item.product.id,
              quantity: item.quantity,
              selectedColor: item.selectedColor,
            }),
          });
        }
        // Clear local storage cart once merged
        localStorage.removeItem("ishop_cart");
      }

      // Fetch final merged cart
      const finalCart = await apiRequest("/cart");
      updateCartStateFromBackend(finalCart.data);

      // Fetch wishlist from backend
      const finalWishlist = await apiRequest("/wishlist");
      if (finalWishlist.data?.productIds) {
        setWishlist(finalWishlist.data.productIds);
      }
    } catch (err) {
      console.warn("Failed to sync cart/wishlist with backend:", err);
    }
  }, [updateCartStateFromBackend]);

  // 1. Initial local load for guest sessions
  useEffect(() => {
    if (!user) {
      const savedCart = localStorage.getItem("ishop_cart");
      const savedWishlist = localStorage.getItem("ishop_wishlist");
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          if (parsed && Array.isArray(parsed)) {
            const filteredCart = parsed.filter(
              (item: any) => item && item.product && (item.product.id || item.product._id)
            );
            setCart(filteredCart);
          }
        } catch (e) {
          console.error("Error parsing cart from localStorage", e);
        }
      }
      if (savedWishlist) {
        try {
          const parsed = JSON.parse(savedWishlist);
          if (parsed && Array.isArray(parsed)) {
            const filteredWishlist = parsed.filter((id: any) => typeof id === "string");
            setWishlist(filteredWishlist);
          }
        } catch (e) {
          console.error("Error parsing wishlist from localStorage", e);
        }
      }
    }
  }, [user]);

  // 2. Local storage persistence (guests only)
  useEffect(() => {
    if (!user) {
      localStorage.setItem("ishop_cart", JSON.stringify(cart));
    }
  }, [cart, user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem("ishop_wishlist", JSON.stringify(wishlist));
    }
  }, [wishlist, user]);

  // 3. User session changes: merge local cart to backend & sync state
  const prevUserRef = useRef<any>(undefined);
  useEffect(() => {
    // If transitioning from logged-in to logged-out, clear state & localStorage
    if (prevUserRef.current && !user) {
      setCart([]);
      setWishlist([]);
      localStorage.removeItem("ishop_cart");
      localStorage.removeItem("ishop_wishlist");
    }

    if (user) {
      syncCartWithBackend();
    } else {
      // Reverted to guest session
      setCouponCode("");
      setCouponDiscount(0);
    }
    
    prevUserRef.current = user;
  }, [user, syncCartWithBackend]);

  const addToCart = async (productId: string, quantity = 1, color?: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const targetColor = color || product.colors?.[0]?.name;

    if (user) {
      try {
        const body = await apiRequest("/cart/items", {
          method: "POST",
          body: JSON.stringify({
            productId,
            quantity,
            selectedColor: targetColor,
          }),
        });
        updateCartStateFromBackend(body.data);
      } catch (err) {
        console.error("Backend addToCart error:", err);
      }
    } else {
      // Guest local storage behavior
      setCart((prevCart) => {
        const cleanPrevCart = (prevCart || []).filter((item: any) => item && item.product);
        const existingItemIndex = cleanPrevCart.findIndex(
          (item) => item.product.id === productId && item.selectedColor === targetColor
        );

        if (existingItemIndex > -1) {
          const newCart = [...cleanPrevCart];
          newCart[existingItemIndex] = {
            ...newCart[existingItemIndex],
            quantity: newCart[existingItemIndex].quantity + quantity,
          };
          return newCart;
        } else {
          return [...cleanPrevCart, { product, quantity, selectedColor: targetColor }];
        }
      });
    }
  };

  const removeFromCart = async (productId: string) => {
    if (user) {
      try {
        // Find item ID
        const item = cart.find((i) => i.product.id === productId);
        if (item?._id) {
          const body = await apiRequest(`/cart/items/${item._id}`, {
            method: "DELETE",
          });
          updateCartStateFromBackend(body.data);
        }
      } catch (err) {
        console.error("Backend removeFromCart error:", err);
      }
    } else {
      setCart((prevCart) => (prevCart || []).filter((item) => item && item.product && item.product.id !== productId));
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    if (user) {
      try {
        const item = cart.find((i) => i.product.id === productId);
        if (item?._id) {
          const body = await apiRequest(`/cart/items/${item._id}`, {
            method: "PATCH",
            body: JSON.stringify({ quantity }),
          });
          updateCartStateFromBackend(body.data);
        }
      } catch (err) {
        console.error("Backend updateQuantity error:", err);
      }
    } else {
      setCart((prevCart) =>
        (prevCart || []).map((item) =>
          item && item.product && item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = async () => {
    if (user) {
      try {
        const body = await apiRequest("/cart", { method: "DELETE" });
        updateCartStateFromBackend(body.data);
      } catch (err) {
        console.error("Backend clearCart error:", err);
      }
    } else {
      setCart([]);
      setCouponCode("");
      setCouponDiscount(0);
    }
  };

  const toggleWishlist = async (productId: string) => {
    if (user) {
      try {
        const body = await apiRequest("/wishlist/toggle", {
          method: "POST",
          body: JSON.stringify({ productId }),
        });
        if (body.data?.productIds) {
          setWishlist(body.data.productIds);
        }
      } catch (err) {
        console.error("Backend toggleWishlist error:", err);
      }
    } else {
      setWishlist((prevWishlist) =>
        prevWishlist.includes(productId)
          ? prevWishlist.filter((id) => id !== productId)
          : [...prevWishlist, productId]
      );
    }
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const applyCoupon = async (code: string): Promise<boolean> => {
    const formattedCode = code.toUpperCase().trim();
    if (user) {
      try {
        const body = await apiRequest("/cart/coupon", {
          method: "POST",
          body: JSON.stringify({ code: formattedCode }),
        });
        updateCartStateFromBackend(body.data);
        return true;
      } catch (err) {
        console.warn("Backend coupon application failed:", err);
        return false;
      }
    } else {
      // Guest local coupon logic
      if (formattedCode === "ISHOP10") {
        setCouponCode("ISHOP10");
        return true;
      } else if (formattedCode === "APPLE20") {
        setCouponCode("APPLE20");
        return true;
      }
      return false;
    }
  };

  const cartCount = cart.reduce((total, item) => total + (item?.product ? item.quantity : 0), 0);
  const cartSubtotal = cart.reduce((total, item) => total + (item?.product?.price ? item.product.price * item.quantity : 0), 0);
  
  // Dynamic totals for guests, sync-calculated values are loaded directly from backend for users
  const shippingCost = cartSubtotal >= shippingThreshold || cartSubtotal === 0 ? 0 : 45;

  const localDiscount = !user
    ? (couponCode === "ISHOP10" ? cartSubtotal * 0.1 : couponCode === "APPLE20" ? cartSubtotal * 0.2 : 0)
    : couponDiscount;

  const cartTotal = user
    ? Math.max(0, cartSubtotal + shippingCost - localDiscount)
    : Math.max(0, cartSubtotal + shippingCost - localDiscount);

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        cartCount,
        cartSubtotal,
        shippingCost,
        couponDiscount: localDiscount,
        couponCode,
        applyCoupon,
        cartTotal,
        syncCartWithBackend,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
