"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Mail, Lock, User, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import gsap from "gsap";

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    authModalTab,
    closeAuthModal,
    setAuthModalTab,
    login,
    register,
  } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const backdropRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset fields on modal open/tab change
  useEffect(() => {
    setFormError("");
    setName("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
  }, [authModalOpen, authModalTab]);

  // GSAP animation for slide-in/fade-in
  useEffect(() => {
    if (authModalOpen) {
      document.body.style.overflow = "hidden"; // disable scrolling
      
      // Animate backdrop
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );
      
      // Animate modal container
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, scale: 0.9, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.5)" }
      );
    } else {
      document.body.style.overflow = ""; // restore scrolling
    }
  }, [authModalOpen]);

  const handleClose = useCallback(() => {
    gsap.to(containerRef.current, {
      opacity: 0,
      scale: 0.95,
      y: 15,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => {
        gsap.to(backdropRef.current, {
          opacity: 0,
          duration: 0.2,
          ease: "power2.in",
          onComplete: closeAuthModal
        });
      }
    });
  }, [closeAuthModal]);

  // Keyboard accessibility: ESC close and Focus trapping inside modal
  useEffect(() => {
    if (!authModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
        return;
      }

      if (e.key === "Tab") {
        if (!containerRef.current) return;
        
        // Find all focusable elements inside the modal container
        const focusableElements = containerRef.current.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          // Shift + Tab (backwards tabbing)
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          // Tab (forward tabbing)
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    // Store element that was focused before opening modal
    const previouslyFocusedElement = document.activeElement as HTMLElement;

    // Focus on the first input or button in the modal on open
    const focusTimeout = setTimeout(() => {
      if (containerRef.current) {
        const inputElements = containerRef.current.querySelectorAll(
          'input:not([disabled]), button:not([disabled])'
        );
        if (inputElements.length > 1) {
          // Focus the first input field (index 1 if index 0 is close button)
          const firstInput = inputElements[1] as HTMLElement;
          if (firstInput && firstInput.tagName === "INPUT") {
            firstInput.focus();
          } else {
            (inputElements[0] as HTMLElement).focus();
          }
        } else if (inputElements.length > 0) {
          (inputElements[0] as HTMLElement).focus();
        }
      }
    }, 100);

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(focusTimeout);
      // Restore focus to original element on close
      if (previouslyFocusedElement) {
        previouslyFocusedElement.focus();
      }
    };
  }, [authModalOpen, authModalTab, handleClose]);

  if (!authModalOpen) return null;

  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setFormError("");
    setLoading(true);

    try {
      await login(demoEmail, demoPass);
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || "An authentication error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setLoading(true);

    try {
      if (authModalTab === "login") {
        if (!email || !password) {
          throw new Error("All fields are required");
        }
        await login(email, password);
      } else {
        if (!name || !email || !password) {
          throw new Error("All fields are required");
        }
        if (password.length < 8) {
          throw new Error("Password must be at least 8 characters");
        }
        await register(name, email, password);
      }
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || "An authentication error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-border-gray overflow-hidden flex flex-col relative"
      >
        {/* Header decoration */}
        <div className="h-2 bg-gradient-to-r from-primary to-accent w-full" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-text-gray hover:text-dark p-1.5 rounded-full hover:bg-light-gray transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        <div className="p-8">
          {/* Title */}
          <div className="text-center mb-6">
            <h3 id="auth-modal-title" className="text-2xl font-bold text-dark tracking-tight">
              {authModalTab === "login" ? "Welcome Back" : "Create Account"}
            </h3>
            <p className="text-sm text-text-gray mt-1.5">
              {authModalTab === "login"
                ? "Sign in to access your orders, profile, and cart"
                : "Register to experience express checkout and savings"}
            </p>
          </div>

          {/* Form Error Alert */}
          {formError && (
            <div className="mb-5 flex items-start space-x-2 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs leading-relaxed animate-shake">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {authModalTab === "register" && (
              <div className="space-y-1.5">
                <label htmlFor="auth-fullname" className="text-xs font-semibold text-dark tracking-wide uppercase">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-gray">
                    <User size={16} />
                  </span>
                  <input
                    id="auth-fullname"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-4 py-2.5 bg-light-gray border border-border-gray focus:border-primary focus:bg-white rounded-lg text-sm transition-colors outline-none text-dark"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="auth-email" className="text-xs font-semibold text-dark tracking-wide uppercase">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-gray">
                  <Mail size={16} />
                </span>
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-light-gray border border-border-gray focus:border-primary focus:bg-white rounded-lg text-sm transition-colors outline-none text-dark"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="auth-password" className="text-xs font-semibold text-dark tracking-wide uppercase">
                  Password
                </label>
                {authModalTab === "login" && (
                  <button
                    type="button"
                    onClick={() => {
                      alert("Forgot password? Use developer seed to sign in or check SMTP server logic.");
                    }}
                    className="text-xs text-primary font-medium hover:underline focus:outline-none"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-gray">
                  <Lock size={16} />
                </span>
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={authModalTab === "login" ? "••••••••" : "At least 8 characters"}
                  className="w-full pl-10 pr-10 py-2.5 bg-light-gray border border-border-gray focus:border-primary focus:bg-white rounded-lg text-sm transition-colors outline-none text-dark"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-gray hover:text-dark focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary/95 active:scale-[0.99] text-white font-bold rounded-lg text-sm transition-all shadow-md flex justify-center items-center space-x-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              ) : authModalTab === "login" ? (
                <span>Sign In</span>
              ) : (
                <span>Register Account</span>
              )}
            </button>
          </form>

          {/* Quick Login Section */}
          {authModalTab === "login" && (
            <div className="mt-6">
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-border-gray"></div>
                <span className="flex-shrink mx-4 text-xs text-text-gray font-semibold uppercase tracking-wider">
                  Quick Demo Access
                </span>
                <div className="flex-grow border-t border-border-gray"></div>
              </div>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => handleQuickLogin("demo@ishop.local", "Demo@123456")}
                  className="w-full flex flex-col items-center justify-center p-3 bg-light-gray hover:bg-light-gray/80 border border-border-gray hover:border-primary/45 rounded-xl transition-all cursor-pointer text-center group active:scale-[0.98]"
                >
                  <span className="text-xs font-bold text-dark group-hover:text-primary transition-colors">
                    Demo Shopper
                  </span>
                  <span className="text-[10px] text-text-gray mt-0.5">demo@ishop.local</span>
                </button>
              </div>
            </div>
          )}

          {/* Toggle Trigger */}
          <div className="mt-6 text-center text-sm text-text-gray">
            {authModalTab === "login" ? (
              <span>
                Don't have an account?{" "}
                <button
                  onClick={() => setAuthModalTab("register")}
                  className="text-primary font-bold hover:underline cursor-pointer"
                >
                  Create one
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{" "}
                <button
                  onClick={() => setAuthModalTab("login")}
                  className="text-primary font-bold hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
