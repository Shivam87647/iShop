"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const PromoBanner: React.FC = () => {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (gridRef.current) {
      const cards = gridRef.current.children;
      gsap.fromTo(
        cards,
        { opacity: 0, y: 30, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 85%",
          }
        }
      );
    }
  }, []);

  return (
    <section className="w-full bg-white py-12">
      <div 
        ref={gridRef}
        className="max-w-7xl mx-auto px-4 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {/* Left Card: Free Shipping (Teal Background) */}
        <div className="bg-[#0D9589] rounded-xl overflow-hidden p-8 flex flex-col md:flex-row justify-between items-center h-[280px] hover:shadow-lg transition-shadow relative group">
          <div className="space-y-3 text-white max-w-xs text-center md:text-left relative z-10">
            <span className="text-[9px] font-bold uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-full">
              Delivery Benefit
            </span>
            <h3 className="font-extrabold text-2xl tracking-wide leading-tight">
              FREE SHIPPING
            </h3>
            <h4 className="font-semibold text-xs tracking-wider uppercase text-white/90">
              On all orders over $500.
            </h4>
            <p className="text-xs leading-relaxed text-white/70 font-normal">
              Enjoy fast, reliable, and secure worldwide shipping directly to your doorstep at no additional charge.
            </p>
            <div className="pt-2">
              <Link 
                href="/store"
                className="inline-block bg-white text-[#0D9589] hover:bg-slate-100 px-5 py-2 rounded text-[10px] font-bold tracking-widest transition-colors shadow-sm cursor-pointer"
              >
                ORDER NOW
              </Link>
            </div>
          </div>
          {/* Mockup delivery illustration on the right */}
          <div className="hidden sm:block w-36 h-36 md:w-44 md:h-44 relative z-10 transition-transform duration-500 group-hover:scale-105">
            <img 
              src="https://images.unsplash.com/photo-1595246140625-573b715d11dc?q=80&w=400&auto=format&fit=crop" 
              alt="Free Shipping Delivery Courier" 
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover rounded-lg shadow-md border border-white/10 select-none"
            />
          </div>
        </div>

        {/* Right Card: New Arrivals (Light Grey Background) */}
        <div className="bg-[#F6F7F8] border border-[#E5E7EB] rounded-xl overflow-hidden p-8 flex flex-col md:flex-row justify-between items-center h-[280px] hover:shadow-lg transition-shadow relative group">
          <div className="space-y-3 text-dark max-w-xs text-center md:text-left relative z-10">
            <span className="text-[9px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-2.5 py-1 rounded-full">
              Hot Collection
            </span>
            <h3 className="font-extrabold text-2xl tracking-wide leading-tight">
              NEW ARRIVALS
            </h3>
            <h4 className="font-semibold text-xs tracking-wider uppercase text-text-gray">
              Check out the latest tech.
            </h4>
            <p className="text-xs leading-relaxed text-text-gray font-normal">
              Get your hands on the newly released MacBooks, iPhones, and original accessories with exclusive launch offers.
            </p>
            <div className="pt-2">
              <Link 
                href="/store"
                className="inline-block bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded text-[10px] font-bold tracking-widest transition-colors shadow-sm cursor-pointer"
              >
                SHOP COLLECTION
              </Link>
            </div>
          </div>
          {/* MacBook/iPad illustration on the right */}
          <div className="hidden sm:block w-36 h-36 md:w-44 md:h-44 relative z-10 transition-transform duration-500 group-hover:scale-105">
            <img 
              src="https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=400&auto=format&fit=crop" 
              alt="MacBook Air New Arrival" 
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover rounded-lg shadow-md border border-border-gray/30 select-none"
            />
          </div>
        </div>

      </div>
    </section>
  );
};
