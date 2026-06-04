"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/utils/api";
import { Trash2, Plus, Minus, ArrowRight, ShoppingCart, Check, X } from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    cartSubtotal, 
    shippingCost, 
    couponDiscount, 
    couponCode,
    applyCoupon,
    cartTotal,
    clearCart
  } = useCart();

  const { user, openAuthModal, addAddress } = useAuth();

  const [promoInput, setPromoInput] = useState("");
  const [promoMessage, setPromoMessage] = useState<{ text: string; error: boolean } | null>(null);
  
  // Checkout modal state
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [isOrdered, setIsOrdered] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [isCustomAddress, setIsCustomAddress] = useState(true);
  const [saveToProfile, setSaveToProfile] = useState(false);
  const [billingDetails, setBillingDetails] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    zip: "",
    card: ""
  });

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    
    const success = await applyCoupon(promoInput);
    if (success) {
      setPromoMessage({ text: `Coupon "${promoInput.toUpperCase()}" applied successfully!`, error: false });
    } else {
      setPromoMessage({ text: "Invalid coupon code! Try 'ISHOP10' or 'APPLE20'.", error: true });
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billingDetails.name || !billingDetails.email || !billingDetails.address || !billingDetails.city || !billingDetails.zip) return;
    
    setOrderLoading(true);
    setOrderError("");
    try {
      // 1. Create order on the backend (reserves variant inventory)
      const body = await apiRequest("/orders", {
        method: "POST",
        body: JSON.stringify({
          shippingAddress: {
            fullName: billingDetails.name,
            email: billingDetails.email,
            street: billingDetails.address,
            city: billingDetails.city,
            postalCode: billingDetails.zip,
            country: "US"
          },
          paymentMethod: "mock",
          couponCode: couponCode || undefined
        })
      });

      const orderData = body.order || body.data?.order;
      const paymentData = body.payment || body.data?.payment;

      // 2. Capture and confirm payment
      const paymentId = paymentData?._id || orderData?.payment;
      if (paymentId) {
        await apiRequest("/orders/payments/verify", {
          method: "POST",
          body: JSON.stringify({
            paymentId
          })
        });
      }

      // 3. Save address to profile if checked
      if (saveToProfile && addAddress) {
        try {
          await addAddress({
            fullName: billingDetails.name,
            street: billingDetails.address,
            city: billingDetails.city,
            postalCode: billingDetails.zip,
            label: "Home",
            phone: "",
            isDefault: false
          });
        } catch (saveErr) {
          console.warn("Failed to auto-save address to profile:", saveErr);
        }
      }

      setIsOrdered(true);
      await clearCart();
    } catch (err: any) {
      console.error(err);
      if (err.errors?.fieldErrors) {
        const details = Object.entries(err.errors.fieldErrors)
          .map(([field, msgs]: any) => `${field}: ${msgs.join(", ")}`)
          .join(" | ");
        setOrderError(`Validation failed: ${details}`);
      } else {
        setOrderError(err.message || "Failed to place order. Please review your address details.");
      }
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      
      {/* Breadcrumb Header */}
      <div className="w-full bg-light-gray py-6 border-b border-border-gray">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <nav className="flex space-x-2 text-xs font-semibold text-text-gray uppercase tracking-wider">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <span className="text-dark">Shopping Cart</span>
          </nav>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 lg:px-8 py-12 w-full">
        <h1 className="font-extrabold text-2xl sm:text-3xl text-dark tracking-wide mb-8 uppercase">
          Shopping Cart
        </h1>

        {cart.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border-gray rounded-lg">
            <div className="p-4 bg-light-gray rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 text-text-gray">
              <ShoppingCart size={28} />
            </div>
            <h2 className="font-bold text-lg text-dark mb-2">Your cart is empty</h2>
            <p className="text-sm text-text-gray max-w-xs mx-auto mb-8">
              Looks like you haven't added anything to your cart yet. Browse our store to get started!
            </p>
            <Link 
              href="/store"
              className="inline-block bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded font-bold text-xs tracking-wider transition-colors shadow-md hover:shadow-lg"
            >
              START SHOPPING
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Cart Table List (Left Side) */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Header row (Desktop only) */}
              <div className="hidden md:grid grid-cols-6 text-[10px] font-bold text-text-gray uppercase tracking-wider pb-3 border-b border-border-gray px-4">
                <span className="col-span-3">Product</span>
                <span className="text-center">Price</span>
                <span className="text-center">Qty</span>
                <span className="text-right">Unit Total</span>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                {cart.filter((item) => item && item.product).map((item, index) => (
                  <div 
                    key={`${item.product.id || item.product._id}-${item.selectedColor || ""}-${index}`}
                    className="flex flex-col md:grid md:grid-cols-6 items-center p-4 bg-white border border-border-gray/50 rounded-lg shadow-sm hover:shadow-md transition-shadow gap-4"
                  >
                    {/* Image and Info */}
                    <div className="flex items-center space-x-4 col-span-3 w-full">
                      <Link href={`/product/${item.product.id || item.product._id}`} tabIndex={-1} aria-hidden="true" className="w-20 h-20 bg-light-gray rounded-md overflow-hidden flex-shrink-0 border border-border-gray/30">
                        <img 
                          src={item.product.image} 
                          alt="" 
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                      </Link>
                      <div className="min-w-0">
                        <Link href={`/product/${item.product.id || item.product._id}`} className="hover:text-primary transition-colors">
                          <h3 className="font-bold text-sm sm:text-base text-dark truncate">
                            {item.product.name}
                          </h3>
                        </Link>
                        {item.selectedColor && (
                          <p className="text-xs text-text-gray mt-1 flex items-center space-x-1.5">
                            <span>Color:</span>
                            <span className="font-semibold text-dark">{item.selectedColor}</span>
                          </p>
                        )}
                        <button 
                          onClick={() => removeFromCart(item.product.id || item.product._id || "")}
                          className="text-text-gray hover:text-accent flex items-center space-x-1 mt-2.5 text-xs transition-colors cursor-pointer"
                        >
                          <Trash2 size={12} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>

                    {/* Price details */}
                    <div className="flex justify-between md:justify-center items-center w-full md:w-auto text-sm">
                      <span className="md:hidden text-xs font-semibold text-text-gray">Price:</span>
                      <span className="font-semibold text-dark">${(item.product.price || 0).toFixed(2)}</span>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex justify-between md:justify-center items-center w-full md:w-auto">
                      <span className="md:hidden text-xs font-semibold text-text-gray">Quantity:</span>
                      <div className="flex items-center border border-border-gray rounded bg-light-gray overflow-hidden">
                        <button 
                          onClick={() => updateQuantity(item.product.id || item.product._id || "", item.quantity - 1)}
                          className="p-2 hover:bg-white text-dark transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-3.5 py-1 text-xs font-bold text-dark w-10 text-center select-none bg-white">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.product.id || item.product._id || "", item.quantity + 1)}
                          className="p-2 hover:bg-white text-dark transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Unit total price */}
                    <div className="flex justify-between md:justify-end items-center w-full md:w-auto text-sm">
                      <span className="md:hidden text-xs font-semibold text-text-gray">Total:</span>
                      <span className="font-bold text-primary">${((item.product.price || 0) * item.quantity).toFixed(2)}</span>
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* Cart Summary Card (Right Side) */}
            <div className="space-y-6">
              
              {/* Promo code block */}
              <div className="bg-white border border-border-gray/50 rounded-lg p-6 shadow-sm">
                <h4 className="font-bold text-sm tracking-wider text-dark mb-4 uppercase">
                  HAVE A PROMO CODE?
                </h4>
                <form onSubmit={handleApplyPromo} className="flex space-x-2">
                  <input 
                    type="text" 
                    placeholder="Coupon (e.g. ISHOP10)"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="flex-1 bg-light-gray border border-border-gray rounded px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                  />
                  <button 
                    type="submit"
                    className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded text-xs font-bold transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
                {promoMessage && (
                  <p className={`text-[11px] mt-3 font-semibold ${promoMessage.error ? "text-accent" : "text-green-600"}`}>
                    {promoMessage.text}
                  </p>
                )}
                {couponCode && !promoMessage && (
                  <p className="text-[11px] text-green-600 mt-3 font-semibold">
                    Code &ldquo;{couponCode}&rdquo; active.
                  </p>
                )}
              </div>

              {/* Order total card details */}
              <div className="bg-white border border-border-gray/50 rounded-lg p-6 shadow-sm space-y-4">
                <h4 className="font-bold text-sm tracking-wider text-dark border-b border-border-gray pb-3 mb-1 uppercase">
                  ORDER SUMMARY
                </h4>

                <div className="flex justify-between text-xs text-text-gray">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-dark">${cartSubtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-xs text-text-gray">
                  <span>Shipping Cost:</span>
                  <span className="font-semibold text-dark">
                    {shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-xs text-green-600 font-semibold">
                    <span>Discount:</span>
                    <span>-${couponDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t border-border-gray/50 my-2"></div>

                <div className="flex justify-between text-sm">
                  <span className="font-bold text-dark">Total:</span>
                  <span className="font-extrabold text-primary text-lg">${cartTotal.toFixed(2)}</span>
                </div>

                <button 
                  onClick={() => {
                    if (!user) {
                      openAuthModal("login");
                    } else {
                      // Fill in saved default address if possible
                      const defAddr = user.addresses?.find((a) => a.isDefault) || user.addresses?.[0];
                      setBillingDetails({
                        name: defAddr?.fullName || user.name || "",
                        email: user.email || "",
                        address: defAddr?.street || "",
                        city: defAddr?.city || "",
                        zip: defAddr?.postalCode || "",
                        card: ""
                      });
                      setIsCustomAddress(!defAddr);
                      setSaveToProfile(false);
                      setOrderError("");
                      setShowCheckoutModal(true);
                    }
                  }}
                  className="w-full bg-primary hover:bg-primary-hover text-white text-center py-3.5 rounded font-bold text-xs tracking-widest transition-colors flex items-center justify-center space-x-2 shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
                >
                  <span>PROCEED TO CHECKOUT</span>
                  <ArrowRight size={14} />
                </button>
              </div>

            </div>
          </div>
        )}
      </main>

      {/* Checkout Modal Overlay */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg p-8 relative max-h-[90vh] overflow-y-auto">
            
            {/* Close modal */}
            <button 
              onClick={() => {
                setShowCheckoutModal(false);
                setIsOrdered(false);
              }}
              className="absolute top-4 right-4 text-text-gray hover:text-dark p-1.5 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            {!isOrdered ? (
              <>
                <h3 className="font-extrabold text-xl text-dark tracking-wide mb-6 uppercase">
                  Checkout Billing
                </h3>
                {orderError && (
                  <div className="mb-4 text-xs font-semibold bg-red-50 text-red-600 p-3 rounded-lg leading-relaxed border border-red-200">
                    ⚠️ {orderError}
                  </div>
                )}
                <form onSubmit={handlePlaceOrder} className="space-y-4 text-xs font-semibold">
                  {user?.addresses && user.addresses.length > 0 && (
                    <div>
                      <label className="block text-text-gray mb-1">Select Shipping Address</label>
                      <select
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          if (selectedId === "custom") {
                            setBillingDetails({
                              ...billingDetails,
                              name: user.name || "",
                              address: "",
                              city: "",
                              zip: ""
                            });
                            setIsCustomAddress(true);
                          } else {
                            const addr = user.addresses.find((a) => a._id === selectedId);
                            if (addr) {
                              setBillingDetails({
                                ...billingDetails,
                                name: addr.fullName || user.name || "",
                                address: addr.street || "",
                                city: addr.city || "",
                                zip: addr.postalCode || ""
                              });
                            }
                            setIsCustomAddress(false);
                          }
                        }}
                        className="w-full border border-border-gray rounded px-4 py-2.5 bg-light-gray focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white text-xs font-semibold cursor-pointer"
                        defaultValue={user.addresses.find((a) => a.isDefault)?._id || user.addresses[0]?._id || ""}
                      >
                        {user.addresses.map((addr) => (
                          <option key={addr._id} value={addr._id}>
                            {addr.label || "Address"}: {addr.fullName} ({addr.street}, {addr.city})
                          </option>
                        ))}
                        <option value="custom">Use a different / new address</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-text-gray mb-1">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={billingDetails.name}
                      onChange={(e) => setBillingDetails({...billingDetails, name: e.target.value})}
                      placeholder="e.g. John Doe"
                      className="w-full border border-border-gray rounded px-4 py-2.5 bg-light-gray focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-text-gray mb-1">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={billingDetails.email}
                      onChange={(e) => setBillingDetails({...billingDetails, email: e.target.value})}
                      placeholder="e.g. john@example.com"
                      className="w-full border border-border-gray rounded px-4 py-2.5 bg-light-gray focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-text-gray mb-1">Delivery Address</label>
                    <input 
                      type="text" 
                      required
                      value={billingDetails.address}
                      onChange={(e) => setBillingDetails({...billingDetails, address: e.target.value})}
                      placeholder="e.g. 123 Cupertino Apple Way"
                      className="w-full border border-border-gray rounded px-4 py-2.5 bg-light-gray focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-text-gray mb-1">City</label>
                      <input 
                        type="text" 
                        required
                        value={billingDetails.city}
                        onChange={(e) => setBillingDetails({...billingDetails, city: e.target.value})}
                        placeholder="e.g. Cupertino"
                        className="w-full border border-border-gray rounded px-4 py-2.5 bg-light-gray focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-text-gray mb-1">ZIP / Postal Code</label>
                      <input 
                        type="text" 
                        required
                        value={billingDetails.zip}
                        onChange={(e) => setBillingDetails({...billingDetails, zip: e.target.value})}
                        placeholder="e.g. 95014"
                        className="w-full border border-border-gray rounded px-4 py-2.5 bg-light-gray focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-text-gray mb-1">Card Number (Visa/MC)</label>
                    <input 
                      type="text" 
                      required
                      value={billingDetails.card}
                      onChange={(e) => setBillingDetails({...billingDetails, card: e.target.value})}
                      placeholder="e.g. 4111 2222 3333 4444"
                      className="w-full border border-border-gray rounded px-4 py-2.5 bg-light-gray focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                    />
                  </div>

                  {/* Save to Profile Option */}
                  {user && isCustomAddress && (
                    <div className="flex items-center pt-2">
                      <input
                        type="checkbox"
                        id="save-to-profile"
                        checked={saveToProfile}
                        onChange={(e) => setSaveToProfile(e.target.checked)}
                        className="h-4 w-4 text-primary focus:ring-primary border-border-gray rounded cursor-pointer"
                      />
                      <label htmlFor="save-to-profile" className="ml-2 text-xs font-semibold text-dark cursor-pointer select-none">
                        Save this address to my profile shipping list
                      </label>
                    </div>
                  )}

                  <div className="pt-4 border-t border-border-gray mt-6 flex justify-between items-center">
                    <div className="text-sm">
                      <span className="text-text-gray block text-[10px]">Order Total:</span>
                      <span className="font-extrabold text-primary">${cartTotal.toFixed(2)}</span>
                    </div>
                    <button 
                      type="submit"
                      disabled={orderLoading}
                      className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded font-bold text-xs tracking-wider transition-colors shadow-md hover:shadow-lg active:scale-95 cursor-pointer disabled:opacity-75"
                    >
                      {orderLoading ? "PLACING ORDER..." : "PLACE ORDER"}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-10 space-y-6">
                <div className="p-4 bg-green-100 text-green-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 scale-0 animate-[bounce_0.6s_ease-out_forwards_0.2s]">
                  <Check size={36} />
                </div>
                <h3 className="font-extrabold text-xl text-dark uppercase tracking-wide">
                  Order Placed Successfully!
                </h3>
                <p className="text-sm text-text-gray max-w-sm mx-auto leading-relaxed">
                  Thank you, <span className="font-bold text-dark">{billingDetails.name}</span>! Your payment was processed successfully. We've sent a confirmation email to <span className="font-bold text-dark">{billingDetails.email}</span>.
                </p>
                <div className="pt-6">
                  <button 
                    onClick={() => {
                      setShowCheckoutModal(false);
                      setIsOrdered(false);
                      router.push("/profile");
                    }}
                    className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded font-bold text-xs tracking-wider transition-colors cursor-pointer"
                  >
                    GO TO PROFILE & TRACK ORDER
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
