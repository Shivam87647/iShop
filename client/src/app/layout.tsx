import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { MaintenanceWrapper } from "@/components/MaintenanceWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "iShop - Premium Apple E-Commerce",
  description: "Experience the best of Apple products, accessories, and support at iShop, the leading Apple reseller.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-[#22262A] font-sans antialiased">
        <AuthProvider>
          <CartProvider>
            <MaintenanceWrapper>
              {children}
              <AuthModal />
            </MaintenanceWrapper>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
