import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User as UserIcon,
  LogOut,
  Key,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Coins,
  ShoppingCart,
  Heart,
  Gift,
  Bell,
  HelpCircle,
  Settings,
  FileText,
  RotateCcw,
  XCircle,
  ShieldCheck,
  MessageSquare,
  Send,
  Loader2,
  Gamepad2,
  Wallet,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  DollarSign
} from "lucide-react";
import { UserData } from "../types";

export interface ProfileSectionProps {
  userData: (UserData & { avatarId?: string }) | null;
  userOrders: any[];
  userDeposits: any[];
  systemNotifications: any[];
  userTickets: any[];
  supportTopic: string;
  setSupportTopic: (val: string) => void;
  supportMessage: string;
  setSupportMessage: (val: string) => void;
  loading: boolean;
  submitSupportTicket: (e: React.FormEvent) => void;
  openEditModal: () => void;
  setPassModal: (val: boolean) => void;
  handleLogout: () => void;
  copyToClipboard: (text: string, type: string) => void;
  copiedId: boolean;
  setActiveSection: (sec: "home" | "wallet" | "profile" | "topup") => void;
  openTopup: (game: "Free Fire" | "PUBG Mobile") => void;
  historySubTab: "orders" | "deposits";
  setHistorySubTab: (val: "orders" | "deposits") => void;
}

