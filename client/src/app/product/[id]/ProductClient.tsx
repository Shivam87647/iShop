"use client";

import React, { useState, useEffect, useRef } from "react";
import { Star, Heart, ShoppingBag, Check } from "lucide-react";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { ProductCard } from "@/components/ProductCard";
import gsap from "gsap";

interface ProductClientProps {
  product: Product;
  relatedProducts: Product[];
}

export const ProductClient: React.FC<ProductClientProps> = ({ product, relatedProducts }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || "");
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);

  const isFav = isInWishlist(product.id);
  const imageRef = useRef<HTMLImageElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  // GSAP animations on page load
  useEffect(() => {
    if (imageRef.current && detailsRef.current) {
      gsap.fromTo(
        imageRef.current,
        { opacity: 0, x: -30, scale: 0.95 },
        { opacity: 1, x: 0, scale: 1, duration: 0.7, ease: "power3.out" }
      );

      gsap.fromTo(
        detailsRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, [product.id]);

  const handleAddToCart = () => {
    addToCart(product.id, quantity, selectedColor);
    setAddedToast(true);
    setTimeout(() => {
      setAddedToast(false);
    }, 3000);
  };

  return (
    <div className="space-y-16">
      {/* Toast Alert */}
      {addedToast && (
        <div className="fixed bottom-5 right-5 bg-green-600 text-white px-5 py-3 rounded-lg shadow-2xl z-50 flex items-center space-x-3 text-xs font-bold animate-[slideIn_0.3s_ease-out_forwards]">
          <Check size={16} />
          <span>Added {quantity}x {product.name} ({selectedColor}) to your cart!</span>
        </div>
      )}

      {/* Main product columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        
        {/* Left Column: Product Image Gallery */}
        <div className="w-full bg-[#F6F7F8] rounded-xl overflow-hidden p-8 flex items-center justify-center border border-border-gray/30">
          <div className="relative w-full aspect-square max-w-[450px]">
            <img 
              ref={imageRef}
              src={product.image} 
              alt={product.name} 
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="w-full h-full object-cover rounded-lg shadow-md"
            />
          </div>
        </div>

        {/* Right Column: Details & Selection controls */}
        <div ref={detailsRef} className="space-y-6 text-sm font-semibold">
          
          {/* Header */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold tracking-wider uppercase text-primary bg-primary/10 px-2.5 py-1 rounded">
                {product.category}
              </span>
              <span className="text-xs text-green-600 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span>
                <span>In Stock</span>
              </span>
            </div>
            <h1 className="font-extrabold text-2xl sm:text-3xl text-dark leading-tight">
              {product.name}
            </h1>
            
            {/* Rating Stars */}
            <div className="flex items-center space-x-1.5 py-1">
              <div className="flex items-center space-x-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={14} 
                    className={i < product.rating ? "fill-[#FFC72C] text-[#FFC72C]" : "text-[#D1D5DB]"}
                  />
                ))}
              </div>
              <span className="text-xs text-text-gray font-normal">(18 verified reviews)</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-center space-x-3.5 border-y border-border-gray/50 py-4">
            <span className="text-2xl font-extrabold text-primary">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <>
                <span className="text-base text-text-gray font-normal line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
                <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded">
                  SAVE ${(product.originalPrice - product.price).toFixed(0)}
                </span>
              </>
            )}
          </div>

          {/* Short Description */}
          <p className="text-xs text-text-gray leading-relaxed font-normal">
            {product.description}
          </p>

          {/* Selector controls: Color picker */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-dark tracking-wide uppercase">
                Select Color: <span className="text-primary normal-case font-semibold ml-1">{selectedColor}</span>
              </h4>
              <div className="flex space-x-3">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center shadow-sm hover:scale-105 ${
                      selectedColor === color.name 
                        ? "border-primary scale-110" 
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    aria-label={`Select color ${color.name}`}
                  >
                    {selectedColor === color.name && (
                      <Check 
                        size={12} 
                        className={color.hex === "#FFFFFF" ? "text-dark" : "text-white"} 
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selector controls: Quantity picker */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center pt-4 border-t border-border-gray/30">
            <div className="flex items-center border border-border-gray rounded-md bg-light-gray overflow-hidden">
              <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="px-4 py-3 hover:bg-white text-dark transition-colors cursor-pointer"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="px-6 py-2.5 font-bold text-dark text-center select-none w-14 bg-white">
                {quantity}
              </span>
              <button 
                onClick={() => setQuantity(q => q + 1)}
                className="px-4 py-3 hover:bg-white text-dark transition-colors cursor-pointer"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex-1 flex gap-3">
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-primary hover:bg-primary-hover text-white py-3.5 px-6 rounded font-bold text-xs tracking-wider transition-colors flex items-center justify-center space-x-2 shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
              >
                <ShoppingBag size={14} />
                <span>ADD TO CART</span>
              </button>

              <button 
                onClick={() => toggleWishlist(product.id)}
                className={`p-3.5 border rounded transition-all shadow-sm active:scale-95 cursor-pointer ${
                  isFav 
                    ? "bg-accent text-white border-accent" 
                    : "border-border-gray text-dark hover:bg-light-gray"
                }`}
                aria-label="Add to Wishlist"
              >
                <Heart size={14} className={isFav ? "fill-white" : ""} />
              </button>
            </div>
          </div>

          {/* Specifications List */}
          {product.specs && product.specs.length > 0 && (
            <div className="pt-6 border-t border-border-gray/30 space-y-3 font-normal text-xs text-text-gray">
              <h4 className="text-xs font-bold text-dark uppercase tracking-wide">
                Product Specifications
              </h4>
              <div className="bg-light-gray rounded-lg p-4 space-y-2 border border-border-gray/30">
                {product.specs.map((spec) => (
                  <div key={spec.label} className="grid grid-cols-3 gap-2">
                    <span className="font-bold text-dark">{spec.label}:</span>
                    <span className="col-span-2 text-[#22262a]/95">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-border-gray/35">
          <h2 className="font-extrabold text-xl sm:text-2xl text-dark tracking-wide uppercase mb-8 text-center sm:text-left">
            RELATED PRODUCTS
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <div key={p.id}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
