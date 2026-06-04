"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { apiRequest, setAccessToken } from "@/utils/api";

export interface Address {
  _id?: string;
  label?: string;
  fullName: string;
  phone?: string;
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country?: string;
  isDefault?: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  addresses: Address[];
  avatar?: { url: string; publicId: string };
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authModalOpen: boolean;
  authModalTab: "login" | "register";
  openAuthModal: (tab?: "login" | "register") => void;
  closeAuthModal: () => void;
  setAuthModalTab: (tab: "login" | "register") => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  addAddress: (address: Address) => Promise<void>;
  updateAddress: (addressId: string, address: Address) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
  updateProfile: (updates: { name: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");

  // Attempt silent refresh on page mount to restore logged-in sessions
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const body = await apiRequest("/auth/refresh", { method: "POST", skipAuth: true });
        if (body.data?.user) {
          setUser(body.data.user);
          setAccessToken(body.data.accessToken);
        }
      } catch {
        // Safe to ignore on mount (means no active cookie session)
        console.log("No active session restored.");
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const openAuthModal = (tab: "login" | "register" = "login") => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const login = async (email: string, password: string) => {
    const body = await apiRequest("/auth/login", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({ email, password }),
    });

    if (body.data?.user) {
      setUser(body.data.user);
      setAccessToken(body.data.accessToken);
      closeAuthModal();
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const body = await apiRequest("/auth/register", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({ name, email, password }),
    });

    if (body.data?.user) {
      setUser(body.data.user);
      setAccessToken(body.data.accessToken);
      closeAuthModal();
    }
  };

  const logout = async () => {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch (err) {
      console.warn("Logout request failed:", err);
    } finally {
      setUser(null);
      setAccessToken(null);
    }
  };

  const addAddress = async (address: Address) => {
    const body = await apiRequest("/auth/addresses", {
      method: "POST",
      body: JSON.stringify(address),
    });
    if (body.data?.addresses && user) {
      setUser({ ...user, addresses: body.data.addresses });
    }
  };

  const updateAddress = async (addressId: string, address: Address) => {
    const body = await apiRequest(`/auth/addresses/${addressId}`, {
      method: "PATCH",
      body: JSON.stringify(address),
    });
    if (body.data?.addresses && user) {
      setUser({ ...user, addresses: body.data.addresses });
    }
  };

  const deleteAddress = async (addressId: string) => {
    const body = await apiRequest(`/auth/addresses/${addressId}`, {
      method: "DELETE",
    });
    if (body.data?.addresses && user) {
      setUser({ ...user, addresses: body.data.addresses });
    }
  };

  const updateProfile = async (updates: { name: string }) => {
    const body = await apiRequest("/auth/me", {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    if (body.data?.user) {
      setUser(body.data.user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        setAuthModalTab,
        login,
        register,
        logout,
        addAddress,
        updateAddress,
        deleteAddress,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
