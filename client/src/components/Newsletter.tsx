"use client";

import React, { useState } from "react";
import { Mail, Check } from "lucide-react";
import gsap from "gsap";

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubscribed(true);
    // Pop animation on submit
    const target = e.currentTarget;
    gsap.fromTo(target, { scale: 0.98 }, { scale: 1, duration: 0.3, ease: "back.out(2)" });
    
    setTimeout(() => {
      setSubscribed(false);
      setEmail("");
    }, 4000);
  };

  return (
    <section className="w-full bg-[#0D9589] py-16 text-white relative overflow-hidden">
      {/* Decorative vectors */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-2xl -translate-y-1/2 -translate-x-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-black/5 rounded-full blur-3xl translate-y-1/2 translate-x-1/2"></div>

      <div className="max-w-4xl mx-auto px-4 text-center relative z-10 space-y-6">
        <div className="p-3 bg-white/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto shadow-sm">
          <Mail size={22} className="text-white" />
        </div>

        <div className="space-y-2">
          <h2 className="font-extrabold text-2xl sm:text-3xl tracking-wide uppercase">
            SUBSCRIBE TO OUR NEWSLETTER
          </h2>
          <p className="text-xs sm:text-sm text-white/80 max-w-md mx-auto leading-relaxed font-semibold">
            Get the latest updates, exclusive discounts, and product announcements delivered straight to your inbox.
          </p>
        </div>

        {!subscribed ? (
          <form 
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-stretch justify-center max-w-md mx-auto gap-2.5 pt-2"
          >
            <input 
              type="email" 
              required
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-white border border-transparent rounded px-4 py-3 text-xs font-bold text-dark focus:outline-none placeholder-text-gray/70"
            />
            <button 
              type="submit"
              className="bg-dark hover:bg-black text-white px-6 py-3 rounded text-xs font-bold tracking-widest transition-colors cursor-pointer shadow-md"
            >
              SUBSCRIBE
            </button>
          </form>
        ) : (
          <div className="bg-white/10 rounded-lg p-4 max-w-sm mx-auto flex items-center justify-center space-x-2 text-xs font-bold animate-[bounce_0.5s_ease-out_forwards]">
            <Check size={16} className="text-white" />
            <span>Awesome! You have successfully subscribed to iShop newsletter.</span>
          </div>
        )}
      </div>
    </section>
  );
};
