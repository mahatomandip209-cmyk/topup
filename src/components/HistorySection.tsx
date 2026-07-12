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
  ChevronLeft
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
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 no-scrollbar">
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
              const trackingId = `ORD-${order.id.slice(0, 8).toUpperCase()}`;

              return (
                <div
                  key={order.id}
                  className="bg-[#121212]/60 border border-zinc-900/80 hover:border-red-600/30 rounded-2xl overflow-hidden transition-all duration-300 shadow-[0_0_15px_rgba(255,0,0,0.02)]"
                >
                  {/* Summary Item Header */}
                  <div className="p-4 flex justify-between items-center gap-4 border-b border-zinc-900/60 bg-[#161616]/40 select-none">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-red-950/40 text-red-500 font-extrabold px-2 py-0.5 rounded text-[9px] tracking-wide border border-red-900/40 uppercase">
                          {order.game}
                        </span>
                        <span className="text-white font-bold text-xs truncate">{order.packageName}</span>
                      </div>
                      <div className="font-mono text-zinc-500 text-[10px] flex items-center gap-1.5 flex-wrap">
                        <span>ID: {trackingId}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(trackingId);
                            alert(`Copied Order ID: ${trackingId}`);
                          }}
                          className="text-zinc-500 hover:text-white transition-colors cursor-pointer p-0.5 rounded hover:bg-zinc-900 inline-flex items-center justify-center"
                          title="Copy Order ID"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <span>&bull; {new Date(order.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1.5 flex-shrink-0">
                      <p className="font-mono font-bold text-white text-xs">RS {order.price}</p>

                      {order.status === "approved" ? (
                        <span className="flex items-center gap-1 text-emerald-500 text-[9px] font-bold uppercase tracking-wider bg-emerald-950/30 border border-emerald-900/40 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5" /> COMPLETED
                        </span>
                      ) : order.status === "rejected" ? (
                        <span className="flex items-center gap-1 text-red-500 text-[9px] font-bold uppercase tracking-wider bg-red-950/30 border border-red-900/40 px-2 py-0.5 rounded">
                          <XCircle className="w-3.5 h-3.5" /> REJECTED
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-500 text-[9px] font-bold uppercase tracking-wider animate-pulse bg-amber-950/30 border border-amber-900/40 px-2 py-0.5 rounded">
                          <Clock className="w-3.5 h-3.5 animate-spin" /> PENDING
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Detailed Body - Always Visible */}
                  <div className="p-4 space-y-4 text-xs">
                    {/* Key Details Grid */}
                    {(() => {
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
                        "id"
                      ];
                      const customFields = Object.entries(order).filter(
                        ([key]) => !standardKeys.includes(key)
                      );

                      return (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-3 bg-[#0c0c0c] p-3 rounded-xl border border-zinc-900 font-mono">
                            <div>
                              <span className="text-[10px] text-zinc-500 block uppercase font-bold">Game/Service Name</span>
                              <span className="text-white font-bold">{order.game}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-zinc-500 block uppercase font-bold">Product Package</span>
                              <span className="text-white font-bold">{order.packageName}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-zinc-500 block uppercase font-bold">Amount Paid</span>
                              <span className="text-red-500 font-extrabold">RS {order.price}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-zinc-500 block uppercase font-bold">Quantity Ordered</span>
                              <span className="text-emerald-500 font-extrabold">{order.quantity || 1} Pcs</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-[10px] text-zinc-500 block uppercase font-bold">Purchase Date</span>
                              <span className="text-zinc-300 text-[11px]">
                                {new Date(order.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* Dynamically Render Order Requirements only if they exist */}
                          {customFields.length > 0 && (
                            <div className="bg-[#0c0c0c]/90 border border-zinc-900 p-4 rounded-xl space-y-2.5">
                              <span className="text-[10px] text-zinc-400 font-orbitron font-extrabold uppercase tracking-widest block">📝 Filed Requirements</span>
                              <div className="grid grid-cols-1 gap-2.5">
                                {customFields.map(([key, val]: [string, any]) => {
                                  const formattedKey = key
                                    .replace(/([A-Z])/g, ' $1')
                                    .replace(/[_-]/g, ' ')
                                    .trim()
                                    .replace(/^\w/, (c) => c.toUpperCase());
                                  
                                  const displayVal = typeof val === "object" ? JSON.stringify(val) : String(val);

                                  return (
                                    <div key={key} className="bg-black/40 border border-zinc-900/80 p-2.5 px-3.5 rounded-xl font-mono text-xs flex justify-between items-center gap-4">
                                      <div className="space-y-0.5 min-w-0 flex-1">
                                        <span className="text-[9px] text-zinc-500 block uppercase font-bold">{formattedKey}</span>
                                        <span className="text-white font-extrabold tracking-wide break-all">{displayVal}</span>
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigator.clipboard.writeText(displayVal);
                                          alert(`${formattedKey} copied: ${displayVal}`);
                                        }}
                                        className="text-zinc-500 hover:text-white transition-colors cursor-pointer p-1.5 hover:bg-zinc-900 rounded-lg shrink-0"
                                        title={`Copy ${formattedKey}`}
                                      >
                                        <Copy className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Render Voucher Codes if available */}
                    {order.voucher_codes && order.voucher_codes.length > 0 && (
                      <div className="bg-[#0c0c0c]/90 border border-zinc-900 p-4 rounded-xl space-y-2.5">
                        <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                          <span className="text-[10px] text-zinc-400 font-orbitron font-extrabold uppercase tracking-widest block">⚡ Your Delivered Voucher Code(s)</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(order.voucher_codes.join("\n"));
                              alert("All voucher codes copied to clipboard!");
                            }}
                            className="text-[10px] bg-red-950/20 hover:bg-red-900/30 text-red-500 font-bold uppercase py-1 px-2.5 rounded-lg border border-red-900/30 transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" /> Copy All
                          </button>
                        </div>
                        <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 no-scrollbar">
                          {order.voucher_codes.map((code: string, idx: number) => (
                            <div key={idx} className="flex justify-between items-center bg-black/40 border border-zinc-900/85 p-2.5 px-3.5 rounded-xl font-mono text-xs">
                              <span className="text-white select-all tracking-wider font-bold">{code}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(code);
                                  alert("Voucher code copied: " + code);
                                }}
                                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                                title="Copy Code"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Custom Visual Steps Progress Tracker */}
                    <div className="space-y-2">
                      <span className="text-[9px] text-zinc-500 block uppercase font-bold tracking-wider">
                        Delivery Status Track
                      </span>
                      <div className="grid grid-cols-3 gap-1 relative pt-2">
                        {/* Line connector background */}
                        <div className="absolute top-4 left-[16.66%] right-[16.66%] h-0.5 bg-zinc-900 -z-10"></div>
                        <div
                          className={`absolute top-4 left-[16.66%] h-0.5 bg-red-600 -z-10 transition-all duration-500`}
                          style={{
                            width: order.status === "approved" ? "66.66%" : order.status === "rejected" ? "66.66%" : "33.33%"
                          }}
                        ></div>

                        {/* Step 1: Placed */}
                        <div className="text-center space-y-1">
                          <div className="w-4.5 h-4.5 rounded-full bg-red-600 text-white font-mono text-[9px] font-bold flex items-center justify-center mx-auto shadow-[0_0_8px_rgba(239,68,68,0.4)]">
                            1
                          </div>
                          <span className="text-[9px] text-zinc-400 font-semibold block uppercase">Placed</span>
                        </div>

                        {/* Step 2: Verification */}
                        <div className="text-center space-y-1">
                          <div
                            className={`w-4.5 h-4.5 rounded-full font-mono text-[9px] font-bold flex items-center justify-center mx-auto transition-colors ${
                              order.status !== "pending"
                                ? "bg-red-600 text-white shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                                : "bg-zinc-950 text-amber-500 border border-amber-600/60 animate-pulse"
                            }`}
                          >
                            2
                          </div>
                          <span className="text-[9px] text-zinc-400 font-semibold block uppercase">Verifying</span>
                        </div>

                        {/* Step 3: Result */}
                        <div className="text-center space-y-1">
                          <div
                            className={`w-4.5 h-4.5 rounded-full font-mono text-[9px] font-bold flex items-center justify-center mx-auto transition-colors ${
                              order.status === "approved"
                                ? "bg-emerald-600 text-white shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                                : order.status === "rejected"
                                ? "bg-red-600 text-white"
                                : "bg-zinc-950 text-zinc-600 border border-zinc-900"
                            }`}
                          >
                            {order.status === "approved" ? "✓" : order.status === "rejected" ? "✗" : "3"}
                          </div>
                          <span className="text-[9px] text-zinc-400 font-semibold block uppercase">
                            {order.status === "approved" ? "Completed" : order.status === "rejected" ? "Failed" : "Delivery"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status explanation & Action Buttons */}
                    <div className="bg-[#121212]/80 border border-zinc-900 p-3 rounded-xl space-y-2 text-[11px] leading-relaxed text-zinc-400">
                      {order.status === "approved" && (
                        <p>
                          🏆 <strong className="text-emerald-500">Delivered Successfully!</strong> The game credits have been dispatched directly to your player identification count. Please open or restart your game to reflect the updated diamonds/UC.
                        </p>
                      )}
                      {order.status === "rejected" && (
                        <p>
                          ⚠️ <strong className="text-red-500">Order Rejected.</strong> Our team was unable to process this order. The paid points have been restored to your profile balance. Please verify your UID coordinates and order details again.
                        </p>
                      )}
                      {order.status === "pending" && (
                        <p>
                          ⌛ <strong className="text-amber-500">Processing...</strong> Our verification staff is confirming your purchase order queue. Estimated delivery time is 5 to 15 minutes.
                        </p>
                      )}

                      <div className="flex gap-2 pt-1 font-bold">
                        <button
                          onClick={() => handleOrderInquiry(order)}
                          className="flex-1 bg-red-950/20 hover:bg-red-900/30 text-red-500 hover:text-white border border-red-900/30 py-1.5 rounded-lg text-[10px] uppercase transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3" /> Ask Support Team
                        </button>
                        <button
                          onClick={() => copyToClipboard(trackingId, "id")}
                          className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 py-1.5 px-3 rounded-lg text-[10px] uppercase transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Copy className="w-3 h-3" /> Copy Ref ID
                        </button>
                      </div>
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
