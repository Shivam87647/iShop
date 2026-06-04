import React from "react";
import Link from "next/link";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#EBF6FF] text-[#22262A] pt-16 pb-8 border-t border-[#D3ECFF]">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Footer Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-2xl text-primary tracking-tight">iShop</h3>
            <p className="text-xs text-[#22262A]/70 leading-relaxed max-w-xs">
              iShop is a clean and modern design template for premium Apple reseller store, offering the latest and greatest Apple gadgets with exceptional customer support and global shipping.
            </p>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm tracking-wider text-dark">FOLLOW US</h4>
            <p className="text-xs text-[#22262A]/70 leading-relaxed max-w-xs">
              Stay updated with our latest offers, announcements, and guides. Follow us on our social platforms.
            </p>
            <div className="flex space-x-4 pt-2">
              <Link href="#" className="p-2 bg-white rounded-full text-[#3B5998] hover:scale-110 transition-transform shadow-sm flex items-center justify-center w-8 h-8" aria-label="Facebook">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/>
                </svg>
              </Link>
              <Link href="#" className="p-2 bg-white rounded-full text-[#1DA1F2] hover:scale-110 transition-transform shadow-sm flex items-center justify-center w-8 h-8" aria-label="Twitter">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </Link>
              <Link href="#" className="p-2 bg-white rounded-full text-[#E1306C] hover:scale-110 transition-transform shadow-sm flex items-center justify-center w-8 h-8" aria-label="Instagram">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </Link>
              <Link href="#" className="p-2 bg-white rounded-full text-[#FF0000] hover:scale-110 transition-transform shadow-sm flex items-center justify-center w-8 h-8" aria-label="Youtube">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.525 3.545 12 3.545 12 3.545s-7.525 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.025 0 12 0 12s0 3.975.502 5.837a3.003 3.003 0 002.11 2.11c1.863.508 9.388.508 9.388.508s7.525 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.975 24 12 24 12s0-3.975-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </Link>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm tracking-wider text-dark">CONTACT US</h4>
            <div className="text-xs text-[#22262A]/70 space-y-2 leading-relaxed">
              <p>iShop Store - Cupertino Office</p>
              <p>One Apple Park Way, Cupertino, CA 95014</p>
              <p>Phone: +1 (800) MY-APPLE</p>
              <p>Email: support@ishop-reseller.com</p>
            </div>
          </div>

          {/* Useful Links */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm tracking-wider text-dark">INFORMATION</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-[#22262A]/70">
              <Link href="#" className="hover:text-primary transition-colors">About Us</Link>
              <Link href="#" className="hover:text-primary transition-colors">Find a Store</Link>
              <Link href="#" className="hover:text-primary transition-colors">Shipping Info</Link>
              <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-primary transition-colors">Return Policy</Link>
              <Link href="#" className="hover:text-primary transition-colors">FAQ</Link>
              <Link href="#" className="hover:text-primary transition-colors">Contact Support</Link>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#D3ECFF] my-8"></div>

        {/* Footer Bottom Row */}
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 text-xs text-[#22262A]/60">
          <div>
            &copy; {new Date().getFullYear()} iShop E-Commerce. All Rights Reserved. Designed by Apple Reseller.
          </div>
          
          {/* Payment Badges (SVG) */}
          <div className="flex space-x-2">
            {/* Visa */}
            <div className="w-10 h-6 bg-white rounded flex items-center justify-center font-bold text-blue-900 text-[10px] shadow-sm select-none">
              VISA
            </div>
            {/* Mastercard */}
            <div className="w-10 h-6 bg-white rounded flex items-center justify-center font-bold text-red-600 text-[9px] shadow-sm select-none">
              MC
            </div>
            {/* Paypal */}
            <div className="w-10 h-6 bg-white rounded flex items-center justify-center font-bold text-blue-600 italic text-[9px] shadow-sm select-none">
              PayPal
            </div>
            {/* Western Union */}
            <div className="w-10 h-6 bg-white rounded flex items-center justify-center font-bold text-yellow-600 text-[8px] shadow-sm select-none text-center leading-none">
              WU
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
