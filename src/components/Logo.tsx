import React from "react";
import { ShoppingBag } from "lucide-react";

export default function Logo({ className = "", iconSize = 24, textClass = "text-xl" }) {
  return (
    <div className={`flex items-center select-none ${className}`}>
      <span className={`font-orbitron font-extrabold tracking-widest leading-none text-white ${textClass}`}>
        BNY <span className="text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.85)] filter font-black">SHOP</span>
      </span>
    </div>
  );
}
