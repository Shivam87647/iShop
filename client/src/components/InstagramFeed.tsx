"use client";

import React, { useEffect, useRef } from "react";
import { Heart } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface InstaPhoto {
  id: number;
  url: string;
  likes: string;
  comments: string;
}

const instaPhotos: InstaPhoto[] = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=400&auto=format&fit=crop",
    likes: "2.4k",
    comments: "84"
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=400&auto=format&fit=crop",
    likes: "1.8k",
    comments: "42"
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=400&auto=format&fit=crop",
    likes: "3.2k",
    comments: "112"
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1588449668338-d134ae213c4f?q=80&w=400&auto=format&fit=crop",
    likes: "2.9k",
    comments: "95"
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=400&auto=format&fit=crop",
    likes: "4.1k",
    comments: "154"
  },
  {
    id: 6,
    url: "https://images.unsplash.com/photo-1622445262465-2481c4574875?q=80&w=400&auto=format&fit=crop",
    likes: "1.5k",
    comments: "28"
  }
];

export const InstagramFeed: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (containerRef.current) {
      const title = containerRef.current.querySelector(".insta-title");
      const grid = containerRef.current.querySelector(".insta-grid");

      gsap.fromTo(
        title,
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 90%"
          }
        }
      );

      if (grid) {
        gsap.fromTo(
          grid.children,
          { opacity: 0, scale: 0.95 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: grid,
              start: "top 85%"
            }
          }
        );
      }
    }
  }, []);

  return (
    <section ref={containerRef} className="w-full bg-[#F6F7F8] py-16 border-y border-border-gray/30">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
        {/* Section Header */}
        <div className="insta-title text-center mb-10 space-y-2">
          <h2 className="font-extrabold text-2xl tracking-wide uppercase text-dark">
            OUR GALLERY
          </h2>
          <p className="text-xs text-text-gray font-semibold flex items-center justify-center space-x-1.5 hover:text-primary transition-colors cursor-pointer">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="text-primary inline-block">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
            <span>@ishop_store</span>
          </p>
          <div className="w-16 h-1 bg-primary mx-auto mt-2.5 rounded-full"></div>
        </div>

        {/* Collage/Grid */}
        <div className="insta-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {instaPhotos.map((photo) => (
            <div 
              key={photo.id}
              className="relative pt-[100%] w-full rounded-lg overflow-hidden group shadow-sm bg-white border border-border-gray/20 select-none cursor-pointer"
            >
              <img 
                src={photo.url} 
                alt="Instagram layout thumbnail" 
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              
              {/* Hover overlay mask */}
              <div className="absolute inset-0 bg-primary/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white space-x-4 z-10">
                <div className="flex items-center space-x-1 text-xs font-bold">
                  <Heart size={14} className="fill-white" />
                  <span>{photo.likes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
