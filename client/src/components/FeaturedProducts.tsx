import React from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { products } from "@/data/products";

export const FeaturedProducts: React.FC = () => {
  // Select distinct products for each column list
  const featured = products.slice(0, 3);
  const bestRated = products.filter(p => p.rating === 5).slice(0, 3);
  const specialOffers = products.filter(p => p.originalPrice !== undefined).slice(0, 3);

  const ProductItem: React.FC<{ product: typeof products[0] }> = ({ product }) => (
    <div className="flex items-center space-x-4 py-3 border-b border-border-gray/40 last:border-b-0 hover:bg-light-gray/30 px-2 rounded-md transition-colors">
      <Link href={`/product/${product.id}`} tabIndex={-1} aria-hidden="true" className="w-16 h-16 flex-shrink-0 bg-[#F6F7F8] rounded-md overflow-hidden relative border border-border-gray/30">
        <img 
          src={product.image} 
          alt="" 
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
        />
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/product/${product.id}`} className="hover:text-primary transition-colors block">
          <h4 className="font-bold text-xs sm:text-sm text-dark truncate">
            {product.name}
          </h4>
        </Link>
        {/* Rating */}
        <div className="flex items-center space-x-0.5 mt-1 mb-1.5">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={10} 
              className={i < product.rating ? "fill-[#FFC72C] text-[#FFC72C]" : "text-[#D1D5DB]"}
            />
          ))}
        </div>
        {/* Price */}
        <div className="flex items-center space-x-2">
          <span className="font-bold text-xs text-dark">${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-[10px] text-text-gray line-through">${product.originalPrice.toFixed(2)}</span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <section className="w-full bg-white pb-16 pt-4">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Column 1: Featured Products */}
          <div>
            <h3 className="font-bold text-sm tracking-wider text-dark border-b border-border-gray pb-3 mb-4 uppercase">
              FEATURED PRODUCTS
            </h3>
            <div className="space-y-1">
              {featured.map((product) => (
                <ProductItem key={`feat-${product.id}`} product={product} />
              ))}
            </div>
          </div>

          {/* Column 2: Best Rated */}
          <div>
            <h3 className="font-bold text-sm tracking-wider text-dark border-b border-border-gray pb-3 mb-4 uppercase">
              TOP RATED
            </h3>
            <div className="space-y-1">
              {bestRated.map((product) => (
                <ProductItem key={`rated-${product.id}`} product={product} />
              ))}
            </div>
          </div>

          {/* Column 3: Special Offers */}
          <div>
            <h3 className="font-bold text-sm tracking-wider text-dark border-b border-border-gray pb-3 mb-4 uppercase">
              SPECIAL OFFERS
            </h3>
            <div className="space-y-1">
              {specialOffers.map((product) => (
                <ProductItem key={`offer-${product.id}`} product={product} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
