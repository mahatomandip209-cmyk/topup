import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingCart,
  Gamepad2,
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  MessageSquare,
  ChevronLeft,
  Key
} from "lucide-react";

export interface HistorySectionProps {
  userOrders: any[];
  userDeposits: any[];
  historySubTab: "orders" | "deposits";
  setHistorySubTab: (val: "orders" | "deposits") => void;
  copyToClipboard: (text: string, type: "esewa" | "id") => void;
  setActiveSection: (sec: "home" | "wallet" | "profile" | "topup" | "history") => void;
  setProfileActiveTab: (val: "overview" | "favorites" | "notifications" | "support" | "refer" | "policies") => void;
  setSupportTopic: (val: string) => void;
  setSupportMessage: (val: string) => void;
  expandedOrder?: string | null;
  setExpandedOrder?: (val: string | null) => void;
}

export default function HistorySection({
  userOrders,
  userDeposits,
  historySubTab,
  setHistorySubTab,
  copyToClipboard,
  setActiveSection,
  setProfileActiveTab,
  setSupportTopic,
  setSupportMessage,
  expandedOrder,
  setExpandedOrder
}: HistorySectionProps) {
  const [localExpandedOrder, setLocalExpandedOrder] = useState<string | null>(null);
  const actualExpandedOrder = expandedOrder !== undefined ? expandedOrder : localExpandedOrder;
  const actualSetExpandedOrder = setExpandedOrder !== undefined ? setExpandedOrder : setLocalExpandedOrder;

  const [expandedDeposit, setExpandedDeposit] = useState<string | null>(null);

  const handleOrderInquiry = (order: any) => {
    const trackingId = `ORD-${order.id.slice(0, 8).toUpperCase()}`;
    setSupportTopic(`Inquiry about ${order.game} Order ${trackingId}`);
    setSupportMessage(
      `Hello team, I have a question regarding my order of ${order.packageName} for game ${order.game}.\nOrder ID: ${trackingId}\nPlayer UID: ${order.playerUid}\nPrice: RS ${order.price}\nStatus: ${order.status.toUpperCase()}`
    );
    // Switch to profile active section and make sure "support" tab is open!
    setProfileActiveTab("support");
    setActiveSection("profile");
  };

  return (
    <motion.div
      key="history-main"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveSection("home")}
            className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Go back to Home"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-red-600" />
            <h2 className="font-orbitron text-xl font-bold tracking-wide text-white uppercase">Order History</h2>
          </div>
        </div>
      </div>

      {/* Sub-tab selection filters */}
      <div className="flex border-b border-zinc-900 bg-zinc-950/40 p-1 rounded-xl gap-1.5 border">
        <button
          onClick={() => setHistorySubTab("orders")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            historySubTab === "orders"
              ? "bg-red-600 text-white shadow-[0_0_10px_rgba(255,0,0,0.2)] font-extrabold"
              : "text-zinc-500 hover:text-zinc-400 hover:bg-zinc-900/20"
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span>Game Orders ({userOrders.length})</span>
        </button>
        <button
          onClick={() => setHistorySubTab("deposits")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            historySubTab === "deposits"
              ? "bg-red-600 text-white shadow-[0_0_10px_rgba(255,0,0,0.2)] font-extrabold"
              : "text-zinc-500 hover:text-zinc-400 hover:bg-zinc-900/20"
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Deposits ({userDeposits.length})</span>
        </button>
      </div>

      {/* Main lists */}
      <div className="space-y-4">
        {historySubTab === "orders" ? (
          userOrders.length === 0 ? (
            <div className="text-center py-20 bg-[#121212]/30 rounded-2xl border border-zinc-900/60 space-y-3">
              <Gamepad2 className="w-12 h-12 text-zinc-800 mx-auto" />
              <p className="text-zinc-500 text-xs font-medium">No game top-up orders found.</p>
              <button
                onClick={() => setActiveSection("home")}
                className="px-5 py-2.5 bg-red-950/20 border border-red-900/40 hover:bg-red-900/20 text-red-500 hover:text-white rounded-lg text-xs font-extrabold uppercase transition-all cursor-pointer"
              >
                Order Instant Credits
              </button>
            </div>
          ) : (
            userOrders.map((order) => {
              const trackingId = `GAM-${order.id.slice(0, 6).toUpperCase()}`;
              const isVoucher = order.category === "voucher_code" || (order.voucher_codes && order.voucher_codes.length > 0);

              return (
                <div
                  key={order.id}
                  className="bg-white border border-zinc-200/80 rounded-3xl p-5 space-y-4 shadow-sm hover:shadow-md transition-all duration-300 text-zinc-950"
                >
                  {/* Top Section: Order ID, Game Name, Product Name, Qty & Status Pill */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1 min-w-0">
                      {/* Order ID with Copy button */}
                      <div className="font-mono text-[11px] font-extrabold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                        <span>{trackingId}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(trackingId);
                            alert(`Copied Order ID: ${trackingId}`);
                          }}
                          className="text-zinc-400 hover:text-blue-600 transition-colors cursor-pointer p-0.5 rounded hover:bg-zinc-100 inline-flex items-center justify-center"
                          title="Copy Order ID"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Game Name */}
                      <h4 className="font-sans font-bold text-xs text-blue-600 tracking-wide uppercase">
                        {order.game}
                      </h4>

                      {/* Product Name */}
                      <h3 className="font-sans font-extrabold text-base text-zinc-900 tracking-tight">
                        {order.packageName}
                      </h3>

                      {/* Quantity & Type */}
                      <p className="text-zinc-500 font-medium text-xs">
                        Qty: {order.quantity || 1} &bull; {order.category === "voucher_code" ? "wallet" : "direct topup"}
                      </p>
                    </div>

                    {/* Status Pill on Top Right */}
                    <div className="flex-shrink-0">
                      {order.status === "approved" ? (
                        <span className="inline-flex items-center justify-center px-4 py-1.5 text-[10px] font-extrabold text-blue-600 bg-blue-50 border border-blue-100 rounded-full tracking-wider uppercase">
                          COMPLETED
                        </span>
                      ) : order.status === "rejected" ? (
                        <span className="inline-flex items-center justify-center px-4 py-1.5 text-[10px] font-extrabold text-red-600 bg-red-50 border border-red-100 rounded-full tracking-wider uppercase">
                          REJECTED
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center px-4 py-1.5 text-[10px] font-extrabold text-amber-600 bg-amber-50 border border-amber-100 rounded-full tracking-wider uppercase animate-pulse">
                          PENDING
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle Section: Voucher Box (if approved & codes exist) OR Requirements Area */}
                  {order.status === "approved" && order.voucher_codes && order.voucher_codes.length > 0 ? (
                    /* Voucher Code Box */
                    <div className="border border-emerald-500/20 bg-emerald-50/50 rounded-2xl p-4 space-y-3">
                      {/* Voucher Box Header */}
                      <div className="flex justify-between items-center border-b border-emerald-500/10 pb-2">
                        <span className="text-[11px] text-emerald-700 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                          <Key className="w-3.5 h-3.5 text-emerald-600" />
                          YOUR VOUCHER CODE{order.voucher_codes.length > 1 ? `S (${order.voucher_codes.length})` : ""}
                        </span>
                        {order.voucher_codes.length > 1 && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(order.voucher_codes.join("\n"));
                              alert("All voucher codes copied to clipboard!");
                            }}
                            className="text-[10px] text-emerald-600 hover:text-emerald-800 font-bold uppercase tracking-wider underline cursor-pointer"
                          >
                            COPY ALL
                          </button>
                        )}
                      </div>

                      {/* Voucher Code Rows */}
                      <div className="space-y-2">
                        {order.voucher_codes.map((code: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2.5">
                            {/* Index Badge */}
                            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs flex-shrink-0">
                              {idx + 1}
                            </div>

                            {/* Code Text Box */}
                            <div className="flex-1 min-w-0 bg-white border border-zinc-200/80 rounded-xl px-3.5 py-2 text-zinc-900 font-mono text-xs font-bold tracking-wide shadow-sm truncate select-all">
                              {code}
                            </div>

                            {/* Copy button */}
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(code);
                                alert("Voucher code copied: " + code);
                              }}
                              className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-colors cursor-pointer shadow-sm flex-shrink-0"
                              title="Copy Voucher Code"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Show Order Requirements for custom categories, or if pending/rejected */
                    (() => {
                      const standardKeys = [
                        "orderId",
                        "userOrderId",
                        "userId",
                        "userName",
                        "userEmail",
                        "game",
                        "gameId",
                        "packageName",
                        "price",
                        "quantity",
                        "status",
                        "timestamp",
                        "voucher_codes",
                        "id",
                        "category"
                      ];
                      const customFields = Object.entries(order).filter(
                        ([key]) => !standardKeys.includes(key)
                      );

                      if (customFields.length === 0) return null;

                      return (
                        <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 space-y-3">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block border-b border-zinc-200/50 pb-1.5">
                            📝 Submitted Information
                          </span>
                          <div className="grid grid-cols-1 gap-2">
                            {customFields.map(([key, val]: [string, any]) => {
                              const formattedKey = key
                                .replace(/([A-Z])/g, ' $1')
                                .replace(/[_-]/g, ' ')
                                .trim()
                                .replace(/^\w/, (c) => c.toUpperCase());

                              const displayVal = typeof val === "object" ? JSON.stringify(val) : String(val);

                              return (
                                <div key={key} className="bg-white border border-zinc-200/60 p-2.5 px-3.5 rounded-xl font-mono text-xs flex justify-between items-center gap-4 shadow-sm">
                                  <div className="space-y-0.5 min-w-0 flex-1">
                                    <span className="text-[9px] text-zinc-400 block uppercase font-bold">{formattedKey}</span>
                                    <span className="text-zinc-950 font-extrabold tracking-wide break-all">{displayVal}</span>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigator.clipboard.writeText(displayVal);
                                      alert(`${formattedKey} copied: ${displayVal}`);
                                    }}
                                    className="text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer p-1.5 hover:bg-zinc-100 rounded-lg shrink-0"
                                    title={`Copy ${formattedKey}`}
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()
                  )}

                  {/* Bottom Section: Footer (Price & Date/Time) */}
                  <div className="flex justify-between items-center border-t border-zinc-100 pt-3 text-xs">
                    <div className="font-sans font-extrabold text-blue-600 text-sm">
                      NPR {Number(order.price).toLocaleString()}
                    </div>
                    <div className="text-zinc-400 text-[11px] font-medium">
                      {new Date(order.timestamp).toLocaleString("en-US", {
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                        second: "numeric",
                        hour12: true
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )
        ) : (
          userDeposits.length === 0 ? (
            <div className="text-center py-20 bg-[#121212]/30 rounded-2xl border border-zinc-900/60 space-y-3">
              <Wallet className="w-12 h-12 text-zinc-800 mx-auto" />
              <p className="text-zinc-500 text-xs font-medium">No deposit logs registered.</p>
              <button
                onClick={() => setActiveSection("wallet")}
                className="px-5 py-2.5 bg-red-950/20 border border-red-900/40 hover:bg-red-900/20 text-red-500 hover:text-white rounded-lg text-xs font-extrabold uppercase transition-all cursor-pointer"
              >
                Submit Deposit Proof
              </button>
            </div>
          ) : (
            userDeposits.map((dep) => {
              const isExpanded = expandedDeposit === dep.id;

              return (
                <div
                  key={dep.id}
                  className={`bg-[#121212]/40 border rounded-2xl overflow-hidden transition-all duration-300 ${
                    isExpanded ? "border-emerald-600/50 shadow-[0_0_15px_rgba(16,185,129,0.05)] bg-[#121212]/80" : "border-zinc-900 hover:border-zinc-800"
                  }`}
                >
                  {/* Summary Item Header */}
                  <div
                    onClick={() => setExpandedDeposit(isExpanded ? null : dep.id)}
                    className="p-4 flex justify-between items-center gap-4 cursor-pointer select-none"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="bg-emerald-950/40 text-emerald-500 font-extrabold px-2 py-0.5 rounded text-[9px] tracking-wide border border-emerald-900/40 uppercase">
                          ESEWA
                        </span>
                        <span className="text-white font-bold text-xs truncate">Ref ID: {dep.trx}</span>
                      </div>
                      <div className="font-mono text-zinc-500 text-[10px]">
                        {dep.senderName ? `Sender: ${dep.senderName} • ` : ""}Date: {new Date(dep.timestamp).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1.5 flex-shrink-0">
                      <p className="font-mono font-bold text-emerald-500 text-xs">RS {dep.amount}</p>

                      {dep.status === "approved" ? (
                        <span className="flex items-center gap-1 text-emerald-500 text-[9px] font-bold uppercase tracking-wider">
                          <CheckCircle2 className="w-3.5 h-3.5" /> APPROVED
                        </span>
                      ) : dep.status === "rejected" ? (
                        <span className="flex items-center gap-1 text-red-500 text-[9px] font-bold uppercase tracking-wider">
                          <XCircle className="w-3.5 h-3.5" /> REJECTED
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-500 text-[9px] font-bold uppercase tracking-wider animate-pulse">
                          <Clock className="w-3.5 h-3.5" /> VERIFYING
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dropdown Body */}
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-zinc-900/80 bg-black/40 p-4 space-y-3.5 text-xs font-mono"
                    >
                      <div className="grid grid-cols-2 gap-3 bg-[#0c0c0c] p-3 rounded-xl border border-zinc-900">
                        <div>
                          <span className="text-[10px] text-zinc-500 block uppercase font-bold">Transaction Code</span>
                          <span className="text-white font-bold tracking-wide">{dep.trx}</span>
                        </div>
                        {dep.senderName && (
                          <div>
                            <span className="text-[10px] text-zinc-500 block uppercase font-bold">Sender Name</span>
                            <span className="text-white font-bold truncate block">{dep.senderName}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-[10px] text-zinc-500 block uppercase font-bold">Loaded Points</span>
                          <span className="text-emerald-500 font-extrabold text-xs">RS {dep.amount}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-500 block uppercase font-bold">Logged Date</span>
                          <span className="text-zinc-300 text-[11px] block truncate">
                            {new Date(dep.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {dep.proofImage && (
                        <div className="bg-[#0c0c0c] p-3 rounded-xl border border-zinc-900 text-center space-y-2">
                          <span className="text-[10px] text-zinc-500 block uppercase font-bold">Your Uploaded Proof</span>
                          <div className="flex justify-center">
                            <img
                              src={dep.proofImage}
                              alt="Uploaded Proof"
                              className="max-h-48 rounded border border-zinc-800 object-contain"
                            />
                          </div>
                        </div>
                      )}

                      <div className="bg-[#121212]/80 border border-zinc-900 p-3 rounded-xl text-[11px] leading-relaxed text-zinc-400">
                        {dep.status === "approved" ? (
                          <p>
                            ✓ <strong className="text-emerald-500">Verification complete!</strong> RS {dep.amount} points have been credited to your profile balance instantly. Thank you for using BNY Topup gateway.
                          </p>
                        ) : dep.status === "rejected" ? (
                          <p>
                            ✗ <strong className="text-red-500">Verification failed.</strong> This deposit slip was rejected because our billing team could not trace the eSewa code or sender coordinates. Please verify your screenshot proof or contact support.
                          </p>
                        ) : (
                          <p>
                            ⌛ <strong className="text-amber-500">Verification in progress...</strong> Our manual auditing desk is cross-checking this transaction against our eSewa statement. Estimated verification time is usually 5-30 minutes.
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })
          )
        )}
      </div>
    </motion.div>
  );
}
