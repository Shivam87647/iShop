"use client";

import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { products } from "@/data/products";
import { Filter, SlidersHorizontal, RotateCcw } from "lucide-react";
import gsap from "gsap";

interface FilterSidebarProps {
  searchFilter: string;
  setSearchFilter: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  minPrice: number;
  setMinPrice: (value: number) => void;
  priceRange: number;
  setPriceRange: (value: number) => void;
  selectedColor: string;
  setSelectedColor: (value: string) => void;
  wishlistOnly: boolean;
  setWishlistOnly: (value: boolean) => void;
  handleResetFilters: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  searchFilter,
  setSearchFilter,
  categoryFilter,
  setCategoryFilter,
  minPrice,
  setMinPrice,
  priceRange,
  setPriceRange,
  selectedColor,
  setSelectedColor,
  wishlistOnly,
  setWishlistOnly,
  handleResetFilters,
}) => {
  // Categories list
  const categories = [
    { label: "All Categories", value: "all" },
    { label: "MacBook", value: "mac" },
    { label: "iPhone", value: "iphone" },
    { label: "iPad", value: "ipad" },
    { label: "Apple Watch", value: "watch" },
    { label: "Accessories", value: "accessories" }
  ];

  // Distinct colors list from mock products database
  const colors = [
    { name: "all", hex: "#E5E7EB", isAll: true },
    { name: "Space Gray", hex: "#5E6266" },
    { name: "Silver", hex: "#E3E4E5" },
    { name: "Space Black", hex: "#1C1D21" },
    { name: "Titanium Blue", hex: "#2F4452" },
    { name: "Gold / Starlight", hex: "#F0E4D3" },
    { name: "Blue", hex: "#D4E1EC" },
    { name: "Pink", hex: "#FCE1E4" },
    { name: "White", hex: "#FFFFFF" }
  ];

  return (
    <div className="space-y-8 font-semibold text-xs text-[#22262a]">
      {/* Wishlist only option toggle */}
      <div className="space-y-3">
        <h4 className="font-bold text-sm tracking-wider text-dark uppercase border-b border-border-gray pb-3">
          Wishlist Only
        </h4>
        <label className="flex items-center space-x-3 cursor-pointer select-none text-xs font-semibold py-1">
          <input 
            type="checkbox" 
            checked={wishlistOnly}
            onChange={(e) => setWishlistOnly(e.target.checked)}
            className="w-4 h-4 rounded border-border-gray text-primary focus:ring-primary cursor-pointer"
          />
          <span className={wishlistOnly ? "text-primary font-bold" : "text-text-gray font-normal"}>
            Show Saved Products
          </span>
        </label>
      </div>

      {/* Reset all filters */}
      <button
        onClick={handleResetFilters}
        className="w-full border border-border-gray hover:border-primary text-text-gray hover:text-primary py-3.5 rounded font-bold text-xs tracking-wider transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
      >
        <RotateCcw size={13} />
        <span>RESET FILTERS</span>
      </button>

      {/* Search sidebar filter */}
      <div className="space-y-3">
        <h4 className="font-bold text-sm tracking-wider text-dark uppercase border-b border-border-gray pb-3">
          Search Products
        </h4>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full bg-light-gray border border-border-gray rounded-md px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
          />
        </div>
      </div>

      {/* Category selector list */}
      <div className="space-y-3">
        <h4 className="font-bold text-sm tracking-wider text-dark uppercase border-b border-border-gray pb-3">
          Categories
        </h4>
        <div className="space-y-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(cat.value)}
              className={`w-full text-left py-1.5 transition-colors cursor-pointer flex justify-between items-center ${
                categoryFilter === cat.value ? "text-primary font-bold" : "text-text-gray hover:text-primary font-normal"
              }`}
            >
              <span>{cat.label}</span>
              <span className="text-[10px] text-text-gray/60 font-semibold bg-light-gray px-2 py-0.5 rounded-full">
                {cat.value === "all" 
                  ? products.length 
                  : products.filter(p => p.category === cat.value).length
                }
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Price filter range slider */}
      <div className="space-y-3">
        <h4 className="font-bold text-sm tracking-wider text-dark uppercase border-b border-border-gray pb-3">
          Price Range
        </h4>
        <div className="pt-2 space-y-4">
          <input 
            type="range" 
            min="0" 
            max="2000" 
            step="10"
            value={priceRange} 
            onChange={(e) => setPriceRange(Number(e.target.value))}
            className="w-full h-1 bg-border-gray rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between items-center text-text-gray text-[10px] font-semibold">
            <span>Min: $0.00</span>
            <span className="font-bold text-primary bg-primary/10 px-2 py-1 rounded text-xs">
              Max: ${priceRange.toFixed(2)}
            </span>
          </div>
          
          {/* Custom price inputs */}
          <div className="flex items-center space-x-2 pt-1">
            <div className="relative flex-1">
              <span className="absolute left-2 top-2.5 text-text-gray/70 text-[10px] font-bold">$</span>
              <input 
                type="number"
                placeholder="Min"
                value={minPrice === 0 ? "" : minPrice}
                onChange={(e) => {
                  const val = e.target.value === "" ? 0 : Number(e.target.value);
                  setMinPrice(val);
                }}
                onWheel={(e) => e.currentTarget.blur()}
                onFocus={(e) => e.target.select()}
                className="w-full bg-light-gray border border-border-gray rounded pl-4 pr-1.5 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                min="0"
              />
            </div>
            <span className="text-text-gray font-bold text-xs">-</span>
            <div className="relative flex-1">
              <span className="absolute left-2 top-2.5 text-text-gray/70 text-[10px] font-bold">$</span>
              <input 
                type="number"
                placeholder="Max"
                value={priceRange === 0 ? "" : priceRange}
                onChange={(e) => {
                  const val = e.target.value === "" ? 0 : Number(e.target.value);
                  setPriceRange(val);
                }}
                onWheel={(e) => e.currentTarget.blur()}
                onFocus={(e) => e.target.select()}
                className="w-full bg-light-gray border border-border-gray rounded pl-4 pr-1.5 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                min="0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Color picker filter */}
      <div className="space-y-3">
        <h4 className="font-bold text-sm tracking-wider text-dark uppercase border-b border-border-gray pb-3">
          Color Filter
        </h4>
        <div className="flex flex-wrap gap-2.5 pt-1">
          {colors.map((color) => (
            <button
              key={color.name}
              onClick={() => setSelectedColor(color.name)}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer shadow-sm ${
                selectedColor === color.name 
                  ? "border-primary scale-110" 
                  : "border-transparent hover:scale-105"
              }`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
              aria-label={`Filter by color ${color.name}`}
            >
              {color.isAll && selectedColor === "all" && (
                <span className="text-[9px] font-bold text-dark uppercase leading-none">All</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

function StoreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { wishlist } = useCart();
  
  // URL Params initialization
  const initialCategory = searchParams.get("category") || "all";
  const initialSearch = searchParams.get("search") || "";
  const initialWishlistOnly = searchParams.get("wishlist") === "true";

  // State Management
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [searchFilter, setSearchFilter] = useState(initialSearch);
  const [wishlistOnly, setWishlistOnly] = useState(initialWishlistOnly);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [priceRange, setPriceRange] = useState<number>(2000);
  const [selectedColor, setSelectedColor] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("default");

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  // Keep track of the last URL parameters we synced, to prevent local state changes from being overwritten
  const prevParamsRef = useRef({
    category: initialCategory,
    search: initialSearch,
    wishlist: initialWishlistOnly,
  });

  // Sync category, search and wishlist query parameters when they change in URL
  useEffect(() => {
    const currentCategory = searchParams.get("category") || "all";
    const currentSearch = searchParams.get("search") || "";
    const currentWishlist = searchParams.get("wishlist") === "true";

    // Only update state if the URL parameters actually changed from what we last saw
    if (
      currentCategory !== prevParamsRef.current.category ||
      currentSearch !== prevParamsRef.current.search ||
      currentWishlist !== prevParamsRef.current.wishlist
    ) {
      setCategoryFilter(currentCategory);
      setSearchFilter(currentSearch);
      setWishlistOnly(currentWishlist);

      // Keep our record of URL parameters in sync
      prevParamsRef.current = {
        category: currentCategory,
        search: currentSearch,
        wishlist: currentWishlist,
      };
    }
  }, [searchParams]);

  // Filtering products logic
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category Filter
      if (categoryFilter !== "all" && product.category !== categoryFilter) {
        return false;
      }

      // Search Filter
      if (searchFilter && !product.name.toLowerCase().includes(searchFilter.toLowerCase())) {
        return false;
      }

      // Wishlist Only Filter
      if (wishlistOnly && !wishlist.includes(product.id)) {
        return false;
      }

      // Price Filter (Min and Max)
      if (product.price < minPrice || product.price > priceRange) {
        return false;
      }

      // Color Filter
      if (selectedColor !== "all") {
        const hasColor = product.colors?.some((c) => c.name.toLowerCase().includes(selectedColor.toLowerCase()) || selectedColor.toLowerCase().includes(c.name.toLowerCase()));
        if (!hasColor) return false;
      }

      return true;
    });
  }, [categoryFilter, searchFilter, wishlistOnly, wishlist, minPrice, priceRange, selectedColor]);

  // Sorting products logic
  const sortedProducts = useMemo(() => {
    const items = [...filteredProducts];
    if (sortBy === "price-low") {
      return items.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      return items.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      return items.sort((a, b) => b.rating - a.rating);
    }
    return items; // Default (mock ordering)
  }, [filteredProducts, sortBy]);

  // Stagger GSAP animations on filter outcomes
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
            duration: 0.45, 
            stagger: 0.05, 
            ease: "power2.out" 
          }
        );
      }
    }
  }, [categoryFilter, searchFilter, wishlistOnly, minPrice, priceRange, selectedColor, sortBy]);

  const handleResetFilters = () => {
    setCategoryFilter("all");
    setSearchFilter("");
    setWishlistOnly(false);
    setMinPrice(0);
    setPriceRange(2000);
    setSelectedColor("all");
    setSortBy("default");
    
    // Clear URL parameters
    router.push("/store");
  };

  return (
    <>
      {/* Breadcrumb path */}
      <div className="w-full bg-light-gray py-6 border-b border-border-gray">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <nav className="flex space-x-2 text-xs font-semibold text-text-gray uppercase tracking-wider">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <span className="text-dark">Store</span>
          </nav>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 lg:px-8 py-12 w-full">
        {/* Upper sorting actions & mobile filters toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-border-gray pb-6 mb-8 text-xs font-semibold">
          <h1 className="font-extrabold text-xl sm:text-2xl text-dark tracking-wide uppercase">
            {wishlistOnly ? "My Wishlist" : categoryFilter === "all" ? "All Products" : categoryFilter} ({sortedProducts.length})
          </h1>
          
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            {/* Mobile Filters button toggle */}
            <button 
              onClick={() => setIsMobileFiltersOpen(true)}
              className="lg:hidden flex items-center space-x-1.5 border border-border-gray px-4 py-2.5 rounded text-dark hover:bg-light-gray transition-colors w-full sm:w-auto justify-center cursor-pointer"
            >
              <SlidersHorizontal size={14} />
              <span>Filters</span>
            </button>

            {/* Sorting dropdown */}
            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <span className="text-text-gray hidden sm:inline whitespace-nowrap">Sort By:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-border-gray rounded px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-auto"
              >
                <option value="default">Default Ordering</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Rating: Highest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Store main layout grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Desktop Filter Sidebar column */}
          <aside className="hidden lg:block lg:col-span-1">
            <FilterSidebar 
              searchFilter={searchFilter}
              setSearchFilter={setSearchFilter}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              wishlistOnly={wishlistOnly}
              setWishlistOnly={setWishlistOnly}
              handleResetFilters={handleResetFilters}
            />
          </aside>

          {/* Products Grid column */}
          <div className="lg:col-span-3">
            {sortedProducts.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-border-gray rounded-lg">
                <Filter size={32} className="text-text-gray mx-auto mb-4" />
                <h3 className="font-bold text-base text-dark mb-1">No products found</h3>
                <p className="text-xs text-text-gray max-w-xs mx-auto mb-6">
                  We couldn't find any products matching your current filters. Try resetting them!
                </p>
                <button 
                  onClick={handleResetFilters}
                  className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded text-xs font-bold transition-colors cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div 
                ref={gridRef}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
              >
                {sortedProducts.map((product) => (
                  <div key={product.id}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile filter slide-up drawer details */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center lg:hidden">
          <div className="bg-white rounded-t-2xl shadow-2xl w-full max-h-[85vh] overflow-y-auto p-6 relative">
            <button 
              onClick={() => setIsMobileFiltersOpen(false)}
              className="absolute top-4 right-4 text-text-gray hover:text-dark p-1.5 transition-colors cursor-pointer font-bold text-xs"
            >
              Done
            </button>
            <h3 className="font-bold text-sm tracking-wide text-dark uppercase mb-6 flex items-center space-x-2">
              <SlidersHorizontal size={14} />
              <span>Filter Products</span>
            </h3>
            
            <FilterSidebar 
              searchFilter={searchFilter}
              setSearchFilter={setSearchFilter}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              wishlistOnly={wishlistOnly}
              setWishlistOnly={setWishlistOnly}
              handleResetFilters={handleResetFilters}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default function StorePage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center py-20 text-sm font-semibold text-text-gray">
          Loading store contents...
        </div>
      }>
        <StoreContent />
      </Suspense>
      <Footer />
    </>
  );
}