export default function ProfileSection({
  userData,
  userOrders,
  userDeposits,
  systemNotifications,
  userTickets,
  supportTopic,
  setSupportTopic,
  supportMessage,
  setSupportMessage,
  loading,
  submitSupportTicket,
  openEditModal,
  setPassModal,
  handleLogout,
  copyToClipboard,
  copiedId,
  setActiveSection,
  openTopup,
  historySubTab,
  setHistorySubTab
}: ProfileSectionProps) {
  const [profileSubView, setProfileSubView] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {profileSubView === null ? (
          <motion.div
            key="profile-menu"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            {/* Header with back button */}
            <div className="flex items-center gap-3 border-b border-zinc-900 pb-4 mb-2">
              <button
                onClick={() => setActiveSection("home")}
                className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-red-600" />
                <h2 className="font-orbitron text-xl font-bold tracking-wide text-white">Profile</h2>
              </div>
            </div>

            {/* Profile Info Header Card (from screenshot) */}
            <div className="bg-gradient-to-b from-zinc-900/60 to-black rounded-3xl border border-zinc-800/80 p-6 flex items-center justify-between gap-4 relative overflow-hidden shadow-lg">
              <div className="flex items-center gap-4 min-w-0">
                {/* Circle user icon */}
                <div className="w-16 h-16 rounded-full border-2 border-red-600/60 flex items-center justify-center bg-red-950/20 text-red-500 relative flex-shrink-0">
                  <UserIcon className="w-8 h-8" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-orbitron font-extrabold text-lg text-white tracking-wide truncate">
                    {userData?.name ?? "Guest Gamer"}
                  </h3>
                  <p className="text-zinc-500 text-xs font-mono truncate">{userData?.email ?? "guest@bnytopup.com"}</p>
                  
                  {/* Points display */}
                  <div className="flex items-center gap-1.5 text-red-500 font-bold text-xs mt-1 bg-red-950/30 px-2.5 py-0.5 rounded-full w-fit border border-red-900/20">
                    <Coins className="w-3.5 h-3.5" />
                    <span>{userData?.balance ?? 0} Points</span>
                  </div>
                </div>
              </div>

              {/* Edit button */}
              <button
                onClick={() => setProfileSubView("settings")}
                className="p-3 bg-red-950/20 hover:bg-red-900/30 text-red-500 hover:text-white rounded-2xl border border-red-900/20 transition-all cursor-pointer flex-shrink-0"
                title="Edit Profile"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>

            {/* Main Options list (from screenshot) */}
            <div className="space-y-3">
              {/* Store Points */}
              <div
                onClick={() => setActiveSection("wallet")}
                className="group bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/80 hover:border-red-600/30 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all duration-300"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-red-950/30 text-red-500 flex items-center justify-center flex-shrink-0 border border-red-900/20">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm tracking-wide">Store Points</h4>
                    <p className="text-zinc-500 text-xs">Balance: RS {userData?.balance ?? 0}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-red-500 transition-colors" />
              </div>

              {/* My Orders */}
              <div
                onClick={() => {
                  setHistorySubTab("orders");
                  setProfileSubView("orders");
                }}
                className="group bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/80 hover:border-red-600/30 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all duration-300"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-zinc-950/50 text-zinc-400 flex items-center justify-center flex-shrink-0 border border-zinc-800/60">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm tracking-wide">My Orders</h4>
                    <p className="text-zinc-500 text-xs">Track your purchases</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-red-500 transition-colors" />
              </div>

              {/* Favorites */}
              <div
                onClick={() => setProfileSubView("favorites")}
                className="group bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/80 hover:border-red-600/30 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all duration-300"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-zinc-950/50 text-zinc-400 flex items-center justify-center flex-shrink-0 border border-zinc-800/60">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm tracking-wide">Favorites</h4>
                    <p className="text-zinc-500 text-xs">Your favorite games</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-red-500 transition-colors" />
              </div>

              {/* Notifications */}
              <div
                onClick={() => setProfileSubView("notifications")}
                className="group bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/80 hover:border-red-600/30 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all duration-300"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-zinc-950/50 text-zinc-400 flex items-center justify-center flex-shrink-0 border border-zinc-800/60">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm tracking-wide">Notifications</h4>
                    <p className="text-zinc-500 text-xs">Stay updated</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-red-500 transition-colors" />
              </div>

              {/* Support Chat */}
              <div
                onClick={() => setProfileSubView("support")}
                className="group bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/80 hover:border-red-600/30 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all duration-300"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-zinc-950/50 text-zinc-400 flex items-center justify-center flex-shrink-0 border border-zinc-800/60">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm tracking-wide">Support Chat</h4>
                    <p className="text-zinc-500 text-xs">Chat with our team</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-red-500 transition-colors" />
              </div>

              {/* Refer & Earn */}
              <div
                onClick={() => setProfileSubView("refer")}
                className="group bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/80 hover:border-red-600/30 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all duration-300"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-zinc-950/50 text-zinc-400 flex items-center justify-center flex-shrink-0 border border-zinc-800/60">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm tracking-wide">Refer & Earn</h4>
                    <p className="text-zinc-500 text-xs">Share with friends & earn rewards</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-red-500 transition-colors" />
              </div>

              {/* Settings */}
              <div
                onClick={() => setProfileSubView("settings")}
                className="group bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/80 hover:border-red-600/30 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all duration-300"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-zinc-950/50 text-zinc-400 flex items-center justify-center flex-shrink-0 border border-zinc-800/60">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm tracking-wide">Settings</h4>
                    <p className="text-zinc-500 text-xs">App preferences</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-red-500 transition-colors" />
              </div>

              {/* LEGAL HEADER */}
              <div className="pt-4 pb-1 pl-1">
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest pl-2">Legal</span>
              </div>

              <div className="bg-[#0b0b0b] border border-zinc-900 rounded-2xl overflow-hidden divide-y divide-zinc-900">
                {/* Terms & Conditions */}
                <div
                  onClick={() => setProfileSubView("terms")}
                  className="group hover:bg-zinc-900/30 p-4 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-zinc-500 group-hover:text-red-500 transition-colors" />
                    <span className="text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors">Terms & Conditions</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-red-500 transition-colors" />
                </div>

                {/* Refund Policy */}
                <div
                  onClick={() => setProfileSubView("refund")}
                  className="group hover:bg-zinc-900/30 p-4 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <RotateCcw className="w-4 h-4 text-zinc-500 group-hover:text-red-500 transition-colors" />
                    <span className="text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors">Refund Policy</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-red-500 transition-colors" />
                </div>

                {/* Cancellation Policy */}
                <div
                  onClick={() => setProfileSubView("cancellation")}
                  className="group hover:bg-zinc-900/30 p-4 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <XCircle className="w-4 h-4 text-zinc-500 group-hover:text-red-500 transition-colors" />
                    <span className="text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors">Cancellation Policy</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-red-500 transition-colors" />
                </div>

                {/* Privacy Policy */}
                <div
                  onClick={() => setProfileSubView("privacy")}
                  className="group hover:bg-zinc-900/30 p-4 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-zinc-500 group-hover:text-red-500 transition-colors" />
                    <span className="text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors">Privacy Policy</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-red-500 transition-colors" />
                </div>
              </div>

              {/* Logout button */}
              <div
                onClick={handleLogout}
                className="group bg-red-950/10 hover:bg-red-950/20 border border-red-950/40 hover:border-red-900/60 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all duration-300 mt-6"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-red-950/30 text-red-500 flex items-center justify-center flex-shrink-0 border border-red-900/20">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-red-500 text-sm tracking-wide">Logout</h4>
                    <p className="text-red-900/80 text-xs">Sign out of your account</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-red-900/60 group-hover:text-red-500 transition-colors" />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={profileSubView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* SUB-VIEWS MANAGER */}
            {profileSubView === "orders" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
                  <button
                    onClick={() => setProfileSubView(null)}
                    className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="font-orbitron text-xl font-bold tracking-wide text-white">My Orders</h2>
                </div>

                <div className="flex gap-2 border-b border-zinc-900 pb-2">
                  <button
                    onClick={() => setHistorySubTab("orders")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      historySubTab === "orders"
                        ? "bg-red-600 text-white shadow-[0_0_10px_rgba(255,0,0,0.2)]"
                        : "text-zinc-500 hover:text-zinc-400 bg-zinc-950/50 border border-zinc-900"
                    }`}
                  >
                    🎮 Topup Orders ({userOrders.length})
                  </button>
                  <button
                    onClick={() => setHistorySubTab("deposits")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      historySubTab === "deposits"
                        ? "bg-red-600 text-white shadow-[0_0_10px_rgba(255,0,0,0.2)]"
                        : "text-zinc-500 hover:text-zinc-400 bg-zinc-950/50 border border-zinc-900"
                    }`}
                  >
                    💳 Wallet Deposits ({userDeposits.length})
                  </button>
                </div>

                {historySubTab === "orders" ? (
                  <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1 no-scrollbar">
                    {userOrders.length === 0 ? (
                      <div className="text-center py-10 bg-[#121212]/50 rounded-xl border border-zinc-900 space-y-2">
                        <Gamepad2 className="w-8 h-8 text-zinc-800 mx-auto" />
                        <p className="text-zinc-500 text-xs">No game top-up orders found.</p>
                        <button
                          onClick={() => {
                            setActiveSection("home");
                            setProfileSubView(null);
                          }}
                          className="text-red-500 hover:underline font-bold text-xs uppercase cursor-pointer"
                        >
                          Order Instant Credits
                        </button>
                      </div>
                    ) : (
                      userOrders.map((order) => (
                        <div
                          key={order.id}
                          className="bg-[#121212]/50 border border-zinc-900 p-4 rounded-xl flex justify-between items-center gap-4 text-xs hover:border-red-900/40 transition-colors"
                        >
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="bg-red-950/40 text-red-500 font-bold px-2 py-0.5 rounded text-[9px] tracking-wide border border-red-900/40">
                                {order.game}
                              </span>
                              <span className="text-white font-bold">{order.packageName}</span>
                            </div>
                            <div className="font-mono text-zinc-400 space-y-0.5 text-[11px]">
                              <p className="truncate"><span className="text-zinc-600">Player UID:</span> {order.playerUid}</p>
                              <p className="text-[10px] text-zinc-600">
                                {new Date(order.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="text-right space-y-1.5 flex-shrink-0">
                            <p className="font-mono font-bold text-white text-sm">RS {order.price}</p>
                            {order.status === "approved" ? (
                              <span className="flex items-center gap-1 justify-end text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
                                <CheckCircle2 className="w-3.5 h-3.5" /> DELIVERED
                              </span>
                            ) : order.status === "rejected" ? (
                              <span className="flex items-center gap-1 justify-end text-red-500 text-[10px] font-bold uppercase tracking-wider">
                                <XCircle className="w-3.5 h-3.5" /> REJECTED
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 justify-end text-amber-500 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                                <Clock className="w-3.5 h-3.5 animate-spin" /> PENDING
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1 no-scrollbar">
                    {userDeposits.length === 0 ? (
                      <div className="text-center py-10 bg-[#121212]/50 rounded-xl border border-zinc-900 space-y-2">
                        <Wallet className="w-8 h-8 text-zinc-800 mx-auto" />
                        <p className="text-zinc-500 text-xs">No deposit logs registered.</p>
                        <button
                          onClick={() => {
                            setActiveSection("wallet");
                            setProfileSubView(null);
                          }}
                          className="text-red-500 hover:underline font-bold text-xs uppercase cursor-pointer"
                        >
                          Submit deposit proof
                        </button>
                      </div>
                    ) : (
                      userDeposits.map((dep) => (
                        <div
                          key={dep.id}
                          className="bg-[#121212]/50 border border-zinc-900 p-4 rounded-xl flex justify-between items-center gap-4 text-xs hover:border-emerald-900/40 transition-colors"
                        >
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="bg-emerald-950/40 text-emerald-500 font-bold px-2 py-0.5 rounded text-[9px] tracking-wide border border-emerald-900/40">
                                ESEWA
                              </span>
                              <span className="text-zinc-500 font-mono text-[10px] truncate">
                                ID: {dep.trx}
                              </span>
                            </div>
                            <div className="font-mono text-zinc-400 space-y-0.5 text-[11px]">
                              <p className="truncate"><span className="text-zinc-600">Sender:</span> {dep.senderName}</p>
                              <p className="text-[10px] text-zinc-600">
                                {new Date(dep.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="text-right space-y-1.5 flex-shrink-0">
                            <p className="font-mono font-bold text-emerald-500 text-sm">RS {dep.amount}</p>
                            {dep.status === "approved" ? (
                              <span className="flex items-center gap-1 justify-end text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
                                <CheckCircle2 className="w-3.5 h-3.5" /> APPROVED
                              </span>
                            ) : dep.status === "rejected" ? (
                              <span className="flex items-center gap-1 justify-end text-red-500 text-[10px] font-bold uppercase tracking-wider">
                                <XCircle className="w-3.5 h-3.5" /> REJECTED
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 justify-end text-amber-500 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                                <Clock className="w-3.5 h-3.5" /> VERIFYING
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {profileSubView === "favorites" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
                  <button
                    onClick={() => setProfileSubView(null)}
                    className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="font-orbitron text-xl font-bold tracking-wide text-white">Favorites</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() => {
                      openTopup("Free Fire");
                      setProfileSubView(null);
                    }}
                    className="group bg-[#121212] rounded-2xl overflow-hidden border border-zinc-900 hover:border-red-600 transition-all duration-300 cursor-pointer p-4 flex flex-col items-center text-center gap-3"
                  >
                    <div className="w-16 h-16 rounded-full overflow-hidden border border-zinc-800 bg-black p-1">
                      <img
                        src="https://i.ibb.co/My1kJfTy/IMG-20260302-211532.jpg"
                        alt="Free Fire"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="font-bold text-sm text-white group-hover:text-red-500 transition-colors">Free Fire</p>
                    <span className="text-[10px] text-red-500 font-bold bg-red-950/30 px-2 py-0.5 rounded-full border border-red-900/20">Buy diamonds</span>
                  </div>

                  <div
                    onClick={() => {
                      openTopup("PUBG Mobile");
                      setProfileSubView(null);
                    }}
                    className="group bg-[#121212] rounded-2xl overflow-hidden border border-zinc-900 hover:border-red-600 transition-all duration-300 cursor-pointer p-4 flex flex-col items-center text-center gap-3"
                  >
                    <div className="w-16 h-16 rounded-full overflow-hidden border border-zinc-800 bg-black p-1">
                      <img
                        src="https://i.ibb.co/jPZjCShd/IMG-20260302-211625.jpg"
                        alt="PUBG Mobile"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="font-bold text-sm text-white group-hover:text-red-500 transition-colors">PUBG Mobile</p>
                    <span className="text-[10px] text-red-500 font-bold bg-red-950/30 px-2 py-0.5 rounded-full border border-red-900/20">Buy UC Cash</span>
                  </div>
                </div>
              </div>
            )}

            {profileSubView === "notifications" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
                  <button
                    onClick={() => setProfileSubView(null)}
                    className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="font-orbitron text-xl font-bold tracking-wide text-white">Notifications</h2>
                </div>

                <div className="space-y-3.5 max-h-[450px] overflow-y-auto pr-1 no-scrollbar">
                  {systemNotifications.length === 0 ? (
                    <p className="text-zinc-600 text-xs italic text-center py-10 bg-zinc-900/20 rounded-xl border border-zinc-900">
                      No notices registered at the moment.
                    </p>
                  ) : (
                    systemNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="bg-[#121212]/60 border border-zinc-900 hover:border-zinc-800 p-4 rounded-xl space-y-2.5 transition-all relative overflow-hidden"
                      >
                        {notif.type === "warning" && <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>}
                        {notif.type === "news" && <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>}
                        {notif.type === "info" && <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>}

                        <div className="flex justify-between items-start gap-4">
                          <h5 className="font-bold text-white text-xs tracking-wide flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping"></span>
                            {notif.title}
                          </h5>
                          <span className="text-[9px] font-mono text-zinc-500 flex-shrink-0">
                            {new Date(notif.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-zinc-400 text-[11px] leading-relaxed font-mono">{notif.body}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {profileSubView === "support" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
                  <button
                    onClick={() => setProfileSubView(null)}
                    className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="font-orbitron text-xl font-bold tracking-wide text-white">Support Chat</h2>
                </div>

                <form onSubmit={submitSupportTicket} className="bg-[#121212]/75 border border-zinc-900 p-5 rounded-2xl space-y-4">
                  <div>
                    <h4 className="font-orbitron font-bold text-red-500 text-xs uppercase tracking-widest border-b border-zinc-900 pb-2">
                      CREATE SUPPORT TICKET
                    </h4>
                    <p className="text-[10px] text-zinc-500 mt-1">Submit dynamic claims to verification team</p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-1 uppercase tracking-wider">Inquiry Subject</label>
                      <input
                        type="text"
                        placeholder="e.g. UC package not received"
                        value={supportTopic}
                        onChange={(e) => setSupportTopic(e.target.value)}
                        className="w-full bg-black border border-zinc-800 text-white placeholder-zinc-700 px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-red-600 transition-all font-mono text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-1 uppercase tracking-wider">Detailed Message</label>
                      <textarea
                        placeholder="Provide exact details such as transaction ID, UID number, etc."
                        value={supportMessage}
                        rows={3}
                        onChange={(e) => setSupportMessage(e.target.value)}
                        className="w-full bg-black border border-zinc-800 text-white placeholder-zinc-700 px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-red-600 transition-all text-xs leading-relaxed"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-red-600 hover:bg-red-500 transition-all text-white font-bold py-2.5 rounded-lg text-xs tracking-wider cursor-pointer border border-red-500 flex items-center justify-center gap-1.5"
                    >
                      {loading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          SUBMIT HELP TICKET
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <div className="space-y-3">
                  <h4 className="font-orbitron font-bold text-zinc-500 text-[10px] uppercase tracking-widest pl-1">TICKET HISTORY ({userTickets.length})</h4>
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
                    {userTickets.length === 0 ? (
                      <p className="text-zinc-600 text-[11px] italic text-center py-6 bg-[#121212]/30 rounded-xl border border-zinc-900">
                        No previous support logs recorded.
                      </p>
                    ) : (
                      userTickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          className="bg-[#121212]/50 border border-zinc-900 p-3 rounded-xl text-xs space-y-2 hover:border-zinc-800 transition-colors"
                        >
                          <div className="flex justify-between items-center gap-4">
                            <span className="font-bold text-white truncate font-orbitron">{ticket.topic}</span>
                            {ticket.status === "resolved" ? (
                              <span className="bg-emerald-950/40 text-emerald-500 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-emerald-900/40">
                                RESOLVED
                              </span>
                            ) : (
                              <span className="bg-amber-950/40 text-amber-500 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-amber-900/40 animate-pulse">
                                OPEN
                              </span>
                            )}
                          </div>
                          <p className="text-zinc-400 text-[11px] leading-relaxed font-mono bg-black/40 p-2.5 rounded-lg border border-zinc-900">{ticket.message}</p>
                          <div className="flex justify-between items-center text-[10px] text-zinc-600 font-mono pt-1">
                            <span>Ref ID: #{ticket.id.slice(1, 6).toUpperCase()}</span>
                            <span>{new Date(ticket.timestamp).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {profileSubView === "refer" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
                  <button
                    onClick={() => setProfileSubView(null)}
                    className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="font-orbitron text-xl font-bold tracking-wide text-white">Refer & Earn</h2>
                </div>

                <div className="bg-[#121212] border border-zinc-900 rounded-2xl p-6 text-center space-y-4">
                  <Gift className="w-12 h-12 text-red-500 mx-auto animate-bounce" />
                  <div className="space-y-1">
                    <h4 className="font-orbitron font-bold text-white uppercase tracking-wider">Share BNY & Earn</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Invite your gamer friends to join BNY TOPUP. You'll receive 50 Points for every friend who creates an account and completes an order!
                    </p>
                  </div>

                  <div className="bg-black border border-zinc-800 rounded-xl p-3 flex justify-between items-center text-xs font-mono mt-2">
                    <span className="text-red-500 font-bold truncate pr-3">
                      https://bnytopup.com/ref/{userData?.uniqueId || "PLAYER"}
                    </span>
                    <button
                      onClick={() => copyToClipboard(`https://bnytopup.com/ref/${userData?.uniqueId || "PLAYER"}`, "id")}
                      className="bg-red-950/30 hover:bg-red-900/40 p-2 rounded-lg text-red-500 cursor-pointer transition-all border border-red-900/20"
                    >
                      {copiedId ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  {copiedId && <p className="text-[10px] text-emerald-500 font-bold">Referral link copied!</p>}
                </div>
              </div>
            )}

            {profileSubView === "settings" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
                  <button
                    onClick={() => setProfileSubView(null)}
                    className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="font-orbitron text-xl font-bold tracking-wide text-white">Settings</h2>
                </div>

                <div className="bg-[#121212] border border-zinc-900 p-5 rounded-2xl space-y-4 shadow-sm">
                  <h4 className="font-orbitron font-bold text-red-500 text-xs uppercase tracking-widest border-b border-zinc-900 pb-2">
                    SECURITY & PREFERENCES
                  </h4>

                  <div className="space-y-3.5">
                    <button
                      onClick={openEditModal}
                      className="w-full bg-black hover:bg-zinc-900/60 border border-zinc-800 hover:border-zinc-750 transition-all text-white text-xs font-bold py-3.5 rounded-xl tracking-wide flex items-center justify-between px-4 cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-red-500" />
                        CHANGE DISPLAY NAME
                      </span>
                      <span className="text-zinc-500 font-mono text-[10px]">{userData?.name} &rarr;</span>
                    </button>

                    <button
                      onClick={() => setPassModal(true)}
                      className="w-full bg-black hover:bg-zinc-900/60 border border-zinc-800 hover:border-zinc-750 transition-all text-white text-xs font-bold py-3.5 rounded-xl tracking-wide flex items-center justify-between px-4 cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-red-500" />
                        CHANGE ACCESS PASSWORD
                      </span>
                      <span className="text-zinc-500 font-mono text-[10px]">Secure &rarr;</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {profileSubView === "terms" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
                  <button
                    onClick={() => setProfileSubView(null)}
                    className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="font-orbitron text-lg font-bold tracking-wide text-white">Terms & Conditions</h2>
                </div>

                <div className="bg-[#121212] border border-zinc-900 rounded-2xl p-5 space-y-4 text-xs text-zinc-400 leading-relaxed max-h-[400px] overflow-y-auto no-scrollbar">
                  <h3 className="font-bold text-white text-sm">1. ACCEPTANCE OF TERMS</h3>
                  <p>By registering on BNY TOPUP, you acknowledge and agree that you have read, understood, and accept all policies outlined on our platform.</p>
                  
                  <h3 className="font-bold text-white text-sm">2. IN-GAME CREDITS AND DELIVERIES</h3>
                  <p>We supply official credits including Garena Free Fire Diamonds and PUBG Mobile UC. The exact Player UID must be supplied; BNY is not responsible for credits misrouted due to incorrect player numbers entered by users.</p>

                  <h3 className="font-bold text-white text-sm">3. USER ACCOUNT SECURITY</h3>
                  <p>Users are responsible for maintaining the privacy and security of their custom accounts, unique identification codes, and verification records.</p>
                </div>
              </div>
            )}

            {profileSubView === "refund" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
                  <button
                    onClick={() => setProfileSubView(null)}
                    className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="font-orbitron text-lg font-bold tracking-wide text-white">Refund Policy</h2>
                </div>

                <div className="bg-[#121212] border border-zinc-900 rounded-2xl p-5 space-y-4 text-xs text-zinc-400 leading-relaxed">
                  <h3 className="font-bold text-white text-sm">FINAL AND NON-REFUNDABLE DELIVERIES</h3>
                  <p>All virtual product purchases, topup orders, and credit recharges are instantly or manually processed through official APIs. Once game credits (Diamonds/UC) have been successfully delivered or credited to your player identification number, they are completely final and non-refundable.</p>
                  
                  <h3 className="font-bold text-white text-sm">ORDER REJECTIONS</h3>
                  <p>If an order is rejected due to lack of verification proof, the transaction amount remains in your wallet and can be used for secondary orders, but cannot be withdrawn back to bank/esewa accounts.</p>
                </div>
              </div>
            )}

            {profileSubView === "cancellation" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
                  <button
                    onClick={() => setProfileSubView(null)}
                    className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="font-orbitron text-lg font-bold tracking-wide text-white">Cancellation Policy</h2>
                </div>

                <div className="bg-[#121212] border border-zinc-900 rounded-2xl p-5 space-y-4 text-xs text-zinc-400 leading-relaxed">
                  <h3 className="font-bold text-white text-sm">PROCESSING SYSTEM CANCELLATION</h3>
                  <p>Users may request cancellation of their orders strictly before the order shifts from "PENDING" to "DELIVERED". Once the order has been picked up by the official delivery gateway, cancellation requests are automatically discarded.</p>
                  
                  <h3 className="font-bold text-white text-sm">MANUAL VOID CLAIMS</h3>
                  <p>To request a manual void, please submit a detailed ticket in our support portal or get in touch through WhatsApp support immediately.</p>
                </div>
              </div>
            )}

            {profileSubView === "privacy" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
                  <button
                    onClick={() => setProfileSubView(null)}
                    className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="font-orbitron text-lg font-bold tracking-wide text-white">Privacy Policy</h2>
                </div>

                <div className="bg-[#121212] border border-zinc-900 rounded-2xl p-5 space-y-4 text-xs text-zinc-400 leading-relaxed">
                  <h3 className="font-bold text-white text-sm">DATA COLLECTION AND INTENT</h3>
                  <p>We respect player confidentiality. The primary details gathered are your registered name, transaction reference proof, and player game identification numbers (UIDs). We never store nor request your private social game logins or passwords.</p>
                  
                  <h3 className="font-bold text-white text-sm">SECURE ENCRYPTION</h3>
                  <p>All database records are authenticated securely through our persistent Cloud Firestore structure and verified dynamically strictly on authorized access endpoints.</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
