import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ref,
  onValue,
  set,
  update,
  push,
  get,
  remove
} from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  User
} from "firebase/auth";
import {
  Home,
  Wallet,
  User as UserIcon,
  LogOut,
  Key,
  Pencil,
  ChevronLeft,
  Coins,
  ShoppingCart,
  Heart,
  FileText,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Lock,
  Mail,
  UserCheck,
  Copy,
  Check,
  MessageCircle,
  Bell,
  History as HistoryIcon,
  ShieldCheck,
  Send,
  Gamepad2,
  Settings,
  XCircle,
  Info,
  Activity,
  Globe,
  DollarSign,
  Phone,
  Gift,
  Ticket
} from "lucide-react";
import { auth, db } from "./firebase";
import { UserData } from "./types";
import { servicesData, ServiceItem, GamePackage, exchangeRates } from "./data/packages";
import Logo from "./components/Logo";
import ProfileSection from "./components/ProfileSection";
import HistorySection from "./components/HistorySection";
import AdminSection from "./components/AdminSection";

export default function App() {
  // Splash & Initialization State
  const [authInitializing, setAuthInitializing] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<(UserData & { avatarId?: string; phone?: string; country?: string; referralCode?: string }) | null>(null);

  // Active section configuration
  const [activeSection, setActiveSection] = useState<"home" | "wallet" | "history" | "profile" | "topup" | "admin">("home");

  // Profile interactive states
  const [profileActiveTab, setProfileActiveTab] = useState<
    "menu" | "overview" | "favorites" | "notifications" | "support" | "refer" | "policies" | "settings"
  >("menu");
  const [historySubTab, setHistorySubTab] = useState<"orders" | "deposits">("orders");
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [userDeposits, setUserDeposits] = useState<any[]>([]);
  const [systemNotifications, setSystemNotifications] = useState<any[]>([]);
  const [userTickets, setUserTickets] = useState<any[]>([]);
  const [supportTopic, setSupportTopic] = useState("");
  const [supportMessage, setSupportMessage] = useState("");

  // Auth views
  const [authView, setAuthView] = useState<"login" | "register">("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  
  // Registration Advanced Fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regCountry, setRegCountry] = useState("Nepal");
  const [regReferral, setRegReferral] = useState("");

  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Multi-Currency State
  const [activeCurrency, setActiveCurrency] = useState<"NPR" | "AED" | "USD">("NPR");

  // Category selection state
  const [selectedCategory, setSelectedCategory] = useState<string>("topup");
  const [dbCategories, setDbCategories] = useState<any[]>([
    { id: "topup", name: "Direct Top-up" },
    { id: "voucher", name: "Voucher Code" },
    { id: "subscription", name: "Premium Subscription" }
  ]);

  // Active service selection (one of the 10 services)
  const [activeService, setActiveService] = useState<ServiceItem | null>(null);
  const [selectedPkg, setSelectedPkg] = useState<GamePackage | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  // Dynamic input fields state for active order
  const [fieldsState, setFieldsState] = useState<any>({});

  // Custom DB-loaded prices fallback map
  const [dbPrices, setDbPrices] = useState<any>({});

  // Dynamic DB-loaded games list
  const [dbServices, setDbServices] = useState<ServiceItem[]>([]);

  // Dynamic DB-loaded payment settings
  const [paymentSettings, setPaymentSettings] = useState({
    qrCode: "https://i.ibb.co/8nFCFgqw/WA-1772424062040.jpg",
    esewaNum: "9825880400"
  });

  // Listen to games, categories and payment settings
  useEffect(() => {
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
        setDbServices(list);
      } else {
        // Seed default games
        set(gamesRef, servicesData);
        setDbServices(servicesData);
      }
    });

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
      }
    });

    const paymentRef = ref(db, "payment_settings");
    const unsubscribePayment = onValue(paymentRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPaymentSettings({
          qrCode: data.qrCode || "https://i.ibb.co/8nFCFgqw/WA-1772424062040.jpg",
          esewaNum: data.esewaNum || "9825880400"
        });
      } else {
        // Seed default payment coordinates
        set(paymentRef, {
          qrCode: "https://i.ibb.co/8nFCFgqw/WA-1772424062040.jpg",
          esewaNum: "9825880400"
        });
      }
    });

    return () => {
      unsubscribeGames();
      unsubscribeCategories();
      unsubscribePayment();
    };
  }, [db]);

  // Wallet deposit options & state
  const [depositMethod, setDepositMethod] = useState<"esewa" | "khalti" | "binance" | "uaebank">("esewa");
  const [walletAmt, setWalletAmt] = useState("");
  const [esewaNum, setEsewaNum] = useState("");
  const [esewaName, setEsewaName] = useState("");
  const [esewaTrx, setEsewaTrx] = useState("");
  const [depositProofImage, setDepositProofImage] = useState<string | null>(null);

  // Modals state
  const [alertModal, setAlertModal] = useState<{ active: boolean; message: string }>({
    active: false,
    message: "",
  });
  const [customNotification, setCustomNotification] = useState<{
    active: boolean;
    message: string;
    type: "success" | "error" | "info" | "confirm";
    onConfirm?: () => void;
    onCancel?: () => void;
  } | null>(null);
  const [voucherSuccessModal, setVoucherSuccessModal] = useState<{
    active: boolean;
    codes: string[];
    gameName: string;
    packageName: string;
    orderId: string;
    finalPrice: number;
  } | null>(null);

  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [nameModal, setNameModal] = useState(false);
  const [newNameInput, setNewNameInput] = useState("");

  const [passModal, setPassModal] = useState(false);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confPass, setConfPass] = useState("");

  // Clipboard copies
  const [copiedEsewa, setCopiedEsewa] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // General loader states
  const [loading, setLoading] = useState(false);

  // Slider Image Banner Carousel State
  const [slideIndex, setSlideIndex] = useState(0);
  const [dbBanners, setDbBanners] = useState<string[]>([
    "https://i.ibb.co/rG5h77vw/1770000367736-1a203456.jpg",
    "https://i.ibb.co/7tFsSW46/1770040656764-0a668a00.jpg"
  ]);

  // Is Admin detection
  const isAdmin = currentUser?.email === "mandipmahato717@gmail.com" || (userData as any)?.role === "admin" || (typeof window !== "undefined" && (window.location.pathname === "/admin" || window.location.pathname.endsWith("/admin") || window.location.href.includes("/admin")));

  // Detect /admin pathname on load
  useEffect(() => {
    if (typeof window !== "undefined" && (window.location.pathname === "/admin" || window.location.pathname.endsWith("/admin") || window.location.href.includes("/admin"))) {
      setActiveSection("admin");
    }
  }, []);

  // Set up custom glowing alert and confirm dialogue overrides
  useEffect(() => {
    window.alert = (msg: string) => {
      let type: "success" | "error" | "info" = "info";
      const m = (msg || "").toLowerCase();
      if (
        m.includes("success") || 
        m.includes("done") || 
        m.includes("added") || 
        m.includes("copied") || 
        m.includes("dispatched") || 
        m.includes("delivered") || 
        m.includes("cleared") ||
        m.includes("completed") ||
        m.includes("updated") ||
        m.includes("saved")
      ) {
        type = "success";
      } else if (
        m.includes("error") || 
        m.includes("fail") || 
        m.includes("invalid") || 
        m.includes("mismatch") || 
        m.includes("blocked") || 
        m.includes("not enough") || 
        m.includes("required") ||
        m.includes("please") ||
        m.includes("mismatch")
      ) {
        type = "error";
      }
      setCustomNotification({
        active: true,
        message: msg,
        type: type
      });
    };

    (window as any).customConfirm = (msg: string): Promise<boolean> => {
      return new Promise((resolve) => {
        setCustomNotification({
          active: true,
          message: msg,
          type: "confirm",
          onConfirm: () => {
            setCustomNotification(null);
            resolve(true);
          },
          onCancel: () => {
            setCustomNotification(null);
            resolve(false);
          }
        });
      });
    };
  }, []);

  // Auto-rotating Banner carousel
  useEffect(() => {
    if (dbBanners.length <= 1) return;
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % dbBanners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [dbBanners]);

  // Track Firebase Auth state
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setUserData(null);
      }
      setAuthInitializing(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // Listen to User data modifications from Firebase Realtime Database
  useEffect(() => {
    if (!currentUser) return;
    const userRef = ref(db, `users/${currentUser.uid}`);
    const unsubscribeDb = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.blocked) {
          alert("Your account is currently blocked.");
          signOut(auth);
          return;
        }
        setUserData(data);
      } else {
        const uniqueId = "BNY-" + Math.floor(10000 + Math.random() * 90000);
        set(userRef, {
          name: regName || "BNY Guest",
          email: currentUser.email || "guest@bnyshop.com",
          uniqueId: uniqueId,
          balance: 0,
          blocked: false,
          avatarId: "vanguard",
          phone: regPhone || "",
          country: regCountry || "Nepal",
          referralCode: regReferral || "",
          role: currentUser.email === "mandipmahato717@gmail.com" ? "admin" : "user"
        }).catch((err) => console.error("Error initializing user data:", err));
      }
    });

    // Fetch dynamic customizable prices from DB
    const pricesRef = ref(db, "custom_prices");
    const unsubscribePrices = onValue(pricesRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        setDbPrices(val);
      }
    });

    // Fetch user orders history (both standard UID orders and custom forms)
    const ordersRef = ref(db, `orders/${currentUser.uid}`);
    const unsubscribeOrders = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b: any) => b.timestamp - a.timestamp);
        setUserOrders(list);
      } else {
        setUserOrders([]);
      }
    });

    // Fetch user deposits history
    const depositsRef = ref(db, "deposits");
    const unsubscribeDeposits = onValue(depositsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data)
          .map(key => ({
            id: key,
            ...data[key]
          }))
          .filter(dep => dep.uid === currentUser.uid)
          .sort((a, b: any) => b.timestamp - a.timestamp);
        setUserDeposits(list);
      } else {
        setUserDeposits([]);
      }
    });

    // Fetch dynamic slide banners from DB
    const bannersRef = ref(db, "banners");
    const unsubscribeBanners = onValue(bannersRef, (snapshot) => {
      const val = snapshot.val();
      if (val && Array.isArray(val)) {
        setDbBanners(val);
      } else if (val) {
        setDbBanners(Object.values(val));
      }
    });

    // Fetch system notifications (filtered by personal user targetUid or global)
    const notificationsRef = ref(db, "notifications");
    const unsubscribeNotifications = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }))
        .filter(notif => !notif.targetUid || notif.targetUid === currentUser.uid)
        .sort((a, b: any) => b.timestamp - a.timestamp);
        setSystemNotifications(list);
      } else {
        // Fallback default notifications if database node is empty
        setSystemNotifications([
          {
            id: "default-1",
            title: "🔥 Welcome to BNY SHOP!",
            body: "Get instant game diamonds, streaming codes, and USDT exchanges active 24/7. Our priority is your trust.",
            timestamp: Date.now() - 3600000 * 2,
            type: "info"
          },
          {
            id: "default-2",
            title: "⚡ FAST DELIVERY ASSURED",
            body: "All orders are processed in 5-15 minutes. Verification requests are monitored live.",
            timestamp: Date.now() - 3600000 * 24,
            type: "warning"
          }
        ]);
      }
    });

    // Fetch user support tickets
    const ticketsRef = ref(db, `support_tickets/${currentUser.uid}`);
    const unsubscribeTickets = onValue(ticketsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b: any) => b.timestamp - a.timestamp);
        setUserTickets(list);
      } else {
        setUserTickets([]);
      }
    });

    return () => {
      unsubscribeDb();
      unsubscribePrices();
      unsubscribeOrders();
      unsubscribeDeposits();
      unsubscribeBanners();
      unsubscribeNotifications();
      unsubscribeTickets();
    };
  }, [currentUser]);

  // Pricing Formatter Helper based on active currency choice
  const convertAndFormatPrice = (baseNPR: number) => {
    if (activeCurrency === "NPR") {
      return `Rs. ${baseNPR}`;
    } else if (activeCurrency === "USD") {
      return `$${(baseNPR / exchangeRates.USD).toFixed(2)}`;
    } else {
      return `${(baseNPR / exchangeRates.AED).toFixed(2)} AED`;
    }
  };

  // Auth Operations
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    if (!loginEmail || !loginPass) {
      setAuthError("Please enter both email and password.");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPass);
      setAuthSuccess("Logged in successfully!");
    } catch (err: any) {
      setAuthError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    if (!regName || !regEmail || !regPass || !regPhone) {
      setAuthError("Please fill all required fields (Name, Email, Password, and WhatsApp Number).");
      return;
    }
    setLoading(true);
    try {
      // Check if WhatsApp number is already registered
      const usersSnap = await get(ref(db, "users"));
      const usersData = usersSnap.val() || {};
      const phoneExists = Object.values(usersData).some((u: any) => u.phone === regPhone);
      if (phoneExists) {
        setAuthError("WhatsApp number is already registered.");
        setLoading(false);
        return;
      }

      const res = await createUserWithEmailAndPassword(auth, regEmail, regPass);
      const uniqueId = "BNY-" + Math.floor(10000 + Math.random() * 90000);
      await set(ref(db, `users/${res.user.uid}`), {
        name: regName,
        email: regEmail,
        password: regPass,
        uniqueId: uniqueId,
        balance: 0,
        blocked: false,
        phone: regPhone,
        country: regCountry,
        referralCode: regReferral,
        avatarId: "vanguard",
        role: regEmail === "mandipmahato717@gmail.com" ? "admin" : "user"
      });
      setAuthSuccess("Account created successfully!");
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use" || err.message?.includes("email-already-in-use")) {
        setAuthError("Email already in use");
      } else {
        setAuthError(err.message || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const confirmed = (window as any).customConfirm 
      ? await (window as any).customConfirm("Are you sure you want to log out?") 
      : window.confirm("Are you sure you want to log out?");
    if (confirmed) {
      await signOut(auth);
      setActiveSection("home");
    }
  };

  // Profile operations
  const openEditModal = () => {
    if (userData) {
      setNewNameInput(userData.name);
      setNameModal(true);
    }
  };

  const saveNewName = async () => {
    if (!newNameInput.trim() || !currentUser) return;
    setLoading(true);
    try {
      await update(ref(db, `users/${currentUser.uid}`), {
        name: newNameInput.trim(),
      });
      setNameModal(false);
    } catch (err: any) {
      alert(err.message || "Failed to update name");
    } finally {
      setLoading(false);
    }
  };

  const submitSupportTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportTopic.trim() || !supportMessage.trim() || !currentUser) {
      alert("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      const ticketsRef = ref(db, `support_tickets/${currentUser.uid}`);
      await push(ticketsRef, {
        topic: supportTopic.trim(),
        message: supportMessage.trim(),
        status: "open",
        timestamp: Date.now(),
      });
      setSupportTopic("");
      setSupportMessage("");
      alert("Support message submitted successfully! We will get back to you shortly.");
    } catch (err: any) {
      alert(err.message || "Failed to submit support request");
    } finally {
      setLoading(false);
    }
  };

  const saveNewPass = async () => {
    if (!oldPass || !newPass || !confPass) {
      alert("Please fill all fields");
      return;
    }
    if (newPass !== confPass) {
      alert("Passwords mismatch");
      return;
    }
    if (!currentUser || !currentUser.email) return;
    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, oldPass);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPass);
      alert("Password changed successfully!");
      setOldPass("");
      setNewPass("");
      setConfPass("");
      setPassModal(false);
    } catch (err: any) {
      alert(err.message || "Password change failed");
    } finally {
      setLoading(false);
    }
  };

  // Order Operations
  const openTopup = (service: ServiceItem) => {
    setActiveService(service);
    setSelectedPkg(null);
    setQuantity(1);
    setFieldsState({});
    setActiveSection("topup");
  };

  // Place order for any of the 10 services
  const submitOrder = async () => {
    if (!activeService || !currentUser || !userData) return;

    // Retrieve final price (checks customizable db fallback prices)
    let finalPriceNPR = 0;
    let finalPackageName = "";

    if (activeService.id === "usdt") {
      // USDT is computed dynamically
      const cryptoAmount = parseFloat(fieldsState.cryptoAmount);
      const txType = fieldsState.txType; // "BUY (Rate: 152 NPR)" or "SELL"

      if (!fieldsState.walletAddress || !fieldsState.network || !fieldsState.whatsappNumber || isNaN(cryptoAmount) || cryptoAmount < 50 || cryptoAmount > 1000 || !txType) {
        alert("Please enter all required USDT parameters correctly ($50 to $1000 limit).");
        return;
      }

      const isBuy = txType.includes("BUY");
      finalPriceNPR = isBuy ? cryptoAmount * 152 : 0; // If they sell us, cost to place order is 0. Balance gets updated on approval!
      finalPackageName = `${isBuy ? "BUY" : "SELL"} ${cryptoAmount} USDT (${fieldsState.network})`;
    } else {
      // Standard packages
      if (!selectedPkg) {
        alert("Please select a package size first.");
        return;
      }

      // Read fallback db custom price or standard package price
      const safeKey = selectedPkg.n.replace(/[.#$\[\]]/g, "_");
      const basePrice = dbPrices[activeService.id]?.[safeKey] ?? selectedPkg.p;
      finalPriceNPR = basePrice * quantity;
      finalPackageName = quantity > 1 ? `${selectedPkg.n} (Qty: ${quantity})` : selectedPkg.n;

      // Validate dynamic fields based on configurations
      if (!isVoucher) {
        const fieldsToValidate = activeService.fields || [];

        for (const f of fieldsToValidate) {
          if (!fieldsState[f.key]) {
            alert(`Please enter a valid ${f.label}`);
            return;
          }
        }
      }
    }

    // Verify balance if user is buying (i.e. cost is above 0)
    if (finalPriceNPR > 0 && userData.balance < finalPriceNPR) {
      const missing = finalPriceNPR - userData.balance;
      setAlertModal({
        active: true,
        message: `Insufficient Balance! Please deposit ${convertAndFormatPrice(missing)} first.`,
      });
      return;
    }

    // Fetch and assign voucher codes first if it's a voucher game
    let assignedVouchers: any[] = [];
    let updatedVoucherCodesMap: any = null;
    
    // Generate order IDs early so we have them for the voucher markers and the payloads
    const orderId = push(ref(db, "all_orders")).key || "";
    const userOrderId = push(ref(db, `orders/${currentUser.uid}`)).key || "";

    if (isVoucher) {
      setLoading(true);
      try {
        const snap = await get(ref(db, `games/${activeService.id}`));
        const gameVal = snap.val();
        const rawVoucherCodes = gameVal ? gameVal.voucher_codes : null;
        const allCodesList: any[] = [];
        if (rawVoucherCodes) {
          Object.keys(rawVoucherCodes).forEach(key => {
            allCodesList.push({ id: key, ...rawVoucherCodes[key] });
          });
        }
        const availableCodes = allCodesList.filter(c => c.status === "available" || !c.status);
        if (availableCodes.length < quantity) {
          alert(`Not enough voucher codes in stock! Available: ${availableCodes.length}, Requested: ${quantity}`);
          setLoading(false);
          return;
        }
        assignedVouchers = availableCodes.slice(0, quantity);

        // Prepare the updated voucher codes map to save back
        updatedVoucherCodesMap = { ...rawVoucherCodes };
        assignedVouchers.forEach(v => {
          updatedVoucherCodesMap[v.id] = {
            ...v,
            status: "sold",
            soldTo: currentUser.uid,
            orderId: orderId,
            soldAt: Date.now()
          };
          delete updatedVoucherCodesMap[v.id].id; // clean up key
        });
      } catch (err: any) {
        alert("Error fetching available stock: " + err.message);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    try {
      // Deduct balance if purchasing
      if (finalPriceNPR > 0) {
        const newBal = userData.balance - finalPriceNPR;
        await update(ref(db, `users/${currentUser.uid}`), { balance: newBal });
      }

      const orderPayload = {
        orderId,
        userOrderId,
        uid: currentUser.uid,
        email: currentUser.email,
        uniqueId: userData.uniqueId,
        game: activeService.name,
        packageName: finalPackageName,
        price: finalPriceNPR,
        quantity: activeService.id === "usdt" ? 1 : quantity,
        status: isVoucher ? "approved" : "pending",
        timestamp: Date.now(),
        ...(isVoucher ? { voucher_codes: assignedVouchers.map(v => v.code) } : fieldsState)
      };

      const updates: any = {};
      updates[`all_orders/${orderId}`] = orderPayload;
      updates[`orders/${currentUser.uid}/${userOrderId}`] = orderPayload;

      if (isVoucher && updatedVoucherCodesMap) {
        updates[`games/${activeService.id}`] = {
          voucher_codes: updatedVoucherCodesMap
        };
      }

      await update(ref(db), updates);

      if (isVoucher) {
        setVoucherSuccessModal({
          active: true,
          codes: assignedVouchers.map(v => v.code),
          gameName: activeService.name,
          packageName: finalPackageName,
          orderId: userOrderId || "",
          finalPrice: finalPriceNPR
        });
      } else {
        // Construct highly-polished WhatsApp notification text
        const fieldsText = Object.keys(fieldsState)
          .map(key => `🔸 *${key.toUpperCase()}:* ${fieldsState[key]}`)
          .join("\n");

        const msg = `🛒 *BNY SHOP NEW ORDER* 🚀\n\n` +
                    `📦 *Product:* ${activeService.name}\n` +
                    `💎 *Item:* ${finalPackageName}\n` +
                    `💰 *Price:* NPR ${finalPriceNPR} (${convertAndFormatPrice(finalPriceNPR)})\n` +
                    `👤 *User Name:* ${userData.name}\n` +
                    `📧 *User Email:* ${currentUser.email}\n` +
                    `🆔 *BNY Unique ID:* ${userData.uniqueId}\n\n` +
                    `📝 *Fulfillment Details:*\n${fieldsText}`;

        const whatsappUrl = `https://wa.me/9779825880400?text=${encodeURIComponent(msg)}`;
        window.open(whatsappUrl, "_blank");

        setSelectedPkg(null);
        setFieldsState({});
        setActiveSection("home");
        alert("Order placed successfully! Redirecting to verification desk...");
      }
    } catch (err: any) {
      alert(err.message || "Failed to submit order");
    } finally {
      setLoading(false);
    }
  };

  const goToWallet = () => {
    setAlertModal({ active: false, message: "" });
    setActiveSection("wallet");
  };

  // Submit Deposit Transaction proof manually with image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const fileType = file.type;
    if (fileType !== "image/png" && fileType !== "image/jpeg" && fileType !== "image/jpg") {
      alert("Please upload JPG, JPEG, or PNG files only.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setDepositProofImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const submitDeposit = async () => {
    if (!walletAmt || !esewaTrx) {
      alert("Please enter Deposit Amount and Transaction Code.");
      return;
    }
    if (!depositProofImage) {
      alert("Please upload an image proof (JPG or PNG only).");
      return;
    }
    if (!currentUser || !userData) return;

    setLoading(true);
    try {
      const depositsRef = ref(db, "deposits");
      await push(depositsRef, {
        uid: currentUser.uid,
        email: currentUser.email,
        amount: parseInt(walletAmt),
        trx: esewaTrx,
        status: "pending",
        proofImage: depositProofImage, // Base64 encoded screenshot
        timestamp: Date.now(),
        paymentMethod: "ESEWA"
      });

      const msg = `🚀 *BNY SHOP DEPOSIT PROOF* 🚀\n\n` +
                  `🆔 *BNY ID:* ${userData.uniqueId}\n` +
                  `👤 *Member Name:* ${userData.name}\n` +
                  `📧 *Member Email:* ${currentUser.email}\n` +
                  `💳 *Method:* ESEWA\n` +
                  `💰 *Load Amount:* NPR ${walletAmt}\n` +
                  `🔢 *Transaction Code:* ${esewaTrx}\n` +
                  `🖼️ *Image Proof Included:* Yes (Uploaded directly on platform)`;

      const whatsappUrl = `https://wa.me/9779825880400?text=${encodeURIComponent(msg)}`;
      window.open(whatsappUrl, "_blank");

      // Reset fields
      setWalletAmt("");
      setEsewaTrx("");
      setDepositProofImage(null);
      alert("Deposit slip loaded! Our auditors will credit your balance shortly.");
    } catch (err: any) {
      alert(err.message || "Failed to log deposit");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: "esewa" | "id") => {
    navigator.clipboard.writeText(text);
    if (type === "esewa") {
      setCopiedEsewa(true);
      setTimeout(() => setCopiedEsewa(false), 2000);
    } else {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const activeServiceCategoryObj = dbCategories.find(c => c.id === activeService?.category);
  const activeServiceCategoryName = activeServiceCategoryObj ? (activeServiceCategoryObj.name || "").toLowerCase() : "";
  const isVoucher = activeService?.category?.toLowerCase() === "voucher" || 
                    activeService?.category?.toLowerCase().includes("voucher") ||
                    activeServiceCategoryName.includes("voucher");

  const rawVouchersObj = activeService?.voucher_codes || {};
  const vouchersList = typeof rawVouchersObj === "object"
    ? Object.keys(rawVouchersObj).map((key: any) => ({ id: key, ...rawVouchersObj[key] }))
    : [];
  const availableVouchersCount = vouchersList.filter((v: any) => v.status === "available" || !v.status).length;

  return (
    <div className="min-h-screen bg-bg-navy text-white font-sans flex flex-col antialiased selection:bg-brand-orange selection:text-white">
      {/* AUTH INITIALIZING BANNER */}
      {authInitializing && (
        <div className="flex-1 flex flex-col justify-center items-center">
          <Loader2 className="w-10 h-10 animate-spin text-brand-orange" />
          <p className="text-xs text-zinc-500 font-mono mt-3 uppercase tracking-wider animate-pulse">
            BNY SHOP &bull; SECURING CONNECTION
          </p>
        </div>
      )}

      {/* AUTH SCREEN VIEW */}
      {!currentUser && !authInitializing && !isAdmin && (
        <div id="auth-screen" className="flex-1 flex flex-col justify-center items-center px-4 py-12 bg-[radial-gradient(circle_at_center,_#0b162c_0%,_#040810_100%)]">
          <motion.div
            initial={{ y: -15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Logo iconSize={32} textClass="text-3xl" />
          </motion.div>

          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="w-full max-w-md bg-card-bg rounded-3xl border border-brand-blue/30 p-8 shadow-[0_0_50px_rgba(0,102,204,0.15)]"
          >
            {authView === "login" ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="text-center mb-2">
                  <h2 className="text-lg font-orbitron font-extrabold tracking-widest text-white uppercase">MEMBER PORTAL</h2>
                  <p className="text-xs text-zinc-400 mt-1">Access your store wallets and order tracker</p>
                </div>

                {authError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs font-semibold text-red-400 text-center leading-relaxed">
                    {authError}
                  </div>
                )}
                {authSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-xs font-semibold text-emerald-400 text-center leading-relaxed">
                    {authSuccess}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="Email Address"
                      className="w-full bg-black/50 border border-zinc-900 text-white placeholder-zinc-700 px-10 py-3 rounded-xl focus:outline-none focus:border-brand-blue transition-all font-mono text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Security Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                      type="password"
                      value={loginPass}
                      onChange={(e) => setLoginPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-black/50 border border-zinc-900 text-white placeholder-zinc-700 px-10 py-3 rounded-xl focus:outline-none focus:border-brand-blue transition-all font-mono text-sm"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-brand-blue to-brand-blue/90 hover:from-brand-blue hover:to-brand-blue active:scale-[0.98] transition-all py-3.5 rounded-xl font-bold font-orbitron tracking-widest text-xs flex items-center justify-center gap-2 cursor-pointer border border-brand-blue/50 shadow-[0_4px_15px_rgba(0,102,204,0.3)] mt-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      ENTER BNY PORTAL
                    </>
                  )}
                </button>

                <p className="text-center text-zinc-400 text-xs mt-6">
                  Don't have an account?{" "}
                  <span
                    className="text-brand-orange cursor-pointer hover:underline font-extrabold"
                    onClick={() => {
                      setAuthView("register");
                      setAuthError(null);
                      setAuthSuccess(null);
                    }}
                  >
                    Register
                  </span>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="text-center mb-1">
                  <h2 className="text-lg font-orbitron font-extrabold tracking-widest text-white uppercase font-black">CREATE ACCOUNT</h2>
                </div>

                {authError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs font-semibold text-red-400 text-center leading-relaxed">
                    {authError}
                  </div>
                )}
                {authSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-xs font-semibold text-emerald-400 text-center leading-relaxed">
                    {authSuccess}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Full Name</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-black/50 border border-zinc-900 text-white placeholder-zinc-700 px-4 py-2.5 rounded-xl focus:outline-none focus:border-brand-blue transition-all text-xs font-semibold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">WhatsApp Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                    <input
                      type="text"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="9825880400"
                      className="w-full bg-black/50 border border-zinc-900 text-white placeholder-zinc-700 px-9 py-2.5 rounded-xl focus:outline-none focus:border-brand-blue transition-all text-xs font-mono font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="Email Address"
                      className="w-full bg-black/50 border border-zinc-900 text-white placeholder-zinc-700 px-10 py-2.5 rounded-xl focus:outline-none focus:border-brand-blue transition-all font-mono text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Create Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                    <input
                      type="password"
                      value={regPass}
                      onChange={(e) => setRegPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-black/50 border border-zinc-900 text-white placeholder-zinc-700 px-9 py-2.5 rounded-xl focus:outline-none focus:border-brand-blue transition-all font-mono text-xs"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-brand-orange to-brand-orange/90 hover:from-brand-orange hover:to-brand-orange active:scale-[0.98] transition-all py-3.5 rounded-xl font-bold font-orbitron tracking-widest text-xs flex items-center justify-center gap-2 cursor-pointer border border-brand-orange/50 shadow-[0_4px_15px_rgba(243,91,4,0.3)]"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      CREATE ACCOUNT
                    </>
                  )}
                </button>

                <p className="text-center text-zinc-400 text-xs mt-4">
                  Already registered?{" "}
                  <span
                    className="text-brand-orange cursor-pointer hover:underline font-extrabold"
                    onClick={() => {
                      setAuthView("login");
                      setAuthError(null);
                      setAuthSuccess(null);
                    }}
                  >
                    Login
                  </span>
                </p>
              </form>
            )}
          </motion.div>
        </div>
      )}

      {/* MAIN APPLICATION INTERFACE */}
      {(currentUser || isAdmin) && !authInitializing && (
        <div id="app-content" className={`flex-1 flex flex-col w-full ${activeSection === "admin" && isAdmin ? "max-w-6xl" : "max-w-3xl"} mx-auto pb-24 shadow-2xl min-h-screen bg-bg-navy border-x border-zinc-900/40 transition-all duration-300`}>
          {/* Header Bar */}
          <header className="sticky top-0 bg-bg-navy/90 backdrop-blur-md px-5 py-4 flex justify-between items-center border-b border-red-600/20 z-50">
            <Logo iconSize={20} textClass="text-lg" />
            
            <div className="flex items-center gap-2.5">
              {/* Balance Widget */}
              <div className="flex items-center gap-2 border border-red-600/40 bg-red-950/10 px-3 py-1.5 rounded-xl shadow-[inset_0_0_10px_rgba(220,38,38,0.15)] h-8">
                <span className="text-zinc-400 font-mono text-[9px] uppercase tracking-wider">Balance:</span>
                <span className="text-red-500 font-black font-mono text-xs filter drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]">
                  {convertAndFormatPrice(userData?.balance ?? 0)}
                </span>
              </div>
            </div>
          </header>

          {/* Dynamic home slider only shows in home section */}
          {activeSection === "home" && (
            <div id="home-slider" className="w-full aspect-video relative overflow-hidden border-b border-brand-blue/10 bg-zinc-950">
              <div
                className="flex w-full h-full transition-transform duration-1000 ease-in-out"
                style={{ transform: `translateX(-${slideIndex * 100}%)` }}
              >
                {dbBanners.map((url, index) => (
                  <div key={index} className="min-w-full h-full relative">
                    <img
                      src={url}
                      alt={`Promo Slide ${index + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    {/* Dark gradient mask */}
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-navy via-transparent to-transparent"></div>
                  </div>
                ))}
              </div>
              
              {/* Tagline overlay removed */}

              {/* Pagination Dots */}
              <div className="absolute bottom-4 right-5 flex gap-1.5 z-10">
                {dbBanners.map((_, index) => (
                  <div
                    key={index}
                    onClick={() => setSlideIndex(index)}
                    className={`w-2.5 h-1.5 rounded-full transition-all cursor-pointer ${
                      slideIndex === index ? "w-6 bg-brand-orange" : "bg-zinc-700"
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic Render Section Router */}
          <main className="flex-1 px-4 py-6">
            <AnimatePresence mode="wait">
              
              {/* 1. HOME SECTION */}
              {activeSection === "home" && (
                <motion.div
                  key="home"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Category Tabs Selector with Red Glowing Design */}
                  <div className="flex overflow-x-auto whitespace-nowrap no-scrollbar gap-2.5 pb-2.5 border-b border-zinc-900/40 md:justify-center justify-start px-1 max-w-full scroll-smooth">
                    {dbCategories.map((cat) => {
                      const isActive = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`px-4 py-2.5 rounded-xl font-orbitron font-extrabold text-[11px] uppercase tracking-wider transition-all duration-300 border cursor-pointer text-center shrink-0 ${
                            isActive
                              ? "bg-red-950/45 border-red-600 text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.65)] scale-105"
                              : "bg-black/40 border-zinc-900 text-zinc-500 hover:text-zinc-300 hover:border-zinc-800"
                          }`}
                        >
                          {cat.name}
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                    {(dbServices.length > 0 ? dbServices : servicesData)
                      .filter((service) => service.category === selectedCategory)
                      .map((service) => (
                        <div
                          key={service.id}
                          onClick={() => openTopup(service)}
                          className="group bg-card-bg rounded-2xl overflow-hidden border border-zinc-900 hover:border-red-600 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] active:scale-95 flex flex-col justify-between"
                        >
                          <div className="relative aspect-[4/3] overflow-hidden bg-black/60 flex items-center justify-center p-2 border-b border-zinc-900/40">
                            <img
                              src={service.image}
                              alt={service.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-contain group-hover:scale-105 transition-all duration-500"
                            />
                          </div>
                          <div className="p-3 text-center bg-black/10">
                            <p className="font-bold tracking-wider text-xs text-white group-hover:text-red-500 group-hover:filter group-hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.6)] transition-all">
                              {service.name}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </motion.div>
              )}

              {/* 2. WALLET SECTION */}
              {activeSection === "wallet" && (
                <motion.div
                  key="wallet"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="text-center py-6 bg-gradient-to-b from-card-bg to-[#070b14] rounded-3xl border border-red-600/30 space-y-1 shadow-[0_0_20px_rgba(220,38,38,0.15)]">
                    <p className="text-zinc-400 text-[10px] uppercase font-mono tracking-widest">Available BNY Store Wallet</p>
                    <h1 className="font-orbitron text-3xl font-extrabold text-red-500 tracking-wider filter drop-shadow-[0_0_10px_rgba(239,68,68,0.65)]">
                      {convertAndFormatPrice(userData?.balance ?? 0)}
                    </h1>
                  </div>

                  {/* QR Code and Account Details Block */}
                  <div className="bg-card-bg p-6 rounded-3xl border border-zinc-900 flex flex-col items-center space-y-4 shadow-md">
                    <h4 className="font-orbitron font-extrabold text-xs text-red-500 uppercase tracking-widest filter drop-shadow-[0_0_5px_rgba(239,68,68,0.4)]">
                      eSewa Direct Payment QR
                    </h4>

                    <div className="bg-white p-2.5 rounded-2xl border-4 border-red-600 shadow-[0_0_25px_rgba(220,38,38,0.45)] aspect-square w-52 h-52 flex items-center justify-center relative overflow-hidden">
                      <img
                        id="qr-display"
                        src={paymentSettings.qrCode} // eSewa QR
                        alt="Payment QR Code"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="text-center space-y-1.5 font-mono w-full max-w-xs">
                      <p className="text-zinc-400 text-[10px] uppercase tracking-wider font-extrabold">
                        Account Coordinates
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-1 bg-black/40 py-2 px-3 rounded-xl border border-zinc-900">
                        <b className="text-red-500 text-base tracking-wider filter drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]">
                          {paymentSettings.esewaNum}
                        </b>
                        <button
                          onClick={() => copyToClipboard(paymentSettings.esewaNum, "esewa")}
                          className="bg-zinc-900 hover:bg-zinc-800 p-1.5 rounded-lg text-red-500 hover:text-white border border-zinc-800 cursor-pointer transition-colors shadow-[0_0_8px_rgba(220,38,38,0.2)]"
                          title="Copy ID"
                        >
                          {copiedEsewa ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {copiedEsewa && (
                        <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-wider animate-pulse font-sans">
                          ID Copied to clipboard!
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Deposit Form with File Upload */}
                  <div className="bg-card-bg p-6 rounded-3xl border border-zinc-900 space-y-5 shadow-md">
                    <h3 className="font-orbitron font-extrabold text-xs text-red-500 uppercase tracking-widest border-b border-zinc-900 pb-2.5 filter drop-shadow-[0_0_8px_rgba(239,68,68,0.55)]">
                      SUBMIT TRANSACTION PROOF
                    </h3>

                    <div className="space-y-4 text-xs font-mono">
                      <div>
                        <label className="text-zinc-400 block mb-1 uppercase font-bold text-[10px]">Deposit Amount (NPR)</label>
                        <input
                          type="number"
                          placeholder=""
                          value={walletAmt}
                          onChange={(e) => setWalletAmt(e.target.value)}
                          className="w-full bg-black/50 border border-zinc-900 text-white placeholder-zinc-700 px-4 py-3 rounded-xl focus:outline-none focus:border-red-600 transition-all shadow-inner"
                        />
                      </div>

                      <div>
                        <label className="text-zinc-400 block mb-1 uppercase font-bold text-[10px]">Transaction Code / Ref ID</label>
                        <input
                          type="text"
                          placeholder=""
                          value={esewaTrx}
                          onChange={(e) => setEsewaTrx(e.target.value)}
                          className="w-full bg-black/50 border border-zinc-900 text-white placeholder-zinc-700 px-4 py-3 rounded-xl focus:outline-none focus:border-red-600 transition-all shadow-inner"
                        />
                      </div>

                      <div>
                        <label className="text-zinc-400 block mb-1.5 uppercase font-bold text-[10px]">Upload Image Proof (PNG or JPG Only)</label>
                        <div className="relative border border-dashed border-zinc-800 rounded-xl p-4 bg-black/20 hover:border-red-600/50 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer">
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={handleImageUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          {depositProofImage ? (
                            <div className="space-y-2 text-center w-full">
                              <div className="mx-auto max-h-32 max-w-[180px] overflow-hidden rounded-lg border border-zinc-800">
                                <img
                                  src={depositProofImage}
                                  alt="Proof Preview"
                                  className="w-full h-auto object-cover"
                                />
                              </div>
                              <p className="text-[10px] text-emerald-500 font-extrabold uppercase tracking-wider">✓ Image Selected Successfully</p>
                            </div>
                          ) : (
                            <div className="text-center py-2 space-y-1">
                              <span className="text-xl">📷</span>
                              <p className="text-[10px] text-zinc-500 uppercase font-extrabold tracking-wider">Click or Drag to Select Screenshot</p>
                              <p className="text-[9px] text-zinc-600 font-medium">Supports PNG, JPG, JPEG formats</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={submitDeposit}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 active:scale-[0.98] text-white transition-all py-3.5 rounded-xl font-bold font-orbitron tracking-widest text-xs flex items-center justify-center gap-2.5 cursor-pointer border border-red-600/40 mt-2 shadow-[0_0_15px_rgba(220,38,38,0.3)] filter drop-shadow-[0_0_5px_rgba(220,38,38,0.25)]"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <MessageCircle className="w-4 h-4" />
                            SUBMIT DEPOSIT PROOF
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 3. HISTORY SECTION */}
              {activeSection === "history" && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <HistorySection
                    userOrders={userOrders}
                    userDeposits={userDeposits}
                    historySubTab={historySubTab}
                    setHistorySubTab={setHistorySubTab}
                    copyToClipboard={copyToClipboard}
                    setActiveSection={setActiveSection}
                    setProfileActiveTab={setProfileActiveTab}
                    setSupportTopic={setSupportTopic}
                    setSupportMessage={setSupportMessage}
                    expandedOrder={expandedOrderId}
                    setExpandedOrder={setExpandedOrderId}
                  />
                </motion.div>
              )}

              {/* 4. PROFILE SECTION */}
              {activeSection === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProfileSection
                    userData={userData}
                    systemNotifications={systemNotifications}
                    userTickets={userTickets}
                    supportTopic={supportTopic}
                    setSupportTopic={setSupportTopic}
                    supportMessage={supportMessage}
                    setSupportMessage={setSupportMessage}
                    loading={loading}
                    submitSupportTicket={submitSupportTicket}
                    openEditModal={openEditModal}
                    setPassModal={setPassModal}
                    handleLogout={handleLogout}
                    copyToClipboard={copyToClipboard}
                    copiedId={copiedId}
                    setActiveSection={setActiveSection}
                    openTopup={openTopup}
                    activeTab={profileActiveTab}
                    setActiveTab={setProfileActiveTab}
                  />
                </motion.div>
              )}

              {/* 5. TOPUP SECTION (DYNAMIC 10 SERVICES FLOW) */}
              {activeSection === "topup" && activeService && (
                <motion.div
                  key="topup"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                    <h2 className="font-orbitron text-md font-black text-white tracking-widest uppercase">
                      Topup {activeService.name}
                    </h2>
                    <button
                      onClick={() => {
                        setSelectedPkg(null);
                        setFieldsState({});
                        setActiveSection("home");
                      }}
                      className="flex items-center gap-1.5 text-[10px] text-zinc-500 hover:text-white transition-colors uppercase font-mono tracking-wider cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back to Services
                    </button>
                  </div>

                  {/* Render package options (Only if not USDT as USDT computes rate dynamically) */}
                  {activeService.id !== "usdt" && (
                    <div className="space-y-2">
                      <span className="text-[10px] text-zinc-500 font-mono font-extrabold uppercase tracking-widest block">
                        Select Packages
                      </span>
                      <div className="grid grid-cols-2 gap-3 font-mono">
                        {activeService.packages.map((pkg, idx) => {
                          const safeKey = pkg.n.replace(/[.#$\[\]]/g, "_");
                          const currentPriceNPR = dbPrices[activeService.id]?.[safeKey] ?? pkg.p;

                          return (
                            <div
                              key={idx}
                              onClick={() => {
                                setSelectedPkg(pkg);
                                setTimeout(() => {
                                  const elem = document.getElementById("buy-flow-section");
                                  if (elem) elem.scrollIntoView({ behavior: "smooth" });
                                }, 100);
                              }}
                              className={`p-4 rounded-2xl border text-center cursor-pointer transition-all duration-300 ${
                                selectedPkg?.n === pkg.n
                                  ? "bg-red-950/45 border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.6)] scale-102"
                                  : "bg-black/20 border-zinc-900 hover:border-zinc-800"
                              }`}
                            >
                              <h4 className="font-bold text-white tracking-wide mb-1 text-xs">{pkg.n}</h4>
                              <p className="text-xs font-mono text-brand-orange font-extrabold">
                                {convertAndFormatPrice(currentPriceNPR)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Dynamic Fields Input & Order Flow */}
                  {(selectedPkg || activeService.id === "usdt") && (
                    <motion.div
                      id="buy-flow-section"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card-bg p-6 rounded-3xl border border-zinc-900 space-y-4 shadow-md"
                    >
                      <div className="border-b border-zinc-900 pb-3 mb-1 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-zinc-500 block uppercase font-mono tracking-widest">Selected Item</span>
                          <h3 className="font-orbitron font-extrabold text-white text-sm">
                            {activeService.id === "usdt" ? (
                              `USDT BUY/SELL TRANSACTION DESK`
                            ) : (
                              `${selectedPkg?.n}`
                            )}
                          </h3>
                        </div>
                        {activeService.id !== "usdt" && (
                          <div className="text-right">
                            <span className="text-[10px] text-zinc-500 block uppercase font-mono tracking-widest">Price</span>
                            <span className="font-orbitron font-black text-brand-orange text-md block">
                              {convertAndFormatPrice((dbPrices[activeService.id]?.[selectedPkg!.n.replace(/[.#$\[\]]/g, "_")] ?? selectedPkg!.p) * quantity)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Quantity Selector (Only if not USDT) */}
                      {activeService.id !== "usdt" && (
                        <div className="flex items-center justify-between bg-black/30 border border-zinc-900/60 p-4 rounded-2xl">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Quantity</span>
                            <span className="text-[9px] text-zinc-600">Select purchase amount</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setQuantity(Math.max(1, quantity - 1))}
                              className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-bold flex items-center justify-center transition-all cursor-pointer active:scale-95"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-xs font-black font-mono text-white">
                              {quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => setQuantity(quantity + 1)}
                              className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-bold flex items-center justify-center transition-all cursor-pointer active:scale-95"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Display Dynamic Fields */}
                      <div className="space-y-4 text-xs font-mono">
                        {isVoucher ? (
                          <div className="space-y-3">
                            <div className="p-4 bg-zinc-950/45 border border-zinc-900/80 rounded-2xl text-center space-y-1">
                              <span className="text-emerald-500 font-orbitron font-extrabold tracking-wider uppercase text-[10px] block">⚡ Instant Delivery Voucher</span>
                              <p className="text-[11px] text-zinc-400">No ID/UID required. The voucher code will be loaded instantly to your account!</p>
                            </div>

                            <div className="p-4 bg-black/30 border border-zinc-900/70 rounded-2xl flex items-center justify-between">
                              <span className="text-[10px] uppercase font-bold text-zinc-400">Voucher Stock Status</span>
                              <span className={`font-orbitron font-black text-[11px] px-2.5 py-1 rounded-lg tracking-wider uppercase ${
                                availableVouchersCount > 0
                                  ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/30"
                                  : "bg-red-950/45 text-red-500 border border-red-950"
                              }`}>
                                {availableVouchersCount > 0 ? `${availableVouchersCount} Available` : "Sold Out"}
                              </span>
                            </div>
                          </div>
                        ) : (
                          (activeService.fields || []).map((f, fIdx) => (
                            <div key={fIdx}>
                              <label className="text-zinc-400 block mb-1.5">{f.label}</label>
                              {f.type === "select" ? (
                                <select
                                  value={fieldsState[f.key] || ""}
                                  onChange={(e) => setFieldsState({ ...fieldsState, [f.key]: e.target.value })}
                                  className="w-full bg-black/50 border border-zinc-900 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-brand-blue font-bold text-xs"
                                >
                                  <option value="">-- Choose Option --</option>
                                  {f.options?.map((opt, oIdx) => (
                                    <option key={oIdx} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type={f.type}
                                  placeholder={f.placeholder}
                                  value={fieldsState[f.key] || ""}
                                  onChange={(e) => setFieldsState({ ...fieldsState, [f.key]: e.target.value })}
                                  className="w-full bg-black/50 border border-zinc-900 text-white placeholder-zinc-700 px-4 py-3 rounded-xl focus:outline-none focus:border-brand-blue transition-all"
                                />
                              )}
                            </div>
                          ))
                        )}

                        {/* USDT Dynamic Price Estimation Display */}
                        {activeService.id === "usdt" && fieldsState.cryptoAmount && fieldsState.txType && (
                          <div className="bg-black/40 border border-zinc-900 p-3.5 rounded-2xl flex justify-between items-center text-xs">
                            <span className="text-zinc-500 font-bold uppercase">Estimated Transaction Price</span>
                            <strong className="text-brand-orange font-black">
                              {fieldsState.txType.includes("BUY") ? (
                                `NPR ${parseFloat(fieldsState.cryptoAmount) * 152} (${convertAndFormatPrice(parseFloat(fieldsState.cryptoAmount) * 152)})`
                              ) : (
                                `You receive NPR ${parseFloat(fieldsState.cryptoAmount) * 160}`
                              )}
                            </strong>
                          </div>
                        )}

                        <button
                          onClick={submitOrder}
                          disabled={loading}
                          className="w-full bg-gradient-to-r from-brand-orange to-brand-orange/90 hover:from-brand-orange hover:to-brand-orange active:scale-[0.98] transition-all py-3.5 rounded-xl font-bold font-orbitron tracking-widest text-xs flex items-center justify-center gap-2 cursor-pointer border border-brand-orange/40 shadow-[0_4px_15px_rgba(243,91,4,0.35)] mt-2"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "CONFIRM STORE PURCHASE"
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* 6. ADMIN PORTAL SECTION */}
              {activeSection === "admin" && isAdmin && (
                <motion.div
                  key="admin"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <AdminSection db={db} currentUser={currentUser} services={dbServices.length > 0 ? dbServices : servicesData} setActiveSection={setActiveSection} customConfirm={(window as any).customConfirm} />
                </motion.div>
              )}

            </AnimatePresence>
          </main>

          {/* Bottom navigation bar */}
          <nav className="fixed bottom-0 left-0 right-0 max-w-3xl mx-auto bg-bg-navy/95 border-t border-zinc-900 px-4 py-2.5 flex justify-around items-center z-40 shadow-[0_-10px_30px_rgba(4,8,16,0.8)] backdrop-blur-md">
            {activeSection !== "admin" && (
              <button
                onClick={() => {
                  setSelectedPkg(null);
                  setFieldsState({});
                  setActiveSection("home");
                }}
                className={`flex flex-col items-center gap-1 cursor-pointer transition-all duration-300 ${
                  activeSection === "home" || activeSection === "topup" 
                    ? "text-red-500 font-extrabold filter drop-shadow-[0_0_8px_rgba(239,68,68,0.85)] scale-105" 
                    : "text-zinc-600 hover:text-white"
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
              </button>
            )}

            {activeSection !== "admin" && (
              <button
                onClick={() => setActiveSection("wallet")}
                className={`flex flex-col items-center gap-1 cursor-pointer transition-all duration-300 ${
                  activeSection === "wallet" 
                    ? "text-red-500 font-extrabold filter drop-shadow-[0_0_8px_rgba(239,68,68,0.85)] scale-105" 
                    : "text-zinc-600 hover:text-white"
                }`}
              >
                <Wallet className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Wallet</span>
              </button>
            )}

            {activeSection !== "admin" && (
              <button
                onClick={() => setActiveSection("history")}
                className={`flex flex-col items-center gap-1 cursor-pointer transition-all duration-300 ${
                  activeSection === "history" 
                    ? "text-red-500 font-extrabold filter drop-shadow-[0_0_8px_rgba(239,68,68,0.85)] scale-105" 
                    : "text-zinc-600 hover:text-white"
                }`}
              >
                <HistoryIcon className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">History</span>
              </button>
            )}

            <button
              onClick={() => {
                setProfileActiveTab("menu");
                setActiveSection("profile");
              }}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-all duration-300 ${
                activeSection === "profile" 
                  ? "text-red-500 font-extrabold filter drop-shadow-[0_0_8px_rgba(239,68,68,0.85)] scale-105" 
                  : "text-zinc-600 hover:text-white"
              }`}
            >
              <UserIcon className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Profile</span>
            </button>

            {/* Render Admin Tab if User email matches CEO / Admin privileges */}
            {isAdmin && (
              <button
                onClick={() => setActiveSection("admin")}
                className={`flex flex-col items-center gap-1 cursor-pointer transition-all duration-300 relative ${
                  activeSection === "admin" 
                    ? "text-red-500 font-extrabold filter drop-shadow-[0_0_8px_rgba(239,68,68,0.85)] scale-105" 
                    : "text-zinc-600 hover:text-red-500"
                }`}
              >
                <ShieldCheck className="w-5 h-5 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Admin</span>
                <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
              </button>
            )}
          </nav>
        </div>
      )}

      {/* MODALS BACKDROP WRAPPERS */}
      {/* Alert Insufficient Balance Modal */}
      <AnimatePresence>
        {alertModal.active && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[999]">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xs bg-card-bg border border-brand-orange rounded-3xl p-6 text-center space-y-4 shadow-[0_0_30px_rgba(243,91,4,0.25)]"
            >
              <div className="text-brand-orange flex justify-center">
                <AlertTriangle className="w-12 h-12 animate-bounce" />
              </div>
              <h3 className="font-orbitron font-extrabold text-white text-md tracking-widest">ALERT</h3>
              <p className="text-zinc-300 text-xs font-mono leading-relaxed">{alertModal.message}</p>
              <button
                onClick={goToWallet}
                className="w-full bg-brand-orange hover:bg-brand-orange/95 transition-all text-white font-bold py-2.5 rounded-xl text-xs tracking-wider cursor-pointer font-orbitron"
              >
                GO TO WALLET
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Name Edit Modal */}
      <AnimatePresence>
        {nameModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[999]">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xs bg-card-bg border border-brand-blue rounded-3xl p-6 space-y-4"
            >
              <h3 className="font-orbitron font-extrabold text-white tracking-widest text-center text-xs uppercase">
                Update Display Name
              </h3>
              <input
                type="text"
                value={newNameInput}
                onChange={(e) => setNewNameInput(e.target.value)}
                className="w-full bg-black/40 border border-zinc-900 text-white placeholder-zinc-700 px-4 py-3 rounded-xl focus:outline-none focus:border-brand-blue transition-all text-xs font-bold font-sans"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setNameModal(false)}
                  className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold py-2.5 rounded-xl text-[10px] tracking-wider cursor-pointer transition-colors uppercase font-mono"
                >
                  Cancel
                </button>
                <button
                  onClick={saveNewName}
                  disabled={loading}
                  className="flex-1 bg-brand-blue hover:bg-brand-blue text-white font-bold py-2.5 rounded-xl text-[10px] tracking-wider cursor-pointer transition-colors flex items-center justify-center gap-1 uppercase font-mono"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Password Modal */}
      <AnimatePresence>
        {passModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[999]">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-card-bg border border-brand-blue rounded-3xl p-6 space-y-4"
            >
              <h3 className="font-orbitron font-extrabold text-white tracking-widest text-center text-xs uppercase">
                Change Password
              </h3>

              <div className="space-y-3 font-mono text-xs">
                <input
                  type="password"
                  placeholder="Current Password"
                  value={oldPass}
                  onChange={(e) => setOldPass(e.target.value)}
                  className="w-full bg-black/40 border border-zinc-900 text-white placeholder-zinc-700 px-4 py-2.5 rounded-xl focus:outline-none focus:border-brand-blue transition-all"
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full bg-black/40 border border-zinc-900 text-white placeholder-zinc-700 px-4 py-2.5 rounded-xl focus:outline-none focus:border-brand-blue transition-all"
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confPass}
                  onChange={(e) => setConfPass(e.target.value)}
                  className="w-full bg-black/40 border border-zinc-900 text-white placeholder-zinc-700 px-4 py-2.5 rounded-xl focus:outline-none focus:border-brand-blue transition-all"
                />
              </div>

              <div className="flex gap-2 font-mono text-[10px]">
                <button
                  onClick={() => {
                    setOldPass("");
                    setNewPass("");
                    setConfPass("");
                    setPassModal(false);
                  }}
                  className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold py-2.5 rounded-xl tracking-wider cursor-pointer transition-colors uppercase"
                >
                  Cancel
                </button>
                <button
                  onClick={saveNewPass}
                  disabled={loading}
                  className="flex-1 bg-brand-blue hover:bg-brand-blue text-white font-bold py-2.5 rounded-xl tracking-wider cursor-pointer transition-colors flex items-center justify-center gap-1 uppercase"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Update"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Voucher Purchase Success Modal */}
      <AnimatePresence>
        {voucherSuccessModal && voucherSuccessModal.active && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-[999]">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-sm bg-[#0c0c0c] border border-emerald-500 rounded-3xl p-6 space-y-5 shadow-[0_0_40px_rgba(16,185,129,0.25)] text-center relative"
            >
              <div className="text-emerald-500 flex justify-center">
                <CheckCircle2 className="w-16 h-16 animate-pulse" />
              </div>
              
              <div className="space-y-1.5">
                <h3 className="font-orbitron font-black text-white text-base tracking-widest uppercase">
                  Order Completed Successfully
                </h3>
                <p className="text-[11px] text-zinc-500 font-mono">
                  Receipt Ref: ORD-{voucherSuccessModal.orderId.slice(0, 8).toUpperCase()}
                </p>
              </div>

              <div className="bg-black/60 border border-zinc-900 rounded-2xl p-4 text-left space-y-3">
                <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                  <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    {voucherSuccessModal.gameName} &bull; {voucherSuccessModal.packageName}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(voucherSuccessModal.codes.join("\n"));
                      alert("All delivered codes copied to clipboard!");
                    }}
                    className="text-[10px] bg-emerald-950/20 hover:bg-emerald-900/30 text-emerald-500 font-bold uppercase py-1 px-2.5 rounded-lg border border-emerald-900/30 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" /> Copy All
                  </button>
                </div>

                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1 no-scrollbar">
                  {voucherSuccessModal.codes.map((code, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-zinc-950 border border-zinc-900 p-2.5 rounded-xl font-mono text-xs">
                      <span className="text-white select-all tracking-wider font-extrabold">{code}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(code);
                          alert("Code copied: " + code);
                        }}
                        className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                        title="Copy code"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2.5 font-mono text-[11px] uppercase">
                <button
                  onClick={() => {
                    setVoucherSuccessModal(null);
                    setSelectedPkg(null);
                    setFieldsState({});
                    setSelectedCategory("topup");
                    setActiveSection("home");
                    window.location.reload();
                  }}
                  className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold py-3 rounded-xl tracking-wider cursor-pointer transition-colors border border-zinc-800"
                >
                  OK
                </button>
                <button
                  onClick={() => {
                    setExpandedOrderId(voucherSuccessModal.orderId);
                    setHistorySubTab("orders");
                    setActiveSection("history");
                    setVoucherSuccessModal(null);
                    setSelectedPkg(null);
                    setFieldsState({});
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 rounded-xl tracking-wider cursor-pointer transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                >
                  Order Detail
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Glowing Alert & Confirm Dialogue Modal */}
      <AnimatePresence>
        {customNotification && customNotification.active && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-[10000]">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              transition={{ duration: 0.2 }}
              className={`w-full max-w-sm bg-[#050505] border rounded-3xl p-6 text-center space-y-5 relative ${
                customNotification.type === "error"
                  ? "border-red-500/80 shadow-[0_0_40px_rgba(239,68,68,0.4)]"
                  : customNotification.type === "success"
                  ? "border-emerald-500/80 shadow-[0_0_40px_rgba(16,185,129,0.4)]"
                  : customNotification.type === "confirm"
                  ? "border-red-500/80 shadow-[0_0_40px_rgba(239,68,68,0.4)]"
                  : "border-amber-500/80 shadow-[0_0_40px_rgba(245,158,11,0.4)]"
              }`}
            >
              {/* Pulse Indicator */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-zinc-900 bg-zinc-950/50">
                <span className={`w-1.5 h-1.5 rounded-full animate-ping ${
                  customNotification.type === "error" || customNotification.type === "confirm"
                    ? "bg-red-500"
                    : customNotification.type === "success"
                    ? "bg-emerald-500"
                    : "bg-amber-500"
                }`}></span>
                <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-zinc-500">SYSTEM</span>
              </div>

              {/* Icon */}
              <div className="flex justify-center pt-2">
                {customNotification.type === "success" ? (
                  <CheckCircle2 className="w-14 h-14 text-emerald-500 filter drop-shadow-[0_0_10px_rgba(16,185,129,0.7)] animate-pulse" />
                ) : customNotification.type === "error" || customNotification.type === "confirm" ? (
                  <AlertTriangle className="w-14 h-14 text-red-500 filter drop-shadow-[0_0_10px_rgba(239,68,68,0.7)] animate-bounce" />
                ) : (
                  <Info className="w-14 h-14 text-amber-500 filter drop-shadow-[0_0_10px_rgba(245,158,11,0.7)] animate-pulse" />
                )}
              </div>

              {/* Title Header */}
              <div className="space-y-1">
                <h3 className={`font-orbitron font-black text-xs uppercase tracking-widest ${
                  customNotification.type === "error" || customNotification.type === "confirm"
                    ? "text-red-500"
                    : customNotification.type === "success"
                    ? "text-emerald-500"
                    : "text-amber-500"
                }`}>
                  {customNotification.type === "confirm"
                    ? "CONFIRM ACTION"
                    : customNotification.type === "error"
                    ? "SYSTEM ALERT"
                    : customNotification.type === "success"
                    ? "SUCCESS STATUS"
                    : "INFORMATION"}
                </h3>
                <div className="w-8 h-0.5 mx-auto bg-zinc-900 rounded-full" />
              </div>

              {/* Message */}
              <p className="text-zinc-300 text-xs font-mono font-medium leading-relaxed bg-black/40 border border-zinc-900/60 p-4 rounded-2xl select-text">
                {customNotification.message}
              </p>

              {/* Controls */}
              {customNotification.type === "confirm" ? (
                <div className="flex gap-2.5 font-mono text-[11px] uppercase">
                  <button
                    onClick={() => {
                      if (customNotification.onCancel) customNotification.onCancel();
                      setCustomNotification(null);
                    }}
                    className="flex-1 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-white font-extrabold py-3 rounded-xl tracking-wider cursor-pointer transition-colors"
                  >
                    NO / CANCEL
                  </button>
                  <button
                    onClick={() => {
                      if (customNotification.onConfirm) customNotification.onConfirm();
                      setCustomNotification(null);
                    }}
                    className="flex-1 bg-red-950/20 hover:bg-red-900/30 text-red-500 font-extrabold py-3 rounded-xl tracking-wider cursor-pointer border border-red-900/40 transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-pulse"
                  >
                    YES / CONFIRM
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setCustomNotification(null)}
                  className={`w-full font-mono text-[11px] font-extrabold py-3 rounded-xl tracking-wider cursor-pointer transition-all ${
                    customNotification.type === "success"
                      ? "bg-emerald-950/20 hover:bg-emerald-900/30 text-emerald-500 border border-emerald-900/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                      : customNotification.type === "error"
                      ? "bg-red-950/20 hover:bg-red-900/30 text-red-500 border border-red-900/40 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                      : "bg-amber-950/20 hover:bg-amber-900/30 text-amber-500 border border-amber-900/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                  }`}
                >
                  DISMISS
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
