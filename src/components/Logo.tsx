import React from "react";
import { ShoppingBag } from "lucide-react";

export default function Logo({ className = "", iconSize = 24, textClass = "text-xl" }) {
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <div className="relative flex items-center justify-center p-2 rounded-xl bg-gradient-to-br from-brand-blue to-brand-orange shadow-[0_0_15px_rgba(0,102,204,0.4)] border border-white/10 animate-pulse">
        <ShoppingBag className="text-white" size={iconSize} />
        <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-blue to-brand-orange rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
      </div>
      <div className="flex flex-col">
        <span className={`font-orbitron font-extrabold tracking-widest leading-none text-white ${textClass}`}>
          BNY <span className="text-brand-orange drop-shadow-[0_0_8px_rgba(243,91,4,0.6)]">SHOP</span>
        </span>
        <span className="text-[9px] font-orbitron font-black uppercase tracking-[0.25em] text-zinc-400 mt-1 leading-none">
          TRUST &middot; SERVICE
        </span>
      </div>
    </div>
  );
}
