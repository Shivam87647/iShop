"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth, Address } from "@/context/AuthContext";
import { apiRequest } from "@/utils/api";
import { Plus, Trash2, Home, MapPin, Briefcase, ShoppingBag, Eye, X, Loader } from "lucide-react";

export default function ProfilePage() {
  const { user, loading, logout, openAuthModal, addAddress, updateAddress, deleteAddress, updateProfile } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Address Deletion Confirmation state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Selected Order Tracking States
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Order Cancellation States
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelSubmitLoading, setCancelSubmitLoading] = useState(false);
  const [cancelError, setCancelError] = useState("");

  // Profile Update States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [profileSubmitLoading, setProfileSubmitLoading] = useState(false);
  const [profileError, setProfileError] = useState("");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    setProfileError("");
    setProfileSubmitLoading(true);
    try {
      await updateProfile({ name: editName.trim() });
      setIsEditingProfile(false);
    } catch (err: any) {
      console.error("Failed to update profile details:", err);
      setProfileError(err.message || "Failed to update profile details. Please try again.");
    } finally {
      setProfileSubmitLoading(false);
    }
  };

  const getStepIndex = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PENDING": return 0;
      case "CONFIRMED":
      case "PROCESSING": return 1;
      case "SHIPPED": return 2;
      case "DELIVERED": return 3;
      default: return 0;
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    setCancelError("");
    setCancelSubmitLoading(true);
    try {
      const response = await apiRequest(`/orders/${selectedOrder._id}/cancel`, {
        method: "PATCH",
        body: JSON.stringify({ reason: cancelReason }),
      });
      
      const updatedOrder = response.data?.order || {
        ...selectedOrder,
        status: "CANCELLED",
        cancelledAt: new Date().toISOString(),
        cancelReason: cancelReason
      };

      // Update the cancelled order in the local state
      setOrders((prevOrders) =>
        prevOrders.map((ord) =>
          ord._id === selectedOrder._id ? updatedOrder : ord
        )
      );
      
      // Update selectedOrder so the modal's details reflect the cancelled state immediately
      setSelectedOrder(updatedOrder);
      
      // Clear cancellation states but keep details open for user tracking/feedback
      setShowCancelConfirm(false);
      setCancelReason("");
    } catch (err: any) {
      console.error("Order cancellation error:", err);
      setCancelError(err.message || "Failed to cancel order. Please try again.");
    } finally {
      setCancelSubmitLoading(false);
    }
  };

  const isCancellable =
    selectedOrder &&
    ["PENDING", "CONFIRMED", "PROCESSING"].includes(selectedOrder.status?.toUpperCase());

  const handleSetDefaultAddress = async (addr: Address) => {
    if (!addr._id) return;
    try {
      await updateAddress(addr._id, {
        fullName: addr.fullName,
        street: addr.street,
        city: addr.city,
        postalCode: addr.postalCode,
        label: addr.label,
        phone: addr.phone,
        state: addr.state,
        country: addr.country,
        isDefault: true
      });
    } catch (err) {
      console.error("Failed to set default address:", err);
    }
  };

  // Address Form States
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [label, setLabel] = useState("Home");
  const [isDefault, setIsDefault] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [addressSubmitLoading, setAddressSubmitLoading] = useState(false);

  // Fetch Order History from backend when user is logged in
  useEffect(() => {
    if (user) {
      const fetchOrders = async () => {
        setOrdersLoading(true);
        try {
          const body = await apiRequest("/orders");
          if (body.data) {
            setOrders(body.data);
          }
        } catch (err) {
          console.error("Failed to fetch orders:", err);
        } finally {
          setOrdersLoading(false);
        }
      };
      fetchOrders();
    }
  }, [user]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError("");
    setAddressSubmitLoading(true);

    try {
      if (!fullName || !street || !city || !postalCode) {
        throw new Error("Required fields are missing");
      }

      await addAddress({
        fullName,
        phone,
        street,
        city,
        state,
        postalCode,
        label,
        isDefault,
      });

      // Clear form
      setFullName("");
      setPhone("");
      setStreet("");
      setCity("");
      setState("");
      setPostalCode("");
      setLabel("Home");
      setIsDefault(false);
      setShowAddressModal(false);
    } catch (err: any) {
      if (err.errors?.fieldErrors) {
        const details = Object.entries(err.errors.fieldErrors)
          .map(([field, msgs]: any) => `${field}: ${msgs.join(", ")}`)
          .join(" | ");
        setAddressError(`Validation failed: ${details}`);
      } else {
        setAddressError(err.message || "Failed to add address.");
      }
    } finally {
      setAddressSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <Loader className="animate-spin text-primary" size={36} />
          <span className="text-sm font-semibold text-text-gray">Loading profile details...</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-4 lg:px-8 py-20 flex flex-col items-center justify-center text-center space-y-6">
          <div className="p-5 bg-light-gray rounded-full text-text-gray shadow-inner">
            <ShoppingBag size={48} />
          </div>
          <h2 className="text-2xl font-extrabold text-dark tracking-wide uppercase">
            Access Restricted
          </h2>
          <p className="text-sm text-text-gray max-w-md leading-relaxed">
            Please sign in to view your profile dashboard, manage shipping addresses, and track order histories.
          </p>
          <button
            onClick={() => openAuthModal("login")}
            className="bg-primary hover:bg-primary/95 text-white px-8 py-3 rounded-lg font-bold text-xs tracking-wider transition-colors shadow-md cursor-pointer"
          >
            SIGN IN / REGISTER
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-light-gray/25">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 lg:px-8 py-12 w-full">
        {/* Breadcrumbs */}
        <div className="text-xs font-semibold text-text-gray uppercase tracking-wider mb-6 space-x-2">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-dark">Account Profile</span>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column 1: User Profile Details Card */}
          <div className="bg-white border border-border-gray rounded-2xl p-6 shadow-sm flex flex-col justify-between h-fit">
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-extrabold text-2xl uppercase">
                  {user.name.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  {isEditingProfile ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[9px] text-text-gray font-bold uppercase tracking-wider block">
                          Edit Profile Name
                        </label>
                        <input
                          type="text"
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full border border-border-gray rounded-lg px-3 py-1.5 bg-light-gray text-xs text-dark font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                        />
                      </div>
                      {profileError && (
                        <p className="text-[10px] text-red-600 font-bold">{profileError}</p>
                      )}
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingProfile(false);
                            setEditName(user.name);
                            setProfileError("");
                          }}
                          className="px-2.5 py-1 border border-border-gray hover:bg-light-gray text-dark text-[10px] font-bold rounded-md transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={profileSubmitLoading}
                          className="px-2.5 py-1 bg-primary hover:bg-primary/90 text-white text-[10px] font-bold rounded-md transition-colors cursor-pointer flex items-center space-x-1 disabled:opacity-75"
                        >
                          {profileSubmitLoading ? (
                            <>
                              <Loader size={10} className="animate-spin" />
                              <span>Saving...</span>
                            </>
                          ) : (
                            <span>Save</span>
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h2 className="font-extrabold text-lg text-dark leading-tight truncate max-w-[120px] sm:max-w-none">{user.name}</h2>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingProfile(true);
                            setEditName(user.name);
                          }}
                          className="text-[10px] text-primary hover:text-primary/80 font-extrabold uppercase tracking-wide cursor-pointer border border-primary/20 rounded px-1.5 py-0.5 hover:bg-primary/5 transition-all"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="flex items-center space-x-2 mt-1.5 flex-wrap gap-y-1">
                        <span className="text-xs font-bold text-primary tracking-wide uppercase px-2 py-0.5 bg-primary/10 rounded-full inline-block">
                          {user.role} Account
                        </span>
                        {user.role === "admin" && (
                          <Link
                            href="/profile/admin-controls"
                            className="text-[10px] font-bold text-accent tracking-wide uppercase px-2 py-0.5 bg-accent/10 hover:bg-accent/20 border border-accent/20 rounded-full transition-all cursor-pointer inline-block"
                          >
                            Admin Controls
                          </Link>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="border-t border-border-gray pt-5 space-y-3.5">
                <div>
                  <span className="text-[10px] text-text-gray block font-semibold uppercase tracking-wider">Email Address</span>
                  <span className="text-sm font-semibold text-dark">{user.email}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-gray block font-semibold uppercase tracking-wider">Address Count</span>
                  <span className="text-sm font-semibold text-dark">{user.addresses?.length || 0} Registered</span>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="mt-8 w-full py-3 border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-lg text-xs tracking-wider transition-colors cursor-pointer text-center"
            >
              LOG OUT FROM SESSION
            </button>
          </div>

          {/* Column 2 & 3: Tabs & Panels */}
          <div className="lg:col-span-2 space-y-8">
            {/* Address Management Panel */}
            <div className="bg-white border border-border-gray rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-extrabold text-base text-dark tracking-wide uppercase">
                  Shipping Addresses
                </h3>
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="flex items-center space-x-1.5 text-xs text-primary font-bold hover:underline cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add New Address</span>
                </button>
              </div>

              {user.addresses?.length === 0 ? (
                <div className="border border-dashed border-border-gray rounded-xl p-8 text-center text-xs font-semibold text-text-gray">
                  No shipping addresses listed yet. Click "Add New Address" above.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.addresses.map((addr) => (
                    <div
                      key={addr._id}
                      className={`border rounded-xl p-4 flex flex-col justify-between relative transition-all ${
                        addr.isDefault
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border-gray hover:border-text-gray bg-white"
                      }`}
                    >
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="flex items-center space-x-1.5 text-xs font-bold text-dark uppercase tracking-wider">
                            {addr.label === "Home" && <Home size={12} className="text-primary" />}
                            {addr.label === "Work" && <Briefcase size={12} className="text-primary" />}
                            {addr.label !== "Home" && addr.label !== "Work" && <MapPin size={12} className="text-primary" />}
                            <span>{addr.label || "Address"}</span>
                          </span>
                          {addr.isDefault && (
                            <span className="text-[9px] bg-primary text-white font-extrabold px-1.5 py-0.5 rounded tracking-wide uppercase">
                              Default
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 text-text-gray leading-normal">
                          <p className="font-bold text-dark text-xs">{addr.fullName}</p>
                          <p>{addr.street}</p>
                          <p>{addr.city}{addr.state ? `, ${addr.state}` : ""} - {addr.postalCode}</p>
                          {addr.phone && <p className="mt-1 font-mono text-[10px]">{addr.phone}</p>}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border-gray flex justify-between items-center min-h-[32px]">
                        {confirmDeleteId === addr._id ? (
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[10px] text-red-600 font-bold uppercase tracking-wider">
                              Are you sure?
                            </span>
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="text-[10px] text-dark hover:underline font-bold uppercase cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  deleteAddress(addr._id!);
                                  setConfirmDeleteId(null);
                                }}
                                className="text-[10px] bg-red-600 text-white px-2 py-1 rounded font-bold uppercase hover:bg-red-700 transition-colors cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {!addr.isDefault ? (
                              <button
                                type="button"
                                onClick={() => handleSetDefaultAddress(addr)}
                                className="text-[10px] text-primary hover:text-primary/80 font-bold tracking-wider uppercase transition-colors cursor-pointer"
                              >
                                Set as Default
                              </button>
                            ) : (
                              <span className="text-[10px] text-green-600 font-bold tracking-wider uppercase">
                                Primary Address
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(addr._id || null)}
                              className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-all cursor-pointer"
                              title="Delete Address"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order History Panel */}
            <div className="bg-white border border-border-gray rounded-2xl p-6 shadow-sm">
              <h3 className="font-extrabold text-base text-dark tracking-wide uppercase mb-6">
                Your Order History
              </h3>

              {ordersLoading ? (
                <div className="py-8 text-center text-xs font-semibold text-text-gray flex justify-center items-center space-x-2">
                  <Loader className="animate-spin text-primary" size={14} />
                  <span>Querying orders database...</span>
                </div>
              ) : orders.length === 0 ? (
                <div className="border border-dashed border-border-gray rounded-xl p-8 text-center text-xs font-semibold text-text-gray">
                  You haven't placed any orders yet. Visit our store to find your favorite products.
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      className="border border-border-gray rounded-xl p-4 hover:border-text-gray transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2.5">
                          <span className="font-bold text-xs text-dark">{order.orderNumber}</span>
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
                        </div>
                        <p className="text-[10px] text-text-gray">
                          Placed on: {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-[10px] text-text-gray">
                          Items Count: {order.items?.reduce((c: number, i: any) => c + i.quantity, 0) || 0}
                        </p>
                      </div>

                      <div className="flex items-center justify-between w-full md:w-auto gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-border-gray">
                        <div className="text-right">
                          <span className="text-[9px] text-text-gray block font-semibold uppercase">Total Amount</span>
                          <span className="font-extrabold text-primary text-sm">${order.total.toFixed(2)}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderModal(true);
                            }}
                            className="p-2 border border-border-gray hover:bg-light-gray text-dark rounded-lg transition-colors cursor-pointer"
                            title="View Order Details"
                          >
                            <Eye size={14} />
                          </button>

                          {["PENDING", "CONFIRMED", "PROCESSING"].includes(order.status?.toUpperCase()) && (
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowOrderModal(true);
                                setShowCancelConfirm(true);
                              }}
                              className="p-2 border border-red-100 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer"
                              title="Cancel Order"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Address Form Modal Overlay */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border-gray shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowAddressModal(false)}
              className="absolute top-4 right-4 text-text-gray hover:text-dark p-1 rounded-full hover:bg-light-gray cursor-pointer"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            <h3 className="font-extrabold text-lg text-dark tracking-wide uppercase mb-4">
              Add Shipping Address
            </h3>

            {addressError && (
              <div className="mb-4 text-xs font-semibold bg-red-50 text-red-600 p-2.5 border border-red-150 rounded">
                {addressError}
              </div>
            )}

            <form onSubmit={handleAddAddress} className="space-y-3.5 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-text-gray uppercase">Label (e.g. Home, Work)</label>
                  <select
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full border border-border-gray rounded-lg px-3 py-2 bg-light-gray"
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-text-gray uppercase">Default Address</label>
                  <div className="flex items-center h-8">
                    <input
                      type="checkbox"
                      id="default-chk"
                      checked={isDefault}
                      onChange={(e) => setIsDefault(e.target.checked)}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="default-chk" className="ml-2 font-medium text-dark cursor-pointer select-none">
                      Set as Default
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-text-gray uppercase">Recipient Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full border border-border-gray rounded-lg px-3 py-2 bg-light-gray"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-text-gray uppercase">Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="123-456-7890"
                    className="w-full border border-border-gray rounded-lg px-3 py-2 bg-light-gray"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-text-gray uppercase">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="e.g. 95014"
                    className="w-full border border-border-gray rounded-lg px-3 py-2 bg-light-gray"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-text-gray uppercase">Street Address</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. 1 Infinite Loop"
                  className="w-full border border-border-gray rounded-lg px-3 py-2 bg-light-gray"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-text-gray uppercase">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Cupertino"
                    className="w-full border border-border-gray rounded-lg px-3 py-2 bg-light-gray"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-text-gray uppercase">State / Region</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. CA"
                    className="w-full border border-border-gray rounded-lg px-3 py-2 bg-light-gray"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={addressSubmitLoading}
                className="w-full py-3 bg-primary hover:bg-primary/95 text-white font-bold rounded-lg tracking-wider transition-colors cursor-pointer disabled:opacity-75"
              >
                {addressSubmitLoading ? "SAVING..." : "SAVE ADDRESS"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal Overlay */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border-gray shadow-2xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowOrderModal(false);
                setSelectedOrder(null);
                setShowCancelConfirm(false);
                setCancelReason("");
                setCancelError("");
              }}
              className="absolute top-4 right-4 text-text-gray hover:text-dark p-1.5 rounded-full hover:bg-light-gray cursor-pointer transition-colors"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            <h3 className="font-extrabold text-lg text-dark tracking-wide uppercase mb-2">
              Order Details
            </h3>
            <p className="text-[10px] text-text-gray font-semibold mb-6">
              ORDER #: <span className="text-dark font-bold font-mono">{selectedOrder.orderNumber}</span> | PLACED ON {new Date(selectedOrder.createdAt).toLocaleDateString()}
            </p>

            {/* Cancelled Banner if cancelled */}
            {selectedOrder.status?.toUpperCase() === "CANCELLED" && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-xs">
                <div className="flex items-center space-x-2 text-red-700 font-bold uppercase tracking-wider mb-1">
                  <X size={16} className="text-red-700" />
                  <span>Order Cancelled</span>
                </div>
                <p className="text-red-600/90 font-medium">
                  This order was cancelled on {selectedOrder.cancelledAt ? new Date(selectedOrder.cancelledAt).toLocaleDateString() : new Date().toLocaleDateString()}.
                </p>
                {selectedOrder.cancelReason && (
                  <p className="text-red-700 mt-1.5 font-bold">
                    Reason: <span className="font-medium text-red-600/90">{selectedOrder.cancelReason}</span>
                  </p>
                )}
              </div>
            )}

            {/* Stepper tracking progress bar */}
            {selectedOrder.status?.toUpperCase() !== "CANCELLED" && (
              <div className="mb-8 bg-light-gray/60 border border-border-gray/30 p-5 rounded-xl">
                <h4 className="text-[10px] font-bold text-dark uppercase tracking-wider mb-4">Delivery Progress</h4>
                
                <div className="relative flex justify-between items-center w-full max-w-md mx-auto py-2">
                  {/* Connecting track line */}
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-border-gray -translate-y-1/2 z-0"></div>
                  {/* Active highlight line */}
                  <div 
                    className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-500"
                    style={{
                      width: `${(getStepIndex(selectedOrder.status) / 3) * 100}%`
                    }}
                  ></div>

                  {/* Step indicators */}
                  {["Placed", "Confirmed", "Shipped", "Delivered"].map((step, idx) => {
                    const isActive = idx <= getStepIndex(selectedOrder.status);
                    return (
                      <div key={step} className="flex flex-col items-center relative z-10">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-extrabold transition-colors duration-300 ${
                          isActive ? "bg-primary text-white" : "bg-white border-2 border-border-gray text-text-gray"
                        }`}>
                          {idx + 1}
                        </div>
                        <span className={`text-[9px] mt-1.5 font-bold ${
                          isActive ? "text-primary" : "text-text-gray"
                        }`}>{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start text-xs font-semibold">
              {/* Left Column: Items */}
              <div className="space-y-4">
                <h4 className="font-bold text-[10px] tracking-wider text-dark border-b border-border-gray pb-2 uppercase">
                  Items Ordered
                </h4>
                <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                  {selectedOrder.items?.map((item: any, index: number) => (
                    <div key={`${item.product}-${item.selectedColor || ""}-${index}`} className="flex items-center space-x-3 pb-3 border-b border-border-gray/30 last:border-0 last:pb-0">
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          loading="lazy"
                          decoding="async"
                          className="w-10 h-10 object-cover rounded bg-light-gray border border-border-gray/30 flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-dark truncate text-xs">{item.name}</h5>
                        <p className="text-[10px] text-text-gray mt-0.5">
                          Qty: {item.quantity} {item.selectedColor && `| Color: ${item.selectedColor}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-dark">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Address & Pricing Summary */}
              <div className="space-y-6">
                {/* Shipping Details */}
                <div className="space-y-2">
                  <h4 className="font-bold text-[10px] tracking-wider text-dark border-b border-border-gray pb-2 uppercase">
                    Shipping Details
                  </h4>
                  <div className="text-text-gray leading-normal text-xs font-normal">
                    <p className="font-bold text-dark">{selectedOrder.shippingAddress?.fullName}</p>
                    <p>{selectedOrder.shippingAddress?.street}</p>
                    <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode}</p>
                    <p>{selectedOrder.shippingAddress?.country || "US"}</p>
                  </div>
                </div>

                {/* Financial Totals summary */}
                <div className="space-y-2 bg-light-gray/40 p-4 rounded-xl border border-border-gray/20">
                  <h4 className="font-bold text-[10px] tracking-wider text-dark border-b border-border-gray/50 pb-2 uppercase">
                    Order Summary
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-text-gray">
                      <span>Subtotal:</span>
                      <span className="font-semibold text-dark">${selectedOrder.subtotal?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-text-gray">
                      <span>Shipping Cost:</span>
                      <span className="font-semibold text-dark">${selectedOrder.shippingCost?.toFixed(2)}</span>
                    </div>
                    {selectedOrder.discountAmount > 0 && (
                      <div className="flex justify-between text-green-600 font-semibold">
                        <span>Discount:</span>
                        <span>-${selectedOrder.discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-border-gray/50 my-1"></div>
                    <div className="flex justify-between font-bold text-sm">
                      <span className="text-dark">Total:</span>
                      <span className="text-primary font-extrabold text-base">${selectedOrder.total?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Cancel Order Action */}
                {isCancellable && (
                  <div className="border border-red-150 bg-red-50/30 rounded-xl p-4 space-y-3 mt-4">
                    {!showCancelConfirm ? (
                      <button
                        type="button"
                        onClick={() => setShowCancelConfirm(true)}
                        className="w-full py-2.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300 font-bold rounded-lg text-xs tracking-wider transition-all cursor-pointer text-center flex items-center justify-center space-x-1.5 shadow-sm"
                      >
                        <X size={14} />
                        <span>CANCEL THIS ORDER</span>
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] text-red-700 font-bold uppercase tracking-wider block">
                            Reason for Cancellation (Optional)
                          </label>
                          <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="e.g. Changed my mind, found a better price, ordered by mistake..."
                            maxLength={500}
                            rows={2}
                            className="w-full border border-red-200 focus:border-red-400 focus:ring-1 focus:ring-red-400 rounded-lg p-2.5 text-xs bg-white text-dark font-medium leading-relaxed font-sans"
                          />
                        </div>
                        {cancelError && (
                          <p className="text-[10px] text-red-600 font-bold">{cancelError}</p>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setShowCancelConfirm(false);
                              setCancelReason("");
                              setCancelError("");
                            }}
                            className="py-2 bg-white hover:bg-light-gray text-dark border border-border-gray font-bold rounded-lg text-xs transition-colors cursor-pointer"
                          >
                            NEVERMIND
                          </button>
                          <button
                            type="button"
                            disabled={cancelSubmitLoading}
                            onClick={handleCancelOrder}
                            className="py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center space-x-1"
                          >
                            {cancelSubmitLoading ? (
                              <>
                                <Loader size={12} className="animate-spin" />
                                <span>CANCELLING...</span>
                              </>
                            ) : (
                              <span>CONFIRM CANCEL</span>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
