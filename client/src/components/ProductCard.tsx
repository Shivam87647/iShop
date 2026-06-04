"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { Heart, ShoppingCart, Star, Eye } from "lucide-react";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import gsap from "gsap";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const isFav = isInWishlist(product.id);

  const handleMouseEnter = () => {
    if (imageRef.current) {
      gsap.to(imageRef.current, { scale: 1.08, duration: 0.4, ease: "power2.out" });
    }
    if (overlayRef.current) {
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.3, ease: "power2.out" });
    }
  };

  const handleMouseLeave = () => {
    if (imageRef.current) {
      gsap.to(imageRef.current, { scale: 1, duration: 0.4, ease: "power2.out" });
    }
    if (overlayRef.current) {
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, ease: "power2.out" });
    }
  };

  return (
    <div 
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group bg-white border border-[#F6F7F8] rounded-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between relative h-full"
    >
      {/* Badge (HOT, NEW, SALE) */}
      {product.badge && (
        <span className={`absolute top-3 left-3 z-10 text-[10px] font-bold px-2.5 py-0.5 rounded tracking-wider uppercase text-white shadow-sm ${
          product.badge === "HOT" ? "bg-[#FF4858]" : 
          product.badge === "NEW" ? "bg-[#33A0FF]" : "bg-[#FFC72C]"
        }`}>
          {product.badge}
        </span>
      )}

      {/* Product Image and Overlay */}
      <div className="w-full pt-[100%] bg-light-gray relative overflow-hidden flex items-center justify-center">
        <img 
          ref={imageRef}
          src={product.image} 
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover select-none"
        />

        {/* Hover Action Overlay */}
        <div 
          ref={overlayRef}
          className="absolute inset-0 bg-white/80 opacity-0 flex items-center justify-center space-x-3 z-20"
        >
          {/* Add to Wishlist */}
          <button 
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product.id);
              gsap.fromTo(e.currentTarget, { scale: 0.8 }, { scale: 1, duration: 0.3, ease: "back.out(2)" });
            }}
            className={`p-3 rounded-full shadow-md transition-colors cursor-pointer ${
              isFav ? "bg-accent text-white" : "bg-white text-dark hover:bg-primary hover:text-white"
            }`}
            aria-label="Add to Wishlist"
          >
            <Heart size={16} className={isFav ? "fill-white" : ""} />
          </button>

          {/* Quick Add to Cart */}
          <button 
            onClick={(e) => {
              e.preventDefault();
              addToCart(product.id, 1);
              // Trigger pop animation on the clicked button
              gsap.fromTo(e.currentTarget, { scale: 0.8 }, { scale: 1, duration: 0.3, ease: "back.out(2)" });
            }}
            className="p-3 bg-white text-dark rounded-full shadow-md hover:bg-primary hover:text-white transition-colors cursor-pointer"
            aria-label="Add to Cart"
          >
            <ShoppingCart size={16} />
          </button>

          {/* View Details */}
          <Link 
            href={`/product/${product.id}`}
            className="p-3 bg-white text-dark rounded-full shadow-md hover:bg-primary hover:text-white transition-colors cursor-pointer"
            aria-label="View Details"
          >
            <Eye size={16} />
          </Link>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 flex-1 flex flex-col justify-between text-center mt-2">
        <div>
          {/* Product Title */}
          <Link href={`/product/${product.id}`} className="block">
            <h4 className="font-bold text-sm text-[#22262a] hover:text-primary transition-colors line-clamp-1">
              {product.name}
            </h4>
          </Link>

          {/* Star Rating */}
          <div className="flex justify-center items-center space-x-0.5 mt-2">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={12} 
                className={i < product.rating ? "fill-[#FFC72C] text-[#FFC72C]" : "text-[#D1D5DB]"}
              />
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="flex justify-center items-center space-x-2.5 mt-3.5">
          {product.originalPrice ? (
            <>
              <span className="font-bold text-sm text-accent">${product.price.toFixed(2)}</span>
              <span className="text-xs text-text-gray line-through">${product.originalPrice.toFixed(2)}</span>
            </>
          ) : (
            <span className="font-bold text-sm text-[#22262a]">${product.price.toFixed(2)}</span>
          )}
        </div>
      </div>
    </div>
  );
};
