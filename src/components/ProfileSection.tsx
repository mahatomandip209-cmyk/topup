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
  DollarSign,
  Gift,
  ExternalLink,
  Link
} from "lucide-react";
import { UserData } from "../types";

export interface ProfileSectionProps {
  userData: (UserData & { avatarId?: string }) | null;
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
  setActiveSection: (sec: "home" | "wallet" | "history" | "profile" | "topup" | "admin") => void;
  openTopup: (service: any) => void;
  activeTab: "menu" | "overview" | "favorites" | "notifications" | "support" | "refer" | "policies" | "settings";
  setActiveTab: (val: "menu" | "overview" | "favorites" | "notifications" | "support" | "refer" | "policies" | "settings") => void;
}

export default function ProfileSection({
  userData,
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
  activeTab,
  setActiveTab
}: ProfileSectionProps) {
  // Selected policy active subtab
  const [activePolicy, setActivePolicy] = useState<"terms" | "refund" | "cancellation" | "privacy">("terms");

  // Expanded card tracking inside list views
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [expandedDeposit, setExpandedDeposit] = useState<string | null>(null);

  // List of navigation items for the left side menu
  interface NavItem {
    id: "overview" | "favorites" | "notifications" | "support" | "refer" | "policies";
    label: string;
    icon: React.ComponentType<any>;
    badge?: number;
  }

  const navItems: NavItem[] = [
    { id: "overview", label: "Overview", icon: UserIcon },
    { id: "favorites", label: "Favorites", icon: Heart },
    { id: "notifications", label: "Notices", icon: Bell, badge: systemNotifications.length },
    { id: "support", label: "Support Chat", icon: MessageSquare, badge: userTickets.filter(t => t.status === "open").length },
    { id: "refer", label: "Refer & Earn", icon: Gift },
    { id: "policies", label: "Policies", icon: FileText }
  ];

  // Helper to trigger support message setup for a specific order inquiry
  const handleOrderInquiry = (order: any) => {
    const getDisplayOrderId = (o: any) => {
      if (o.orderId && o.orderId.startsWith("BNY-")) {
        return o.orderId;
      }
      const cleanId = (o.orderId || o.id || "").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
      const suffix = cleanId.slice(0, 8).padEnd(8, "X");
      return `BNY-${suffix}`;
    };
    const trackingId = getDisplayOrderId(order);
    setSupportTopic(`Inquiry about ${order.game} Order ${trackingId}`);
    setSupportMessage(
      `Hello team, I have a question regarding my order of ${order.packageName} for game ${order.game}.\nOrder ID: ${trackingId}\nPlayer UID: ${order.playerUid}\nPrice: RS ${order.price}\nStatus: ${order.status.toUpperCase()}`
    );
    setActiveTab("support");
  };

  if (activeTab === "menu") {
    return (
      <div className="space-y-5 max-w-2xl mx-auto pb-10">
        {/* Profile Header */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveSection("home")}
              className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Go back to Home"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="font-orbitron text-lg font-bold tracking-wide text-white uppercase">Profile</h2>
          </div>
          
          <div className="flex items-center gap-1.5 bg-red-950/40 text-red-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-red-900/40">
            <ShieldCheck className="w-3.5 h-3.5 animate-pulse" />
            <span>VERIFIED PLAYER</span>
          </div>
        </div>

        {/* 1. TOP USER CARD */}
        <div className="bg-[#121212]/80 border border-zinc-900/80 rounded-2xl p-4 flex items-center justify-between gap-4 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 rounded-full blur-2xl"></div>
          
          <div className="flex items-center gap-4 min-w-0">
            {/* Avatar image / blue outline container */}
            <div className="w-14 h-14 rounded-full border-2 border-blue-500 flex items-center justify-center bg-blue-950/20 text-blue-400 relative flex-shrink-0">
              <UserIcon className="w-7 h-7 text-white" />
            </div>

            <div className="min-w-0">
              <h3 className="font-orbitron font-extrabold text-md text-white tracking-wide truncate">
                {userData?.name ?? "Guest Gamer"}
              </h3>
              <p className="text-zinc-500 text-xs font-mono truncate">{userData?.email ?? "guest@bnytopup.com"}</p>
              
              {/* Point stats display with blue accent link icon */}
              <div className="flex items-center gap-1 text-blue-400 font-extrabold text-[11px] mt-1 hover:underline cursor-pointer">
                <Link className="w-3.5 h-3.5" />
                <span>{userData?.balance ?? 0} Points</span>
              </div>
            </div>
          </div>

          {/* Edit icon */}
          <button
            onClick={openEditModal}
            className="p-3 bg-blue-950/20 border border-blue-900/40 hover:bg-blue-950/40 hover:border-blue-500/50 text-blue-400 hover:text-white rounded-xl transition-all cursor-pointer"
            title="Edit Display Name"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>

        {/* 2. MENU OPTIONS LIST */}
        <div className="space-y-3">
          
          {/* Store Points */}
          <div
            onClick={() => setActiveTab("overview")}
            className="group bg-[#121212]/80 border border-zinc-900/80 hover:border-zinc-800/80 hover:bg-zinc-900/20 rounded-2xl p-4 flex justify-between items-center cursor-pointer transition-all duration-200"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="bg-blue-500/10 text-blue-400 p-3 rounded-2xl flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                <Coins className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-white text-xs group-hover:text-blue-400 transition-colors">Store Points</h4>
                <p className="text-[11px] text-zinc-500 truncate mt-0.5">Balance: {userData?.balance ?? 0} Points</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors flex-shrink-0" />
          </div>

          {/* My Orders */}
          <div
            onClick={() => setActiveSection("history")}
            className="group bg-[#121212]/80 border border-zinc-900/80 hover:border-zinc-800/80 hover:bg-zinc-900/20 rounded-2xl p-4 flex justify-between items-center cursor-pointer transition-all duration-200"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="bg-zinc-800/50 text-zinc-300 p-3 rounded-2xl flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-white text-xs group-hover:text-red-500 transition-colors">My Orders</h4>
                <p className="text-[11px] text-zinc-500 truncate mt-0.5">Track your purchases</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors flex-shrink-0" />
          </div>

          {/* Favorites */}
          <div
            onClick={() => setActiveTab("favorites")}
            className="group bg-[#121212]/80 border border-zinc-900/80 hover:border-zinc-800/80 hover:bg-zinc-900/20 rounded-2xl p-4 flex justify-between items-center cursor-pointer transition-all duration-200"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="bg-red-500/10 text-red-500 p-3 rounded-2xl flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                <Heart className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-white text-xs group-hover:text-red-500 transition-colors">Favorites</h4>
                <p className="text-[11px] text-zinc-500 truncate mt-0.5">Your favorite games</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors flex-shrink-0" />
          </div>

          {/* Support Chat */}
          <div
            onClick={() => setActiveTab("support")}
            className="group bg-[#121212]/80 border border-zinc-900/80 hover:border-zinc-800/80 hover:bg-zinc-900/20 rounded-2xl p-4 flex justify-between items-center cursor-pointer transition-all duration-200"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="bg-emerald-500/10 text-emerald-500 p-3 rounded-2xl flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-white text-xs group-hover:text-emerald-500 transition-colors">Support Chat</h4>
                <p className="text-[11px] text-zinc-500 truncate mt-0.5">Chat with our team</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors flex-shrink-0" />
          </div>

          {/* Refer & Earn */}
          <div
            onClick={() => setActiveTab("refer")}
            className="group bg-[#121212]/80 border border-zinc-900/80 hover:border-zinc-800/80 hover:bg-zinc-900/20 rounded-2xl p-4 flex justify-between items-center cursor-pointer transition-all duration-200"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="bg-purple-500/10 text-purple-400 p-3 rounded-2xl flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                <Gift className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-white text-xs group-hover:text-purple-400 transition-colors">Refer & Earn</h4>
                <p className="text-[11px] text-zinc-500 truncate mt-0.5">Share with friends & earn rewards</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors flex-shrink-0" />
          </div>

          {/* Settings */}
          <div
            onClick={() => setActiveTab("settings")}
            className="group bg-[#121212]/80 border border-zinc-900/80 hover:border-zinc-800/80 hover:bg-zinc-900/20 rounded-2xl p-4 flex justify-between items-center cursor-pointer transition-all duration-200"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="bg-zinc-700/10 text-zinc-400 p-3 rounded-2xl flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                <Settings className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-white text-xs group-hover:text-white transition-colors">Settings</h4>
                <p className="text-[11px] text-zinc-500 truncate mt-0.5">App preferences</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors flex-shrink-0" />
          </div>

        </div>

        {/* 3. LEGAL SECTION */}
        <div className="space-y-2.5 pt-2">
          <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest pl-1">
            LEGAL
          </span>

          <div className="bg-[#121212]/80 border border-zinc-900/80 rounded-2xl overflow-hidden divide-y divide-zinc-900/60 shadow-md">
            
            {/* Terms & Conditions */}
            <div
              onClick={() => {
                setActiveTab("policies");
                setActivePolicy("terms");
              }}
              className="group flex justify-between items-center p-4 hover:bg-zinc-900/20 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-4.5 h-4.5 text-blue-400 flex-shrink-0 group-hover:scale-105 transition-transform" />
                <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">Terms & Conditions</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
            </div>

            {/* Refund Policy */}
            <div
              onClick={() => {
                setActiveTab("policies");
                setActivePolicy("refund");
              }}
              className="group flex justify-between items-center p-4 hover:bg-zinc-900/20 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <RotateCcw className="w-4.5 h-4.5 text-blue-400 flex-shrink-0 group-hover:scale-105 transition-transform" />
                <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">Refund Policy</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
            </div>

            {/* Cancellation Policy */}
            <div
              onClick={() => {
                setActiveTab("policies");
                setActivePolicy("cancellation");
              }}
              className="group flex justify-between items-center p-4 hover:bg-zinc-900/20 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <XCircle className="w-4.5 h-4.5 text-blue-400 flex-shrink-0 group-hover:scale-105 transition-transform" />
                <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">Cancellation Policy</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
            </div>

            {/* Privacy Policy */}
            <div
              onClick={() => {
                setActiveTab("policies");
                setActivePolicy("privacy");
              }}
              className="group flex justify-between items-center p-4 hover:bg-zinc-900/20 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <ShieldCheck className="w-4.5 h-4.5 text-blue-400 flex-shrink-0 group-hover:scale-105 transition-transform" />
                <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">Privacy Policy</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
            </div>

          </div>
        </div>

        {/* 4. LOGOUT CARD */}
        <div
          onClick={handleLogout}
          className="group bg-red-950/10 border border-red-950 hover:border-red-600/40 hover:bg-red-950/20 rounded-2xl p-4 flex justify-between items-center cursor-pointer transition-all duration-200 mt-4"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="bg-red-500/20 text-red-500 p-3 rounded-2xl flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
              <LogOut className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-red-500 text-xs">Logout</h4>
              <p className="text-[11px] text-zinc-500 truncate mt-0.5">Sign out of your account</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-red-500/60 group-hover:text-red-500 transition-colors flex-shrink-0" />
        </div>

      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Detail View Header */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("menu")}
            className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1"
            title="Back to Profile"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-xs font-bold font-mono">Back</span>
          </button>
          <h2 className="font-orbitron text-lg font-bold tracking-wide text-white uppercase">
            {activeTab === "overview" && "Store Points"}
            {activeTab === "favorites" && "Favorites"}
            {activeTab === "notifications" && "Notifications"}
            {activeTab === "support" && "Support Chat"}
            {activeTab === "refer" && "Refer & Earn"}
            {activeTab === "policies" && "Policies"}
            {activeTab === "settings" && "Settings"}
          </h2>
        </div>
        
        {/* Verification indicator badge */}
        <div className="hidden sm:flex items-center gap-1.5 bg-red-950/40 text-red-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-red-900/40">
          <ShieldCheck className="w-3.5 h-3.5 animate-pulse" />
          <span>VERIFIED PLAYER</span>
        </div>
      </div>

      {/* Main card panel displaying active tab details */}
      <div className="bg-[#0c0c0c] border border-zinc-900/80 rounded-2xl p-4 sm:p-6 shadow-inner min-h-[400px]">
        <AnimatePresence mode="wait">
            
            {/* 2. OVERVIEW TAB CONTENT */}
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div>
                  <h3 className="font-orbitron text-md font-bold text-red-500 uppercase tracking-widest">
                    Account Overview
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Manage your profile display details and basic account security preferences
                  </p>
                </div>

                <div className="bg-[#121212]/50 border border-zinc-900 p-5 rounded-2xl space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-3xl"></div>

                  <div className="flex justify-between items-center border-b border-zinc-900/80 pb-3">
                    <div>
                      <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest block mb-0.5">
                        Authorized Gamer Card
                      </span>
                      <h4 className="font-orbitron font-extrabold text-white tracking-wide text-xs">
                        SECURE ACCESS AUTHORIZATION
                      </h4>
                    </div>
                    <div className="flex items-center gap-1 bg-red-950/30 text-red-500 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-red-900/40">
                      <ShieldCheck className="w-3.5 h-3.5 animate-pulse" /> LIVE
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-500 font-bold block uppercase">Display Name</span>
                      <span className="text-white font-extrabold tracking-wide">{userData?.name ?? "..."}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-500 font-bold block uppercase">Email Address</span>
                      <span className="text-white truncate block">{userData?.email ?? "..."}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-500 font-bold block uppercase">Member Level</span>
                      <span className="text-red-500 font-extrabold tracking-wider flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5" />
                        PLATINUM ELITE
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-500 font-bold block uppercase">Gateway Link</span>
                      <span className="text-emerald-500 font-bold tracking-wider">ACTIVE</span>
                    </div>
                  </div>
                </div>

                {/* Edit forms triggers */}
                <div className="bg-[#121212]/20 border border-zinc-900 p-4 rounded-xl space-y-3">
                  <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider block">
                    Security Actions
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <button
                      onClick={openEditModal}
                      className="flex items-center justify-between px-4 py-3.5 bg-black hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 transition-all text-white text-xs font-bold rounded-xl tracking-wide cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Pencil className="w-4 h-4 text-red-500" />
                        CHANGE DISPLAY NAME
                      </span>
                      <span className="text-zinc-600 font-mono text-[10px]">&rarr;</span>
                    </button>

                    <button
                      onClick={() => setPassModal(true)}
                      className="flex items-center justify-between px-4 py-3.5 bg-black hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 transition-all text-white text-xs font-bold rounded-xl tracking-wide cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-red-500" />
                        CHANGE PASSWORD
                      </span>
                      <span className="text-zinc-600 font-mono text-[10px]">&rarr;</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. FAVORITES TAB CONTENT */}
            {activeTab === "favorites" && (
              <motion.div
                key="favorites"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div>
                  <h3 className="font-orbitron text-md font-bold text-red-500 uppercase tracking-widest">
                    My Favorites
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Quickly launch purchase gateways for your favorite game titles
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Free fire */}
                  <div
                    onClick={() => openTopup("Free Fire")}
                    className="group bg-[#121212]/40 rounded-2xl p-4 border border-zinc-900 hover:border-red-600 transition-all duration-300 cursor-pointer flex flex-col items-center text-center gap-3 relative overflow-hidden shadow-md"
                  >
                    <div className="w-14 h-14 rounded-full overflow-hidden border border-zinc-800 bg-black p-1 flex-shrink-0">
                      <img
                        src="https://i.ibb.co/My1kJfTy/IMG-20260302-211532.jpg"
                        alt="Free Fire"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white group-hover:text-red-500 transition-colors">Free Fire</p>
                      <span className="text-[10px] text-zinc-500 font-medium block mt-0.5">Garena Diamond Service</span>
                    </div>
                    <span className="text-[10px] text-red-500 font-bold bg-red-950/40 px-3 py-1 rounded-full border border-red-900/30">
                      BUY DIAMONDS
                    </span>
                  </div>

                  {/* PUBG Mobile */}
                  <div
                    onClick={() => openTopup("PUBG Mobile")}
                    className="group bg-[#121212]/40 rounded-2xl p-4 border border-zinc-900 hover:border-red-600 transition-all duration-300 cursor-pointer flex flex-col items-center text-center gap-3 relative overflow-hidden shadow-md"
                  >
                    <div className="w-14 h-14 rounded-full overflow-hidden border border-zinc-800 bg-black p-1 flex-shrink-0">
                      <img
                        src="https://i.ibb.co/jPZjCShd/IMG-20260302-211625.jpg"
                        alt="PUBG Mobile"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white group-hover:text-red-500 transition-colors">PUBG Mobile</p>
                      <span className="text-[10px] text-zinc-500 font-medium block mt-0.5">UC Cash Services</span>
                    </div>
                    <span className="text-[10px] text-red-500 font-bold bg-red-950/40 px-3 py-1 rounded-full border border-red-900/30">
                      BUY UC CASH
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 4. NOTIFICATIONS TAB CONTENT */}
            {activeTab === "notifications" && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div>
                  <h3 className="font-orbitron text-md font-bold text-red-500 uppercase tracking-widest">
                    Official notices
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Official system bulletins and announcement notices from BNY TOPUP Team
                  </p>
                </div>

                <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1 no-scrollbar">
                  {systemNotifications.length === 0 ? (
                    <p className="text-zinc-600 text-xs italic text-center py-12 bg-zinc-900/10 rounded-xl border border-zinc-900">
                      No system notifications at the moment.
                    </p>
                  ) : (
                    systemNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="bg-[#121212]/40 border border-zinc-900 hover:border-zinc-800 p-4 rounded-xl space-y-2.5 transition-all relative overflow-hidden shadow-sm"
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
              </motion.div>
            )}

            {/* 5. SUPPORT TAB CONTENT */}
            {activeTab === "support" && (
              <motion.div
                key="support"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div>
                  <h3 className="font-orbitron text-md font-bold text-red-500 uppercase tracking-widest">
                    Support Desk
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Submit verified support ticket claims regarding order delivery, refunds, or wallet balance
                  </p>
                </div>

                <form onSubmit={submitSupportTicket} className="bg-[#121212]/50 border border-zinc-900 p-4 rounded-xl space-y-4">
                  <div>
                    <h4 className="font-orbitron font-bold text-red-500 text-xs uppercase tracking-widest border-b border-zinc-900 pb-2">
                      CREATE INQUIRY CLAIM
                    </h4>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-1 uppercase tracking-wider font-bold">
                        Subject Topic
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Free Fire order ORD-FF-839A not credited"
                        value={supportTopic}
                        onChange={(e) => setSupportTopic(e.target.value)}
                        className="w-full bg-black border border-zinc-800 text-white placeholder-zinc-700 px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-red-600 transition-all font-mono text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-1 uppercase tracking-wider font-bold">
                        Detailed Message
                      </label>
                      <textarea
                        placeholder="Please supply your transaction reference slip screenshots details, player unique coordinates, and order reference."
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
                          SUBMIT SECURE HELP CLAIM
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Tickets list */}
                <div className="space-y-3">
                  <h4 className="font-orbitron font-bold text-zinc-500 text-[10px] uppercase tracking-widest pl-1">
                    MY TICKETS HISTORY ({userTickets.length})
                  </h4>
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
                    {userTickets.length === 0 ? (
                      <p className="text-zinc-600 text-[11px] italic text-center py-6 bg-[#121212]/10 rounded-xl border border-zinc-900">
                        No support tickets submitted previously.
                      </p>
                    ) : (
                      userTickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          className="bg-[#121212]/30 border border-zinc-900 p-3 rounded-xl text-xs space-y-2 hover:border-zinc-800 transition-colors"
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
                          <p className="text-zinc-400 text-[11px] leading-relaxed font-mono bg-black/40 p-2.5 rounded-lg border border-zinc-900">
                            {ticket.message}
                          </p>
                          <div className="flex justify-between items-center text-[10px] text-zinc-600 font-mono pt-1">
                            <span>Ref ID: #{ticket.id.slice(1, 6).toUpperCase()}</span>
                            <span>{new Date(ticket.timestamp).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 6. REFER & EARN TAB CONTENT */}
            {activeTab === "refer" && (
              <motion.div
                key="refer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div>
                  <h3 className="font-orbitron text-md font-bold text-red-500 uppercase tracking-widest">
                    Refer & Earn
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Invite other gamers to BNY TOPUP and unlock free credit bonuses
                  </p>
                </div>

                <div className="bg-[#121212]/50 border border-zinc-900 rounded-2xl p-6 text-center space-y-4">
                  <Gift className="w-12 h-12 text-red-500 mx-auto animate-bounce" />
                  <div className="space-y-1">
                    <h4 className="font-orbitron font-extrabold text-white uppercase tracking-wider">
                      SHARE BNY & CLAIM BONUSES
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed max-w-md mx-auto">
                      Invite your gaming circle to join our community. When a referred friend signs up and completes their first game credit purchase, you will receive <strong className="text-red-500">50 Reward Points</strong> credited to your wallet balance instantly!
                    </p>
                  </div>

                  <div className="bg-black border border-zinc-900 rounded-xl p-3 flex justify-between items-center text-xs font-mono max-w-sm mx-auto">
                    <span className="text-red-500 font-bold truncate pr-3 select-all">
                      {typeof window !== "undefined" ? window.location.origin : "https://bnytopup.vercel.app"}/ref/{userData?.uniqueId || "GAMER"}
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(`${typeof window !== "undefined" ? window.location.origin : "https://bnytopup.vercel.app"}/ref/${userData?.uniqueId || "GAMER"}`, "ID")
                      }
                      className="bg-red-950/30 hover:bg-red-900/40 p-2 rounded-lg text-red-500 cursor-pointer transition-all border border-red-900/20"
                      title="Copy referral link"
                    >
                      {copiedId ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  {copiedId && <p className="text-[10px] text-emerald-500 font-bold">Referral code link copied!</p>}
                </div>
              </motion.div>
            )}

            {/* 7. POLICIES TAB CONTENT */}
            {activeTab === "policies" && (
              <motion.div
                key="policies"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="font-orbitron text-md font-bold text-red-500 uppercase tracking-widest">
                    Platform Policies
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Read our official terms of service, refund guarantees, and data protection rules
                  </p>
                </div>

                {/* Policy Sub tabs */}
                <div className="flex border-b border-zinc-900 bg-zinc-950/40 p-1 rounded-xl gap-1 border overflow-x-auto no-scrollbar">
                  {[
                    { id: "terms", label: "Terms" },
                    { id: "refund", label: "Refunds" },
                    { id: "cancellation", label: "Cancel" },
                    { id: "privacy", label: "Privacy" }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setActivePolicy(p.id as any)}
                      className={`flex-1 py-1.5 px-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                        activePolicy === p.id
                          ? "bg-red-950/30 text-red-500 border border-red-900/40 font-extrabold"
                          : "text-zinc-500 hover:text-zinc-400"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Interactive Dynamic Policy Content displayer */}
                <div className="bg-[#121212]/30 border border-zinc-900 p-4 rounded-xl text-xs text-zinc-400 leading-relaxed max-h-[350px] overflow-y-auto no-scrollbar">
                  {activePolicy === "terms" && (
                    <div className="space-y-3.5">
                      <h4 className="font-bold text-white uppercase text-[11px]">1. ACCEPTANCE OF TERMS</h4>
                      <p>
                        By registering on BNY TOPUP, you acknowledge and agree that you have read, understood, and accept all policies outlined on our platform.
                      </p>
                      
                      <h4 className="font-bold text-white uppercase text-[11px]">2. IN-GAME CREDITS AND DELIVERIES</h4>
                      <p>
                        We supply official credits including Garena Free Fire Diamonds and PUBG Mobile UC. The exact Player UID must be supplied; BNY is not responsible for credits misrouted due to incorrect player numbers entered by users.
                      </p>

                      <h4 className="font-bold text-white uppercase text-[11px]">3. USER ACCOUNT SECURITY</h4>
                      <p>
                        Users are responsible for maintaining the privacy and security of their custom accounts, unique identification codes, and verification records.
                      </p>
                    </div>
                  )}

                  {activePolicy === "refund" && (
                    <div className="space-y-3.5">
                      <h4 className="font-bold text-white uppercase text-[11px]">FINAL AND NON-REFUNDABLE DELIVERIES</h4>
                      <p>
                        All virtual product purchases, topup orders, and credit recharges are instantly or manually processed through official APIs. Once game credits (Diamonds/UC) have been successfully delivered or credited to your player identification number, they are completely final and non-refundable.
                      </p>
                      
                      <h4 className="font-bold text-white uppercase text-[11px]">ORDER REJECTIONS</h4>
                      <p>
                        If an order is rejected due to lack of verification proof, the transaction amount remains in your wallet and can be used for secondary orders, but cannot be withdrawn back to bank/esewa accounts.
                      </p>
                    </div>
                  )}

                  {activePolicy === "cancellation" && (
                    <div className="space-y-3.5">
                      <h4 className="font-bold text-white uppercase text-[11px]">PROCESSING SYSTEM CANCELLATION</h4>
                      <p>
                        Users may request cancellation of their orders strictly before the order shifts from "PENDING" to "DELIVERED". Once the order has been picked up by the official delivery gateway, cancellation requests are automatically discarded.
                      </p>
                      
                      <h4 className="font-bold text-white uppercase text-[11px]">MANUAL VOID CLAIMS</h4>
                      <p>
                        To request a manual void, please submit a detailed ticket in our support portal or get in touch through WhatsApp support immediately.
                      </p>
                    </div>
                  )}

                  {activePolicy === "privacy" && (
                    <div className="space-y-3.5">
                      <h4 className="font-bold text-white uppercase text-[11px]">DATA COLLECTION AND INTENT</h4>
                      <p>
                        We respect player confidentiality. The primary details gathered are your registered name, transaction reference proof, and player game identification numbers (UIDs). We never store nor request your private social game logins or passwords.
                      </p>
                      
                      <h4 className="font-bold text-white uppercase text-[11px]">SECURE ENCRYPTION</h4>
                      <p>
                        All database records are authenticated securely through our persistent Cloud Firestore structure and verified dynamically strictly on authorized access endpoints.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* 8. SETTINGS TAB CONTENT */}
            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div>
                  <h3 className="font-orbitron text-md font-bold text-red-500 uppercase tracking-widest">
                    Settings & Preferences
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Update your account details, display credentials, and credentials passwords
                  </p>
                </div>

                <div className="bg-[#121212]/50 border border-zinc-900 p-5 rounded-2xl space-y-4">
                  <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest block">
                    Profile Customization
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <button
                      onClick={openEditModal}
                      className="flex items-center justify-between px-4 py-3.5 bg-black hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 transition-all text-white text-xs font-bold rounded-xl tracking-wide cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Pencil className="w-4 h-4 text-red-500" />
                        CHANGE DISPLAY NAME
                      </span>
                      <span className="text-zinc-600 font-mono text-[10px]">&rarr;</span>
                    </button>

                    <button
                      onClick={() => setPassModal(true)}
                      className="flex items-center justify-between px-4 py-3.5 bg-black hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 transition-all text-white text-xs font-bold rounded-xl tracking-wide cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-red-500" />
                        CHANGE PASSWORD
                      </span>
                      <span className="text-zinc-600 font-mono text-[10px]">&rarr;</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }
