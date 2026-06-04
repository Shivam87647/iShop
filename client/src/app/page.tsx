import React from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { BestSellers } from "@/components/BestSellers";
import { PromoBanner } from "@/components/PromoBanner";
import { InstagramFeed } from "@/components/InstagramFeed";
import { LatestNews } from "@/components/LatestNews";
import { Newsletter } from "@/components/Newsletter";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <BestSellers />
        <PromoBanner />
        <InstagramFeed />
        <LatestNews />
        <Newsletter />
        <FeaturedProducts />
      </main>
      <Footer />
    </>
  );
}
