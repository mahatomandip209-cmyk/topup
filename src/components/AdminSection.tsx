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
  Upload,
  ClipboardList,
  Eye,
  EyeOff,
  Tags,
  ArrowLeft,
  Ticket,
  Copy
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
  const [adminTab, setAdminTab] = useState<"dashboard" | "orders" | "deposits" | "users" | "categories" | "games" | "vouchers" | "products" | "qrcode" | "requirements" | "banners">("dashboard");

  // Dynamic state loaded from DB
  const [dbGames, setDbGames] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [allDeposits, setAllDeposits] = useState<any[]>([]);
  const [globalRequirements, setGlobalRequirements] = useState<any[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<any>({ qrCode: "", esewaNum: "" });
  const [currentBanners, setCurrentBanners] = useState<string[]>([]);

  // Category CRUD state
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryId, setNewCategoryId] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");

  // Product modal state
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

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

  // Password visibility and Add Game Popup states
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [isAddGameModalOpen, setIsAddGameModalOpen] = useState(false);

  // New Game Form state
  const [newGameId, setNewGameId] = useState("");
  const [newGameName, setNewGameName] = useState("");
  const [newGameImage, setNewGameImage] = useState("");
  const [newGameCategory, setNewGameCategory] = useState<string>("topup");
  const [newGameDesc, setNewGameDesc] = useState("");
  const [selectedGameReqs, setSelectedGameReqs] = useState<string[]>([]);

  // Editing Game ID state
  const [editingGameId, setEditingGameId] = useState<string | null>(null);
  const [editGameName, setEditGameName] = useState("");
  const [editGameImage, setEditGameImage] = useState("");
  const [editGameCategory, setEditGameCategory] = useState<string>("topup");
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

  // Game-specific Requirements State
  const [selectedReqGameId, setSelectedReqGameId] = useState<string | null>(null);
  const [isAddReqModalOpen, setIsAddReqModalOpen] = useState(false);
  const [isEditReqModalOpen, setIsEditReqModalOpen] = useState(false);
  const [reqModalName, setReqModalName] = useState("");
  const [reqModalType, setReqModalType] = useState<"text" | "number">("text");
  const [editingReqIdx, setEditingReqIdx] = useState<number | null>(null);

  // Vouchers Management State
  const [selectedVoucherGameId, setSelectedVoucherGameId] = useState<string | null>(null);
  const [voucherTextArea, setVoucherTextArea] = useState("");
  const [voucherFilter, setVoucherFilter] = useState<"available" | "sold">("available");

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
        let list: any[] = [];
        if (Array.isArray(data)) {
          list = data.map((game, idx) => {
            if (!game) return null;
            return {
              ...game,
              id: game.id || String(idx),
              packages: game.packages ? (Array.isArray(game.packages) ? game.packages : Object.values(game.packages)) : []
            };
          }).filter(Boolean);
        } else if (typeof data === "object") {
          list = Object.keys(data).map(key => {
            const game = data[key];
            if (!game) return null;
            return {
              ...game,
              id: game.id || key,
              packages: game.packages ? (Array.isArray(game.packages) ? game.packages : Object.values(game.packages)) : []
            };
          }).filter(Boolean);
        }
        setDbGames(list);
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

    // 8. Fetch Categories (Seed defaults if empty)
    const categoriesRef = ref(db, "categories");
    const unsubscribeCategories = onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        let list: any[] = [];
        if (Array.isArray(data)) {
          list = data.map((item, idx) => {
            if (!item) return null;
            if (typeof item === "string") {
              return { id: item, name: item.charAt(0).toUpperCase() + item.slice(1) };
            }
            if (typeof item === "object") {
              return { 
                id: item.id || String(idx), 
                name: item.name || item.id || String(idx) 
              };
            }
            return null;
          }).filter(Boolean);
        } else if (typeof data === "object") {
          list = Object.keys(data).map(k => {
            const val = data[k];
            if (!val) return null;
            if (typeof val === "string") {
              return { id: k, name: val };
            }
            if (typeof val === "object") {
              return { 
                id: k, 
                name: val.name || val.id || k 
              };
            }
            return { id: k, name: k };
          }).filter(Boolean);
        }
        setDbCategories(list);
      } else {
        const defaultCats: Record<string, { name: string }> = {
          topup: { name: "Direct Top-up" },
          voucher: { name: "Voucher Code" },
          subscription: { name: "Premium Subscription" }
        };
        set(categoriesRef, defaultCats);
        setDbCategories([
          { id: "topup", name: "Direct Top-up" },
          { id: "voucher", name: "Voucher Code" },
          { id: "subscription", name: "Premium Subscription" }
        ]);
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
      unsubscribeCategories();
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

      if (type === "add") {
        setShowPasswords(prev => ({ ...prev, [selectedUser.uid]: true }));
        setSelectedUser(null);
      } else {
        setSelectedUser({ ...selectedUser, balance: newBalance });
      }
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

    const finalFields: any[] = [];

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
      setIsAddGameModalOpen(false);
      alert("Game added successfully!");
    } catch (err: any) {
      alert("Error adding game: " + err.message);
    }
  };

  const handleEditGameSave = async () => {
    if (!editingGameId) return;

    const existingGame = dbGames.find(g => g.id === editingGameId);
    const finalFields = existingGame?.fields || [];

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

  // ---------------- CATEGORIES CRUD ----------------
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      alert("Category Name is required");
      return;
    }
    const slug = newCategoryId.trim() || newCategoryName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_");
    try {
      await set(ref(db, `categories/${slug}`), {
        name: newCategoryName.trim()
      });
      setNewCategoryName("");
      setNewCategoryId("");
      setIsAddCategoryModalOpen(false);
      alert("Category added successfully!");
    } catch (err: any) {
      alert("Error adding category: " + err.message);
    }
  };

  const handleEditCategorySave = async () => {
    if (!editingCategoryId || !editCategoryName.trim()) {
      alert("Category Name is required");
      return;
    }
    try {
      await update(ref(db, `categories/${editingCategoryId}`), {
        name: editCategoryName.trim()
      });
      setEditingCategoryId(null);
      alert("Category updated successfully!");
    } catch (err: any) {
      alert("Error updating category: " + err.message);
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    if (confirm(`Are you sure you want to delete category "${catId}"?`)) {
      try {
        await remove(ref(db, `categories/${catId}`));
        alert("Category deleted successfully!");
      } catch (err: any) {
        alert("Error deleting category: " + err.message);
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
      await update(ref(db, `games/${selectedProductGameId}`), { packages: updatedPkgs });
      setNewPackageName("");
      setNewPackagePrice("");
      setIsAddProductModalOpen(false);
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
      await update(ref(db, `games/${selectedProductGameId}`), { packages });
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
        await update(ref(db, `games/${selectedProductGameId}`), { packages });
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

  // ---------------- GAME-SPECIFIC REQUIREMENTS CRUD ----------------
  const handleAddGameRequirement = async () => {
    if (!selectedReqGameId) return;
    if (!reqModalName.trim()) {
      alert("Requirement Name is required");
      return;
    }

    const gameObj = dbGames.find(g => g.id === selectedReqGameId);
    if (!gameObj) return;

    const labelStr = reqModalName.trim();
    const keyStr = labelStr.toLowerCase().replace(/[^a-z0-9]/g, "") || "field";
    const newField = {
      label: labelStr,
      type: reqModalType,
      placeholder: `e.g. Enter ${labelStr}`,
      key: keyStr
    };

    const currentFields = gameObj.fields || [];
    // Prevent duplicate labels
    if (currentFields.some((f: any) => f.label.toLowerCase() === labelStr.toLowerCase())) {
      alert("A requirement with this name already exists for this game.");
      return;
    }

    const updatedFields = [...currentFields, newField];

    try {
      await update(ref(db, `games/${selectedReqGameId}`), { fields: updatedFields });
      setReqModalName("");
      setReqModalType("text");
      setIsAddReqModalOpen(false);
      alert("Requirement added successfully!");
    } catch (err: any) {
      alert("Error adding requirement: " + err.message);
    }
  };

  const handleUpdateGameRequirement = async () => {
    if (!selectedReqGameId || editingReqIdx === null) return;
    if (!reqModalName.trim()) {
      alert("Requirement Name is required");
      return;
    }

    const gameObj = dbGames.find(g => g.id === selectedReqGameId);
    if (!gameObj) return;

    const labelStr = reqModalName.trim();
    const keyStr = labelStr.toLowerCase().replace(/[^a-z0-9]/g, "") || "field";
    const updatedFields = [...(gameObj.fields || [])];

    // Prevent duplicates for other items
    if (updatedFields.some((f: any, idx: number) => idx !== editingReqIdx && f.label.toLowerCase() === labelStr.toLowerCase())) {
      alert("A requirement with this name already exists for this game.");
      return;
    }

    updatedFields[editingReqIdx] = {
      label: labelStr,
      type: reqModalType,
      placeholder: `e.g. Enter ${labelStr}`,
      key: keyStr
    };

    try {
      await update(ref(db, `games/${selectedReqGameId}`), { fields: updatedFields });
      setReqModalName("");
      setReqModalType("text");
      setEditingReqIdx(null);
      setIsEditReqModalOpen(false);
      alert("Requirement updated successfully!");
    } catch (err: any) {
      alert("Error updating requirement: " + err.message);
    }
  };

  const handleDeleteGameRequirement = async (idxToDelete: number) => {
    if (!selectedReqGameId) return;
    const gameObj = dbGames.find(g => g.id === selectedReqGameId);
    if (!gameObj) return;

    if (confirm("Are you sure you want to delete this requirement?")) {
      const updatedFields = (gameObj.fields || []).filter((_: any, idx: number) => idx !== idxToDelete);
      try {
        await update(ref(db, `games/${selectedReqGameId}`), { fields: updatedFields });
        alert("Requirement deleted successfully.");
      } catch (err: any) {
        alert("Error deleting requirement: " + err.message);
      }
    }
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
          
          {adminTab !== "games" && adminTab !== "categories" ? (
            <div>
              <h2 className="font-orbitron font-extrabold text-lg text-white tracking-wider uppercase flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-red-500" /> BNY Desk
              </h2>
              <p className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase">
                {adminTab === "dashboard" && "Dashboard Overview"}
                {adminTab === "orders" && "Fulfill Orders"}
                {adminTab === "deposits" && "Load Deposits"}
                {adminTab === "users" && "User Balances"}
                {adminTab === "vouchers" && "Instant Voucher stock manager"}
                {adminTab === "products" && "Packages & Price Customizer"}
                {adminTab === "qrcode" && "Payment settings details"}
                {adminTab === "requirements" && "Dynamic Order Requirements manager"}
                {adminTab === "banners" && "Slide banners manager"}
              </p>
            </div>
          ) : adminTab === "categories" ? (
            <div>
              <h2 className="font-orbitron font-extrabold text-lg text-white tracking-wider uppercase flex items-center gap-2">
                Manage Categories
              </h2>
              <p className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase">
                Add, Edit, and Delete categories for Game Items
              </p>
            </div>
          ) : (
            <div>
              <h2 className="font-orbitron font-extrabold text-lg text-white tracking-wider uppercase flex items-center gap-2">
                Manage Games
              </h2>
              <p className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase">
                Add, Edit, and Delete Game Titles
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {adminTab !== "games" && setActiveSection && (
            <button
              onClick={() => setActiveSection("home")}
              className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 text-[10px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider font-mono transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Exit Admin
            </button>
          )}
          {adminTab !== "games" && (
            <span className="bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest font-mono">
              {adminTab.toUpperCase()}
            </span>
          )}
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
                    { id: "orders", label: `Orders (${pendingOrdersCount})`, icon: ClipboardList },
                    { id: "deposits", label: `Deposits (${pendingDepositsCount})`, icon: Wallet },
                    { id: "users", label: `User Balances (${allUsers.length})`, icon: Users },
                    { id: "categories", label: `Categories (${dbCategories.length})`, icon: Tags },
                    { id: "games", label: "Games", icon: Database },
                    { id: "vouchers", label: "Voucher", icon: Ticket },
                    { id: "products", label: "Products", icon: ShoppingCart },
                    { id: "requirements", label: "Requirements", icon: Sliders },
                    { id: "qrcode", label: "QR Code & Payments", icon: QrCode },
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
                          if (item.id === "requirements") {
                            setSelectedReqGameId(null);
                          }
                          if (item.id === "vouchers") {
                            setSelectedVoucherGameId(null);
                          }
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
          <div className="space-y-8 animate-fadeIn">
            {/* STATISTICS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Total Sales Card */}
              <div className="bg-black/40 p-6 border border-zinc-900/80 rounded-3xl space-y-4 flex flex-col justify-between hover:border-emerald-500/30 hover:shadow-[0_10px_30px_rgba(16,185,129,0.05)] transition-all duration-300">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] text-zinc-500 block uppercase font-mono font-extrabold tracking-wider">Total Sales</span>
                  <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-black font-mono text-emerald-500 tracking-tight">NPR {totalSales}</p>
                  <span className="text-[8px] text-emerald-600 block font-mono uppercase font-bold mt-1">From approved dispatches</span>
                </div>
              </div>

              {/* Total Orders Card */}
              <div className="bg-black/40 p-6 border border-zinc-900/80 rounded-3xl space-y-4 flex flex-col justify-between hover:border-zinc-700 hover:shadow-[0_10px_30px_rgba(255,255,255,0.02)] transition-all duration-300">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] text-zinc-500 block uppercase font-mono font-extrabold tracking-wider">Total Orders</span>
                  <div className="p-2 bg-zinc-800/40 rounded-xl border border-zinc-800">
                    <ClipboardList className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-black font-mono text-white tracking-tight">{allOrders.length}</p>
                  <span className="text-[8px] text-zinc-500 block font-mono uppercase font-bold mt-1">Total system logs</span>
                </div>
              </div>

              {/* Pending Deposits Card */}
              <div className="bg-black/40 p-6 border border-zinc-900/80 rounded-3xl space-y-4 flex flex-col justify-between relative overflow-hidden hover:border-blue-500/30 hover:shadow-[0_10px_30px_rgba(59,130,246,0.05)] transition-all duration-300">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] text-zinc-500 block uppercase font-mono font-extrabold tracking-wider">Pending Deposits</span>
                  <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <Wallet className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-black font-mono text-blue-400 tracking-tight">{pendingDepositsCount}</p>
                  <span className="text-[8px] text-zinc-500 block font-mono uppercase font-bold mt-1">Requires audit</span>
                </div>
                {pendingDepositsCount > 0 && (
                  <div className="absolute right-3 top-3 w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></div>
                )}
              </div>

              {/* Pending Orders Card */}
              <div className="bg-black/40 p-6 border border-zinc-900/80 rounded-3xl space-y-4 flex flex-col justify-between relative overflow-hidden hover:border-red-500/30 hover:shadow-[0_10px_30px_rgba(239,68,68,0.05)] transition-all duration-300">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] text-zinc-500 block uppercase font-mono font-extrabold tracking-wider">Pending Orders</span>
                  <div className="p-2 bg-red-500/10 rounded-xl border border-red-500/20">
                    <ShoppingCart className="w-5 h-5 text-red-500" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-black font-mono text-red-500 tracking-tight">{pendingOrdersCount}</p>
                  <span className="text-[8px] text-zinc-500 block font-mono uppercase font-bold mt-1">Needs delivery</span>
                </div>
                {pendingOrdersCount > 0 && (
                  <div className="absolute right-3 top-3 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></div>
                )}
              </div>

              {/* Total Users Card */}
              <div className="bg-black/40 p-6 border border-zinc-900/80 rounded-3xl space-y-4 flex flex-col justify-between hover:border-purple-500/30 hover:shadow-[0_10px_30px_rgba(168,85,247,0.05)] transition-all duration-300">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] text-zinc-500 block uppercase font-mono font-extrabold tracking-wider">Total Users</span>
                  <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20">
                    <Users className="w-5 h-5 text-purple-400" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-black font-mono text-purple-400 tracking-tight">{allUsers.length}</p>
                  <span className="text-[8px] text-zinc-500 block font-mono uppercase font-bold mt-1">Gamer userbase</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 1.1 ORDERS SECTION (FIRST-CLASS TAB) */}
        {adminTab === "orders" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-orbitron font-extrabold text-lg uppercase tracking-widest text-white flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-red-500" /> Fulfill Orders
              </h3>

              {/* FILTER BAR */}
              <div className="flex bg-black/40 border border-zinc-900 p-1 rounded-2xl gap-1 text-[9px] font-mono font-bold uppercase tracking-wider">
                {[
                  { id: "pending", label: `Pending (${pendingOrdersCount})` },
                  { id: "approved", label: "Approved" },
                  { id: "rejected", label: "Rejected" },
                  { id: "all", label: "All Logs" }
                ].map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => setOrderFilter(sub.id as any)}
                    className={`px-3 py-2 rounded-xl cursor-pointer transition-all ${
                      orderFilter === sub.id
                        ? "bg-red-600 text-white shadow-lg shadow-red-500/20"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            </div>

            {/* SEARCH */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4.5 h-4.5" />
              <input
                type="text"
                placeholder="Search orders by Player UID, email, game or package name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/50 border border-zinc-900 rounded-2xl px-12 py-3.5 text-xs font-mono placeholder-zinc-700 text-white focus:outline-none focus:border-red-500 transition-all shadow-inner"
              />
            </div>

            {/* ORDERS SCROLLABLE GRID */}
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 no-scrollbar">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-20 bg-black/20 border border-zinc-900/50 rounded-3xl">
                  <p className="text-zinc-500 font-mono text-xs">No orders match the current filter.</p>
                </div>
              ) : (
                filteredOrders.map(order => (
                  <div key={order.orderId} className="bg-[#0c1322] border border-zinc-900 hover:border-zinc-800 rounded-3xl p-6 space-y-4 transition-all duration-300 shadow-xl">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="bg-red-500/10 border border-red-500/20 text-red-500 text-[8px] font-bold px-2 py-0.5 rounded uppercase font-mono tracking-wider">
                            {order.game}
                          </span>
                          <strong className="text-white text-sm">{order.packageName}</strong>
                        </div>
                        <p className="text-[9px] text-zinc-500 font-mono mt-1.5">
                          Date: {new Date(order.timestamp).toLocaleString()} &bull; Order ID: <span className="text-zinc-400 font-bold">{order.orderId.toUpperCase()}</span>
                        </p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">User Email: <strong className="text-zinc-300 font-mono">{order.email}</strong></p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <strong className="text-white font-mono text-base block">NPR {order.price}</strong>
                        <span className={`inline-block text-[9px] font-bold uppercase font-mono px-2 py-0.5 rounded-full mt-1 ${
                          order.status === "approved" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : order.status === "rejected" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse"
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Order Requirements details block */}
                    <div className="bg-black/40 border border-zinc-900 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono text-zinc-400">
                      {order.playerUid && (
                        <div>
                          <span className="text-zinc-600 block text-[9px] uppercase tracking-wider font-extrabold mb-0.5">Player UID</span>
                          <strong className="text-red-500 text-sm tracking-widest">{order.playerUid}</strong>
                        </div>
                      )}
                      {order.customerEmail && (
                        <div>
                          <span className="text-zinc-600 block text-[9px] uppercase tracking-wider font-extrabold mb-0.5">Customer Game Email</span>
                          <strong className="text-white text-xs">{order.customerEmail}</strong>
                        </div>
                      )}
                      {order.customerPassword && (
                        <div>
                          <span className="text-zinc-600 block text-[9px] uppercase tracking-wider font-extrabold mb-0.5">Activation Password</span>
                          <strong className="text-white text-xs">{order.customerPassword}</strong>
                        </div>
                      )}
                      {order.whatsappNumber && (
                        <div>
                          <span className="text-zinc-600 block text-[9px] uppercase tracking-wider font-extrabold mb-0.5">Contact WhatsApp</span>
                          <strong className="text-white text-xs">{order.whatsappNumber}</strong>
                        </div>
                      )}
                    </div>

                    {order.status === "pending" && (
                      <div className="flex gap-3 font-mono font-bold">
                        <button
                          onClick={() => rejectOrder(order)}
                          className="flex-1 bg-red-950/20 hover:bg-red-900/30 border border-red-900/30 text-red-500 text-[11px] py-3 rounded-xl cursor-pointer uppercase tracking-wider transition-all"
                        >
                          REJECT ORDER
                        </button>
                        <button
                          onClick={() => approveOrder(order)}
                          className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 text-[11px] py-3 rounded-xl cursor-pointer uppercase tracking-wider transition-all shadow-lg shadow-red-500/20"
                        >
                          DISPATCH DELIVERED
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 1.2 DEPOSITS SECTION (FIRST-CLASS TAB) */}
        {adminTab === "deposits" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-orbitron font-extrabold text-lg uppercase tracking-widest text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-blue-500" /> Load Deposits
              </h3>

              {/* DEPOSIT FILTER BAR */}
              <div className="flex bg-black/40 border border-zinc-900 p-1 rounded-2xl gap-1 text-[9px] font-mono font-bold uppercase tracking-wider">
                {[
                  { id: "pending", label: `Pending (${pendingDepositsCount})` },
                  { id: "approved", label: "Approved" },
                  { id: "rejected", label: "Rejected" },
                  { id: "all", label: "All Logs" }
                ].map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => setDepositFilter(sub.id as any)}
                    className={`px-3 py-2 rounded-xl cursor-pointer transition-all ${
                      depositFilter === sub.id
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            </div>

            {/* SEARCH */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4.5 h-4.5" />
              <input
                type="text"
                placeholder="Search deposits by Trx Code, Sender name, phone, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/50 border border-zinc-900 rounded-2xl px-12 py-3.5 text-xs font-mono placeholder-zinc-700 text-white focus:outline-none focus:border-blue-500 transition-all shadow-inner"
              />
            </div>

            {/* DEPOSITS SCROLLABLE GRID */}
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 no-scrollbar">
              {filteredDeposits.length === 0 ? (
                <div className="text-center py-20 bg-black/20 border border-zinc-900/50 rounded-3xl">
                  <p className="text-zinc-500 font-mono text-xs">No deposits match current filter.</p>
                </div>
              ) : (
                filteredDeposits.map(dep => (
                  <div key={dep.depositId} className="bg-[#0c1322] border border-zinc-900 hover:border-zinc-800 rounded-3xl p-6 space-y-4 transition-all duration-300 shadow-xl">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8px] font-bold px-2 py-0.5 rounded uppercase font-mono tracking-wider">
                          eSewa / Khalti Load
                        </span>
                        <p className="text-xs text-white font-mono font-bold mt-2">Trx Reference ID: {dep.trx}</p>
                        <p className="text-[9px] text-zinc-500 font-mono mt-1">{new Date(dep.timestamp).toLocaleString()}</p>
                        <p className="text-[11px] text-zinc-400 mt-1">User Email: <strong className="text-zinc-300 font-mono">{dep.email}</strong></p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <strong className="text-emerald-500 font-mono text-base block">NPR {dep.amount}</strong>
                        <span className={`inline-block text-[9px] font-bold uppercase font-mono px-2 py-0.5 rounded-full mt-1 ${
                          dep.status === "approved" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : dep.status === "rejected" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse"
                        }`}>
                          {dep.status}
                        </span>
                      </div>
                    </div>

                    {dep.senderName && (
                      <div className="bg-black/30 border border-zinc-900 rounded-2xl p-3.5 text-xs font-mono text-zinc-400">
                        <span className="text-zinc-600 block text-[8px] uppercase tracking-wider font-extrabold mb-0.5">Sender Details</span>
                        <strong className="text-white">{dep.senderName}</strong> &bull; {dep.senderNum || "N/A"}
                      </div>
                    )}

                    {dep.proofImage && (
                      <div className="text-center bg-black/60 p-3 border border-zinc-900/60 rounded-2xl">
                        <span className="text-zinc-600 block text-[8px] uppercase tracking-wider font-extrabold mb-2 text-left font-mono">Uploaded Deposit Receipt Proof</span>
                        <a href={dep.proofImage} target="_blank" rel="referrer noopener" className="inline-block relative group overflow-hidden rounded-xl">
                          <img
                            src={dep.proofImage}
                            alt="deposit proof slip"
                            className="max-h-60 object-contain mx-auto rounded-xl transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-mono text-[9px] uppercase tracking-wider">
                            View Original Image
                          </div>
                        </a>
                      </div>
                    )}

                    {dep.status === "pending" && (
                      <div className="flex gap-3 font-mono font-bold">
                        <button
                          onClick={() => rejectDeposit(dep)}
                          className="flex-1 bg-red-950/20 hover:bg-red-900/30 border border-red-900/30 text-red-500 text-[11px] py-3 rounded-xl cursor-pointer uppercase tracking-wider transition-all"
                        >
                          DECLINE RECEIPT
                        </button>
                        <button
                          onClick={() => approveDeposit(dep)}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-500 hover:to-blue-600 text-[11px] py-3 rounded-xl cursor-pointer uppercase tracking-wider transition-all shadow-lg shadow-blue-500/20"
                        >
                          CONFIRM CREDIT
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 1.3 USER BALANCES SECTION (FIRST-CLASS TAB) */}
        {adminTab === "users" && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="font-orbitron font-extrabold text-lg uppercase tracking-widest text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" /> Gamer Balances
            </h3>

            {/* SEARCH */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4.5 h-4.5" />
              <input
                type="text"
                placeholder="Search registered gamers by Name, Email, Unique ID, or WhatsApp Phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/50 border border-zinc-900 rounded-2xl px-12 py-3.5 text-xs font-mono placeholder-zinc-700 text-white focus:outline-none focus:border-purple-500 transition-all shadow-inner"
              />
            </div>

            {/* USERS LIST VIEW */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 no-scrollbar">
              {filteredUsers.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-black/20 border border-zinc-900/50 rounded-3xl">
                  <p className="text-zinc-500 font-mono text-xs">No registered gamers match the query.</p>
                </div>
              ) : (
                filteredUsers.map(u => {
                  const isPasswordVisible = showPasswords[u.uid] || false;
                  return (
                    <div key={u.uid} className="bg-[#0c1322] border border-zinc-900 hover:border-zinc-800 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 shadow-xl">
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase">Name:</span>
                          <strong className="text-white text-sm truncate">{u.name}</strong>
                          <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono font-bold tracking-wider">
                            {u.uniqueId || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-zinc-400 font-mono">
                          <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase">Email:</span>
                          <span className="truncate">{u.email}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
                          <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase">Number:</span>
                          <span>{u.phone || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                          <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase">Password:</span>
                          <span className="font-semibold text-zinc-300 bg-black/40 px-2 py-0.5 rounded border border-zinc-900 font-sans">
                            {isPasswordVisible ? (u.password || "BNYPass@123") : "••••••••"}
                          </span>
                          <button
                            onClick={() => {
                              setShowPasswords(prev => ({ ...prev, [u.uid]: !isPasswordVisible }));
                            }}
                            className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-white transition-colors cursor-pointer"
                            title={isPasswordVisible ? "Hide Password" : "Show Password"}
                          >
                            {isPasswordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5 pt-1">
                          <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase">Balance:</span>
                          <span className="text-xs text-emerald-500 font-mono font-black filter drop-shadow-[0_0_10px_rgba(16,185,129,0.15)]">NPR {u.balance ?? 0}</span>
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="flex-1 sm:flex-none bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/20 text-purple-400 hover:text-purple-300 text-[10px] px-3.5 py-2.5 rounded-xl cursor-pointer font-extrabold uppercase tracking-widest font-mono transition-all text-center"
                        >
                          BALANCE
                        </button>
                        <button
                          onClick={() => toggleBlockUser(u)}
                          className={`flex-1 sm:flex-none px-3 py-2 rounded-xl border text-[10px] font-mono tracking-widest uppercase font-extrabold cursor-pointer transition-all ${
                            u.blocked
                              ? "bg-red-950/35 text-red-500 border-red-900/50 hover:bg-red-900/10"
                              : "bg-zinc-900 hover:bg-zinc-800 text-zinc-500 border-zinc-800 hover:text-zinc-400"
                          }`}
                        >
                          {u.blocked ? "BLOCKED" : "BLOCK"}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 1.4 CATEGORIES SECTION */}
        {adminTab === "categories" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-900">
              <div>
                <h3 className="font-orbitron font-extrabold text-lg uppercase tracking-widest text-white flex items-center gap-2">
                  <Tags className="w-5 h-5 text-red-500" /> CATEGORIES
                </h3>
                <p className="text-[10px] text-zinc-500 font-mono tracking-wider">
                  Manage game classifications and structures
                </p>
              </div>
              <button
                onClick={() => {
                  setNewCategoryName("");
                  setNewCategoryId("");
                  setIsAddCategoryModalOpen(true);
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-mono font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                Add Category Option
              </button>
            </div>

            {/* ADD CATEGORY POPUP MODAL */}
            <AnimatePresence>
              {isAddCategoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-[#0b111e] border border-zinc-900 rounded-3xl p-6 w-full max-w-sm space-y-5 shadow-2xl relative"
                  >
                    <button
                      onClick={() => setIsAddCategoryModalOpen(false)}
                      className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="space-y-1">
                      <h4 className="font-orbitron font-extrabold text-lg text-white uppercase tracking-wider">
                        Add New Category
                      </h4>
                      <p className="text-xs text-zinc-500 font-sans">Enter details to create a new category</p>
                    </div>

                    <div className="space-y-4 font-mono text-xs text-left">
                      <div>
                        <label className="text-zinc-400 block mb-1 uppercase text-[9px] font-bold">Category Name</label>
                        <input
                          type="text"
                          placeholder="e.g. PC Games"
                          value={newCategoryName}
                          onChange={(e) => {
                            setNewCategoryName(e.target.value);
                            const slug = e.target.value
                              .toLowerCase()
                              .trim()
                              .replace(/[^a-z0-9]+/g, "_");
                            setNewCategoryId(slug);
                          }}
                          className="w-full bg-black border border-zinc-900 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 font-sans text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2 font-mono">
                      <button
                        onClick={() => setIsAddCategoryModalOpen(false)}
                        className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 py-3 rounded-xl text-xs uppercase cursor-pointer transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddCategory}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-xs uppercase cursor-pointer transition-colors shadow-lg shadow-red-500/20"
                      >
                        Create
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* EDIT CATEGORY POPUP MODAL */}
            <AnimatePresence>
              {editingCategoryId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-[#0b111e] border border-zinc-900 rounded-3xl p-6 w-full max-w-sm space-y-5 shadow-2xl relative"
                  >
                    <button
                      onClick={() => setEditingCategoryId(null)}
                      className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="space-y-1">
                      <h4 className="font-orbitron font-extrabold text-lg text-white uppercase tracking-wider">
                        Edit Category
                      </h4>
                      <p className="text-xs text-zinc-500 font-sans">Modify selected category name</p>
                    </div>

                    <div className="space-y-4 font-mono text-xs text-left">
                      <div>
                        <label className="text-zinc-400 block mb-1 uppercase text-[9px] font-bold">Category Name</label>
                        <input
                          type="text"
                          value={editCategoryName}
                          onChange={(e) => setEditCategoryName(e.target.value)}
                          className="w-full bg-black border border-zinc-900 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 font-sans text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2 font-mono">
                      <button
                        onClick={() => setEditingCategoryId(null)}
                        className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 py-3 rounded-xl text-xs uppercase cursor-pointer transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleEditCategorySave}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-xs uppercase cursor-pointer transition-colors shadow-lg shadow-red-500/20"
                      >
                        Save
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* LIST OF CATEGORIES */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dbCategories.length === 0 ? (
                <div className="col-span-full bg-zinc-950/20 border border-zinc-900/60 rounded-3xl p-12 text-center">
                  <p className="text-zinc-500 font-mono text-xs uppercase">No categories found in system.</p>
                </div>
              ) : (
                dbCategories.map((cat) => (
                  <div key={cat.id} className="bg-[#0c1322] border border-zinc-900 hover:border-zinc-800 rounded-3xl p-5 flex items-center justify-between gap-4 transition-all duration-300 shadow-xl">
                    <div className="space-y-1 min-w-0">
                      <span className="text-[10px] text-red-500 font-mono uppercase font-bold tracking-wider">Category</span>
                      <h4 className="text-white font-sans font-bold text-sm truncate">{cat.name}</h4>
                      <p className="text-[9px] text-zinc-500 font-mono">ID: {cat.id}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingCategoryId(cat.id);
                          setEditCategoryName(cat.name);
                        }}
                        className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer"
                        title="Edit Category"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-2 bg-red-950/20 hover:bg-red-900/30 border border-red-900/30 text-red-500 rounded-xl transition-all cursor-pointer"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 2. GAMES CRUD EDITOR */}
        {adminTab === "games" && (
          <div className="space-y-6">
            {/* TOP ACTIONS AREA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-900">
              <div>
                <h3 className="font-orbitron font-extrabold text-lg uppercase tracking-widest text-white flex items-center gap-2">
                  GAMES / SERVICE TITLES
                </h3>
                <p className="text-[10px] text-zinc-500 font-mono tracking-wider">
                  Manage all active game top-up configurations
                </p>
              </div>
              <button
                onClick={() => {
                  setNewGameId("");
                  setNewGameName("");
                  setNewGameImage("");
                  setNewGameCategory("topup");
                  setNewGameDesc("");
                  setSelectedGameReqs([]);
                  setIsAddGameModalOpen(true);
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-mono font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                Add Game Option
              </button>
            </div>

            {/* ADD GAME POPUP MODAL */}
            <AnimatePresence>
              {isAddGameModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-[#0b111e] border border-zinc-900 rounded-3xl p-6 w-full max-w-md space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar"
                  >
                    <button
                      onClick={() => setIsAddGameModalOpen(false)}
                      className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="space-y-1">
                      <h4 className="font-orbitron font-extrabold text-lg text-white uppercase tracking-wider">
                        Add New Game
                      </h4>
                      <p className="text-xs text-zinc-500 font-sans">Configure details for your new game service</p>
                    </div>

                    <div className="space-y-4 font-mono text-xs text-left">
                      {/* Game Name */}
                      <div>
                        <label className="text-zinc-400 block mb-1 uppercase text-[9px] font-bold">Game Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Clash of Clans"
                          value={newGameName}
                          onChange={(e) => {
                            setNewGameName(e.target.value);
                            const slug = e.target.value
                              .toLowerCase()
                              .trim()
                              .replace(/[^a-z0-9]+/g, "_");
                            setNewGameId(slug);
                          }}
                          className="w-full bg-black border border-zinc-900 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 font-sans text-xs"
                        />
                      </div>

                      {/* Game Slug */}
                      <div>
                        <label className="text-zinc-400 block mb-1 uppercase text-[9px] font-bold">Game Slug / unique ID (No spaces)</label>
                        <input
                          type="text"
                          placeholder="e.g. clash_of_clans"
                          value={newGameId}
                          onChange={(e) => setNewGameId(e.target.value)}
                          className="w-full bg-black border border-zinc-900 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 font-sans text-xs"
                        />
                      </div>

                      {/* Upload Logo File Selector */}
                      <div>
                        <label className="text-zinc-400 block mb-1 uppercase text-[9px] font-bold">Upload Logo (PNG/JPG)</label>
                        <div className="flex flex-col gap-2">
                          <label className="flex items-center justify-center gap-2 bg-black/60 border border-zinc-900 hover:border-zinc-800 rounded-xl py-3 px-4 text-zinc-400 hover:text-white cursor-pointer transition-all border-dashed">
                            <Upload className="w-4 h-4 text-red-500" />
                            <span>{newGameImage ? "Logo Image Loaded" : "Choose Image File"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setNewGameImage(reader.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                          {newGameImage && (
                            <div className="flex items-center gap-2 bg-black/45 p-2 rounded-xl border border-zinc-900">
                              <img src={newGameImage} className="w-8 h-8 object-cover rounded" alt="Logo preview" />
                              <span className="text-[10px] text-zinc-500 truncate flex-1">{newGameImage.startsWith("data:") ? "Local Image Base64" : newGameImage}</span>
                              <button onClick={() => setNewGameImage("")} className="text-red-500 hover:text-red-400 text-[10px] cursor-pointer">Remove</button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Category */}
                      <div>
                        <label className="text-zinc-400 block mb-1 uppercase text-[9px] font-bold">Category</label>
                        <select
                          value={newGameCategory}
                          onChange={(e) => setNewGameCategory(e.target.value as any)}
                          className="w-full bg-black border border-zinc-900 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 uppercase text-xs"
                        >
                          {dbCategories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Action buttons inside popup */}
                    <div className="flex gap-3 pt-2 font-mono">
                      <button
                        onClick={() => setIsAddGameModalOpen(false)}
                        className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 py-3 rounded-xl text-xs uppercase cursor-pointer transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddGame}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-xs uppercase cursor-pointer transition-colors shadow-lg shadow-red-500/20"
                      >
                        Create Game
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* LIST OF AVAILABLE GAMES */}
            <div className="space-y-4">
              <span className="text-[10px] text-zinc-500 font-extrabold font-mono uppercase tracking-widest block">
                Manage Available Games ({dbGames.length})
              </span>

              <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-1 no-scrollbar font-mono">
                {dbGames.map(game => {
                  const isEditing = editingGameId === game.id;
                  return (
                    <div key={game.id} className="bg-[#0c1322] border border-zinc-900 hover:border-zinc-800 p-5 rounded-3xl space-y-4 transition-all duration-300 shadow-xl text-left">
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
                              <label className="text-zinc-600 block text-[8px] uppercase">Image URL / Logo Upload</label>
                              <div className="flex flex-col gap-1.5">
                                <label className="flex items-center justify-center gap-1 bg-black border border-zinc-900 hover:border-zinc-800 rounded-lg p-2 text-[10px] text-zinc-400 cursor-pointer transition-all">
                                  <Upload className="w-3.5 h-3.5 text-red-500" />
                                  <span>Upload New Logo</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                          setEditGameImage(reader.result as string);
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                    className="hidden"
                                  />
                                </label>
                                <input
                                  type="text"
                                  value={editGameImage}
                                  onChange={(e) => setEditGameImage(e.target.value)}
                                  className="w-full bg-black border border-zinc-900 rounded-lg p-2 text-white focus:outline-none focus:border-red-500"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-zinc-600 block text-[8px] uppercase">Category</label>
                              <select
                                value={editGameCategory}
                                onChange={(e) => setEditGameCategory(e.target.value as any)}
                                className="w-full bg-black border border-zinc-900 rounded-lg p-2 text-white uppercase focus:outline-none text-xs"
                              >
                                {dbCategories.map(cat => (
                                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
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

                          <div className="flex gap-2 font-bold font-mono">
                            <button
                              onClick={() => setEditingGameId(null)}
                              className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 py-2 rounded-xl text-[10px] cursor-pointer"
                            >
                              CANCEL
                            </button>
                            <button
                              onClick={handleEditGameSave}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl text-[10px] cursor-pointer"
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
                              className="w-14 h-14 object-cover rounded-2xl border border-zinc-900 flex-shrink-0 bg-black/40"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <strong className="text-white text-sm">{game.name}</strong>
                                <span className="bg-zinc-900 border border-zinc-800 text-zinc-500 text-[8px] font-mono px-2 py-0.5 rounded-full uppercase">
                                  {game.category}
                                </span>
                              </div>
                              <p className="text-[10px] text-zinc-500 font-mono mt-0.5 max-w-xs">{game.description}</p>
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
                                const matchIds = (game.fields || []).map((f: any) => {
                                  const reqObj = globalRequirements.find(r => r.name.toLowerCase() === f.label.toLowerCase());
                                  return reqObj?.id;
                                }).filter(Boolean);
                                setEditGameReqs(matchIds);
                              }}
                              className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl cursor-pointer transition-colors"
                              title="Edit Game"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteGame(game.id)}
                              className="p-2.5 bg-red-950/20 hover:bg-red-900/20 border border-red-950 text-red-500 rounded-xl cursor-pointer transition-colors"
                              title="Delete Game"
                            >
                              <Trash2 className="w-4 h-4" />
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
          <div className="space-y-6 animate-fadeIn">
            {selectedProductGameId === "" ? (
              // STEP 1: SHOW ALL AVAILABLE GAMES LIST/GRID
              <div className="space-y-5">
                <div>
                  <h3 className="font-orbitron font-extrabold text-lg uppercase tracking-widest text-white flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-red-500" /> PRODUCTS
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-mono tracking-wider">
                    Select a game to manage its product items & prices
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {dbGames.length === 0 ? (
                    <div className="col-span-full bg-zinc-950/20 border border-zinc-900/60 rounded-3xl p-12 text-center">
                      <p className="text-zinc-500 font-mono text-xs uppercase">No games found in system.</p>
                    </div>
                  ) : (
                    dbGames.map((game) => (
                      <div
                        key={game.id}
                        onClick={() => {
                          setSelectedProductGameId(game.id);
                          setEditingPkgIdx(null);
                        }}
                        className="bg-[#0c1322] border border-zinc-900 hover:border-red-600/50 rounded-3xl p-5 flex items-center gap-4 transition-all duration-300 shadow-xl cursor-pointer hover:scale-[1.01] group relative overflow-hidden"
                      >
                        <img
                          src={game.image}
                          alt={game.name}
                          className="w-16 h-16 object-cover rounded-2xl border border-zinc-900 flex-shrink-0 bg-black/40"
                          referrerPolicy="no-referrer"
                        />
                        <div className="space-y-1 min-w-0 flex-1">
                          <span className="text-[8px] bg-red-600/10 text-red-500 border border-red-950/30 px-2 py-0.5 rounded-full font-mono uppercase font-extrabold">
                            {game.category || "topup"}
                          </span>
                          <h4 className="text-white font-sans font-extrabold text-base truncate group-hover:text-red-500 transition-colors">{game.name}</h4>
                          <p className="text-[10px] text-zinc-500 font-mono">
                            {game.packages?.length || 0} Products available
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              // STEP 2: SHOW SPECIFIC GAME PRODUCTS MANAGEMENT "NEW PAGE"
              <div className="space-y-6">
                {(() => {
                  const gameObj = dbGames.find(g => g.id === selectedProductGameId);
                  if (!gameObj) {
                    return (
                      <div className="text-center py-12">
                        <p className="text-zinc-500">Game not found.</p>
                        <button
                          onClick={() => setSelectedProductGameId("")}
                          className="mt-4 bg-zinc-900 text-white font-mono px-4 py-2 rounded-xl"
                        >
                          Back to Games
                        </button>
                      </div>
                    );
                  }

                  const packagesList = gameObj.packages || [];

                  return (
                    <>
                      {/* SUB-HEADER AREA */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-900">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setSelectedProductGameId("")}
                            className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white cursor-pointer transition-all mr-1"
                            title="Back to Games list"
                          >
                            <ArrowLeft className="w-4.5 h-4.5" />
                          </button>
                          <img
                            src={gameObj.image}
                            alt={gameObj.name}
                            className="w-12 h-12 object-cover rounded-xl border border-zinc-900 flex-shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <h3 className="font-orbitron font-extrabold text-base text-white tracking-wider uppercase">
                              {gameObj.name} Products
                            </h3>
                            <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider">
                              Category: {gameObj.category}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setNewPackageName("");
                            setNewPackagePrice("");
                            setIsAddProductModalOpen(true);
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white font-mono font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 self-start sm:self-auto"
                        >
                          <Plus className="w-4 h-4" />
                          Add Product Option
                        </button>
                      </div>

                      {/* ADD PRODUCT MODAL */}
                      <AnimatePresence>
                        {isAddProductModalOpen && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
                            <motion.div
                              initial={{ scale: 0.95, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.95, opacity: 0 }}
                              className="bg-[#0b111e] border border-zinc-900 rounded-3xl p-6 w-full max-w-sm space-y-5 shadow-2xl relative"
                            >
                              <button
                                onClick={() => setIsAddProductModalOpen(false)}
                                className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                              >
                                <X className="w-5 h-5" />
                              </button>

                              <div className="space-y-1">
                                <h4 className="font-orbitron font-extrabold text-lg text-white uppercase tracking-wider">
                                  Add Product Item
                                </h4>
                                <p className="text-xs text-zinc-500 font-sans">Input name and price for the new product</p>
                              </div>

                              <div className="space-y-4 font-mono text-xs text-left">
                                <div>
                                  <label className="text-zinc-400 block mb-1 uppercase text-[9px] font-bold">Product Name</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. 100 Diamonds"
                                    value={newPackageName}
                                    onChange={(e) => setNewPackageName(e.target.value)}
                                    className="w-full bg-black border border-zinc-900 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 font-sans text-xs"
                                  />
                                </div>

                                <div>
                                  <label className="text-zinc-400 block mb-1 uppercase text-[9px] font-bold">Product Price (NPR)</label>
                                  <input
                                    type="number"
                                    placeholder="e.g. 110"
                                    value={newPackagePrice}
                                    onChange={(e) => setNewPackagePrice(e.target.value)}
                                    className="w-full bg-black border border-zinc-900 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 font-sans text-xs"
                                  />
                                </div>
                              </div>

                              <div className="flex gap-3 pt-2 font-mono">
                                <button
                                  onClick={() => setIsAddProductModalOpen(false)}
                                  className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 py-3 rounded-xl text-xs uppercase cursor-pointer transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleAddPackage}
                                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-xs uppercase cursor-pointer transition-colors shadow-lg shadow-red-500/20"
                                >
                                  Add Product
                                </button>
                              </div>
                            </motion.div>
                          </div>
                        )}
                      </AnimatePresence>

                      {/* CURRENT PACKAGES LIST */}
                      <div className="space-y-3 font-mono">
                        <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest block">
                          Product Items List ({packagesList.length})
                        </span>

                        <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto pr-1 no-scrollbar text-xs">
                          {packagesList.length === 0 ? (
                            <div className="text-center py-14 bg-zinc-950/20 border border-zinc-900/60 rounded-3xl text-zinc-500">
                              There are no products available for this game. Click "Add Product Option" above to begin!
                            </div>
                          ) : (
                            packagesList.map((pkg: any, idx: number) => {
                              const isEditingPkg = editingPkgIdx === idx;
                              return (
                                <div key={idx} className="bg-[#0c1322] border border-zinc-900 p-4 rounded-3xl flex items-center justify-between gap-4 shadow-lg transition-all duration-300 hover:border-zinc-800">
                                  {isEditingPkg ? (
                                    <div className="flex-1 flex gap-3 items-end flex-wrap">
                                      <div className="flex-1 min-w-[150px]">
                                        <label className="text-[8px] text-zinc-600 uppercase block mb-1">Product Name</label>
                                        <input
                                          type="text"
                                          value={editPackageName}
                                          onChange={(e) => setEditPackageName(e.target.value)}
                                          className="w-full bg-black border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                                        />
                                      </div>
                                      <div className="w-28">
                                        <label className="text-[8px] text-zinc-600 uppercase block mb-1">Price (NPR)</label>
                                        <input
                                          type="number"
                                          value={editPackagePrice}
                                          onChange={(e) => setEditPackagePrice(e.target.value)}
                                          className="w-full bg-black border border-zinc-800 rounded-xl p-2.5 text-xs text-red-500 font-bold focus:outline-none focus:border-red-500"
                                        />
                                      </div>
                                      <div className="flex gap-2 font-bold font-mono">
                                        <button
                                          onClick={() => setEditingPkgIdx(null)}
                                          className="px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] text-zinc-400 uppercase tracking-wider hover:text-white transition-colors cursor-pointer"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          onClick={() => handleUpdatePackage(idx)}
                                          className="px-4 py-2.5 bg-red-600 rounded-xl text-white text-[10px] uppercase tracking-wider hover:bg-red-700 transition-colors cursor-pointer"
                                        >
                                          Save
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="space-y-0.5">
                                        <span className="text-[9px] text-red-500 uppercase tracking-widest font-extrabold">Item package</span>
                                        <h5 className="font-sans font-extrabold text-white text-sm">{pkg.n}</h5>
                                      </div>
                                      <div className="flex items-center gap-4">
                                        <strong className="text-emerald-500 text-sm">NPR {pkg.p}</strong>
                                        <div className="flex items-center gap-1.5">
                                          <button
                                            onClick={() => {
                                              setEditingPkgIdx(idx);
                                              setEditPackageName(pkg.n);
                                              setEditPackagePrice(pkg.p.toString());
                                            }}
                                            className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer"
                                            title="Edit Product"
                                          >
                                            <Edit3 className="w-4 h-4" />
                                          </button>
                                          <button
                                            onClick={() => handleDeletePackage(idx)}
                                            className="p-2 bg-red-950/20 hover:bg-red-900/30 border border-red-900/30 text-red-500 rounded-xl transition-all cursor-pointer"
                                            title="Delete Product"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </>
                  );
                })()}
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
            {!selectedReqGameId ? (
              // 5.1 GAME LIST PAGE
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-black/30 border border-zinc-900 p-5 rounded-2xl">
                  <div>
                    <h3 className="font-orbitron font-extrabold text-white text-md uppercase tracking-wider">
                      Game Requirements Manager
                    </h3>
                    <p className="text-xs text-zinc-500 font-sans mt-0.5">Select a game to customize checkout input fields (e.g., Player UID, Server ID).</p>
                  </div>
                  
                  {/* SEARCH GAMES INPUT */}
                  <div className="relative max-w-xs w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search game..."
                      value={newReqName}
                      onChange={(e) => setNewReqName(e.target.value)}
                      className="w-full bg-black border border-zinc-900 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                    />
                  </div>
                </div>

                {/* GAMES GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dbGames
                    .filter(g => !newReqName || g.name.toLowerCase().includes(newReqName.toLowerCase()))
                    .map(game => {
                      const reqCount = game.fields?.length || 0;
                      return (
                        <div
                          key={game.id}
                          onClick={() => {
                            setSelectedReqGameId(game.id);
                            setNewReqName(""); // Clear game search after selection
                          }}
                          className="bg-black/35 border border-zinc-900/80 hover:border-zinc-850 p-4 rounded-2xl flex items-center justify-between gap-4 cursor-pointer hover:bg-black/50 hover:scale-[1.01] transition-all group duration-200"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={game.image || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=280"}
                              alt={game.name}
                              className="w-12 h-12 rounded-xl object-cover border border-zinc-900"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <strong className="text-white text-sm group-hover:text-red-500 transition-colors block">{game.name}</strong>
                              <span className="bg-zinc-900/60 border border-zinc-900 text-zinc-400 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase">
                                {game.category || "topup"}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-zinc-500 font-mono block uppercase">Requirements</span>
                            <span className="font-orbitron font-black text-xs text-red-500 block">
                              {reqCount} {reqCount === 1 ? "Field" : "Fields"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  {dbGames.filter(g => !newReqName || g.name.toLowerCase().includes(newReqName.toLowerCase())).length === 0 && (
                    <div className="col-span-full py-16 text-center text-zinc-600 font-mono text-xs">
                      No games matched your search.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // 5.2 NEW2 PAGE: DETAILED GAME REQUIREMENTS
              (() => {
                const gameObj = dbGames.find(g => g.id === selectedReqGameId);
                if (!gameObj) return <div className="text-center font-mono py-10 text-zinc-500">Game not found</div>;
                const requirementsList = gameObj.fields || [];

                return (
                  <div className="space-y-6">
                    {/* TOP HEADER BLOCK WITH BACK AND ADD OPTION */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-black/30 border border-zinc-900 p-5 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setSelectedReqGameId(null)}
                          className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-xl cursor-pointer transition-colors"
                          title="Back to Games"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                        
                        <div className="flex items-center gap-3">
                          <img
                            src={gameObj.image}
                            alt={gameObj.name}
                            className="w-12 h-12 rounded-xl object-cover border border-zinc-900"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest block">Managing requirements for</span>
                            <h3 className="font-orbitron font-extrabold text-white text-md uppercase tracking-wider">{gameObj.name}</h3>
                          </div>
                        </div>
                      </div>

                      {/* ADD REQUIREMENT BUTTON */}
                      <button
                        onClick={() => {
                          setReqModalName("");
                          setReqModalType("text");
                          setIsAddReqModalOpen(true);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white font-mono font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
                      >
                        <Plus className="w-4 h-4" />
                        Add Requirements
                      </button>
                    </div>

                    {/* CURRENT REQUIREMENTS LIST */}
                    <div className="space-y-3">
                      <span className="text-[10px] text-zinc-500 font-extrabold font-mono uppercase tracking-widest block">
                        Available Current Requirements ({requirementsList.length})
                      </span>

                      <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto pr-1 no-scrollbar text-xs font-mono">
                        {requirementsList.length === 0 ? (
                          <div className="bg-black/20 border border-zinc-900 border-dashed py-12 rounded-2xl text-center space-y-2">
                            <p className="text-zinc-600">No requirements defined for this game yet.</p>
                            <p className="text-[10px] text-zinc-500 font-sans">Click the "Add Requirements" button above to add fields like Player ID, Server ID, etc.</p>
                          </div>
                        ) : (
                          requirementsList.map((req: any, idx: number) => (
                            <div key={idx} className="bg-black/40 border border-zinc-900 p-4 rounded-2xl flex items-center justify-between gap-4">
                              <div>
                                <span className="text-[10px] text-zinc-500 block uppercase font-mono tracking-widest mb-0.5">Field #{idx + 1}</span>
                                <div className="flex items-center gap-2">
                                  <strong className="text-white text-sm">{req.label}</strong>
                                  <span className="bg-zinc-900 border border-zinc-800 text-zinc-500 text-[8px] font-mono px-2 py-0.5 rounded uppercase">
                                    {req.type}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setEditingReqIdx(idx);
                                    setReqModalName(req.label);
                                    setReqModalType(req.type || "text");
                                    setIsEditReqModalOpen(true);
                                  }}
                                  className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-xl cursor-pointer transition-colors"
                                  title="Edit Requirement"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteGameRequirement(idx)}
                                  className="p-2.5 bg-red-950/20 hover:bg-red-900/20 border border-red-950 text-red-500 rounded-xl cursor-pointer transition-colors"
                                  title="Delete Requirement"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()
            )}

            {/* ADD REQUIREMENT POPUP MODAL */}
            <AnimatePresence>
              {isAddReqModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-[#0b111e] border border-zinc-900 rounded-3xl p-6 w-full max-w-sm space-y-5 shadow-2xl relative"
                  >
                    <button
                      onClick={() => setIsAddReqModalOpen(false)}
                      className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="space-y-1">
                      <h4 className="font-orbitron font-extrabold text-lg text-white uppercase tracking-wider">
                        Add Requirement
                      </h4>
                      <p className="text-xs text-zinc-500 font-sans">Create a checkout input requirement for users.</p>
                    </div>

                    <div className="space-y-4 font-mono text-xs text-left">
                      <div>
                        <label className="text-zinc-400 block mb-1 uppercase text-[9px] font-bold">Requirement Name (Label)</label>
                        <input
                          type="text"
                          placeholder="e.g. Player UID, Server ID"
                          value={reqModalName}
                          onChange={(e) => setReqModalName(e.target.value)}
                          className="w-full bg-black border border-zinc-900 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-red-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-zinc-400 block mb-1 uppercase text-[9px] font-bold">Field Input Type</label>
                        <select
                          value={reqModalType}
                          onChange={(e) => setReqModalType(e.target.value as any)}
                          className="w-full bg-black border border-zinc-900 rounded-lg py-2 px-3 text-white uppercase focus:outline-none focus:border-red-500 font-mono"
                        >
                          <option value="text">Text / Character Field</option>
                          <option value="number">Numeric Field Only</option>
                        </select>
                      </div>

                      <button
                        onClick={handleAddGameRequirement}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl uppercase cursor-pointer transition-colors mt-2"
                      >
                        Add Requirement
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* EDIT REQUIREMENT POPUP MODAL */}
            <AnimatePresence>
              {isEditReqModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-[#0b111e] border border-zinc-900 rounded-3xl p-6 w-full max-w-sm space-y-5 shadow-2xl relative"
                  >
                    <button
                      onClick={() => {
                        setIsEditReqModalOpen(false);
                        setEditingReqIdx(null);
                      }}
                      className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="space-y-1">
                      <h4 className="font-orbitron font-extrabold text-lg text-white uppercase tracking-wider">
                        Edit Requirement
                      </h4>
                      <p className="text-xs text-zinc-500 font-sans">Modify requirement details.</p>
                    </div>

                    <div className="space-y-4 font-mono text-xs text-left">
                      <div>
                        <label className="text-zinc-400 block mb-1 uppercase text-[9px] font-bold">Requirement Name (Label)</label>
                        <input
                          type="text"
                          placeholder="e.g. Player UID, Server ID"
                          value={reqModalName}
                          onChange={(e) => setReqModalName(e.target.value)}
                          className="w-full bg-black border border-zinc-900 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-red-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-zinc-400 block mb-1 uppercase text-[9px] font-bold">Field Input Type</label>
                        <select
                          value={reqModalType}
                          onChange={(e) => setReqModalType(e.target.value as any)}
                          className="w-full bg-black border border-zinc-900 rounded-lg py-2 px-3 text-white uppercase focus:outline-none focus:border-red-500 font-mono"
                        >
                          <option value="text">Text / Character Field</option>
                          <option value="number">Numeric Field Only</option>
                        </select>
                      </div>

                      <button
                        onClick={handleUpdateGameRequirement}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl uppercase cursor-pointer transition-colors mt-2"
                      >
                        Save Changes
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* VOUCHER CODES STOCK MANAGER */}
        {adminTab === "vouchers" && (
          <div className="space-y-6 animate-fadeIn">
            {!selectedVoucherGameId ? (
              // VOUCHER GAMES SELECTION VIEW
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-black/30 border border-zinc-900 p-5 rounded-2xl">
                  <div>
                    <h3 className="font-orbitron font-extrabold text-white text-md uppercase tracking-wider">
                      Voucher Code Stock Manager
                    </h3>
                    <p className="text-xs text-zinc-500 font-sans mt-0.5">
                      Select a voucher category game/service to manage its digital codes.
                    </p>
                  </div>
                </div>

                {/* VOUCHER GAMES GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dbGames
                    .filter(g => {
                      const catLower = (g.category || "").toLowerCase();
                      return catLower === "voucher" || catLower.includes("voucher");
                    })
                    .map(game => {
                      const rawCodes = game.voucher_codes || {};
                      const codesList = typeof rawCodes === "object"
                        ? Object.keys(rawCodes).map(k => ({ id: k, ...rawCodes[k] }))
                        : [];
                      const availableCount = codesList.filter((c: any) => c.status === "available" || !c.status).length;
                      const soldCount = codesList.filter((c: any) => c.status === "sold" || c.status === "soldout").length;

                      return (
                        <div
                          key={game.id}
                          onClick={() => {
                            setSelectedVoucherGameId(game.id);
                            setVoucherTextArea("");
                            setVoucherFilter("available");
                          }}
                          className="bg-black/35 border border-zinc-900/80 hover:border-zinc-850 p-4 rounded-2xl flex items-center justify-between gap-4 cursor-pointer hover:bg-black/50 hover:scale-[1.01] transition-all group duration-200"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={game.image || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=280"}
                              alt={game.name}
                              className="w-12 h-12 rounded-xl object-cover border border-zinc-900"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <strong className="text-white text-sm group-hover:text-red-500 transition-colors block">{game.name}</strong>
                              <span className="bg-zinc-900/60 border border-zinc-900 text-zinc-400 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase">
                                Voucher Category
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-zinc-500 font-mono block uppercase">In Stock</span>
                            <span className="font-orbitron font-black text-xs text-emerald-500 block">
                              {availableCount} Available
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  {dbGames.filter(g => {
                    const catLower = (g.category || "").toLowerCase();
                    return catLower === "voucher" || catLower.includes("voucher");
                  }).length === 0 && (
                    <div className="col-span-full py-16 text-center text-zinc-600 font-mono text-xs bg-black/20 border border-zinc-900 border-dashed rounded-2xl">
                      No voucher-category games/services configured yet. Add one in the "Games" tab with category "Voucher Code".
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // DETAILED VOUCHER MANAGER VIEW FOR SELECTED GAME
              (() => {
                const gameObj = dbGames.find(g => g.id === selectedVoucherGameId);
                if (!gameObj) return <div className="text-center font-mono py-10 text-zinc-500">Game not found</div>;

                const rawCodes = gameObj.voucher_codes || {};
                const codesList = typeof rawCodes === "object"
                  ? Object.keys(rawCodes).map(k => ({ id: k, ...rawCodes[k] }))
                  : [];
                
                const availableCodes = codesList.filter((c: any) => c.status === "available" || !c.status);
                const soldCodes = codesList.filter((c: any) => c.status === "sold" || c.status === "soldout");
                const currentFilteredCodes = voucherFilter === "available" ? availableCodes : soldCodes;

                const handleAddVoucherCodes = async () => {
                  const lines = voucherTextArea.split("\n");
                  const codesToAdd = lines
                    .map(line => line.trim())
                    .filter(line => line.length > 0);

                  if (codesToAdd.length === 0) {
                    alert("Please enter at least one valid voucher code.");
                    return;
                  }

                  try {
                    const voucherRef = ref(db, `games/${selectedVoucherGameId}/voucher_codes`);
                    for (const code of codesToAdd) {
                      await push(voucherRef, {
                        code: code,
                        status: "available",
                        createdAt: new Date().toISOString()
                      });
                    }
                    setVoucherTextArea("");
                    alert(`Successfully added ${codesToAdd.length} voucher codes!`);
                  } catch (err: any) {
                    alert("Error adding voucher codes: " + err.message);
                  }
                };

                const handleDeleteCode = async (codeId: string) => {
                  if (confirm("Are you sure you want to delete this voucher code?")) {
                    try {
                      await remove(ref(db, `games/${selectedVoucherGameId}/voucher_codes/${codeId}`));
                      alert("Voucher code deleted.");
                    } catch (err: any) {
                      alert("Error deleting: " + err.message);
                    }
                  }
                };

                return (
                  <div className="space-y-6">
                    {/* TOP GAME TITLE HEADER */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-black/30 border border-zinc-900 p-5 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setSelectedVoucherGameId(null)}
                          className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-xl cursor-pointer transition-colors"
                          title="Back to Games"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                        
                        <div className="flex items-center gap-3">
                          <img
                            src={gameObj.image}
                            alt={gameObj.name}
                            className="w-12 h-12 rounded-xl object-cover border border-zinc-900"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest block">Managing Vouchers Stock for</span>
                            <h3 className="font-orbitron font-extrabold text-white text-md uppercase tracking-wider">{gameObj.name}</h3>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* TWO-COLUMN GRID: ADD FORM LEFT, STOCK LIST RIGHT */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      
                      {/* LEFT: ADD CODES FORM */}
                      <div className="lg:col-span-5 bg-black/30 border border-zinc-900 p-5 rounded-3xl space-y-4 text-xs font-mono">
                        <div className="flex items-center gap-2 text-red-500">
                          <Ticket className="w-4 h-4" />
                          <span className="text-[10px] font-extrabold uppercase tracking-widest block">
                            Add Voucher Codes (One Per Line)
                          </span>
                        </div>

                        <textarea
                          rows={8}
                          value={voucherTextArea}
                          onChange={(e) => setVoucherTextArea(e.target.value)}
                          placeholder="ABC-123-XYZ&#10;DEF-456-UVW&#10;GHI-789-RST"
                          className="w-full bg-black border border-zinc-900 rounded-xl p-3 text-white text-xs font-mono focus:outline-none focus:border-red-500 leading-relaxed resize-none placeholder-zinc-700"
                        />

                        <button
                          onClick={handleAddVoucherCodes}
                          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl uppercase cursor-pointer transition-colors text-xs font-orbitron"
                        >
                          Add Codes
                        </button>
                      </div>

                      {/* RIGHT: STOCK STATUS LIST */}
                      <div className="lg:col-span-7 space-y-4">
                        {/* SUB-TABS (AVAILABLE AND SOLD ONLY) */}
                        <div className="flex bg-black/40 border border-zinc-900 p-1 rounded-xl">
                          <button
                            onClick={() => setVoucherFilter("available")}
                            className={`flex-1 py-2 text-center text-xs font-mono font-bold uppercase rounded-lg transition-all cursor-pointer ${
                              voucherFilter === "available"
                                ? "bg-red-600 text-white"
                                : "text-zinc-500 hover:text-white"
                            }`}
                          >
                            Available ({availableCodes.length})
                          </button>
                          <button
                            onClick={() => setVoucherFilter("sold")}
                            className={`flex-1 py-2 text-center text-xs font-mono font-bold uppercase rounded-lg transition-all cursor-pointer ${
                              voucherFilter === "sold"
                                ? "bg-red-600 text-white"
                                : "text-zinc-500 hover:text-white"
                            }`}
                          >
                            Sold / Used ({soldCodes.length})
                          </button>
                        </div>

                        {/* FILTERED CODES SCROLL AREA */}
                        <div className="bg-black/25 border border-zinc-900 rounded-3xl p-4 min-h-[300px] max-h-[420px] overflow-y-auto no-scrollbar">
                          {currentFilteredCodes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[260px] text-zinc-600 font-mono text-xs space-y-1">
                              <span>No codes in this status.</span>
                              {voucherFilter === "available" && (
                                <span className="text-[10px] text-zinc-500 font-sans">Use the left panel to upload new stock.</span>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-2.5">
                              {currentFilteredCodes.map((c: any) => (
                                <div
                                  key={c.id}
                                  className="flex items-center justify-between gap-4 bg-black/40 border border-zinc-900 p-3 rounded-2xl"
                                >
                                  <div className="flex items-center gap-2.5 overflow-hidden">
                                    <div className={`w-2 h-2 rounded-full ${voucherFilter === "available" ? "bg-emerald-500" : "bg-zinc-700"}`} />
                                    <span className="font-mono text-xs text-white tracking-wider break-all font-bold select-all">
                                      {c.code}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(c.code);
                                        alert("Code copied to clipboard: " + c.code);
                                      }}
                                      className="p-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-800 rounded-lg cursor-pointer transition-colors"
                                      title="Copy Code"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteCode(c.id)}
                                      className="p-2 bg-red-950/20 hover:bg-red-900/20 border border-red-950 text-red-500 rounded-lg cursor-pointer transition-colors"
                                      title="Delete Code"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })()
            )}
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
