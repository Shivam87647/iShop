import React from "react";
import Link from "next/link";
import { blogPosts } from "@/data/blogs";

export const LatestNews: React.FC = () => {
  return (
    <section className="w-full bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="font-extrabold text-2xl sm:text-3xl text-dark tracking-wide uppercase">
            LATEST NEWS
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto mt-3 rounded-full"></div>
        </div>

        {/* Blog Post Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <article 
              key={post.id}
              className="bg-white border border-[#F6F7F8] hover:border-border-gray hover:shadow-lg rounded-lg overflow-hidden transition-all duration-300 flex flex-col group h-full"
            >
              {/* Post Image */}
              <div className="relative pt-[60%] w-full overflow-hidden bg-light-gray select-none">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Post Content */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  {/* Date & Read time */}
                  <div className="flex items-center space-x-3 text-[10px] font-bold text-text-gray tracking-wider uppercase mb-3">
                    <span>{post.date}</span>
                    <span className="w-1 h-1 bg-text-gray/50 rounded-full"></span>
                    <span>{post.readTime}</span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-sm sm:text-base text-dark hover:text-primary transition-colors leading-snug line-clamp-2 mb-3">
                    <Link href="#">
                      {post.title}
                    </Link>
                  </h3>

                  {/* Excerpt */}
                  <p className="text-xs text-text-gray leading-relaxed line-clamp-3 mb-4">
                    {post.excerpt}
                  </p>
                </div>

                {/* Footer read link */}
                <div className="border-t border-border-gray/50 pt-4 mt-2 flex justify-between items-center text-xs">
                  <span className="font-semibold text-dark">By {post.author}</span>
                  <Link 
                    href="#" 
                    className="font-bold text-primary hover:text-primary-hover tracking-wider uppercase flex items-center space-x-1"
                  >
                    <span>Read More</span>
                    <span className="transition-transform group-hover:translate-x-1 duration-200">-&gt;</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
