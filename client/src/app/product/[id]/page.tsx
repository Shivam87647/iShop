import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { products } from "@/data/products";
import { ProductClient } from "./ProductClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }));
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);

  if (!product) {
    notFound();
  }

  // Find related products of the same category, excluding the current one
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <>
      <Navbar />
      
      {/* Breadcrumbs */}
      <div className="w-full bg-light-gray py-6 border-b border-border-gray">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <nav className="flex space-x-2 text-xs font-semibold text-text-gray uppercase tracking-wider">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link href="/store" className="hover:text-primary transition-colors">Store</Link>
            <span>/</span>
            <Link href={`/store?category=${product.category}`} className="hover:text-primary transition-colors">{product.category}</Link>
            <span>/</span>
            <span className="text-dark truncate max-w-[120px] sm:max-w-none">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Main product wrapper - delegates to Client Component */}
      <main className="flex-1 max-w-7xl mx-auto px-4 lg:px-8 py-12 w-full">
        <ProductClient product={product} relatedProducts={relatedProducts} />
      </main>

      <Footer />
    </>
  );
}
