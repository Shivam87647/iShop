"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import gsap from "gsap";

const slides = [
  {
    id: 0,
    badge: "Super Value Deals",
    title: "On All Apple Products",
    subtitle: "Save more with coupons & up to 70% off!",
    desc: "Experience premium performance and design with our exclusive discounts on MacBooks, iPhones, iPads, and original Apple accessories.",
    btnLink: "/store",
    btnText: "SHOP NOW",
    bgColor: "#E0F2F1", 
    gradient: "linear-gradient(135deg, #E0F2F1 0%, #B2DFDB 100%)",
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=800&auto=format&fit=crop",
    imgAlt: "iShop Selection",
  },
  {
    id: 1,
    badge: "Next-Gen Performance",
    title: "MacBook Pro M-Series",
    subtitle: "Ultimate powerhouse for creative professionals.",
    desc: "Built with cutting-edge Apple Silicon chips. Experience double the battery life, stunning Liquid Retina XDR displays, and unparalleled performance.",
    btnLink: "/store?category=mac",
    btnText: "EXPLORE MAC",
    bgColor: "#ECEFF1", 
    gradient: "linear-gradient(135deg, #ECEFF1 0%, #CFD8DC 100%)",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop",
    imgAlt: "MacBook Pro",
  },
  {
    id: 2,
    badge: "Intelligent Workspaces",
    title: "iPad Pro with M-Chip",
    subtitle: "Completely redesigned. Powerfully mobile.",
    desc: "Supercharged by M-chips. Features the thinnest design, an advanced Tandem OLED display, and full compatibility with Apple Pencil Pro.",
    btnLink: "/store?category=ipad",
    btnText: "ORDER IPAD",
    bgColor: "#E8EAF6", 
    gradient: "linear-gradient(135deg, #E8EAF6 0%, #C5CAE9 100%)",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800&auto=format&fit=crop",
    imgAlt: "iPad Pro",
  }
];

export const Hero: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imgContainerRef = useRef<HTMLDivElement>(null);

  const handleNext = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Autoplay mechanism
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(timer);
  }, [activeSlide]);

  // GSAP animation when activeSlide changes
  useEffect(() => {
    if (textRef.current && imgContainerRef.current) {
      const textChildren = textRef.current.children;
      const img = imgContainerRef.current;

      const tl = gsap.timeline();

      // Reset states
      gsap.set(textChildren, { opacity: 0, y: 20 });
      gsap.set(img, { opacity: 0, scale: 0.93, rotate: -1.5 });

      // Animate text elements staggered
      tl.to(textChildren, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out"
      });

      // Animate image container pop
      tl.to(img, {
        opacity: 1,
        scale: 1,
        rotate: 0,
        duration: 0.6,
        ease: "back.out(1.2)"
      }, "<0.1");
    }
  }, [activeSlide]);

  const current = slides[activeSlide];

  return (
    <section 
      ref={heroRef}
      className="w-full h-[480px] sm:h-[520px] md:h-[580px] lg:h-[620px] flex items-center overflow-hidden relative select-none transition-all duration-[1000ms] ease-in-out"
      style={{ background: current.gradient }}
    >
      {/* Background vector details with smooth rotation */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 w-full flex flex-col md:flex-row items-center justify-between py-8 md:py-0 relative z-10">
        
        {/* Left: Headline & Text Details */}
        <div 
          ref={textRef}
          className="w-full md:w-1/2 text-center md:text-left space-y-4 md:space-y-5 order-2 md:order-1 mt-6 md:mt-0"
        >
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-full inline-block">
            {current.badge}
          </span>
          <h1 className="font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-dark leading-tight">
            {current.title}
          </h1>
          <h2 className="font-bold text-lg sm:text-xl lg:text-2xl text-dark/85">
            {current.subtitle}
          </h2>
          <p className="text-xs sm:text-sm text-text-gray max-w-sm mx-auto md:mx-0 leading-relaxed font-normal">
            {current.desc}
          </p>
          <div className="pt-2">
            <Link 
              href={current.btnLink}
              className="inline-block bg-primary hover:bg-primary-hover text-white px-8 py-3.5 rounded font-bold text-xs tracking-wider transition-all duration-300 shadow-md active:scale-95 cursor-pointer"
            >
              {current.btnText}
            </Link>
          </div>
        </div>

        {/* Right: Product Image Mockup */}
        <div 
          ref={imgContainerRef}
          className="w-full md:w-1/2 flex justify-center items-center order-1 md:order-2 h-1/2 md:h-full relative px-4 md:px-0"
        >
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-[420px] lg:h-[420px] rounded-full bg-white/40 flex items-center justify-center p-6 shadow-sm border border-white/50 transition-all duration-500 hover:shadow-md">
            <img 
              src={current.image} 
              alt={current.imgAlt} 
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="max-w-[85%] max-h-[85%] object-cover rounded-lg shadow-2xl hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </div>

      {/* Side Navigation Buttons (Arrows) */}
      <button 
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/40 hover:bg-white/70 text-dark border border-white/50 transition-all shadow-sm hover:scale-110 active:scale-95 cursor-pointer z-20"
        aria-label="Previous Slide"
      >
        <ChevronLeft size={20} />
      </button>
      <button 
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/40 hover:bg-white/70 text-dark border border-white/50 transition-all shadow-sm hover:scale-110 active:scale-95 cursor-pointer z-20"
        aria-label="Next Slide"
      >
        <ChevronRight size={20} />
      </button>

      {/* Slider Indicator dots (representing the active slide) */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex space-x-2.5 z-20">
        {slides.map((slide, idx) => (
          <button
            key={slide.id}
            onClick={() => setActiveSlide(idx)}
            className={`transition-all duration-300 cursor-pointer ${
              activeSlide === idx 
                ? "w-6 h-2 bg-primary rounded-full" 
                : "w-2 h-2 bg-text-gray/30 hover:bg-text-gray/60 rounded-full"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};
