"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  User, 
  Menu, 
  X, 
  ChevronDown,
  Trash2,
  Settings
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import gsap from "gsap";

const NavbarContent: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, cartCount, cartSubtotal, removeFromCart, wishlist } = useCart();
  const { user, openAuthModal, logout } = useAuth();

  const currentCategory = searchParams.get("category");
  const currentWishlist = searchParams.get("wishlist") === "true";

  const checkActive = (linkHref: string) => {
    if (linkHref === "/") {
      return pathname === "/";
    }
    
    if (linkHref.includes("category=")) {
      // Create a dummy URL to parse search parameters
      const url = new URL(linkHref, "http://localhost");
      const linkCategory = url.searchParams.get("category");
      return pathname === "/store" && currentCategory === linkCategory;
    }
    
    if (linkHref === "/store") {
      return pathname === "/store" && !currentCategory && !currentWishlist;
    }
    
    return pathname === linkHref;
  };
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartDropdownOpen, setIsCartDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [announcement, setAnnouncement] = useState<string | null>(null);

  useEffect(() => {
    const enabled = localStorage.getItem("site_alert_banner_enabled");
    const text = localStorage.getItem("site_alert_banner_text");
    if (enabled === "true" || (enabled !== "false" && text)) {
      setAnnouncement(text || "Extra 20% off on all MacBook models this week! Code: MAC20");
    } else {
      setAnnouncement(null);
    }
  }, []);
  
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const cartDropdownRef = useRef<HTMLDivElement>(null);
  const cartIconRef = useRef<HTMLDivElement>(null);

  // Animate cart count on change
  useEffect(() => {
    if (cartIconRef.current && cartCount > 0) {
      gsap.fromTo(
        cartIconRef.current,
        { scale: 0.8, rotate: -10 },
        { scale: 1, rotate: 0, duration: 0.4, ease: "back.out(1.7)" }
      );
    }
  }, [cartCount]);

  // Handle Mobile Menu GSAP transition
  useEffect(() => {
    if (mobileMenuRef.current) {
      if (isMobileMenuOpen) {
        gsap.to(mobileMenuRef.current, {
          x: 0,
          duration: 0.4,
          ease: "power3.out",
        });
      } else {
        gsap.to(mobileMenuRef.current, {
          x: "100%",
          duration: 0.3,
          ease: "power3.in",
        });
      }
    }
  }, [isMobileMenuOpen]);

  // Handle Search Bar GSAP transition
  useEffect(() => {
    if (searchBarRef.current) {
      if (isSearchOpen) {
        gsap.fromTo(
          searchBarRef.current,
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
        );
      }
    }
  }, [isSearchOpen]);

  // Close dropdowns on path change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsCartDropdownOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "HOME", href: "/" },
    { name: "STORE", href: "/store" },
    { name: "IPHONE", href: "/store?category=iphone" },
    { name: "IPAD", href: "/store?category=ipad" },
    { name: "MACBOOK", href: "/store?category=mac" },
    { name: "ACCESSORIES", href: "/store?category=accessories" },
  ];

  return (
    <header className="w-full bg-white border-b border-border-gray sticky top-0 z-50">
      {announcement && (
        <div className="w-full bg-primary py-2 text-center text-white text-[10px] font-extrabold tracking-wider uppercase px-4 flex items-center justify-center space-x-2 select-none relative z-55">
          <span>{announcement}</span>
        </div>
      )}
      {/* Top utility bar - Desktop only */}
      <div className="hidden md:block w-full border-b border-border-gray bg-white py-2 text-xs text-[#262626]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 flex justify-between items-center">
          {/* Left: Language & Currency */}
          <div className="flex items-center space-x-6">
            <button className="flex items-center space-x-1 hover:text-primary transition-colors cursor-pointer">
              <span>EN</span>
              <ChevronDown size={12} />
            </button>
            <button className="flex items-center space-x-1 hover:text-primary transition-colors cursor-pointer">
              <span>USD</span>
              <ChevronDown size={12} />
            </button>
          </div>

          {/* Right: Profile, Wishlist, Cart Summary, Login */}
          <div className="flex items-center space-x-6 font-medium">
            {user ? (
              <>
                <Link href="/profile" className="flex items-center space-x-1 hover:text-primary transition-colors">
                  <User size={14} />
                  <span className="max-w-[80px] truncate">{user.name.split(" ")[0]}</span>
                </Link>
                {user.role === "admin" && (
                  <Link href="/profile/admin-controls" className="flex items-center space-x-1 hover:text-primary transition-colors font-semibold text-accent">
                    <Settings size={14} />
                    <span>Controls</span>
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => openAuthModal("login")}
                  className="flex items-center space-x-1 hover:text-primary transition-colors cursor-pointer bg-transparent border-none text-inherit font-medium"
                >
                  <User size={14} />
                  <span>My Profile</span>
                </button>
                <button
                  onClick={() => openAuthModal("login")}
                  className="hover:text-primary transition-colors cursor-pointer bg-transparent border-none text-inherit font-medium"
                >
                  Sign In
                </button>
              </>
            )}
            <Link href="/store?wishlist=true" className="flex items-center space-x-1 hover:text-primary transition-colors relative">
              <Heart size={14} className={wishlist.length > 0 ? "fill-accent text-accent" : ""} />
              <span>Wishlist</span>
              {wishlist.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link href="/cart" className="flex items-center space-x-1 hover:text-primary transition-colors">
              <ShoppingBag size={14} />
              <span>{cartCount} Items</span>
              <span className="text-text-gray font-normal ml-1">${cartSubtotal.toFixed(2)}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header navigation */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-5 flex justify-between items-center relative">
        {/* Left: Mobile hamburger */}
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden p-1 text-dark hover:text-primary transition-colors"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>

        {/* Center/Left: Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-extrabold text-2xl tracking-tight text-primary">iShop</span>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex space-x-8 lg:space-x-12">
          {navLinks.map((link) => {
            const isActive = checkActive(link.href);
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={`text-sm font-semibold tracking-wider transition-colors hover:text-primary py-1 border-b-2 ${
                  isActive ? "border-primary text-primary" : "border-transparent text-dark"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right: Search & Cart Icons */}
        <div className="flex items-center space-x-4 lg:space-x-6">
          {/* Search Toggle */}
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-2 text-dark hover:text-primary transition-colors cursor-pointer"
            aria-label="Toggle search bar"
          >
            <Search size={20} />
          </button>

          {/* Cart Icon Dropdown trigger */}
          <div className="relative">
            <Link 
              href="/cart"
              onMouseEnter={() => {
                if (window.innerWidth >= 768) {
                  setIsCartDropdownOpen(true);
                }
              }}
              className="p-2 text-dark hover:text-primary transition-colors cursor-pointer relative block"
              aria-label="Shopping cart"
            >
              <div ref={cartIconRef}>
                <ShoppingBag size={20} />
              </div>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Cart Hover Dropdown */}
            {isCartDropdownOpen && (
              <div 
                ref={cartDropdownRef}
                onMouseLeave={() => setIsCartDropdownOpen(false)}
                className="absolute right-0 mt-2 w-80 bg-white border border-border-gray shadow-xl rounded-lg p-4 z-50 hidden md:block"
              >
                <div className="flex justify-between items-center border-b border-border-gray pb-3 mb-3">
                  <h4 className="font-bold text-sm">Shopping Cart ({cartCount})</h4>
                  <Link href="/cart" className="text-xs text-primary font-semibold hover:underline">
                    View Cart
                  </Link>
                </div>
                
                {cart.length === 0 ? (
                  <div className="py-6 text-center text-sm text-text-gray">
                    Your cart is empty.
                  </div>
                ) : (
                  <>
                    <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                      {cart.filter((item) => item && item.product).map((item, index) => (
                        <div key={`${item.product.id || item.product._id}-${item.selectedColor || ""}-${index}`} className="flex items-center space-x-3 text-xs border-b border-border-gray/50 pb-3">
                          <img 
                            src={item.product.image} 
                            alt={item.product.name} 
                            loading="lazy"
                            decoding="async"
                            className="w-12 h-12 object-cover rounded bg-light-gray"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold truncate text-dark">{item.product.name}</h5>
                            <p className="text-text-gray mt-0.5">
                              Qty: {item.quantity} {item.selectedColor && `| Color: ${item.selectedColor}`}
                            </p>
                            <p className="text-primary font-bold mt-1">
                              ${((item.product.price || 0) * item.quantity).toFixed(2)}
                            </p>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.product.id || item.product._id || "")}
                            className="text-text-gray hover:text-accent p-1 transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-border-gray pt-3 mt-3">
                      <div className="flex justify-between text-sm mb-4">
                        <span className="text-text-gray">Subtotal:</span>
                        <span className="font-bold text-dark">${cartSubtotal.toFixed(2)}</span>
                      </div>
                      <Link 
                        href="/cart" 
                        className="block w-full bg-primary hover:bg-primary-hover text-white text-center py-2.5 rounded font-semibold text-xs tracking-wider transition-colors"
                      >
                        CHECKOUT
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Search bar absolute dropdown */}
        {isSearchOpen && (
          <div 
            ref={searchBarRef}
            className="absolute left-0 right-0 top-full bg-white border-b border-border-gray py-4 px-4 shadow-md z-40"
          >
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  router.push(`/store?search=${encodeURIComponent(searchQuery)}`);
                  setIsSearchOpen(false);
                }
              }}
              className="max-w-3xl mx-auto flex items-center space-x-3"
            >
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-light-gray border border-border-gray rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
                autoFocus
              />
              <button 
                type="submit" 
                className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-md text-sm font-semibold transition-colors"
              >
                Search
              </button>
              <button 
                type="button" 
                onClick={() => setIsSearchOpen(false)}
                className="p-2 text-text-gray hover:text-dark transition-colors"
              >
                <X size={20} />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Drawer Navigation overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        {/* Mobile Navigation Drawer */}
        <div 
          ref={mobileMenuRef}
          className="w-4/5 max-w-sm h-full bg-white p-6 shadow-2xl flex flex-col justify-between transform translate-x-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div>
            <div className="flex justify-between items-center border-b border-border-gray pb-4 mb-6">
              <span className="font-extrabold text-xl tracking-tight text-primary">iShop</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 text-dark hover:text-primary transition-colors"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => {
                const isActive = checkActive(link.href);
                return (
                  <Link 
                    key={link.name} 
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-base font-bold transition-colors py-2 ${
                      isActive ? "text-primary font-extrabold" : "text-dark hover:text-primary"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-border-gray pt-6 space-y-4 text-sm">
            {user ? (
              <>
                <Link 
                  href="/profile" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-2 font-semibold text-dark hover:text-primary transition-colors"
                >
                  <User size={18} />
                  <span>My Profile ({user.name.split(" ")[0]})</span>
                </Link>
                {user.role === "admin" && (
                  <Link 
                    href="/profile/admin-controls" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-2 font-semibold text-accent hover:text-accent/80 transition-colors"
                  >
                    <Settings size={18} />
                    <span>Admin Controls</span>
                  </Link>
                )}
                <button 
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 font-semibold text-red-600 hover:text-red-700 transition-colors w-full text-left bg-transparent border-none cursor-pointer p-0"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openAuthModal("login");
                  }}
                  className="flex items-center space-x-2 font-semibold text-dark hover:text-primary transition-colors w-full text-left bg-transparent border-none cursor-pointer p-0"
                >
                  <User size={18} />
                  <span>My Profile / Sign In</span>
                </button>
              </>
            )}
            <Link 
              href="/cart" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex justify-between items-center font-semibold"
            >
              <span className="flex items-center space-x-2">
                <ShoppingBag size={18} />
                <span>My Cart ({cartCount})</span>
              </span>
              <span className="text-primary">${cartSubtotal.toFixed(2)}</span>
            </Link>
            <Link 
              href="/store?wishlist=true" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-2 font-semibold"
            >
              <Heart size={18} className={wishlist.length > 0 ? "fill-accent text-accent" : ""} />
              <span>Wishlist ({wishlist.length})</span>
            </Link>
            <div className="flex justify-between text-xs text-text-gray pt-4 border-t border-border-gray/50">
              <button className="hover:text-primary transition-colors">Language: EN</button>
              <button className="hover:text-primary transition-colors">Currency: USD</button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export const Navbar: React.FC = () => {
  return (
    <Suspense fallback={
      <header className="w-full bg-white border-b border-border-gray sticky top-0 z-50 h-[73px] flex items-center">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 flex justify-between items-center w-full">
          <span className="font-extrabold text-2xl tracking-tight text-primary">iShop</span>
          <div className="w-20 h-6 bg-light-gray animate-pulse rounded"></div>
        </div>
      </header>
    }>
      <NavbarContent />
    </Suspense>
  );
};
