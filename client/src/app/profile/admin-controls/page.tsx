"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/utils/api";
import {
  Loader,
  Plus,
  Edit,
  Trash2,
  Settings,
  Activity,
  ShoppingBag,
  Users,
  Check,
  X,
  Save,
  Package,
  Lock,
  AlertCircle,
  RefreshCw
} from "lucide-react";

export default function AdminControlsPage() {
  const { user, loading, openAuthModal } = useAuth();

  // Navigation and active view state
  const [activeTab, setActiveTab] = useState<"analytics" | "products" | "orders" | "settings">("analytics");

  // Core Data States
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  const [categories, setCategories] = useState<any[]>([]);

  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Global settings state
  const [alertEnabled, setAlertEnabled] = useState(false);
  const [alertText, setAlertText] = useState("");
  const [shippingThreshold, setShippingThreshold] = useState(500);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Product CRUD Modal / Form States
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null); // Null means "Add Mode"
  const [productError, setProductError] = useState("");
  const [productSubmitLoading, setProductSubmitLoading] = useState(false);

  // Form Fields
  const [prodName, setProdName] = useState("");
  const [prodDescription, setProdDescription] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodCompareAtPrice, setProdCompareAtPrice] = useState("");
  const [prodBadge, setProdBadge] = useState("");
  const [prodImageUrl, setProdImageUrl] = useState("");
  const [prodCategory, setProdCategory] = useState("");
  const [prodSubcategory, setProdSubcategory] = useState("");
  const [prodFeatured, setProdFeatured] = useState(false);
  const [prodTrending, setProdTrending] = useState(false);
  const [prodActive, setProdActive] = useState(true);

  // Dynamic Specs & Variants
  const [prodSpecs, setProdSpecs] = useState<{ label: string; value: string }[]>([]);
  const [prodVariants, setProdVariants] = useState<any[]>([]);

  // Confirmation Delete States
  const [confirmDeleteProductId, setConfirmDeleteProductId] = useState<string | null>(null);

  // Redirect non-admins or guests
  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      // Access restricted. Redirect handled inside layout below.
    }
  }, [user, loading]);

  // Load Settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setAlertEnabled(localStorage.getItem("site_alert_banner_enabled") === "true");
      setAlertText(localStorage.getItem("site_alert_banner_text") || "Extra 20% off on all MacBook models this week! Code: MAC20");
      setShippingThreshold(Number(localStorage.getItem("site_free_shipping_threshold") || "500"));
      setMaintenanceMode(localStorage.getItem("site_maintenance_mode") === "true");
    }
  }, []);

  // Fetch Dashboard Analytics
  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const response = await apiRequest("/admin/dashboard");
      if (response.data) {
        setAnalytics(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch admin dashboard analytics:", err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const response = await apiRequest("/categories");
      if (response.data?.categories) {
        setCategories(response.data.categories);
      }
    } catch (err) {
      console.error("Failed to fetch categories list:", err);
    }
  };

  // Fetch Products
  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const response = await apiRequest("/products?limit=100");
      if (response.data) {
        setProducts(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch products list:", err);
    } finally {
      setProductsLoading(false);
    }
  };

  // Fetch Orders
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await apiRequest("/orders/admin/all");
      if (response.data) {
        setOrders(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch all orders list:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Initial Data loading
  useEffect(() => {
    if (user && user.role === "admin") {
      fetchAnalytics();
      fetchCategories();
      fetchProducts();
      fetchOrders();
    }
  }, [user]);

  // Tab change handler
  const handleTabChange = (tab: "analytics" | "products" | "orders" | "settings") => {
    setActiveTab(tab);
    setProductError("");
  };

  // Save Settings handler
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("site_alert_banner_enabled", String(alertEnabled));
    localStorage.setItem("site_alert_banner_text", alertText);
    localStorage.setItem("site_free_shipping_threshold", String(shippingThreshold));
    localStorage.setItem("site_maintenance_mode", String(maintenanceMode));
    
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  // Order Status update handler
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    const order = orders.find(o => o._id === orderId);
    if (order && order.status?.toUpperCase() === "CANCELLED") {
      alert("This order has been cancelled and cannot be modified.");
      return;
    }
    try {
      const response = await apiRequest(`/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, note: "Status updated by administrator" }),
      });
      
      // Update locally
      if (response.data?.order) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? response.data.order : o))
        );
      }
    } catch (err: any) {
      alert(err.message || "Failed to update order status.");
    }
  };

  // Open Add Product Dialog
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProdName("");
    setProdDescription("");
    setProdPrice("");
    setProdCompareAtPrice("");
    setProdBadge("");
    setProdImageUrl("");
    
    // Pick first category as default if available
    setProdCategory(categories[0]?._id || "");
    setProdSubcategory("");
    setProdFeatured(false);
    setProdTrending(false);
    setProdActive(true);
    
    setProdSpecs([]);
    setProdVariants([]);
    setProductError("");
    setShowProductModal(true);
  };

  // Open Edit Product Dialog
  const handleOpenEditProduct = (prod: any) => {
    setEditingProduct(prod);
    setProdName(prod.name || "");
    setProdDescription(prod.description || "");
    setProdPrice(prod.price !== undefined ? String(prod.price) : "");
    setProdCompareAtPrice(prod.compareAtPrice !== undefined ? String(prod.compareAtPrice) : "");
    setProdBadge(prod.badge || "");
    setProdImageUrl(prod.images?.[0]?.url || "");
    setProdCategory(prod.categoryRef || "");
    setProdSubcategory(prod.subcategoryRef || "");
    setProdFeatured(prod.featured || false);
    setProdTrending(prod.trending || false);
    setProdActive(prod.isActive !== false);
    
    // Load specs & variants
    setProdSpecs(prod.specs || []);
    setProdVariants(prod.variants || []);
    setProductError("");
    setShowProductModal(true);
  };

  // Handle Specifications Addition/Removal
  const addSpecField = () => {
    setProdSpecs([...prodSpecs, { label: "", value: "" }]);
  };

  const updateSpecField = (idx: number, field: "label" | "value", value: string) => {
    const updated = [...prodSpecs];
    updated[idx][field] = value;
    setProdSpecs(updated);
  };

  const removeSpecField = (idx: number) => {
    setProdSpecs(prodSpecs.filter((_, i) => i !== idx));
  };

  // Handle Variants Addition/Removal
  const addVariantField = () => {
    setProdVariants([
      ...prodVariants,
      {
        sku: `SKU-${Date.now().toString().slice(-6)}-${prodVariants.length + 1}`,
        stock: 0,
        price: prodPrice ? Number(prodPrice) : 0,
        color: { name: "", hex: "#000000" },
        size: "",
        isActive: true
      }
    ]);
  };

  const updateVariantField = (idx: number, fields: any) => {
    const updated = [...prodVariants];
    updated[idx] = { ...updated[idx], ...fields };
    setProdVariants(updated);
  };

  const updateVariantColorField = (idx: number, fields: any) => {
    const updated = [...prodVariants];
    updated[idx].color = { ...updated[idx].color, ...fields };
    setProdVariants(updated);
  };

  const removeVariantField = (idx: number) => {
    setProdVariants(prodVariants.filter((_, i) => i !== idx));
  };

  // Handle Create or Update Product Submit
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductError("");
    
    if (!prodName.trim() || !prodDescription.trim() || !prodPrice || !prodCategory) {
      setProductError("Please complete all required fields (Name, Description, Price, and Category).");
      return;
    }

    const payload: any = {
      name: prodName.trim(),
      description: prodDescription.trim(),
      price: Number(prodPrice),
      category: prodCategory,
      featured: prodFeatured,
      trending: prodTrending,
      isActive: prodActive
    };

    if (prodCompareAtPrice) {
      payload.compareAtPrice = Number(prodCompareAtPrice);
    }
    if (prodBadge) {
      payload.badge = prodBadge;
    }
    if (prodSubcategory) {
      payload.subcategory = prodSubcategory;
    }

    // Embed images
    if (prodImageUrl.trim()) {
      payload.images = [
        {
          url: prodImageUrl.trim(),
          isPrimary: true
        }
      ];
    }

    // Embed filtered specs
    const validSpecs = prodSpecs.filter(s => s.label.trim() && s.value.trim());
    if (validSpecs.length > 0) {
      payload.specs = validSpecs;
    }

    // Embed filtered variants
    const validVariants = prodVariants.map(v => ({
      sku: v.sku.trim() || `SKU-${Math.random().toString(36).substring(7).toUpperCase()}`,
      stock: Number(v.stock) || 0,
      price: v.price ? Number(v.price) : Number(prodPrice),
      color: v.color?.name ? { name: v.color.name.trim(), hex: v.color.hex || "#000000" } : undefined,
      size: v.size?.trim() || undefined,
      isActive: v.isActive !== false
    }));

    if (validVariants.length > 0) {
      payload.variants = validVariants;
    }

    setProductSubmitLoading(true);

    try {
      if (editingProduct) {
        // Edit Mode
        const response = await apiRequest(`/products/manage/${editingProduct._id}`, {
          method: "PATCH",
          body: JSON.stringify(payload)
        });
        
        if (response.data) {
          // Sync state list
          setProducts(prev =>
            prev.map(p => (p._id === editingProduct._id ? response.data : p))
          );
          setShowProductModal(false);
          setEditingProduct(null);
        }
      } else {
        // Add Mode
        const response = await apiRequest("/products", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        
        if (response.data) {
          setProducts(prev => [response.data, ...prev]);
          setShowProductModal(false);
        }
      }
    } catch (err: any) {
      console.error("Product submit error:", err);
      setProductError(err.message || "An error occurred during submission. Please try again.");
    } finally {
      setProductSubmitLoading(false);
    }
  };

  // Product Delete Handler
  const handleDeleteProduct = async (id: string) => {
    try {
      await apiRequest(`/products/manage/${id}`, {
        method: "DELETE"
      });
      // Remove from list
      setProducts(prev => prev.filter(p => p._id !== id));
      setConfirmDeleteProductId(null);
    } catch (err: any) {
      alert(err.message || "Failed to delete product.");
    }
  };

  // Render Loading spinner for full page checks
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <Loader className="animate-spin text-primary" size={36} />
          <span className="text-sm font-semibold text-text-gray">Verifying admin credentials...</span>
        </div>
        <Footer />
      </div>
    );
  }

  // Restrict screen for non-admin accounts
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-light-gray/25">
        <Navbar />
        <main className="flex-1 max-w-xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center space-y-6">
          <div className="p-5 bg-red-50 text-red-500 rounded-full shadow-inner border border-red-100">
            <Lock size={48} />
          </div>
          <h2 className="text-2xl font-extrabold text-dark tracking-wide uppercase">
            Access Restricted
          </h2>
          <p className="text-sm text-text-gray leading-relaxed">
            This dashboard contains administrative controls. You must sign in using an account with administrator credentials.
          </p>
          <div className="flex space-x-4">
            <Link
              href="/"
              className="bg-white border border-border-gray hover:bg-light-gray text-dark px-6 py-3 rounded-lg font-bold text-xs tracking-wider transition-colors shadow-sm"
            >
              RETURN HOME
            </Link>
            <button
              onClick={() => openAuthModal("login")}
              className="bg-primary hover:bg-primary/95 text-white px-6 py-3 rounded-lg font-bold text-xs tracking-wider transition-colors shadow-md cursor-pointer"
            >
              SIGN IN AS ADMIN
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Filter products by search text
  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.description?.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.slug?.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col justify-between bg-light-gray/25">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 lg:px-8 py-10 w-full">
        {/* Navigation Breadcrumbs */}
        <div className="text-xs font-semibold text-text-gray uppercase tracking-wider mb-6 space-x-2">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link href="/profile" className="hover:text-primary transition-colors">Profile</Link>
          <span>/</span>
          <span className="text-dark">Admin Controls</span>
        </div>

        {/* Dashboard Title Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-dark tracking-wide uppercase">
              Admin Control Panel
            </h2>
            <p className="text-xs text-text-gray mt-1">
              Store analytics, product items management, order processing, and global configurations.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                fetchAnalytics();
                fetchCategories();
                fetchProducts();
                fetchOrders();
              }}
              className="p-2 bg-white hover:bg-light-gray text-dark border border-border-gray rounded-lg transition-colors cursor-pointer"
              title="Refresh All Data"
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={handleOpenAddProduct}
              className="flex items-center space-x-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-lg text-xs font-bold tracking-wider transition-colors shadow-sm cursor-pointer"
            >
              <Plus size={14} />
              <span>ADD PRODUCT ITEM</span>
            </button>
          </div>
        </div>

        {/* Workspace Tab Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column Navigation */}
          <div className="bg-white border border-border-gray rounded-2xl p-4 shadow-sm h-fit space-y-1">
            <button
              onClick={() => handleTabChange("analytics")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left text-xs font-bold tracking-wider uppercase transition-all ${
                activeTab === "analytics"
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-gray hover:bg-light-gray hover:text-dark"
              }`}
            >
              <Activity size={16} />
              <span>Overview Analytics</span>
            </button>
            <button
              onClick={() => handleTabChange("products")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left text-xs font-bold tracking-wider uppercase transition-all ${
                activeTab === "products"
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-gray hover:bg-light-gray hover:text-dark"
              }`}
            >
              <Package size={16} />
              <span>Product Inventory</span>
            </button>
            <button
              onClick={() => handleTabChange("orders")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left text-xs font-bold tracking-wider uppercase transition-all ${
                activeTab === "orders"
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-gray hover:bg-light-gray hover:text-dark"
              }`}
            >
              <ShoppingBag size={16} />
              <span>Customer Orders</span>
            </button>
            <button
              onClick={() => handleTabChange("settings")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left text-xs font-bold tracking-wider uppercase transition-all ${
                activeTab === "settings"
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-gray hover:bg-light-gray hover:text-dark"
              }`}
            >
              <Settings size={16} />
              <span>Site Configurations</span>
            </button>
          </div>

          {/* Right Panels Content Column */}
          <div className="lg:col-span-3 space-y-8">
            {/* PANELS 1: OVERVIEW ANALYTICS */}
            {activeTab === "analytics" && (
              <div className="space-y-8">
                {analyticsLoading ? (
                  <div className="bg-white border border-border-gray rounded-2xl p-12 text-center text-xs font-semibold text-text-gray flex justify-center items-center space-x-2">
                    <Loader className="animate-spin text-primary" size={16} />
                    <span>Loading server database calculations...</span>
                  </div>
                ) : analytics ? (
                  <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="bg-white border border-border-gray rounded-2xl p-6 shadow-sm flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-[10px] text-text-gray block font-bold uppercase tracking-wider">Total Sales (30d)</span>
                          <span className="text-2xl font-extrabold text-primary">${analytics.overview.revenueLast30Days?.toFixed(2)}</span>
                          <span className="text-[9px] text-text-gray block font-semibold">{analytics.overview.ordersLast30Days} orders processed</span>
                        </div>
                        <div className="p-3.5 bg-primary/10 text-primary rounded-xl">
                          <Activity size={24} />
                        </div>
                      </div>

                      <div className="bg-white border border-border-gray rounded-2xl p-6 shadow-sm flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-[10px] text-text-gray block font-bold uppercase tracking-wider">Registered Users</span>
                          <span className="text-2xl font-extrabold text-dark">{analytics.overview.totalUsers}</span>
                          <span className="text-[9px] text-text-gray block font-semibold">+{analytics.overview.newUsersLast30Days} new users last 30d</span>
                        </div>
                        <div className="p-3.5 bg-blue-50 text-blue-500 rounded-xl">
                          <Users size={24} />
                        </div>
                      </div>

                      <div className="bg-white border border-border-gray rounded-2xl p-6 shadow-sm flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-[10px] text-text-gray block font-bold uppercase tracking-wider">Total Products</span>
                          <span className="text-2xl font-extrabold text-dark">{analytics.overview.totalProducts}</span>
                          <span className="text-[9px] text-text-gray block font-semibold">{analytics.overview.activeProducts} items listed active</span>
                        </div>
                        <div className="p-3.5 bg-purple-50 text-purple-500 rounded-xl">
                          <Package size={24} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Top Selling Products */}
                      <div className="bg-white border border-border-gray rounded-2xl p-6 shadow-sm">
                        <h3 className="font-extrabold text-sm text-dark tracking-wide uppercase mb-4 border-b border-border-gray pb-3">
                          Top Products
                        </h3>
                        {analytics.topProducts?.length === 0 ? (
                          <p className="text-xs font-semibold text-text-gray text-center py-6">No purchase data tracked yet.</p>
                        ) : (
                          <div className="divide-y divide-border-gray/50">
                            {analytics.topProducts?.map((item: any) => (
                              <div key={item._id} className="flex justify-between py-3 text-xs font-semibold items-center">
                                <div>
                                  <h4 className="text-dark font-extrabold line-clamp-1">{item.name}</h4>
                                  <span className="text-[9px] text-text-gray block">Sold {item.unitsSold} units</span>
                                </div>
                                <span className="text-primary font-bold">${item.revenue?.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Inventory Stock Warning Alert */}
                      <div className="bg-white border border-border-gray rounded-2xl p-6 shadow-sm">
                        <h3 className="font-extrabold text-sm text-dark tracking-wide uppercase mb-4 border-b border-border-gray pb-3">
                          Low Stock Warning
                        </h3>
                        {analytics.lowStockProducts?.length === 0 ? (
                          <div className="text-center py-6 text-xs text-green-600 font-semibold flex flex-col items-center justify-center space-y-1">
                            <Check size={20} />
                            <span>All product inventory levels are healthy!</span>
                          </div>
                        ) : (
                          <div className="divide-y divide-border-gray/50">
                            {analytics.lowStockProducts?.map((item: any) => (
                              <div key={item._id} className="flex justify-between py-3 text-xs font-semibold items-center">
                                <span className="text-dark line-clamp-1 pr-4">{item.name}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-wide ${
                                  item.totalStock === 0 ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                                }`}>
                                  {item.totalStock === 0 ? "OUT OF STOCK" : `${item.totalStock} LEFT`}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-text-gray font-semibold text-center">Dashboard information unavailable.</p>
                )}
              </div>
            )}

            {/* PANELS 2: PRODUCT INVENTORY LISTING */}
            {activeTab === "products" && (
              <div className="bg-white border border-border-gray rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h3 className="font-extrabold text-base text-dark tracking-wide uppercase">
                    Products Listed ({filteredProducts.length})
                  </h3>
                  <div className="w-full sm:w-64 relative text-xs">
                    <input
                      type="text"
                      placeholder="Search inventory name/slug..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full bg-light-gray border border-border-gray rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                    />
                  </div>
                </div>

                {productsLoading ? (
                  <div className="py-12 text-center text-xs font-semibold text-text-gray flex justify-center items-center space-x-2">
                    <Loader className="animate-spin text-primary" size={14} />
                    <span>Loading inventory catalogue...</span>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="border border-dashed border-border-gray rounded-xl p-8 text-center text-xs font-semibold text-text-gray">
                    No products matched search query.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-border-gray text-text-gray font-bold uppercase tracking-wider">
                          <th className="pb-3 pr-4">Product Name</th>
                          <th className="pb-3 px-4">Category</th>
                          <th className="pb-3 px-4">Price</th>
                          <th className="pb-3 px-4 text-center">Stock</th>
                          <th className="pb-3 px-4 text-center">Status</th>
                          <th className="pb-3 pl-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-gray/40 font-semibold text-dark">
                        {filteredProducts.map((prod) => (
                          <tr key={prod._id} className="hover:bg-light-gray/25 transition-colors">
                            <td className="py-3 pr-4">
                              <div className="flex items-center space-x-3 max-w-[200px]">
                                {prod.images?.[0]?.url && (
                                  <img
                                    src={prod.images[0].url}
                                    alt={prod.name}
                                    className="w-8 h-8 object-cover rounded bg-light-gray border border-border-gray/30 flex-shrink-0"
                                  />
                                )}
                                <div className="truncate">
                                  <h4 className="font-bold line-clamp-1">{prod.name}</h4>
                                  <span className="text-[9px] text-text-gray block uppercase font-mono">{prod.badge || "No badge"}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-text-gray truncate max-w-[120px]">
                              {categories.find(c => c._id === prod.categoryRef || c.slug === prod.category)?.name || "General"}
                            </td>
                            <td className="py-3 px-4 font-bold text-primary">
                              ${prod.price?.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-center font-mono">
                              {prod.totalStock !== undefined ? prod.totalStock : 0}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                                prod.isActive !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                              }`}>
                                {prod.isActive !== false ? "Active" : "Disabled"}
                              </span>
                            </td>
                            <td className="py-3 pl-4 text-right space-x-1 flex items-center justify-end h-[62px]">
                              <button
                                onClick={() => handleOpenEditProduct(prod)}
                                className="p-1.5 border border-border-gray hover:bg-light-gray text-dark rounded-md transition-colors cursor-pointer"
                                title="Edit Product details"
                              >
                                <Edit size={12} />
                              </button>
                              {confirmDeleteProductId === prod._id ? (
                                <div className="flex items-center space-x-1.5 pl-2">
                                  <button
                                    onClick={() => handleDeleteProduct(prod._id)}
                                    className="px-2 py-1 bg-red-600 text-white rounded text-[10px] uppercase font-bold hover:bg-red-700 transition-colors"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteProductId(null)}
                                    className="px-2 py-1 bg-white border border-border-gray text-dark rounded text-[10px] uppercase font-bold hover:bg-light-gray transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmDeleteProductId(prod._id)}
                                  className="p-1.5 border border-red-100 hover:bg-red-50 text-red-500 rounded-md transition-colors cursor-pointer"
                                  title="Delete Product item"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* PANELS 3: CUSTOMER ORDERS LISTING */}
            {activeTab === "orders" && (
              <div className="bg-white border border-border-gray rounded-2xl p-6 shadow-sm">
                <h3 className="font-extrabold text-base text-dark tracking-wide uppercase mb-6">
                  Customer Orders History ({orders.length})
                </h3>

                {ordersLoading ? (
                  <div className="py-12 text-center text-xs font-semibold text-text-gray flex justify-center items-center space-x-2">
                    <Loader className="animate-spin text-primary" size={14} />
                    <span>Loading global orders database...</span>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="border border-dashed border-border-gray rounded-xl p-8 text-center text-xs font-semibold text-text-gray">
                    No orders have been recorded in the system.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-border-gray text-text-gray font-bold uppercase tracking-wider">
                          <th className="pb-3 pr-4">Order Number</th>
                          <th className="pb-3 px-4">User</th>
                          <th className="pb-3 px-4">Date</th>
                          <th className="pb-3 px-4">Total</th>
                          <th className="pb-3 px-4">Current Status</th>
                          <th className="pb-3 pl-4 text-right">Update Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-gray/40 font-semibold text-dark">
                        {orders.map((order) => (
                          <tr key={order._id} className="hover:bg-light-gray/25 transition-colors">
                            <td className="py-3 pr-4 font-bold font-mono">
                              {order.orderNumber}
                            </td>
                            <td className="py-3 px-4">
                              <span className="block font-bold text-dark">{order.user?.name || "Guest Customer"}</span>
                              <span className="block text-[10px] text-text-gray font-normal">{order.user?.email || ""}</span>
                            </td>
                            <td className="py-3 px-4 text-text-gray">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 font-bold text-primary">
                              ${order.total?.toFixed(2)}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded tracking-wide uppercase ${
                                order.status?.toUpperCase() === "DELIVERED" ? "bg-green-100 text-green-700" :
                                order.status?.toUpperCase() === "SHIPPED" ? "bg-blue-100 text-blue-700" :
                                order.status?.toUpperCase() === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                                order.status?.toUpperCase() === "CONFIRMED" ? "bg-purple-100 text-purple-700" :
                                order.status?.toUpperCase() === "PROCESSING" ? "bg-indigo-100 text-indigo-700" :
                                order.status?.toUpperCase() === "CANCELLED" ? "bg-red-100 text-red-700" :
                                "bg-gray-100 text-gray-700"
                              }`}>
                                {order.status}
                              </span>
                            </td>
                             <td className="py-3 pl-4 text-right font-semibold">
                               {order.status?.toUpperCase() === "CANCELLED" ? (
                                 <span className="text-[10px] text-text-gray font-bold uppercase italic pr-2">
                                   No Actions Allowed
                                 </span>
                               ) : (
                                 <select
                                   value={order.status}
                                   onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                                   className="bg-light-gray border border-border-gray rounded text-[11px] px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white text-dark font-semibold cursor-pointer"
                                 >
                                   <option value="pending">PENDING</option>
                                   <option value="confirmed">CONFIRMED</option>
                                   <option value="processing">PROCESSING</option>
                                   <option value="shipped">SHIPPED</option>
                                   <option value="delivered">DELIVERED</option>
                                   <option value="cancelled">CANCELLED</option>
                                 </select>
                               )}
                             </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* PANELS 4: GLOBAL SITE SETTINGS */}
            {activeTab === "settings" && (
              <div className="bg-white border border-border-gray rounded-2xl p-6 shadow-sm">
                <h3 className="font-extrabold text-base text-dark tracking-wide uppercase mb-6 border-b border-border-gray pb-3">
                  Global Site Settings
                </h3>

                <form onSubmit={handleSaveSettings} className="space-y-6 text-xs font-semibold text-dark">
                  {/* Alert Banner Control */}
                  <div className="bg-light-gray/40 border border-border-gray/30 p-5 rounded-xl space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-extrabold text-dark uppercase tracking-wide">Top Announcement Banner</h4>
                        <p className="text-[10px] font-normal text-text-gray mt-0.5">Toggle and configure announcement alerts visible to all users site-wide.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={alertEnabled}
                        onChange={(e) => setAlertEnabled(e.target.checked)}
                        className="h-4.5 w-4.5 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                      />
                    </div>
                    
                    {alertEnabled && (
                      <div className="space-y-1">
                        <label className="text-[10px] text-text-gray uppercase tracking-wider block">Banner Text Message</label>
                        <input
                          type="text"
                          required
                          value={alertText}
                          onChange={(e) => setAlertText(e.target.value)}
                          placeholder="e.g. Clearance sale! Use coupon CODE20 for 20% off items."
                          className="w-full border border-border-gray rounded-lg px-3 py-2 bg-white text-xs font-semibold focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* Standard Commerce Configuration parameters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-text-gray uppercase tracking-wider block">Free Shipping Threshold ($)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={shippingThreshold}
                        onChange={(e) => setShippingThreshold(Number(e.target.value))}
                        className="w-full border border-border-gray rounded-lg px-3 py-2 bg-light-gray font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                      />
                      <span className="text-[9px] text-text-gray font-normal block">Orders with subtotal exceeding this threshold enjoy free standard shipping.</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-text-gray uppercase tracking-wider block">Site Maintenance Mode</label>
                      <div className="flex items-center h-10">
                        <input
                          type="checkbox"
                          id="maint-chk"
                          checked={maintenanceMode}
                          onChange={(e) => setMaintenanceMode(e.target.checked)}
                          className="h-4.5 w-4.5 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                        />
                        <label htmlFor="maint-chk" className="ml-2.5 font-bold text-dark cursor-pointer text-xs select-none">
                          Enable Maintenance Mode
                        </label>
                      </div>
                      <span className="text-[9px] text-text-gray font-normal block">Redirects customers to a friendly hold screen during website updates (simulated).</span>
                    </div>
                  </div>

                  {/* Settings status indicator and button */}
                  <div className="flex items-center space-x-3 pt-4 border-t border-border-gray">
                    <button
                      type="submit"
                      className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-lg text-xs font-bold tracking-wider transition-colors shadow-sm cursor-pointer flex items-center space-x-1.5"
                    >
                      <Save size={14} />
                      <span>SAVE ALL SETTINGS</span>
                    </button>
                    
                    {settingsSaved && (
                      <span className="text-xs font-bold text-green-600 flex items-center space-x-1">
                        <Check size={14} />
                        <span>Settings successfully saved and live!</span>
                      </span>
                    )}
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* CREATE AND UPDATE PRODUCT MODAL OVERLAY */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border-gray shadow-2xl w-full max-w-3xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowProductModal(false);
                setEditingProduct(null);
              }}
              className="absolute top-4 right-4 text-text-gray hover:text-dark p-1.5 rounded-full hover:bg-light-gray cursor-pointer transition-colors"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            <h3 className="font-extrabold text-lg text-dark tracking-wide uppercase mb-2">
              {editingProduct ? "Edit Product Item" : "Add New Product"}
            </h3>
            <p className="text-[10px] text-text-gray font-semibold mb-6">
              {editingProduct ? `PRODUCT ID: ${editingProduct._id}` : "Configure product details, images, specifications and variant inventory."}
            </p>

            {productError && (
              <div className="mb-6 text-xs font-semibold bg-red-50 text-red-600 p-3 border border-red-150 rounded flex items-start space-x-2">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{productError}</span>
              </div>
            )}

            <form onSubmit={handleProductSubmit} className="space-y-6 text-xs font-semibold text-dark">
              {/* SECTION: BASIC INFO */}
              <div className="bg-light-gray/40 border border-border-gray/30 p-4 rounded-xl space-y-4">
                <h4 className="text-[10px] font-bold text-dark uppercase tracking-wider border-b border-border-gray/50 pb-2">1. Basic Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-gray uppercase tracking-wider block">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={prodName}
                      onChange={(e) => setProdName(e.target.value)}
                      placeholder="e.g. iPhone 16 Pro Max"
                      className="w-full border border-border-gray rounded-lg px-3 py-2 bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-gray uppercase tracking-wider block">Image URL</label>
                    <input
                      type="url"
                      value={prodImageUrl}
                      onChange={(e) => setProdImageUrl(e.target.value)}
                      placeholder="e.g. https://images.unsplash.com/photo-xxx"
                      className="w-full border border-border-gray rounded-lg px-3 py-2 bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-text-gray uppercase tracking-wider block">Product Description *</label>
                  <textarea
                    required
                    value={prodDescription}
                    onChange={(e) => setProdDescription(e.target.value)}
                    placeholder="Provide a detailed specifications description of this product..."
                    rows={3}
                    className="w-full border border-border-gray rounded-lg p-3 bg-white font-sans font-medium leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-gray uppercase tracking-wider block">Category *</label>
                    <select
                      value={prodCategory}
                      onChange={(e) => setProdCategory(e.target.value)}
                      className="w-full border border-border-gray rounded-lg px-3 py-2 bg-white"
                    >
                      <option value="" disabled>Select Category</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-text-gray uppercase tracking-wider block">Subcategory (Optional)</label>
                    <select
                      value={prodSubcategory}
                      onChange={(e) => setProdSubcategory(e.target.value)}
                      className="w-full border border-border-gray rounded-lg px-3 py-2 bg-white"
                    >
                      <option value="">None</option>
                      {categories
                        .find((c) => c._id === prodCategory)
                        ?.subcategories?.map((sub: any) => (
                          <option key={sub._id} value={sub._id}>
                            {sub.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-text-gray uppercase tracking-wider block">Product Badge</label>
                    <select
                      value={prodBadge}
                      onChange={(e) => setProdBadge(e.target.value)}
                      className="w-full border border-border-gray rounded-lg px-3 py-2 bg-white"
                    >
                      <option value="">None</option>
                      <option value="NEW">NEW</option>
                      <option value="HOT">HOT</option>
                      <option value="SALE">SALE</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-gray uppercase tracking-wider block">Price ($) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      placeholder="e.g. 999.00"
                      className="w-full border border-border-gray rounded-lg px-3 py-2 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-text-gray uppercase tracking-wider block">Compare At Price ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={prodCompareAtPrice}
                      onChange={(e) => setProdCompareAtPrice(e.target.value)}
                      placeholder="e.g. 1099.00"
                      className="w-full border border-border-gray rounded-lg px-3 py-2 bg-white"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 pt-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="feat-chk"
                      checked={prodFeatured}
                      onChange={(e) => setProdFeatured(e.target.checked)}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                    />
                    <label htmlFor="feat-chk" className="ml-2 font-bold text-dark text-xs cursor-pointer select-none">
                      Featured product
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="trend-chk"
                      checked={prodTrending}
                      onChange={(e) => setProdTrending(e.target.checked)}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                    />
                    <label htmlFor="trend-chk" className="ml-2 font-bold text-dark text-xs cursor-pointer select-none">
                      Trending product
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="active-chk"
                      checked={prodActive}
                      onChange={(e) => setProdActive(e.target.checked)}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                    />
                    <label htmlFor="active-chk" className="ml-2 font-bold text-dark text-xs cursor-pointer select-none">
                      Active / Listed in store
                    </label>
                  </div>
                </div>
              </div>

              {/* SECTION: SPECIFICATIONS */}
              <div className="bg-light-gray/40 border border-border-gray/30 p-4 rounded-xl space-y-4">
                <div className="flex justify-between items-center border-b border-border-gray/50 pb-2">
                  <h4 className="text-[10px] font-bold text-dark uppercase tracking-wider">2. Technical Specifications</h4>
                  <button
                    type="button"
                    onClick={addSpecField}
                    className="flex items-center space-x-1 text-[10px] text-primary font-bold hover:underline cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>ADD SPEC FIELD</span>
                  </button>
                </div>

                {prodSpecs.length === 0 ? (
                  <p className="text-[10px] text-text-gray font-normal italic">No technical specs specified yet. (e.g. Screen: OLED, Memory: 8GB)</p>
                ) : (
                  <div className="space-y-2">
                    {prodSpecs.map((spec, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          required
                          value={spec.label}
                          onChange={(e) => updateSpecField(index, "label", e.target.value)}
                          placeholder="Spec Name (e.g. Storage)"
                          className="flex-1 border border-border-gray rounded-lg px-3 py-1.5 bg-white"
                        />
                        <input
                          type="text"
                          required
                          value={spec.value}
                          onChange={(e) => updateSpecField(index, "value", e.target.value)}
                          placeholder="Value (e.g. 256GB)"
                          className="flex-1 border border-border-gray rounded-lg px-3 py-1.5 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => removeSpecField(index)}
                          className="text-red-500 hover:text-red-700 p-1.5 bg-white border border-border-gray rounded-lg"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION: INVENTORY VARIANTS */}
              <div className="bg-light-gray/40 border border-border-gray/30 p-4 rounded-xl space-y-4">
                <div className="flex justify-between items-center border-b border-border-gray/50 pb-2">
                  <h4 className="text-[10px] font-bold text-dark uppercase tracking-wider">3. Inventory Variants (Colors & Stock)</h4>
                  <button
                    type="button"
                    onClick={addVariantField}
                    className="flex items-center space-x-1 text-[10px] text-primary font-bold hover:underline cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>ADD VARIANT ITEM</span>
                  </button>
                </div>

                {prodVariants.length === 0 ? (
                  <p className="text-[10px] text-text-gray font-normal italic">No variants created. The item will use standard values.</p>
                ) : (
                  <div className="space-y-3">
                    {prodVariants.map((v, index) => (
                      <div key={index} className="border border-border-gray bg-white rounded-lg p-3 space-y-2 relative">
                        <button
                          type="button"
                          onClick={() => removeVariantField(index)}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 size={12} />
                        </button>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="space-y-0.5">
                            <label className="text-[9px] text-text-gray uppercase">SKU</label>
                            <input
                              type="text"
                              required
                              value={v.sku}
                              onChange={(e) => updateVariantField(index, { sku: e.target.value })}
                              placeholder="SKU"
                              className="w-full border border-border-gray rounded-md px-2.5 py-1 text-xs"
                            />
                          </div>

                          <div className="space-y-0.5">
                            <label className="text-[9px] text-text-gray uppercase">Variant Stock</label>
                            <input
                              type="number"
                              required
                              min="0"
                              value={v.stock}
                              onChange={(e) => updateVariantField(index, { stock: Number(e.target.value) })}
                              placeholder="Stock"
                              className="w-full border border-border-gray rounded-md px-2.5 py-1 text-xs"
                            />
                          </div>

                          <div className="space-y-0.5">
                            <label className="text-[9px] text-text-gray uppercase">Variant Price ($)</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={v.price}
                              onChange={(e) => updateVariantField(index, { price: Number(e.target.value) })}
                              placeholder="Price (Optional)"
                              className="w-full border border-border-gray rounded-md px-2.5 py-1 text-xs"
                            />
                          </div>

                          <div className="space-y-0.5">
                            <label className="text-[9px] text-text-gray uppercase">Size</label>
                            <input
                              type="text"
                              value={v.size || ""}
                              onChange={(e) => updateVariantField(index, { size: e.target.value })}
                              placeholder="e.g. 11-inch"
                              className="w-full border border-border-gray rounded-md px-2.5 py-1 text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border-gray/30">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 space-y-0.5">
                              <label className="text-[9px] text-text-gray uppercase">Color Label</label>
                              <input
                                type="text"
                                value={v.color?.name || ""}
                                onChange={(e) => updateVariantColorField(index, { name: e.target.value })}
                                placeholder="Color name (e.g. Space Gray)"
                                className="w-full border border-border-gray rounded-md px-2.5 py-1 text-xs"
                              />
                            </div>
                            <div className="space-y-0.5">
                              <label className="text-[9px] text-text-gray uppercase">Color Hex</label>
                              <div className="flex items-center space-x-1">
                                <input
                                  type="color"
                                  value={v.color?.hex || "#000000"}
                                  onChange={(e) => updateVariantColorField(index, { hex: e.target.value })}
                                  className="w-8 h-7 p-0 border border-border-gray rounded cursor-pointer"
                                />
                                <input
                                  type="text"
                                  value={v.color?.hex || ""}
                                  onChange={(e) => updateVariantColorField(index, { hex: e.target.value })}
                                  placeholder="#000000"
                                  className="w-20 border border-border-gray rounded-md px-2 py-1 text-xs text-center font-mono"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center h-full pt-4">
                            <input
                              type="checkbox"
                              id={`var-act-${index}`}
                              checked={v.isActive !== false}
                              onChange={(e) => updateVariantField(index, { isActive: e.target.checked })}
                              className="h-3.5 w-3.5 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                            />
                            <label htmlFor={`var-act-${index}`} className="ml-2 font-bold text-dark text-[11px] cursor-pointer select-none">
                              Variant Active
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ACTION FOOTER BUTTONS */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border-gray">
                <button
                  type="button"
                  onClick={() => {
                    setShowProductModal(false);
                    setEditingProduct(null);
                  }}
                  className="py-2.5 px-5 bg-white hover:bg-light-gray text-dark border border-border-gray font-bold rounded-lg tracking-wider uppercase transition-colors cursor-pointer"
                >
                  NEVERMIND
                </button>
                <button
                  type="submit"
                  disabled={productSubmitLoading}
                  className="bg-primary hover:bg-primary-hover disabled:opacity-70 text-white px-6 py-2.5 rounded-lg font-bold tracking-wider uppercase transition-colors shadow-sm cursor-pointer flex items-center space-x-2"
                >
                  {productSubmitLoading ? (
                    <>
                      <Loader size={14} className="animate-spin" />
                      <span>SUBMITTING...</span>
                    </>
                  ) : (
                    <span>{editingProduct ? "SAVE CHANGES" : "CREATE PRODUCT"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
