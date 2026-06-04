"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Wrench } from "lucide-react";

export function MaintenanceWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [maintenance, setMaintenance] = useState(false);

  useEffect(() => {
    const checkMaintenance = () => {
      const isMaint = localStorage.getItem("site_maintenance_mode") === "true";
      // Never lock anyone out of the admin controls route so we can turn it off
      if (isMaint && pathname !== "/profile/admin-controls") {
        setMaintenance(true);
      } else {
        setMaintenance(false);
      }
    };
    
    checkMaintenance();
    
    // Support dynamic updates via storage events (across tabs)
    window.addEventListener("storage", checkMaintenance);
    return () => {
      window.removeEventListener("storage", checkMaintenance);
    };
  }, [pathname]);

  if (maintenance) {
    return (
      <div className="min-h-screen bg-[#F6F7F8] flex flex-col items-center justify-center text-center p-6 select-none font-sans">
        <div className="bg-white border border-[#E5E7EB] p-8 rounded-2xl shadow-xl max-w-md w-full space-y-6 flex flex-col items-center">
          <div className="p-4 bg-[#0D9589]/10 text-[#0D9589] rounded-2xl animate-bounce">
            <Wrench size={48} />
          </div>
          <h2 className="text-2xl font-extrabold text-[#22262A] tracking-wide uppercase">
            Under Maintenance
          </h2>
          <p className="text-sm text-[#8D9096] leading-relaxed">
            We are performing updates to bring you the best tech shopping experience. Please check back shortly!
          </p>
          <div className="w-full border-t border-[#E5E7EB] pt-4 flex justify-between items-center text-[10px] text-[#8D9096] font-bold uppercase tracking-wider">
            <span>Downtime: ~15 mins</span>
            <span>Status: Upgrading</span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
