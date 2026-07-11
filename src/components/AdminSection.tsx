import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ref,
  onValue,
  update,
  remove,
  set,
  push,
  get
} from "../firebase";
import {
  Menu,
  X,
  TrendingUp,
  Users,
  ShoppingCart,
  Wallet,
  ShieldCheck,
  Plus,
  Trash2,
  Edit3,
  Save,
  QrCode,
  Sliders,
  Check,
  AlertTriangle,
  Search,
  ChevronRight,
  Database,
  Image as ImageIcon,
  UserCheck,
  UserX,
  Upload
} from "lucide-react";
import { ServiceItem, GamePackage } from "../data/packages";

interface AdminSectionProps {
  db: any;
  currentUser: any;
  services: ServiceItem[];
  setActiveSection?: (section: string) => void;
}

export default function AdminSection({ db, currentUser, services, setActiveSection }: AdminSectionProps) {
  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [adminTab, setAdminTab] = useState<"dashboard" | "games" | "products" | "qrcode" | "requirements" | "banners">("dashboard");

  // Dynamic state loaded from DB
  const [dbGames, setDbGames] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [allDeposits, setAllDeposits] = useState<any[]>([]);
  const [globalRequirements, setGlobalRequirements] = useState<any[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<any>({ qrCode: "", esewaNum: "" });
  const [currentBanners, setCurrentBanners] = useState<string[]>([]);

  // Search filter inputs
  const [searchQuery, setSearchQuery] = useState("");
  const [orderFilter, setOrderFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [depositFilter, setDepositFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  // Sub-navigation inside Dashboard (to toggle users, orders, deposits lists)
  const [dashboardSubTab, setDashboardSubTab] = useState<"orders" | "deposits" | "users" | "banners">("orders");

  // Edit / Add modal states
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustNote, setAdjustNote] = useState("");
  const [loading, setLoading] = useState(false);

  // New Game Form state
  const [newGameId, setNewGameId] = useState("");
  const [newGameName, setNewGameName] = useState("");
  const [newGameImage, setNewGameImage] = useState("");
  const [newGameCategory, setNewGameCategory] = useState<"topup" | "voucher" | "subscription">("topup");
  const [newGameDesc, setNewGameDesc] = useState("");
  const [selectedGameReqs, setSelectedGameReqs] = useState<string[]>([]);

  // Editing Game ID state
  const [editingGameId, setEditingGameId] = useState<string | null>(null);
  const [editGameName, setEditGameName] = useState("");
  const [editGameImage, setEditGameImage] = useState("");
  const [editGameCategory, setEditGameCategory] = useState<"topup" | "voucher" | "subscription">("topup");
  const [editGameDesc, setEditGameDesc] = useState("");
  const [editGameReqs, setEditGameReqs] = useState<string[]>([]);

  // Products manager state
  const [selectedProductGameId, setSelectedProductGameId] = useState<string>("");
  const [newPackageName, setNewPackageName] = useState("");
  const [newPackagePrice, setNewPackagePrice] = useState("");
  const [editingPkgIdx, setEditingPkgIdx] = useState<number | null>(null);
  const [editPackageName, setEditPackageName] = useState("");
  const [editPackagePrice, setEditPackagePrice] = useState("");

  // QR Code form state
  const [qrInputUrl, setQrInputUrl] = useState("");
  const [esewaInputNumber, setEsewaInputNumber] = useState("");

  // Banner state
  const [newBannerUrl, setNewBannerUrl] = useState("");

  // Requirements form state
  const [newReqName, setNewReqName] = useState("");
  const [newReqType, setNewReqType] = useState<"text" | "number">("text");
  const [editingReqId, setEditingReqId] = useState<string | null>(null);
  const [editReqName, setEditReqName] = useState("");
  const [editReqType, setEditReqType] = useState<"text" | "number">("text");

  // Load all DB lists
  useEffect(() => {
    // 1. Fetch Users
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

    // 2. Fetch Orders
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
        setAllOrders([]);
      }
    });

    // 3. Fetch Deposits
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

    // 4. Fetch Games
    const gamesRef = ref(db, "games");
    const unsubscribeGames = onValue(gamesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Array.isArray(data) ? data : Object.keys(data).map(k => ({ id: k, ...data[k] }));
        setDbGames(list.filter(Boolean));
      } else {
        setDbGames([]);
      }
    });

    // 5. Fetch Requirements
    const reqRef = ref(db, "global_requirements");
    const unsubscribeReqs = onValue(reqRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setGlobalRequirements(list);
      } else {
        // Seed default requirement
        const defaultReq = { name: "Player UID", type: "text" };
        const newKey = push(reqRef).key;
        if (newKey) {
          set(ref(db, `global_requirements/${newKey}`), defaultReq);
        }
        setGlobalRequirements([]);
      }
    });

    // 6. Fetch Payment settings
    const paymentRef = ref(db, "payment_settings");
    const unsubscribePayment = onValue(paymentRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPaymentSettings(data);
        setEsewaInputNumber(data.esewaNum || "");
        setQrInputUrl(data.qrCode || "");
      }
    });

    // 7. Fetch slide banners
    const bannersRef = ref(db, "banners");
    const unsubscribeBanners = onValue(bannersRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        setCurrentBanners(Array.isArray(val) ? val : Object.values(val));
      }
    });

    return () => {
      unsubscribeUsers();
      unsubscribeAllOrders();
      unsubscribeDeposits();
      unsubscribeGames();
      unsubscribeReqs();
      unsubscribePayment();
      unsubscribeBanners();
    };
  }, [db]);

  // Balance Override Operations
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

      await update(ref(db, `users/${selectedUser.uid}`), {
        balance: newBalance
      });

      const notificationRef = ref(db, "notifications");
      await push(notificationRef, {
        title: type === "add" ? "💰 Wallet Credits Added" : "⚠️ Wallet Credits Deducted",
        body: `Dear ${selectedUser.name}, your wallet has been updated. Balance: ${type === "add" ? "+" : "-"} NPR ${amt}. Note: ${adjustNote || "Manual Adjustment"}.`,
        timestamp: Date.now(),
        type: type === "add" ? "success" : "warning",
        targetUid: selectedUser.uid
      });

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
        await update(ref(db, `deposits/${deposit.depositId}`), {
          status: "approved"
        });

        let userBal = 0;
        const matchedUser = allUsers.find(u => u.uid === deposit.uid);
        if (matchedUser) {
          userBal = matchedUser.balance ?? 0;
        }
        const updatedBal = userBal + deposit.amount;

        await update(ref(db, `users/${deposit.uid}`), {
          balance: updatedBal
        });

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
        await update(ref(db, `all_orders/${order.orderId}`), {
          status: "approved"
        });

        await update(ref(db, `orders/${order.uid}/${order.userOrderId || order.orderId}`), {
          status: "approved"
        });

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
        let userBal = 0;
        const matchedUser = allUsers.find(u => u.uid === order.uid);
        if (matchedUser) {
          userBal = matchedUser.balance ?? 0;
        }
        const refundedBal = userBal + order.price;

        await update(ref(db, `users/${order.uid}`), {
          balance: refundedBal
        });

        await update(ref(db, `all_orders/${order.orderId}`), {
          status: "rejected"
        });

        await update(ref(db, `orders/${order.uid}/${order.userOrderId || order.orderId}`), {
          status: "rejected"
        });

        const notifRef = ref(db, "notifications");
        await push(notifRef, {
          title: "❌ Order Rejected & Refunded",
          body: `Your order for ${order.game} (${order.packageName}) was rejected. NPR ${order.price} has been refunded to your wallet.`,
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

  // ---------------- GEMS / GAMES CRUD ----------------
  const handleAddGame = async () => {
    if (!newGameId.trim() || !newGameName.trim()) {
      alert("Game ID and Name are required");
      return;
    }
    const cleanId = newGameId.trim().toLowerCase().replace(/\s+/g, "_");

    // Convert requirements selections to actual fields array
    const fields = selectedGameReqs.map(reqId => {
      const reqObj = globalRequirements.find(r => r.id === reqId);
      return {
        label: reqObj?.name || "Player UID",
        placeholder: `e.g. enter ${reqObj?.name.toLowerCase()}`,
        type: reqObj?.type || "text",
        key: reqObj?.name.toLowerCase().replace(/\s+/g, "") || "playerUid"
      };
    });

    // Default fields if empty
    const finalFields = fields.length > 0 ? fields : [
      { label: "Player UID", placeholder: "e.g. 5839218392", type: "text", key: "playerUid" }
    ];

    const newGameObj = {
      id: cleanId,
      name: newGameName.trim(),
      image: newGameImage.trim() || "https://i.ibb.co/My1kJfTy/IMG-20260302-211532.jpg",
      category: newGameCategory,
      description: newGameDesc.trim() || "Instant top-up and voucher load service.",
      fields: finalFields,
      packages: []
    };

    try {
      await set(ref(db, `games/${cleanId}`), newGameObj);
      setNewGameId("");
      setNewGameName("");
      setNewGameImage("");
      setNewGameCategory("topup");
      setNewGameDesc("");
      setSelectedGameReqs([]);
      alert("Game added successfully!");
    } catch (err: any) {
      alert("Error adding game: " + err.message);
    }
  };

  const handleEditGameSave = async () => {
    if (!editingGameId) return;

    const fields = editGameReqs.map(reqId => {
      const reqObj = globalRequirements.find(r => r.id === reqId);
      return {
        label: reqObj?.name || "Player UID",
        placeholder: `e.g. enter ${reqObj?.name.toLowerCase()}`,
        type: reqObj?.type || "text",
        key: reqObj?.name.toLowerCase().replace(/\s+/g, "") || "playerUid"
      };
    });

    const finalFields = fields.length > 0 ? fields : [
      { label: "Player UID", placeholder: "e.g. 5839218392", type: "text", key: "playerUid" }
    ];

    try {
      await update(ref(db, `games/${editingGameId}`), {
        name: editGameName.trim(),
        image: editGameImage.trim(),
        category: editGameCategory,
        description: editGameDesc.trim(),
        fields: finalFields
      });
      setEditingGameId(null);
      alert("Game updated successfully!");
    } catch (err: any) {
      alert("Error saving game: " + err.message);
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    if (confirm("Are you sure you want to delete this game? This will also delete all packages under it!")) {
      try {
        await remove(ref(db, `games/${gameId}`));
        alert("Game deleted.");
      } catch (err: any) {
        alert("Error deleting game: " + err.message);
      }
    }
  };

  // ---------------- PRODUCTS (PACKAGES) CRUD ----------------
  const handleAddPackage = async () => {
    if (!selectedProductGameId) {
      alert("Please select a game first");
      return;
    }
    if (!newPackageName.trim() || !newPackagePrice.trim()) {
      alert("Package name and price are required");
      return;
    }
    const priceNum = parseFloat(newPackagePrice);
    if (isNaN(priceNum) || priceNum < 0) {
      alert("Please enter a valid price");
      return;
    }

    const gameObj = dbGames.find(g => g.id === selectedProductGameId);
    const existingPackages = gameObj?.packages ? [...gameObj.packages] : [];

    const newPkg: GamePackage = {
      n: newPackageName.trim(),
      p: priceNum
    };

    const updatedPkgs = [...existingPackages, newPkg];

    try {
      await set(ref(db, `games/${selectedProductGameId}/packages`), updatedPkgs);
      setNewPackageName("");
      setNewPackagePrice("");
      alert("Product package added successfully!");
    } catch (err: any) {
      alert("Error adding package: " + err.message);
    }
  };

  const handleUpdatePackage = async (idx: number) => {
    if (!selectedProductGameId || idx === null) return;
    const nameStr = editPackageName.trim();
    const priceNum = parseFloat(editPackagePrice);

    if (!nameStr || isNaN(priceNum) || priceNum < 0) {
      alert("Invalid package details");
      return;
    }

    const gameObj = dbGames.find(g => g.id === selectedProductGameId);
    if (!gameObj) return;

    const packages = [...gameObj.packages];
    packages[idx] = { n: nameStr, p: priceNum };

    try {
      await set(ref(db, `games/${selectedProductGameId}/packages`), packages);
      setEditingPkgIdx(null);
      alert("Package updated successfully!");
    } catch (err: any) {
      alert("Error updating: " + err.message);
    }
  };

  const handleDeletePackage = async (idx: number) => {
    if (!selectedProductGameId) return;
    if (confirm("Delete this product package?")) {
      const gameObj = dbGames.find(g => g.id === selectedProductGameId);
      if (!gameObj) return;

      const packages = [...gameObj.packages].filter((_, i) => i !== idx);

      try {
        await set(ref(db, `games/${selectedProductGameId}/packages`), packages);
        alert("Package deleted.");
      } catch (err: any) {
        alert("Error deleting package: " + err.message);
      }
    }
  };

  // ---------------- QR CODE & ESEWA PAYMENTS CRUD ----------------
  const handleSavePaymentSettings = async () => {
    try {
      await update(ref(db, "payment_settings"), {
        qrCode: qrInputUrl.trim(),
        esewaNum: esewaInputNumber.trim()
      });
      alert("Payment settings updated successfully!");
    } catch (err: any) {
      alert("Error updating payment settings: " + err.message);
    }
  };

  const handleDeleteQr = async () => {
    if (confirm("Are you sure you want to delete/clear the QR code image?")) {
      try {
        await update(ref(db, "payment_settings"), { qrCode: "" });
        setQrInputUrl("");
        alert("QR Code cleared.");
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleDeleteEsewaNum = async () => {
    if (confirm("Are you sure you want to delete/clear the eSewa Number?")) {
      try {
        await update(ref(db, "payment_settings"), { esewaNum: "" });
        setEsewaInputNumber("");
        alert("eSewa Number cleared.");
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // Handle local QR code image select (File upload -> base64)
  const handleQrImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "image/png" && file.type !== "image/jpeg" && file.type !== "image/jpg") {
      alert("Please upload JPG, JPEG, or PNG files only.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setQrInputUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // ---------------- REQUIREMENTS CRUD ----------------
  const handleAddRequirement = async () => {
    if (!newReqName.trim()) {
      alert("Requirement Name is required");
      return;
    }

    const newReq = {
      name: newReqName.trim(),
      type: newReqType
    };

    try {
      const reqRef = ref(db, "global_requirements");
      await push(reqRef, newReq);
      setNewReqName("");
      setNewReqType("text");
      alert("Requirement field created!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateRequirement = async () => {
    if (!editingReqId) return;
    try {
      await update(ref(db, `global_requirements/${editingReqId}`), {
        name: editReqName.trim(),
        type: editReqType
      });
      setEditingReqId(null);
      alert("Requirement updated!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteRequirement = async (id: string) => {
    if (confirm("Delete this requirement? It will be removed from global pool.")) {
      try {
        await remove(ref(db, `global_requirements/${id}`));
        alert("Deleted.");
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // ---------------- SLIDESHOW BANNERS CRUD ----------------
  const addBanner = async () => {
    if (!newBannerUrl.trim()) return;
    const updated = [...currentBanners, newBannerUrl.trim()];
    try {
      await set(ref(db, "banners"), updated);
      setNewBannerUrl("");
      alert("Slideshow banner added successfully!");
    } catch (err: any) {
      alert(err.message);
    }
  };

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

  // ---------------- COMPUTING STATS ----------------
  const totalSales = allOrders
    .filter(o => o.status === "approved")
    .reduce((acc, curr) => acc + (curr.price ?? 0), 0);

  const pendingDepositsCount = allDeposits.filter(d => d.status === "pending").length;
  const pendingOrdersCount = allOrders.filter(o => o.status === "pending").length;

  // Filters for lists
  const filteredUsers = allUsers.filter(u =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.uniqueId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = allOrders.filter(o => {
    const isMatchedQuery = searchQuery === "" ||
      o.playerUid?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.packageName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.game?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.uniqueId?.toLowerCase().includes(searchQuery.toLowerCase());

    const isMatchedFilter = orderFilter === "all" || o.status === orderFilter;
    return isMatchedQuery && isMatchedFilter;
  });

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
    <div className="bg-[#0b111e]/90 border border-zinc-900 rounded-3xl p-5 space-y-6 relative min-h-[600px] overflow-hidden text-white font-sans shadow-2xl">
      
      {/* MENU BAR HEADER */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2.5 bg-black/40 hover:bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded-xl cursor-pointer transition-all duration-200"
            title="Open Control Panel Navigation"
            id="admin-hamburger-menu"
          >
            <Menu className="w-5 h-5 text-red-500 animate-pulse" />
          </button>
          
          <div>
            <h2 className="font-orbitron font-extrabold text-lg text-white tracking-wider uppercase flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-red-500" /> BNY Desk
            </h2>
            <p className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase">
              {adminTab === "dashboard" && "Dashboard Overview"}
              {adminTab === "games" && "Games / Service Title Editor"}
              {adminTab === "products" && "Packages & Price Customizer"}
              {adminTab === "qrcode" && "Payment settings details"}
              {adminTab === "requirements" && "Dynamic Order Requirements manager"}
              {adminTab === "banners" && "Slide banners manager"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {setActiveSection && (
            <button
              onClick={() => setActiveSection("home")}
              className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 text-[10px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider font-mono transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Exit Admin
            </button>
          )}
          <span className="bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest font-mono">
            {adminTab.toUpperCase()}
          </span>
        </div>
      </div>

      {/* SLIDING SIDEBAR (SIDE DRAWER) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999]"
            />

            {/* Sidebar Slider Box */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-[#090d16] border-r border-zinc-900 p-6 flex flex-col justify-between z-[1000] shadow-[10px_0_30px_rgba(0,0,0,0.8)]"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-zinc-900">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-bold text-white shadow-lg shadow-red-500/35">
                      B
                    </div>
                    <div>
                      <h4 className="font-orbitron font-extrabold text-xs text-white">BNY SYSTEM</h4>
                      <p className="text-[8px] text-zinc-500 font-mono">v3.1 SECURE PORTAL</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1.5 bg-black/40 hover:bg-zinc-900 border border-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  {[
                    { id: "dashboard", label: "Dashboard", icon: TrendingUp },
                    { id: "games", label: "Games", icon: Database },
                    { id: "products", label: "Products", icon: ShoppingCart },
                    { id: "qrcode", label: "QR Code & Payments", icon: QrCode },
                    { id: "requirements", label: "Requirements", icon: Sliders },
                    { id: "banners", label: "Slide Banners", icon: ImageIcon }
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = adminTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setAdminTab(item.id as any);
                          setIsSidebarOpen(false);
                          setSearchQuery("");
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          isActive
                            ? "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                            : "text-zinc-400 hover:text-white hover:bg-zinc-900/40 border border-transparent"
                        }`}
                      >
                        <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}

                  {setActiveSection && (
                    <button
                      onClick={() => {
                        setActiveSection("home");
                        setIsSidebarOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 hover:text-white hover:bg-emerald-950/20 border border-emerald-900/30 hover:border-emerald-700/50 transition-all cursor-pointer mt-4"
                    >
                      <UserCheck className="w-4.5 h-4.5 flex-shrink-0" />
                      <span>Switch to User View</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="border-t border-zinc-900 pt-4 text-center">
                <p className="text-[9px] text-zinc-600 font-mono">
                  LOGGED IN AS ADMIN
                </p>
                <p className="text-[8px] text-zinc-500 truncate mt-0.5">
                  {currentUser?.email || "Local Override Access"}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ----------------- CONTENT CONTAINER ----------------- */}
      <div className="min-h-[400px]">

        {/* 1. DASHBOARD OVERVIEW */}
        {adminTab === "dashboard" && (
          <div className="space-y-6">
            {/* STATISTICS ROW */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-black/30 p-4 border border-zinc-900 rounded-2xl space-y-1">
                <span className="text-[9px] text-zinc-500 block uppercase font-mono">Total Sales</span>
                <p className="text-lg font-bold font-mono text-emerald-500">NPR {totalSales}</p>
                <span className="text-[7px] text-emerald-600 block">From approved dispatches</span>
              </div>

              <div className="bg-black/30 p-4 border border-zinc-900 rounded-2xl space-y-1">
                <span className="text-[9px] text-zinc-500 block uppercase font-mono">Total Orders</span>
                <p className="text-lg font-bold font-mono text-white">{allOrders.length}</p>
                <span className="text-[7px] text-zinc-500 block">Total system logs</span>
              </div>

              <div className="bg-black/30 p-4 border border-zinc-900 rounded-2xl space-y-1 relative overflow-hidden">
                <span className="text-[9px] text-zinc-500 block uppercase font-mono">Pending Deposit</span>
                <p className="text-lg font-bold font-mono text-blue-400">{pendingDepositsCount}</p>
                <span className="text-[7px] text-zinc-500 block">Requires verification</span>
                {pendingDepositsCount > 0 && (
                  <div className="absolute right-2 top-2 w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></div>
                )}
              </div>

              <div className="bg-black/30 p-4 border border-zinc-900 rounded-2xl space-y-1 relative overflow-hidden">
                <span className="text-[9px] text-zinc-500 block uppercase font-mono">Pending Orders</span>
                <p className="text-lg font-bold font-mono text-red-500">{pendingOrdersCount}</p>
                <span className="text-[7px] text-zinc-500 block">Needs processing</span>
                {pendingOrdersCount > 0 && (
                  <div className="absolute right-2 top-2 w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></div>
                )}
              </div>

              <div className="bg-black/30 p-4 border border-zinc-900 rounded-2xl space-y-1 col-span-2 md:col-span-1">
                <span className="text-[9px] text-zinc-500 block uppercase font-mono">Total Users</span>
                <p className="text-lg font-bold font-mono text-purple-400">{allUsers.length}</p>
                <span className="text-[7px] text-zinc-500 block">Registered gamer base</span>
              </div>
            </div>

            {/* QUICK ALERTS */}
            <div className="bg-red-950/20 border border-red-900/35 p-4 rounded-2xl flex gap-3.5 items-start">
              <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
              <div className="text-xs space-y-1">
                <span className="font-extrabold font-mono text-red-500 uppercase block tracking-wider">
                  Administrative Pending Task List
                </span>
                <p className="text-zinc-400">
                  There are <strong className="text-white font-bold">{pendingOrdersCount} pending orders</strong> and <strong className="text-white font-bold">{pendingDepositsCount} pending wallet loads</strong> requiring manual verification and delivery.
                </p>
              </div>
            </div>

            {/* DASHBOARD MANAGEMENT TABS */}
            <div className="flex bg-black/40 border border-zinc-900 p-1 rounded-2xl gap-1 text-[10px] font-mono font-bold uppercase tracking-wider">
              {[
                { id: "orders", label: `Fulfill Orders (${pendingOrdersCount})`, color: "border-red-500 text-red-500" },
                { id: "deposits", label: `Load Deposits (${pendingDepositsCount})`, color: "border-blue-500 text-blue-500" },
                { id: "users", label: `User Balances (${allUsers.length})`, color: "border-purple-500 text-purple-500" }
              ].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => {
                    setDashboardSubTab(sub.id as any);
                    setSearchQuery("");
                  }}
                  className={`flex-1 text-center py-2.5 rounded-xl cursor-pointer transition-all ${
                    dashboardSubTab === sub.id
                      ? "bg-zinc-900 text-white border border-zinc-800"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* SUB-TAB CONTENTS */}
            <div className="space-y-4">
              {/* SEARCH */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Filter lists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 border border-zinc-900 rounded-xl px-10 py-2.5 text-xs font-mono placeholder-zinc-700 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              {/* ORDERS LIST */}
              {dashboardSubTab === "orders" && (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 no-scrollbar">
                  {filteredOrders.length === 0 ? (
                    <p className="text-center py-10 text-zinc-500 font-mono text-xs">No orders match filter.</p>
                  ) : (
                    filteredOrders.map(order => (
                      <div key={order.orderId} className="bg-black/40 border border-zinc-900/80 rounded-2xl p-4 space-y-3">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="bg-red-500/10 border border-red-500/20 text-red-500 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                                {order.game}
                              </span>
                              <strong className="text-white text-xs">{order.packageName}</strong>
                            </div>
                            <p className="text-[9px] text-zinc-500 font-mono mt-0.5">
                              {new Date(order.timestamp).toLocaleString()} &bull; Code: {order.orderId.slice(0,8).toUpperCase()}
                            </p>
                            <p className="text-[10px] text-zinc-400">Gamer: {order.email}</p>
                          </div>
                          <div className="text-right">
                            <strong className="text-white font-mono text-sm">NPR {order.price}</strong>
                            <span className={`block text-[9px] font-bold uppercase font-mono ${
                              order.status === "approved" ? "text-emerald-500" : order.status === "rejected" ? "text-red-500" : "text-amber-500 animate-pulse"
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>

                        {/* Order dynamic requirements fields */}
                        <div className="bg-black/60 border border-zinc-900 rounded-xl p-3 grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-400">
                          {order.playerUid && (
                            <div>
                              <span className="text-zinc-600 block text-[8px] uppercase">Player UID</span>
                              <strong className="text-red-500">{order.playerUid}</strong>
                            </div>
                          )}
                          {order.customerEmail && (
                            <div>
                              <span className="text-zinc-600 block text-[8px] uppercase">Customer Email</span>
                              <strong className="text-white">{order.customerEmail}</strong>
                            </div>
                          )}
                          {order.customerPassword && (
                            <div>
                              <span className="text-zinc-600 block text-[8px] uppercase">Activation Pass</span>
                              <strong className="text-white">{order.customerPassword}</strong>
                            </div>
                          )}
                          {order.whatsappNumber && (
                            <div>
                              <span className="text-zinc-600 block text-[8px] uppercase">Contact WhatsApp</span>
                              <strong className="text-white">{order.whatsappNumber}</strong>
                            </div>
                          )}
                        </div>

                        {order.status === "pending" && (
                          <div className="flex gap-2 font-mono font-bold">
                            <button
                              onClick={() => rejectOrder(order)}
                              className="flex-1 bg-red-950/20 hover:bg-red-900/30 border border-red-900/30 text-red-500 text-[10px] py-2 rounded-lg cursor-pointer"
                            >
                              REJECT
                            </button>
                            <button
                              onClick={() => approveOrder(order)}
                              className="flex-1 bg-red-600 text-white hover:bg-red-700 text-[10px] py-2 rounded-lg cursor-pointer"
                            >
                              DISPATCH DELIVERED
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* DEPOSITS LIST */}
              {dashboardSubTab === "deposits" && (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 no-scrollbar">
                  {filteredDeposits.length === 0 ? (
                    <p className="text-center py-10 text-zinc-500 font-mono text-xs">No deposit slips found.</p>
                  ) : (
                    filteredDeposits.map(dep => (
                      <div key={dep.depositId} className="bg-black/40 border border-zinc-900 p-4 rounded-2xl space-y-3.5">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                              eSewa / Khalti Load
                            </span>
                            <p className="text-[10px] text-white font-mono mt-1">Trx Code: {dep.trx}</p>
                            <p className="text-[9px] text-zinc-500 font-mono">{new Date(dep.timestamp).toLocaleString()}</p>
                            <p className="text-[10px] text-zinc-400">Gamer: {dep.email}</p>
                          </div>
                          <div className="text-right">
                            <strong className="text-emerald-500 font-mono text-sm">NPR {dep.amount}</strong>
                            <span className={`block text-[9px] font-bold uppercase font-mono ${
                              dep.status === "approved" ? "text-emerald-500" : dep.status === "rejected" ? "text-red-500" : "text-blue-400 animate-pulse"
                            }`}>
                              {dep.status}
                            </span>
                          </div>
                        </div>

                        {dep.senderName && (
                          <p className="text-[10px] font-mono text-zinc-400">Sender: {dep.senderName} ({dep.senderNum || "N/A"})</p>
                        )}

                        {dep.proofImage && (
                          <div className="text-center bg-black/60 p-2 border border-zinc-900 rounded-xl">
                            <img
                              src={dep.proofImage}
                              alt="deposit proof"
                              className="max-h-48 object-contain mx-auto rounded-lg"
                            />
                          </div>
                        )}

                        {dep.status === "pending" && (
                          <div className="flex gap-2 font-mono font-bold">
                            <button
                              onClick={() => rejectDeposit(dep)}
                              className="flex-1 bg-red-950/20 hover:bg-red-900/30 border border-red-900/30 text-red-500 text-[10px] py-2 rounded-lg cursor-pointer"
                            >
                              DECLINE
                            </button>
                            <button
                              onClick={() => approveDeposit(dep)}
                              className="flex-1 bg-blue-600 text-white hover:bg-blue-700 text-[10px] py-2 rounded-lg cursor-pointer"
                            >
                              CONFIRM CREDIT
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* USERS LIST */}
              {dashboardSubTab === "users" && (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 no-scrollbar">
                  {filteredUsers.length === 0 ? (
                    <p className="text-center py-10 text-zinc-500 font-mono text-xs">No users match query.</p>
                  ) : (
                    filteredUsers.map(u => (
                      <div key={u.uid} className="bg-black/40 border border-zinc-900 p-4 rounded-2xl flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-white text-xs">{u.name}</strong>
                            <span className="text-[8px] text-zinc-500 font-mono">({u.uniqueId || "N/A"})</span>
                          </div>
                          <p className="text-[10px] text-zinc-500 font-mono">{u.email}</p>
                          <p className="text-[10px] text-red-400 font-mono">Credits: NPR {u.balance ?? 0}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] px-3 py-1.5 rounded-lg cursor-pointer font-bold font-mono"
                          >
                            BALANCE
                          </button>
                          <button
                            onClick={() => toggleBlockUser(u)}
                            className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                              u.blocked ? "bg-red-900/20 text-red-500 border-red-900" : "bg-zinc-900 text-zinc-500 border-zinc-800"
                            }`}
                          >
                            {u.blocked ? "BLOCKED" : "BLOCK"}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. GAMES CRUD EDITOR */}
        {adminTab === "games" && (
          <div className="space-y-6">
            {/* ADD GAME FORM */}
            <div className="bg-black/30 border border-zinc-900 p-5 rounded-2xl space-y-4">
              <span className="text-[10px] text-red-500 font-extrabold font-mono uppercase tracking-widest block">
                Add New Game / Service Title
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <label className="text-zinc-500 block mb-1 uppercase text-[9px] font-bold">Game Slug / unique ID (No spaces)</label>
                  <input
                    type="text"
                    placeholder="e.g. clash_of_clans"
                    value={newGameId}
                    onChange={(e) => setNewGameId(e.target.value)}
                    className="w-full bg-black border border-zinc-900 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-zinc-500 block mb-1 uppercase text-[9px] font-bold">Game Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Clash of Clans"
                    value={newGameName}
                    onChange={(e) => setNewGameName(e.target.value)}
                    className="w-full bg-black border border-zinc-900 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-zinc-500 block mb-1 uppercase text-[9px] font-bold">Image URL</label>
                  <input
                    type="text"
                    placeholder="https://i.ibb.co/..."
                    value={newGameImage}
                    onChange={(e) => setNewGameImage(e.target.value)}
                    className="w-full bg-black border border-zinc-900 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-zinc-500 block mb-1 uppercase text-[9px] font-bold">Category</label>
                  <select
                    value={newGameCategory}
                    onChange={(e) => setNewGameCategory(e.target.value as any)}
                    className="w-full bg-black border border-zinc-900 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-red-500 uppercase"
                  >
                    <option value="topup">Direct Top-up</option>
                    <option value="voucher">Voucher Code</option>
                    <option value="subscription">Premium Subscription</option>
                  </select>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="text-zinc-500 block mb-1 uppercase text-[9px] font-bold">Description Text</label>
                  <input
                    type="text"
                    placeholder="Enter short gamer description..."
                    value={newGameDesc}
                    onChange={(e) => setNewGameDesc(e.target.value)}
                    className="w-full bg-black border border-zinc-900 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="text-zinc-500 block mb-2 uppercase text-[9px] font-bold">Select Requirements (Checkout Input Fields)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-black/45 rounded-xl border border-zinc-900">
                    {globalRequirements.map(req => {
                      const isChecked = selectedGameReqs.includes(req.id);
                      return (
                        <label key={req.id} className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedGameReqs(selectedGameReqs.filter(id => id !== req.id));
                              } else {
                                setSelectedGameReqs([...selectedGameReqs, req.id]);
                              }
                            }}
                            className="rounded accent-red-600"
                          />
                          <span className="text-[11px] text-zinc-300 truncate">{req.name} ({req.type})</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                onClick={handleAddGame}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase font-mono cursor-pointer transition-colors"
              >
                Create Game Title
              </button>
            </div>

            {/* LIST OF GAMES WITH EDIT/DELETE */}
            <div className="space-y-3.5">
              <span className="text-[10px] text-zinc-500 font-extrabold font-mono uppercase tracking-widest block">
                Manage Available Games ({dbGames.length})
              </span>

              <div className="grid grid-cols-1 gap-3.5 max-h-[400px] overflow-y-auto pr-1 no-scrollbar">
                {dbGames.map(game => {
                  const isEditing = editingGameId === game.id;
                  return (
                    <div key={game.id} className="bg-black/40 border border-zinc-900 p-4 rounded-2xl space-y-4">
                      {isEditing ? (
                        // Game Editing State
                        <div className="space-y-3 font-mono text-xs">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-zinc-600 block text-[8px] uppercase">Game Name</label>
                              <input
                                type="text"
                                value={editGameName}
                                onChange={(e) => setEditGameName(e.target.value)}
                                className="w-full bg-black border border-zinc-900 rounded-lg p-2 text-white focus:outline-none focus:border-red-500"
                              />
                            </div>
                            <div>
                              <label className="text-zinc-600 block text-[8px] uppercase">Image URL</label>
                              <input
                                type="text"
                                value={editGameImage}
                                onChange={(e) => setEditGameImage(e.target.value)}
                                className="w-full bg-black border border-zinc-900 rounded-lg p-2 text-white focus:outline-none focus:border-red-500"
                              />
                            </div>
                            <div>
                              <label className="text-zinc-600 block text-[8px] uppercase">Category</label>
                              <select
                                value={editGameCategory}
                                onChange={(e) => setEditGameCategory(e.target.value as any)}
                                className="w-full bg-black border border-zinc-900 rounded-lg p-2 text-white uppercase focus:outline-none"
                              >
                                <option value="topup">topup</option>
                                <option value="voucher">voucher</option>
                                <option value="subscription">subscription</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-zinc-600 block text-[8px] uppercase">Description</label>
                              <input
                                type="text"
                                value={editGameDesc}
                                onChange={(e) => setEditGameDesc(e.target.value)}
                                className="w-full bg-black border border-zinc-900 rounded-lg p-2 text-white focus:outline-none focus:border-red-500"
                              />
                            </div>
                          </div>

                          {/* Requirements Selection for Edit */}
                          <div>
                            <label className="text-zinc-600 block text-[8px] uppercase mb-1.5">Game Checkout Fields</label>
                            <div className="grid grid-cols-2 gap-2 p-2.5 bg-black rounded-lg border border-zinc-900">
                              {globalRequirements.map(req => {
                                const isChecked = editGameReqs.includes(req.id);
                                return (
                                  <label key={req.id} className="flex items-center gap-1.5 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => {
                                        if (isChecked) {
                                          setEditGameReqs(editGameReqs.filter(id => id !== req.id));
                                        } else {
                                          setEditGameReqs([...editGameReqs, req.id]);
                                        }
                                      }}
                                      className="accent-red-600"
                                    />
                                    <span className="text-[10px] text-zinc-400">{req.name}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          <div className="flex gap-2 font-bold font-mono">
                            <button
                              onClick={() => setEditingGameId(null)}
                              className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 py-1.5 rounded-lg text-[10px] cursor-pointer"
                            >
                              CANCEL
                            </button>
                            <button
                              onClick={handleEditGameSave}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1.5 rounded-lg text-[10px] cursor-pointer"
                            >
                              SAVE CHANGES
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Game Normal View State
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-3">
                            <img
                              src={game.image}
                              alt={game.name}
                              className="w-12 h-12 object-cover rounded-xl border border-zinc-900 flex-shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <strong className="text-white text-xs">{game.name}</strong>
                                <span className="bg-zinc-900 border border-zinc-800 text-zinc-500 text-[8px] font-mono px-1.5 rounded-full lowercase">
                                  {game.category}
                                </span>
                              </div>
                              <p className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate max-w-xs">{game.description}</p>
                              <div className="flex gap-1.5 flex-wrap mt-1">
                                {game.fields?.map((f: any, idx: number) => (
                                  <span key={idx} className="bg-red-500/5 text-red-500 border border-red-950/20 text-[7px] font-mono font-bold uppercase px-1 py-0.2 rounded">
                                    {f.label} ({f.type})
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 font-mono font-bold">
                            <button
                              onClick={() => {
                                setEditingGameId(game.id);
                                setEditGameName(game.name);
                                setEditGameImage(game.image);
                                setEditGameCategory(game.category || "topup");
                                setEditGameDesc(game.description || "");
                                // Match checkout fields labels with global reqs
                                const matchIds = (game.fields || []).map((f: any) => {
                                  const reqObj = globalRequirements.find(r => r.name.toLowerCase() === f.label.toLowerCase());
                                  return reqObj?.id;
                                }).filter(Boolean);
                                setEditGameReqs(matchIds);
                              }}
                              className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl cursor-pointer"
                              title="Edit Game"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteGame(game.id)}
                              className="p-2 bg-red-950/20 hover:bg-red-900/20 border border-red-950 text-red-500 rounded-xl cursor-pointer"
                              title="Delete Game"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 3. PRODUCTS (PACKAGES) CRUD EDITOR */}
        {adminTab === "products" && (
          <div className="space-y-5">
            {/* GAME SELECTOR GRID */}
            <div>
              <label className="text-[10px] text-zinc-500 font-extrabold font-mono uppercase tracking-widest block mb-2">
                Select Game Title to Customize Products
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {dbGames.map(game => {
                  const isSelected = selectedProductGameId === game.id;
                  return (
                    <button
                      key={game.id}
                      onClick={() => {
                        setSelectedProductGameId(game.id);
                        setEditingPkgIdx(null);
                      }}
                      className={`flex items-center gap-2 p-2 rounded-xl text-left border transition-all truncate text-xs font-mono font-bold cursor-pointer ${
                        isSelected
                          ? "bg-red-500/10 border-red-600 text-red-500"
                          : "bg-black/30 border-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-900/20"
                      }`}
                    >
                      <img src={game.image} className="w-6 h-6 rounded object-cover flex-shrink-0" />
                      <span className="truncate">{game.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedProductGameId ? (
              // Selected Game Products view
              <div className="space-y-4">
                {/* ADD PRODUCT FORM */}
                <div className="bg-black/30 border border-zinc-900 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-red-500 font-extrabold font-mono uppercase tracking-widest block">
                      Add Product to {dbGames.find(g => g.id === selectedProductGameId)?.name}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div>
                      <label className="text-zinc-600 block text-[8px] uppercase font-bold mb-0.5">Package Quantity / Name</label>
                      <input
                        type="text"
                        placeholder="e.g. 100 Diamonds"
                        value={newPackageName}
                        onChange={(e) => setNewPackageName(e.target.value)}
                        className="w-full bg-black border border-zinc-900 rounded-lg p-2 text-white focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="text-zinc-600 block text-[8px] uppercase font-bold mb-0.5">Price in NPR (Rs.)</label>
                      <input
                        type="number"
                        placeholder="e.g. 110"
                        value={newPackagePrice}
                        onChange={(e) => setNewPackagePrice(e.target.value)}
                        className="w-full bg-black border border-zinc-900 rounded-lg p-2 text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleAddPackage}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase font-mono cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Product Option
                  </button>
                </div>

                {/* CURRENT PACKAGES LIST */}
                <div className="space-y-3">
                  <span className="text-[10px] text-zinc-500 font-extrabold font-mono uppercase tracking-widest block">
                    Product Packages List ({dbGames.find(g => g.id === selectedProductGameId)?.packages?.length || 0})
                  </span>

                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 no-scrollbar text-xs font-mono">
                    {(() => {
                      const gameObj = dbGames.find(g => g.id === selectedProductGameId);
                      const packagesList = gameObj?.packages || [];

                      if (packagesList.length === 0) {
                        return (
                          <div className="text-center py-10 bg-black/20 border border-zinc-900 rounded-2xl text-zinc-500">
                            There are no products available for this game. Add products above!
                          </div>
                        );
                      }

                      return packagesList.map((pkg: any, idx: number) => {
                        const isEditingPkg = editingPkgIdx === idx;
                        return (
                          <div key={idx} className="bg-black/40 border border-zinc-900 p-3 rounded-xl flex items-center justify-between gap-4">
                            {isEditingPkg ? (
                              <div className="flex-1 flex gap-2.5 items-end">
                                <div className="flex-1">
                                  <input
                                    type="text"
                                    value={editPackageName}
                                    onChange={(e) => setEditPackageName(e.target.value)}
                                    className="w-full bg-black border border-zinc-800 rounded p-1.5 text-xs text-white"
                                  />
                                </div>
                                <div className="w-24">
                                  <input
                                    type="number"
                                    value={editPackagePrice}
                                    onChange={(e) => setEditPackagePrice(e.target.value)}
                                    className="w-full bg-black border border-zinc-800 rounded p-1.5 text-xs text-red-500 font-bold"
                                  />
                                </div>
                                <div className="flex gap-1 font-bold">
                                  <button
                                    onClick={() => setEditingPkgIdx(null)}
                                    className="px-2 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-[9px]"
                                  >
                                    CANCEL
                                  </button>
                                  <button
                                    onClick={() => handleUpdatePackage(idx)}
                                    className="px-2 py-1.5 bg-red-600 rounded text-white text-[9px]"
                                  >
                                    SAVE
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <span className="font-bold text-white text-xs">{pkg.n}</span>
                                <div className="flex items-center gap-3">
                                  <strong className="text-red-500">NPR {pkg.p}</strong>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => {
                                        setEditingPkgIdx(idx);
                                        setEditPackageName(pkg.n);
                                        setEditPackagePrice(pkg.p.toString());
                                      }}
                                      className="p-1.5 hover:bg-zinc-900 text-zinc-500 hover:text-white border border-transparent hover:border-zinc-800 rounded-lg"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeletePackage(idx)}
                                      className="p-1.5 hover:bg-red-950/25 text-zinc-500 hover:text-red-500 border border-transparent hover:border-red-900/20 rounded-lg"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      });
                    })()}
                    </div>
                  </div>
                </div>
              ) : (
              <div className="text-center py-16 text-zinc-500 text-xs font-mono bg-black/10 border border-zinc-900 rounded-3xl">
                Please select a game from the options above to edit or add its product catalog packages.
              </div>
            )}
          </div>
        )}

        {/* 4. QR CODE & PAYMENTS MANAGER */}
        {adminTab === "qrcode" && (
          <div className="space-y-6">
            {/* ESEWA OR KHALTI PAYMENTS MANAGER */}
            <div className="bg-black/30 border border-zinc-900 p-5 rounded-2xl space-y-5">
              <div>
                <h4 className="text-[10px] text-red-500 font-extrabold font-mono uppercase tracking-widest block mb-4">
                  QR Code Display Settings
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono text-xs">
                  {/* Left panel: edit details */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-zinc-500 block mb-1 uppercase text-[9px] font-bold">Paste QR Image URL</label>
                      <input
                        type="text"
                        placeholder="https://image-uploader/qr-code.jpg"
                        value={qrInputUrl}
                        onChange={(e) => setQrInputUrl(e.target.value)}
                        className="w-full bg-black border border-zinc-900 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div className="bg-zinc-950 p-4 border border-zinc-900 rounded-xl space-y-2">
                      <label className="text-zinc-400 block uppercase text-[8px] font-bold flex items-center gap-1">
                        <Upload className="w-3.5 h-3.5 text-red-500" /> Upload Local Image File (Auto Base64)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleQrImageUpload}
                        className="text-[10px] text-zinc-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-zinc-900 file:text-red-500 hover:file:bg-zinc-800 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Right panel: qr preview */}
                  <div className="bg-black/45 p-4 rounded-2xl border border-zinc-900 text-center flex flex-col justify-center items-center space-y-2">
                    <span className="text-[8px] text-zinc-600 font-extrabold uppercase tracking-widest block">Active QR Display Preview</span>
                    {qrInputUrl ? (
                      <div className="space-y-3 text-center">
                        <img
                          src={qrInputUrl}
                          alt="Pay QR code preview"
                          className="max-h-40 mx-auto rounded-xl border-4 border-red-600 bg-white p-1"
                        />
                        <div className="flex justify-center gap-2 font-bold font-mono text-[10px]">
                          <button
                            onClick={handleDeleteQr}
                            className="bg-red-950/20 hover:bg-red-900/30 border border-red-950 px-3 py-1 rounded-lg text-red-500 cursor-pointer"
                          >
                            DELETE QR
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-zinc-600 py-6">No payment QR image configured.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-900/80 pt-4">
                <h4 className="text-[10px] text-red-500 font-extrabold font-mono uppercase tracking-widest block mb-3">
                  eSewa Payment Number Settings
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end font-mono text-xs">
                  <div>
                    <label className="text-zinc-500 block mb-1 uppercase text-[9px] font-bold">eSewa Account ID / Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 9825880400"
                      value={esewaInputNumber}
                      onChange={(e) => setEsewaInputNumber(e.target.value)}
                      className="w-full bg-black border border-zinc-900 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleDeleteEsewaNum}
                      className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 font-bold px-4 py-2.5 rounded-lg text-xs uppercase cursor-pointer flex-1"
                    >
                      Delete Number
                    </button>
                    <button
                      onClick={handleSavePaymentSettings}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-lg text-xs uppercase cursor-pointer flex-1 text-center"
                    >
                      Save Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. REQUIREMENTS CRUD MANAGER */}
        {adminTab === "requirements" && (
          <div className="space-y-6">
            {/* ADD REQUIREMENT FORM */}
            <div className="bg-black/30 border border-zinc-900 p-5 rounded-2xl space-y-4 font-mono text-xs">
              <span className="text-[10px] text-red-500 font-extrabold uppercase tracking-widest block">
                Add Checkout Requirement Option
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-500 block mb-1 uppercase text-[9px] font-bold">Select Input Field Type</label>
                  <select
                    value={newReqType}
                    onChange={(e) => setNewReqType(e.target.value as any)}
                    className="w-full bg-black border border-zinc-900 rounded-lg py-2 px-3 text-white uppercase focus:outline-none focus:border-red-500"
                  >
                    <option value="text">Text Field</option>
                    <option value="number">Number Field</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-500 block mb-1 uppercase text-[9px] font-bold">Requirement Name (Label)</label>
                  <input
                    type="text"
                    placeholder="e.g. Player UID, Server ID"
                    value={newReqName}
                    onChange={(e) => setNewReqName(e.target.value)}
                    className="w-full bg-black border border-zinc-900 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <button
                onClick={handleAddRequirement}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl uppercase cursor-pointer transition-colors"
              >
                Add Requirement Option
              </button>
            </div>

            {/* LIST OF REQUIREMENTS */}
            <div className="space-y-3">
              <span className="text-[10px] text-zinc-500 font-extrabold font-mono uppercase tracking-widest block">
                All Available Order Requirements ({globalRequirements.length})
              </span>

              <div className="grid grid-cols-1 gap-3.5 max-h-[400px] overflow-y-auto pr-1 no-scrollbar text-xs font-mono">
                {globalRequirements.length === 0 ? (
                  <p className="text-center py-10 text-zinc-600">No custom requirement options configured yet.</p>
                ) : (
                  globalRequirements.map(req => {
                    const isEditingReq = editingReqId === req.id;
                    return (
                      <div key={req.id} className="bg-black/40 border border-zinc-900 p-3.5 rounded-2xl flex items-center justify-between gap-4">
                        {isEditingReq ? (
                          <div className="flex-1 flex gap-2.5 items-end">
                            <div className="flex-1">
                              <label className="text-zinc-600 block text-[7px] uppercase font-bold mb-0.5">Label</label>
                              <input
                                type="text"
                                value={editReqName}
                                onChange={(e) => setEditReqName(e.target.value)}
                                className="w-full bg-black border border-zinc-800 rounded p-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                              />
                            </div>
                            <div className="w-32">
                              <label className="text-zinc-600 block text-[7px] uppercase font-bold mb-0.5">Type</label>
                              <select
                                value={editReqType}
                                onChange={(e) => setEditReqType(e.target.value as any)}
                                className="w-full bg-black border border-zinc-800 rounded p-1.5 text-xs text-white focus:outline-none"
                              >
                                <option value="text">text</option>
                                <option value="number">number</option>
                              </select>
                            </div>
                            <div className="flex gap-1.5 font-bold">
                              <button
                                onClick={() => setEditingReqId(null)}
                                className="px-2 py-1.5 bg-zinc-900 border border-zinc-850 rounded text-[9px] cursor-pointer"
                              >
                                CANCEL
                              </button>
                              <button
                                onClick={handleUpdateRequirement}
                                className="px-2.5 py-1.5 bg-red-600 rounded text-white text-[9px] cursor-pointer"
                              >
                                SAVE
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div>
                              <strong className="text-white text-xs">{req.name}</strong>
                              <span className="bg-zinc-900 border border-zinc-800 text-zinc-500 text-[8px] font-mono px-1.5 py-0.2 ml-2 roundeduppercase">
                                {req.type}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingReqId(req.id);
                                  setEditReqName(req.name);
                                  setEditReqType(req.type || "text");
                                }}
                                className="p-1.5 hover:bg-zinc-900 text-zinc-500 hover:text-white border border-transparent hover:border-zinc-800 rounded-lg cursor-pointer animate-none"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteRequirement(req.id)}
                                className="p-1.5 hover:bg-red-950/25 text-zinc-500 hover:text-red-500 border border-transparent hover:border-red-900/20 rounded-lg cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* 6. SLIDESHOW BANNERS CRUD */}
        {adminTab === "banners" && (
          <div className="space-y-4 text-xs font-mono">
            {/* Add Banner Area */}
            <div className="bg-black/30 border border-zinc-900 p-4 rounded-2xl space-y-3">
              <span className="text-[10px] text-red-500 font-extrabold uppercase tracking-widest block">
                Add Slide Banner Image URL
              </span>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste banner image absolute URL (https://...)"
                  value={newBannerUrl}
                  onChange={(e) => setNewBannerUrl(e.target.value)}
                  className="flex-1 bg-black border border-zinc-900 rounded-lg px-3 py-2.5 text-white placeholder-zinc-700 text-xs focus:outline-none focus:border-red-500"
                />
                <button
                  onClick={addBanner}
                  className="bg-red-600 text-white px-4 rounded-lg font-bold flex items-center justify-center cursor-pointer hover:bg-red-700"
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

      {/* BALANCE MODIFIER SHEETS */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="w-full max-w-sm bg-[#0b111e] border border-zinc-800 rounded-3xl p-6 space-y-4 text-white"
            >
              <div className="flex justify-between items-start border-b border-zinc-900 pb-3">
                <div>
                  <h3 className="font-orbitron font-bold text-white text-md">Adjust Wallet Points</h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{selectedUser.name} &bull; {selectedUser.email}</p>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-zinc-500 hover:text-white bg-black/20 hover:bg-zinc-900/50 p-1 rounded-lg transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-black/40 p-3 rounded-xl border border-zinc-900 flex justify-between items-center text-xs">
                <span className="text-zinc-500 uppercase font-mono font-bold">Current Wallet Points</span>
                <strong className="text-red-500 font-mono text-sm">NPR {selectedUser.balance ?? 0}</strong>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div>
                  <label className="text-zinc-400 block mb-1">Adjustment Amount (NPR)</label>
                  <input
                    type="number"
                    placeholder="e.g. 500"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    className="w-full bg-black border border-zinc-900 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Reason / Note (shown to user)</label>
                  <input
                    type="text"
                    placeholder="e.g. Compensation / Signup Bonus"
                    value={adjustNote}
                    onChange={(e) => setAdjustNote(e.target.value)}
                    className="w-full bg-black border border-zinc-900 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  onClick={() => adjustUserBalance("remove")}
                  disabled={loading}
                  className="bg-red-950/20 hover:bg-red-900/20 border border-red-900/30 text-red-500 font-bold py-3 rounded-xl text-xs uppercase cursor-pointer"
                >
                  DEDUCT POINTS
                </button>
                <button
                  onClick={() => adjustUserBalance("add")}
                  disabled={loading}
                  className="bg-red-600 text-white hover:bg-red-700 font-bold py-3 rounded-xl text-xs uppercase cursor-pointer"
                >
                  ADD CREDITS
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
