import React from "react";
import { Truck, RotateCcw, Headphones } from "lucide-react";

export const Features: React.FC = () => {
  const features = [
    {
      icon: <Truck size={36} className="text-[#FF4858]" />,
      title: "FREE SHIPPING",
      description: "Enjoy free shipping on all orders over $500. Fast and secure delivery straight to your doorstep."
    },
    {
      icon: <RotateCcw size={36} className="text-[#FFC72C]" />,
      title: "100% REFUND",
      description: "Not satisfied with your product? Return it within 30 days for a full, hassle-free refund."
    },
    {
      icon: <Headphones size={36} className="text-[#33A0FF]" />,
      title: "24/7 SUPPORT",
      description: "Our dedicated support team is available around the clock to assist you with any questions or issues."
    }
  ];

  return (
    <section className="w-full bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="flex flex-col items-center text-center p-6 bg-[#F6F7F8] hover:bg-white border border-transparent hover:border-border-gray hover:shadow-md rounded-lg transition-all duration-300 group"
            >
              {/* Icon Container */}
              <div className="p-4 bg-white rounded-full group-hover:scale-110 transition-transform duration-300 shadow-sm border border-border-gray/30 mb-5">
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="font-bold text-base text-dark tracking-wide mb-2 uppercase">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-xs text-text-gray leading-relaxed max-w-[260px]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
