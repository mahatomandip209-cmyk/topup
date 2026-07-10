import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ref,
  onValue,
  update,
  remove,
  set,
  push
} from "firebase/database";
import {
  Users,
  ShoppingCart,
  Wallet,
  Coins,
  ShieldCheck,
  Search,
  Check,
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  Edit3,
  TrendingUp,
  AlertTriangle,
  UserX,
  UserCheck,
  Clock,
  HelpCircle,
  MessageCircle,
  ChevronRight,
  Database
} from "lucide-react";
import { ServiceItem } from "../data/packages";

interface AdminSectionProps {
  db: any;
  currentUser: any;
  services: ServiceItem[];
}

export default function AdminSection({ db, currentUser, services }: AdminSectionProps) {
  const [adminTab, setAdminTab] = useState<"dashboard" | "users" | "orders" | "deposits" | "products" | "banners">("dashboard");

  // Loaded database nodes
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [allDeposits, setAllDeposits] = useState<any[]>([]);
  const [allTickets, setAllTickets] = useState<any[]>([]);

  // Search filter inputs
  const [searchQuery, setSearchQuery] = useState("");
  const [orderFilter, setOrderFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [depositFilter, setDepositFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  // Modal / interactive inputs
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustNote, setAdjustNote] = useState("");
  const [loading, setLoading] = useState(false);

  // Banner Manager State
  const [newBannerUrl, setNewBannerUrl] = useState("");
  const [currentBanners, setCurrentBanners] = useState<string[]>([]);

  // Price Customization State
  const [selectedProductService, setSelectedProductService] = useState<string>("");
  const [customPrices, setCustomPrices] = useState<any>({});

  // Loading indicator for lists
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    // 1. Fetch All Users
    const usersRef = ref(db, "users");
    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({
          uid: key,
          ...data[key]
        }));
        setAllUsers(list);
      } else {
        setAllUsers([]);
      }
    });

    // 2. Fetch All Orders (from both global all_orders and aggregating user orders)
    const allOrdersRef = ref(db, "all_orders");
    const unsubscribeAllOrders = onValue(allOrdersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({
          orderId: key,
          ...data[key]
        })).sort((a, b) => b.timestamp - a.timestamp);
        setAllOrders(list);
      } else {
        // Fallback: check individual user orders if global orders is empty
        setAllOrders([]);
      }
    });

    // 3. Fetch All Deposits
    const depositsRef = ref(db, "deposits");
    const unsubscribeDeposits = onValue(depositsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({
          depositId: key,
          ...data[key]
        })).sort((a, b) => b.timestamp - a.timestamp);
        setAllDeposits(list);
      } else {
        setAllDeposits([]);
      }
    });

    // 4. Fetch slide banners
    const bannersRef = ref(db, "banners");
    const unsubscribeBanners = onValue(bannersRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        setCurrentBanners(Array.isArray(val) ? val : Object.values(val));
      } else {
        // Fallback default banners
        setCurrentBanners([
          "https://i.ibb.co/rG5h77vw/1770000367736-1a203456.jpg",
          "https://i.ibb.co/7tFsSW46/1770040656764-0a668a00.jpg"
        ]);
      }
    });

    // 5. Fetch customizable prices
    const pricesRef = ref(db, "custom_prices");
    const unsubscribePrices = onValue(pricesRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        setCustomPrices(val);
      } else {
        setCustomPrices({});
      }
    });

    setDataLoaded(true);

    return () => {
      unsubscribeUsers();
      unsubscribeAllOrders();
      unsubscribeDeposits();
      unsubscribeBanners();
      unsubscribePrices();
    };
  }, [db]);

  // Balance Override Operations (Manual Balance Add/Remove)
  const adjustUserBalance = async (type: "add" | "remove") => {
    if (!selectedUser || !adjustAmount) {
      alert("Please specify a valid amount");
      return;
    }
    const amt = parseFloat(adjustAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Invalid numeric amount");
      return;
    }

    setLoading(true);
    try {
      const currentBalance = selectedUser.balance ?? 0;
      const newBalance = type === "add" ? currentBalance + amt : Math.max(0, currentBalance - amt);

      // 1. Update user balance
      await update(ref(db, `users/${selectedUser.uid}`), {
        balance: newBalance
      });

      // 2. Log custom notice in user notification node
      const notificationRef = ref(db, "notifications");
      await push(notificationRef, {
        title: type === "add" ? "💰 Wallet Credits Added" : "⚠️ Wallet Credits Deducted",
        body: `Dear ${selectedUser.name}, your wallet has been updated by BNY Admin. Balance: ${type === "add" ? "+" : "-"} NPR ${amt}. Note: ${adjustNote || "Manual Adjustment"}.`,
        timestamp: Date.now(),
        type: type === "add" ? "success" : "warning",
        targetUid: selectedUser.uid
      });

      // 3. Update active selected modal state
      setSelectedUser({ ...selectedUser, balance: newBalance });
      setAdjustAmount("");
      setAdjustNote("");
      alert(`Successfully updated user wallet balance to NPR ${newBalance}`);
    } catch (err: any) {
      alert(err.message || "Failed to update balance");
    } finally {
      setLoading(false);
    }
  };

  // Block/Unblock user account
  const toggleBlockUser = async (user: any) => {
    const nextState = !user.blocked;
    if (confirm(`Are you sure you want to ${nextState ? "BLOCK" : "UNBLOCK"} user: ${user.name}?`)) {
      try {
        await update(ref(db, `users/${user.uid}`), {
          blocked: nextState
        });
        alert(`User is now ${nextState ? "BLOCKED" : "ACTIVE"}`);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // Approve Deposit Request
  const approveDeposit = async (deposit: any) => {
    if (confirm(`Approve deposit of NPR ${deposit.amount} for user ID ${deposit.uid}? This will automatically add credits!`)) {
      setLoading(true);
      try {
        // 1. Mark deposit as approved
        await update(ref(db, `deposits/${deposit.depositId}`), {
          status: "approved"
        });

        // 2. Fetch the current user data to be safe and update balance
        let userBal = 0;
        const matchedUser = allUsers.find(u => u.uid === deposit.uid);
        if (matchedUser) {
          userBal = matchedUser.balance ?? 0;
        }
        const updatedBal = userBal + deposit.amount;

        await update(ref(db, `users/${deposit.uid}`), {
          balance: updatedBal
        });

        // 3. Add personal success notification to the user
        const notifRef = ref(db, "notifications");
        await push(notifRef, {
          title: "✅ Deposit Confirmed!",
          body: `Good news! Your deposit request of NPR ${deposit.amount} has been approved by the billing desk. Credits are active in your wallet.`,
          timestamp: Date.now(),
          type: "success",
          targetUid: deposit.uid
        });

        alert("Deposit request approved. User wallet balance updated successfully!");
      } catch (err: any) {
        alert(err.message || "Approval failed");
      } finally {
        setLoading(false);
      }
    }
  };

  // Reject Deposit Request
  const rejectDeposit = async (deposit: any) => {
    if (confirm(`REJECT this deposit request of NPR ${deposit.amount}?`)) {
      setLoading(true);
      try {
        await update(ref(db, `deposits/${deposit.depositId}`), {
          status: "rejected"
        });

        const notifRef = ref(db, "notifications");
        await push(notifRef, {
          title: "❌ Deposit Rejected",
          body: `Your deposit request for NPR ${deposit.amount} was declined. Please verify your transaction code: ${deposit.trx} or contact support.`,
          timestamp: Date.now(),
          type: "warning",
          targetUid: deposit.uid
        });

        alert("Deposit request declined.");
      } catch (err: any) {
        alert(err.message || "Rejection failed");
      } finally {
        setLoading(false);
      }
    }
  };

  // Approve Order Dispatch
  const approveOrder = async (order: any) => {
    if (confirm(`Approve game order ${order.packageName} for UID ${order.playerUid}?`)) {
      setLoading(true);
      try {
        // 1. Update order status in global all_orders
        await update(ref(db, `all_orders/${order.orderId}`), {
          status: "approved"
        });

        // 2. Update order status inside user-specific history node
        await update(ref(db, `orders/${order.uid}/${order.userOrderId || order.orderId}`), {
          status: "approved"
        });

        // 3. Inform the user via automated notifications
        const notifRef = ref(db, "notifications");
        await push(notifRef, {
          title: "🚀 Package Dispatched!",
          body: `Congratulations! Your order for ${order.game} (${order.packageName}) was successfully verified and delivered to UID: ${order.playerUid}. Thank you for choosing BNY SHOP!`,
          timestamp: Date.now(),
          type: "success",
          targetUid: order.uid
        });

        alert("Order successfully dispatched & marked delivered.");
      } catch (err: any) {
        alert(err.message || "Dispatch failed");
      } finally {
        setLoading(false);
      }
    }
  };

  // Reject Order & Refund User Balance
  const rejectOrder = async (order: any) => {
    if (confirm(`REJECT this order? This will automatically REFUND NPR ${order.price} back to the user balance.`)) {
      setLoading(true);
      try {
        // 1. Refund points to user balance
        let userBal = 0;
        const matchedUser = allUsers.find(u => u.uid === order.uid);
        if (matchedUser) {
          userBal = matchedUser.balance ?? 0;
        }
        const refundedBal = userBal + order.price;

        await update(ref(db, `users/${order.uid}`), {
          balance: refundedBal
        });

        // 2. Mark order as rejected globally
        await update(ref(db, `all_orders/${order.orderId}`), {
          status: "rejected"
        });

        // 3. Mark order as rejected in user node
        await update(ref(db, `orders/${order.uid}/${order.userOrderId || order.orderId}`), {
          status: "rejected"
        });

        // 4. Send failure alert notification
        const notifRef = ref(db, "notifications");
        await push(notifRef, {
          title: "❌ Order Rejected & Refunded",
          body: `Your order for ${order.game} (${order.packageName}) was rejected due to verification issues. NPR ${order.price} has been refunded to your wallet.`,
          timestamp: Date.now(),
          type: "warning",
          targetUid: order.uid
        });

        alert("Order rejected. NPR points refunded to user wallet.");
      } catch (err: any) {
        alert(err.message || "Fulfillment reversal failed");
      } finally {
        setLoading(false);
      }
    }
  };

  // Banner Management: Add Banner Url
  const addBanner = async () => {
    if (!newBannerUrl.trim()) return;
    const updated = [...currentBanners, newBannerUrl.trim()];
    try {
      await set(ref(db, "banners"), updated);
      setNewBannerUrl("");
      alert("Homepage slideshow banner added successfully!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Banner Management: Remove Banner Url
  const deleteBanner = async (idx: number) => {
    if (confirm("Delete this banner?")) {
      const updated = currentBanners.filter((_, i) => i !== idx);
      try {
        await set(ref(db, "banners"), updated);
        alert("Banner removed!");
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // Price Manager: Update package price
  const updatePackagePrice = async (serviceId: string, pkgName: string, newPrice: number) => {
    if (isNaN(newPrice) || newPrice < 0) {
      alert("Please enter a valid positive price");
      return;
    }
    try {
      const safeKey = pkgName.replace(/[.#$\[\]]/g, "_"); // sanitize firebase keys
      await set(ref(db, `custom_prices/${serviceId}/${safeKey}`), newPrice);
      alert(`Successfully updated "${pkgName}" price to NPR ${newPrice}`);
    } catch (err: any) {
      alert(err.message || "Failed to edit pricing");
    }
  };

  // Compute stats
  const totalRevenue = allOrders
    .filter(o => o.status === "approved")
    .reduce((acc, curr) => acc + (curr.price ?? 0), 0);

  const totalDeposits = allDeposits
    .filter(d => d.status === "approved")
    .reduce((acc, curr) => acc + (curr.amount ?? 0), 0);

  const pendingOrdersCount = allOrders.filter(o => o.status === "pending").length;
  const pendingDepositsCount = allDeposits.filter(d => d.status === "pending").length;

  // Filter users
  const filteredUsers = allUsers.filter(u =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.uniqueId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter global orders
  const filteredOrders = allOrders.filter(o => {
    const isMatchedQuery = searchQuery === "" ||
      o.playerUid?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.packageName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.game?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.uniqueId?.toLowerCase().includes(searchQuery.toLowerCase());

    const isMatchedFilter = orderFilter === "all" || o.status === orderFilter;
    return isMatchedQuery && isMatchedFilter;
  });

  // Filter global deposits
  const filteredDeposits = allDeposits.filter(d => {
    const isMatchedQuery = searchQuery === "" ||
      d.senderNum?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.senderName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.trx?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const isMatchedFilter = depositFilter === "all" || d.status === depositFilter;
    return isMatchedQuery && isMatchedFilter;
  });

  return (
    <div className="bg-[#0b111e]/80 border border-brand-blue/30 rounded-3xl p-5 space-y-6">
      {/* Admin Panel Header navigation */}
      <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-brand-orange animate-pulse" />
          <div>
            <h2 className="font-orbitron font-extrabold text-lg text-white tracking-wider uppercase">
              Admin Control Panel
            </h2>
            <p className="text-[10px] text-zinc-400 font-mono tracking-wide">
              BNY SHOP AUTHORIZED SYSTEM DESK
            </p>
          </div>
        </div>

        <span className="bg-brand-orange/10 border border-brand-orange/40 text-brand-orange text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest font-mono">
          ROOT LEVEL ACCESS
        </span>
      </div>

      {/* Admin Menu Tabs */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 bg-black/40 p-1.5 rounded-2xl border border-zinc-900 font-mono">
        {[
          { id: "dashboard", label: "Overview", icon: TrendingUp },
          { id: "users", label: "Users", icon: Users },
          { id: "orders", label: "Orders", icon: ShoppingCart },
          { id: "deposits", label: "Deposits", icon: Wallet },
          { id: "products", label: "Prices", icon: Database },
          { id: "banners", label: "Banners", icon: ImageIcon }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setAdminTab(tab.id as any);
                setSearchQuery("");
              }}
              className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                isActive
                  ? "bg-brand-blue text-white shadow-[0_0_15px_rgba(0,102,204,0.4)]"
                  : "text-zinc-500 hover:text-white hover:bg-zinc-900/40"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ADMIN TABS ROUTER */}
      <div className="min-h-[300px]">
        {/* TABS 1: DASHBOARD STATS */}
        {adminTab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="bg-black/40 p-4 border border-zinc-900 rounded-2xl space-y-1">
                <span className="text-[10px] text-zinc-500 block uppercase font-mono">Total Sales</span>
                <p className="text-xl font-bold font-mono text-white">NPR {totalRevenue}</p>
                <span className="text-[8px] text-emerald-500 block">Delivered Orders</span>
              </div>

              <div className="bg-black/40 p-4 border border-zinc-900 rounded-2xl space-y-1">
                <span className="text-[10px] text-zinc-500 block uppercase font-mono">Total Deposits</span>
                <p className="text-xl font-bold font-mono text-white">NPR {totalDeposits}</p>
                <span className="text-[8px] text-emerald-500 block">Verified Loads</span>
              </div>

              <div className="bg-black/40 p-4 border border-zinc-900 rounded-2xl space-y-1 relative overflow-hidden">
                <span className="text-[10px] text-zinc-500 block uppercase font-mono">Pending Orders</span>
                <p className="text-xl font-bold font-mono text-brand-orange">{pendingOrdersCount}</p>
                <span className="text-[8px] text-amber-500 block animate-pulse">Needs dispatch!</span>
                {pendingOrdersCount > 0 && (
                  <div className="absolute right-2 top-2 w-2 h-2 rounded-full bg-brand-orange animate-ping"></div>
                )}
              </div>

              <div className="bg-black/40 p-4 border border-zinc-900 rounded-2xl space-y-1 relative overflow-hidden">
                <span className="text-[10px] text-zinc-500 block uppercase font-mono">Pending Deposits</span>
                <p className="text-xl font-bold font-mono text-brand-blue">{pendingDepositsCount}</p>
                <span className="text-[8px] text-brand-blue block animate-pulse">Pending audit!</span>
                {pendingDepositsCount > 0 && (
                  <div className="absolute right-2 top-2 w-2 h-2 rounded-full bg-brand-blue animate-ping"></div>
                )}
              </div>
            </div>

            {/* Quick Actions Alerts */}
            <div className="bg-[#f35b04]/5 border border-[#f35b04]/20 p-4 rounded-2xl flex gap-3.5 items-start">
              <AlertTriangle className="text-brand-orange flex-shrink-0 mt-0.5" size={18} />
              <div className="text-xs space-y-1 leading-relaxed">
                <span className="font-extrabold uppercase font-mono text-brand-orange block">
                  Quick Action Alerts
                </span>
                <p className="text-zinc-400">
                  You currently have <strong className="text-brand-orange font-bold">{pendingOrdersCount} pending game/streaming orders</strong> and <strong className="text-brand-blue font-bold">{pendingDepositsCount} pending wallet loads</strong> requiring manual verification and dispatch.
                </p>
                <div className="flex gap-2 pt-1 font-bold">
                  <button
                    onClick={() => setAdminTab("orders")}
                    className="bg-brand-orange text-white px-3 py-1 rounded text-[10px] hover:bg-brand-orange/95 cursor-pointer transition-colors"
                  >
                    DISPATCH ORDERS
                  </button>
                  <button
                    onClick={() => setAdminTab("deposits")}
                    className="bg-brand-blue text-white px-3 py-1 rounded text-[10px] hover:bg-brand-blue/95 cursor-pointer transition-colors"
                  >
                    VERIFY DEPOSITS
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Info Grid */}
            <div className="bg-black/30 border border-zinc-900 rounded-2xl p-4 space-y-3.5 text-xs">
              <span className="text-[10px] text-zinc-500 font-extrabold font-mono uppercase tracking-widest block">
                Store Credentials Summary
              </span>
              <div className="grid grid-cols-2 gap-4 font-mono text-zinc-400">
                <div>
                  <span className="text-zinc-600 block text-[10px] uppercase font-bold">Total Registrations</span>
                  <p className="text-white font-bold">{allUsers.length} Users</p>
                </div>
                <div>
                  <span className="text-zinc-600 block text-[10px] uppercase font-bold">WhatsApp Hotline</span>
                  <p className="text-white font-bold">+977 9827679425</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {adminTab === "users" && (
          <div className="space-y-4">
            {/* Search filter input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by username, email, phone, referral code or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/60 border border-zinc-900 rounded-xl px-10 py-3 text-sm placeholder-zinc-700 text-white focus:outline-none focus:border-brand-blue font-mono transition-all"
              />
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 no-scrollbar">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 text-xs font-mono">
                  No registered users found matching that query.
                </div>
              ) : (
                filteredUsers.map(user => (
                  <div
                    key={user.uid}
                    className="bg-black/30 border border-zinc-900 p-4 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-extrabold text-sm">{user.name}</span>
                        {user.blocked ? (
                          <span className="bg-red-950/40 border border-red-900/30 text-red-500 text-[8px] font-bold px-1.5 py-0.2 rounded uppercase">
                            BLOCKED
                          </span>
                        ) : (
                          <span className="bg-emerald-950/40 border border-emerald-900/30 text-emerald-500 text-[8px] font-bold px-1.5 py-0.2 rounded uppercase">
                            ACTIVE
                          </span>
                        )}
                        <span className="text-zinc-500 text-[10px] font-mono">({user.uniqueId || "N/A"})</span>
                      </div>
                      <p className="text-zinc-500 text-xs font-mono truncate">{user.email}</p>
                      {user.phone && <p className="text-brand-orange text-[10px] font-mono">WhatsApp/Phone: {user.phone} ({user.country || "N/A"})</p>}
                      {user.referralCode && <p className="text-zinc-600 text-[9px] font-mono">Referral Code: {user.referralCode}</p>}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <div className="bg-brand-blue/10 border border-brand-blue/30 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-brand-blue flex items-center gap-1">
                        <span>NPR</span>
                        <span>{user.balance ?? 0}</span>
                      </div>

                      <button
                        onClick={() => setSelectedUser(user)}
                        className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-colors px-3 py-2 rounded-lg text-[10px] font-bold font-mono text-zinc-300 cursor-pointer"
                      >
                        MANAGE BALANCE
                      </button>

                      <button
                        onClick={() => toggleBlockUser(user)}
                        className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                          user.blocked
                            ? "bg-emerald-950/20 border-emerald-900/30 text-emerald-500 hover:bg-emerald-900/20"
                            : "bg-red-950/20 border-red-900/30 text-red-500 hover:bg-red-900/20"
                        }`}
                        title={user.blocked ? "Unblock Account" : "Block Account"}
                      >
                        {user.blocked ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* BALANCE MODIFIER SLIDE SHEET */}
            <AnimatePresence>
              {selectedUser && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
                  <motion.div
                    initial={{ scale: 0.92, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.92, opacity: 0 }}
                    className="w-full max-w-sm bg-[#0b111e] border border-brand-blue/40 rounded-3xl p-6 space-y-4"
                  >
                    <div className="flex justify-between items-start border-b border-zinc-800 pb-3">
                      <div>
                        <h3 className="font-orbitron font-bold text-white text-md">Adjust Wallet Points</h3>
                        <p className="text-[10px] text-zinc-500 truncate mt-0.5">{selectedUser.name}</p>
                      </div>
                      <button
                        onClick={() => setSelectedUser(null)}
                        className="text-zinc-500 hover:text-white bg-black/20 hover:bg-zinc-900/50 p-1 rounded-lg transition-all cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="bg-black/40 p-3 rounded-xl border border-zinc-900/80 flex justify-between items-center text-xs">
                      <span className="text-zinc-500 uppercase font-mono font-bold">Current Wallet Points</span>
                      <strong className="text-white font-mono text-sm">NPR {selectedUser.balance ?? 0}</strong>
                    </div>

                    <div className="space-y-3 text-xs font-mono">
                      <div>
                        <label className="text-zinc-400 block mb-1">Adjustment Amount (NPR)</label>
                        <input
                          type="number"
                          placeholder="e.g. 500"
                          value={adjustAmount}
                          onChange={(e) => setAdjustAmount(e.target.value)}
                          className="w-full bg-black border border-zinc-900 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-brand-blue"
                        />
                      </div>

                      <div>
                        <label className="text-zinc-400 block mb-1">Reason / Note (shown to user)</label>
                        <input
                          type="text"
                          placeholder="e.g. Compensation / Signup Bonus / Purchase"
                          value={adjustNote}
                          onChange={(e) => setAdjustNote(e.target.value)}
                          className="w-full bg-black border border-zinc-900 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-brand-blue"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 pt-2">
                      <button
                        onClick={() => adjustUserBalance("remove")}
                        disabled={loading}
                        className="bg-red-950/20 hover:bg-red-900/20 border border-red-900/30 text-red-500 font-extrabold py-3 rounded-xl text-xs tracking-wider cursor-pointer uppercase transition-colors"
                      >
                        DEDUCT POINTS
                      </button>
                      <button
                        onClick={() => adjustUserBalance("add")}
                        disabled={loading}
                        className="bg-brand-blue text-white hover:bg-brand-blue/90 font-extrabold py-3 rounded-xl text-xs tracking-wider cursor-pointer uppercase transition-colors"
                      >
                        ADD CREDITS
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* TAB 3: GAME / MEMBERSHIP ORDERS */}
        {adminTab === "orders" && (
          <div className="space-y-4">
            {/* Search / Filters block */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search player UID, package, game or order ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/60 border border-zinc-900 rounded-xl px-10 py-2.5 text-sm placeholder-zinc-700 text-white focus:outline-none focus:border-brand-blue font-mono transition-all"
                />
              </div>

              {/* Status filter selection */}
              <div className="flex bg-black/50 p-1 rounded-xl border border-zinc-900 text-[10px] font-mono font-bold">
                {["pending", "approved", "rejected", "all"].map(st => (
                  <button
                    key={st}
                    onClick={() => setOrderFilter(st as any)}
                    className={`px-3 py-1.5 rounded-lg uppercase cursor-pointer ${
                      orderFilter === st
                        ? "bg-brand-blue text-white"
                        : "text-zinc-500 hover:text-white"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 no-scrollbar">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-16 text-zinc-500 text-xs font-mono">
                  No top-up orders found matching current filters.
                </div>
              ) : (
                filteredOrders.map(order => {
                  const isPending = order.status === "pending";
                  return (
                    <div
                      key={order.orderId}
                      className="bg-black/30 border border-zinc-900 rounded-2xl p-4 space-y-3.5"
                    >
                      <div className="flex justify-between items-start gap-4 flex-wrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="bg-brand-blue/10 border border-brand-blue/30 text-brand-blue font-extrabold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider">
                              {order.game}
                            </span>
                            <span className="text-white font-bold text-xs">{order.packageName}</span>
                          </div>
                          <p className="text-zinc-500 text-[10px] font-mono">
                            Order Code: ORD-{order.orderId.slice(0, 8).toUpperCase()} &bull; {new Date(order.timestamp).toLocaleString()}
                          </p>
                          <p className="text-zinc-400 text-xs">
                            User Email: <span className="text-white font-semibold">{order.email}</span>
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-white font-bold font-mono text-sm">NPR {order.price}</p>
                          {order.status === "approved" ? (
                            <span className="text-emerald-500 text-[9px] font-bold uppercase tracking-widest block">✓ Delivered</span>
                          ) : order.status === "rejected" ? (
                            <span className="text-red-500 text-[9px] font-bold uppercase tracking-widest block">✗ Rejected</span>
                          ) : (
                            <span className="text-brand-orange text-[9px] font-bold uppercase tracking-widest block animate-pulse">⌛ Pending</span>
                          )}
                        </div>
                      </div>

                      {/* Display Custom Fields depending on product requirements */}
                      <div className="bg-black/60 border border-zinc-900/60 rounded-xl p-3 grid grid-cols-2 gap-2 text-xs font-mono">
                        {order.playerUid && (
                          <div className="col-span-2 sm:col-span-1">
                            <span className="text-[10px] text-zinc-500 block uppercase font-bold">Player UID</span>
                            <strong className="text-brand-orange text-xs tracking-wider">{order.playerUid}</strong>
                          </div>
                        )}
                        {order.customerEmail && (
                          <div className="col-span-2 sm:col-span-1">
                            <span className="text-[10px] text-zinc-500 block uppercase font-bold">Customer Email</span>
                            <strong className="text-white">{order.customerEmail}</strong>
                          </div>
                        )}
                        {order.customerPassword && (
                          <div className="col-span-2 sm:col-span-1">
                            <span className="text-[10px] text-zinc-500 block uppercase font-bold">Activation Pass</span>
                            <strong className="text-white select-all">{order.customerPassword}</strong>
                          </div>
                        )}
                        {order.walletAddress && (
                          <div className="col-span-2">
                            <span className="text-[10px] text-zinc-500 block uppercase font-bold">USDT Wallet Address</span>
                            <strong className="text-white break-all text-[11px] block">{order.walletAddress}</strong>
                          </div>
                        )}
                        {order.network && (
                          <div>
                            <span className="text-[10px] text-zinc-500 block uppercase font-bold">Protocol Network</span>
                            <strong className="text-brand-blue">{order.network}</strong>
                          </div>
                        )}
                        {order.cryptoAmount && (
                          <div>
                            <span className="text-[10px] text-zinc-500 block uppercase font-bold">Crypto Amount</span>
                            <strong className="text-white font-bold">{order.cryptoAmount} USDT</strong>
                          </div>
                        )}
                        {order.whatsappNumber && (
                          <div>
                            <span className="text-[10px] text-zinc-500 block uppercase font-bold">Contact WhatsApp</span>
                            <strong className="text-brand-blue">{order.whatsappNumber}</strong>
                          </div>
                        )}
                      </div>

                      {/* Pending Dispatch Controls */}
                      {isPending && (
                        <div className="flex gap-2 pt-1.5 font-bold">
                          <button
                            onClick={() => rejectOrder(order)}
                            disabled={loading}
                            className="flex-1 bg-red-950/20 hover:bg-red-900/20 border border-red-900/30 text-red-500 py-2 rounded-xl text-xs uppercase cursor-pointer transition-colors"
                          >
                            REJECT (REFUND USER)
                          </button>
                          <button
                            onClick={() => approveOrder(order)}
                            disabled={loading}
                            className="flex-1 bg-brand-blue text-white hover:bg-brand-blue/90 py-2 rounded-xl text-xs uppercase cursor-pointer transition-colors"
                          >
                            APPROVE (DISPATCH COMPLETE)
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 4: MANUAL DEPOSITS VERIFICATION */}
        {adminTab === "deposits" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search sender name, sender number, transaction ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/60 border border-zinc-900 rounded-xl px-10 py-2.5 text-sm placeholder-zinc-700 text-white focus:outline-none focus:border-brand-blue font-mono transition-all"
                />
              </div>

              <div className="flex bg-black/50 p-1 rounded-xl border border-zinc-900 text-[10px] font-mono font-bold">
                {["pending", "approved", "rejected", "all"].map(st => (
                  <button
                    key={st}
                    onClick={() => setDepositFilter(st as any)}
                    className={`px-3 py-1.5 rounded-lg uppercase cursor-pointer ${
                      depositFilter === st
                        ? "bg-brand-blue text-white"
                        : "text-zinc-500 hover:text-white"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 no-scrollbar">
              {filteredDeposits.length === 0 ? (
                <div className="text-center py-16 text-zinc-500 text-xs font-mono">
                  No deposit slips found matching current filters.
                </div>
              ) : (
                filteredDeposits.map(dep => {
                  const isPending = dep.status === "pending";
                  return (
                    <div
                      key={dep.depositId}
                      className="bg-black/30 border border-zinc-900 rounded-2xl p-4 space-y-3"
                    >
                      <div className="flex justify-between items-start gap-4 flex-wrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="bg-brand-orange/10 border border-brand-orange/30 text-brand-orange font-extrabold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider">
                              Esewa / Khalti Wallet
                            </span>
                            <span className="text-white font-bold text-xs truncate">Ref Code: {dep.trx}</span>
                          </div>
                          <p className="text-zinc-500 text-[10px] font-mono">
                            Logged: {new Date(dep.timestamp).toLocaleString()}
                          </p>
                          <p className="text-zinc-400 text-xs">
                            Member: <span className="text-white font-semibold">{dep.email}</span>
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-brand-orange font-bold font-mono text-sm">NPR {dep.amount}</p>
                          {dep.status === "approved" ? (
                            <span className="text-emerald-500 text-[9px] font-bold uppercase tracking-widest block">✓ Approved</span>
                          ) : dep.status === "rejected" ? (
                            <span className="text-red-500 text-[9px] font-bold uppercase tracking-widest block">✗ Rejected</span>
                          ) : (
                            <span className="text-brand-blue text-[9px] font-bold uppercase tracking-widest block animate-pulse">⌛ Audit Required</span>
                          )}
                        </div>
                      </div>

                      <div className="bg-black/60 border border-zinc-900/60 rounded-xl p-3 grid grid-cols-2 gap-2 text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-zinc-500 block uppercase font-bold">Sender Name</span>
                          <strong className="text-white truncate block">{dep.senderName}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-500 block uppercase font-bold">Sender Number</span>
                          <strong className="text-brand-orange tracking-wide">{dep.senderNum}</strong>
                        </div>
                      </div>

                      {/* Verification Controls */}
                      {isPending && (
                        <div className="flex gap-2 pt-1.5 font-bold">
                          <button
                            onClick={() => rejectDeposit(dep)}
                            disabled={loading}
                            className="flex-1 bg-red-950/20 hover:bg-red-900/20 border border-red-900/30 text-red-500 py-2 rounded-xl text-xs uppercase cursor-pointer transition-colors"
                          >
                            REJECT SLIP
                          </button>
                          <button
                            onClick={() => approveDeposit(dep)}
                            disabled={loading}
                            className="flex-1 bg-brand-blue text-white hover:bg-brand-blue/90 py-2 rounded-xl text-xs uppercase cursor-pointer transition-colors"
                          >
                            APPROVE (CREDIT WALLET)
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 5: PRODUCT & PRICE MANAGER */}
        {adminTab === "products" && (
          <div className="space-y-5">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Select Service Category</label>
              <select
                value={selectedProductService}
                onChange={(e) => setSelectedProductService(e.target.value)}
                className="w-full bg-black border border-zinc-900 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-blue font-sans font-bold"
              >
                <option value="">-- Choose Game / Subscription Service --</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                ))}
              </select>
            </div>

            {selectedProductService ? (
              <div className="bg-black/30 border border-zinc-900 rounded-2xl p-4 space-y-4">
                <span className="text-[10px] text-brand-orange font-extrabold uppercase font-mono tracking-widest block">
                  Product Package Prices Manager
                </span>

                <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 no-scrollbar text-xs">
                  {services.find(s => s.id === selectedProductService)?.packages.map((pkg, pIdx) => {
                    const safeKey = pkg.n.replace(/[.#$\[\]]/g, "_");
                    const currentPrice = customPrices[selectedProductService]?.[safeKey] ?? pkg.p;

                    return (
                      <div key={pIdx} className="bg-black/60 border border-zinc-900/80 p-3 rounded-xl flex items-center justify-between gap-4 font-mono">
                        <span className="text-white font-bold">{pkg.n}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-500">NPR</span>
                          <input
                            type="number"
                            defaultValue={currentPrice}
                            onBlur={(e) => {
                              const v = parseFloat(e.target.value);
                              if (!isNaN(v) && v !== currentPrice) {
                                updatePackagePrice(selectedProductService, pkg.n, v);
                              }
                            }}
                            className="w-20 bg-black text-center border border-zinc-800 rounded px-2 py-1 text-xs text-brand-orange font-extrabold font-mono focus:outline-none focus:border-brand-orange"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-zinc-500 font-mono text-center">
                  * Note: Price updates are pushed immediately to all users. Tab out of the input box to trigger save.
                </p>
              </div>
            ) : (
              <div className="text-center py-16 text-zinc-500 text-xs font-mono">
                Select a game or streaming title above to customize user prices.
              </div>
            )}
          </div>
        )}

        {/* TAB 6: HOMEPAGE SLIDE BANNERS MANAGER */}
        {adminTab === "banners" && (
          <div className="space-y-4 text-xs font-mono">
            {/* Add Banner Area */}
            <div className="bg-black/30 border border-zinc-900 p-4 rounded-2xl space-y-3">
              <span className="text-[10px] text-brand-blue font-extrabold uppercase tracking-widest block">
                Add Slide Banner Image URL
              </span>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste banner image absolute URL (https://...)"
                  value={newBannerUrl}
                  onChange={(e) => setNewBannerUrl(e.target.value)}
                  className="flex-1 bg-black border border-zinc-900 rounded-lg px-3 py-2.5 text-white placeholder-zinc-700 text-xs focus:outline-none focus:border-brand-blue"
                />
                <button
                  onClick={addBanner}
                  className="bg-brand-blue text-white px-4 rounded-lg font-bold flex items-center justify-center cursor-pointer hover:bg-brand-blue/95"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Current Slide Banners List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
              <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest block">
                Current Active Slides ({currentBanners.length})
              </span>

              {currentBanners.map((url, index) => (
                <div
                  key={index}
                  className="bg-black/30 border border-zinc-900 p-3 rounded-2xl flex items-center gap-3 justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={url}
                      alt={`Slide ${index + 1}`}
                      className="w-14 aspect-video object-cover rounded border border-zinc-800"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-[10px] text-zinc-400 truncate block flex-1 font-mono">
                      {url}
                    </span>
                  </div>

                  <button
                    onClick={() => deleteBanner(index)}
                    className="p-1.5 hover:bg-red-950/20 rounded-lg border border-transparent hover:border-red-900/30 text-zinc-500 hover:text-red-500 transition-all cursor-pointer"
                    title="Remove Slide"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
