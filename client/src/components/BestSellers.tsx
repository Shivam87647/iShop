"use client";

import React, { useState, useEffect, useRef } from "react";
import { ProductCard } from "./ProductCard";
import { products } from "@/data/products";
import gsap from "gsap";

export const BestSellers: React.FC = () => {
  const categories = [
    { label: "All", value: "all" },
    { label: "Mac", value: "mac" },
    { label: "iPhone", value: "iphone" },
    { label: "iPad", value: "ipad" },
    { label: "Watch", value: "watch" },
    { label: "Accessories", value: "accessories" }
  ];

  const [activeCategory, setActiveCategory] = useState("all");
  const [visibleCount, setVisibleCount] = useState(8);
  const gridRef = useRef<HTMLDivElement>(null);

  // Filter products based on category
  const filteredProducts = activeCategory === "all" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const displayedProducts = filteredProducts.slice(0, visibleCount);

  // GSAP animation when category changes
  useEffect(() => {
    if (gridRef.current) {
      const cards = gridRef.current.querySelectorAll(".group");
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 15, scale: 0.98 },
          { 
            opacity: 1, 
            y: 0, 
            scale: 1, 
            duration: 0.5, 
            stagger: 0.08, 
            ease: "power2.out" 
          }
        );
      }
    }
  }, [activeCategory, visibleCount]);

  const handleCategoryChange = (val: string) => {
    setActiveCategory(val);
    setVisibleCount(8); // Reset count on tab change
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 4);
  };

  return (
    <section className="w-full bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="font-extrabold text-2xl sm:text-3xl text-dark tracking-wide uppercase">
            BEST SELLER
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto mt-3 rounded-full"></div>
        </div>

        {/* Categories Tab Selector */}
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-6 mb-10 text-xs sm:text-sm font-semibold">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategoryChange(cat.value)}
              className={`px-4 py-2.5 rounded transition-all duration-300 cursor-pointer ${
                activeCategory === cat.value
                  ? "bg-primary text-white shadow-sm"
                  : "text-dark hover:text-primary hover:bg-[#F6F7F8]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div 
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {displayedProducts.map((product) => (
            <div key={product.id}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {visibleCount < filteredProducts.length && (
          <div className="text-center mt-12">
            <button
              onClick={handleLoadMore}
              className="inline-block border-b-2 border-primary text-primary hover:text-primary-hover font-bold text-xs tracking-widest pb-1 transition-all duration-300 hover:tracking-[0.15em] active:scale-95 cursor-pointer"
            >
              LOAD MORE
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
