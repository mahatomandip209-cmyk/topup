import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ref,
  onValue,
  set,
  update,
  push,
} from "firebase/database";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  signInAnonymously,
  User,
} from "firebase/auth";
import {
  Home,
  Wallet,
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
  FileText,
  RotateCcw,
  MessageSquare,
  AlertTriangle,
  Loader2,
  Smartphone,
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
  HelpCircle,
  Send,
  Gamepad2,
  Settings,
  Clock,
  XCircle,
  Info,
  Flame,
  Activity,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import { auth, db } from "./firebase";
import { GamePackage, UserData } from "./types";
import ProfileSection from "./components/ProfileSection";
import HistorySection from "./components/HistorySection";

export default function App() {
  // Splash & Initialization State
  const [authInitializing, setAuthInitializing] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData & { avatarId?: string } | null>(null);

  // Active section configuration
  const [activeSection, setActiveSection] = useState<"home" | "wallet" | "history" | "profile" | "topup">("home");

  // Profile interactive states
  const [profileActiveTab, setProfileActiveTab] = useState<
    "menu" | "overview" | "favorites" | "notifications" | "support" | "refer" | "policies" | "settings"
  >("menu");
  const [profileTab, setProfileTab] = useState<"stats" | "history" | "notifications" | "support" | "settings">("stats");
  const [profileSubView, setProfileSubView] = useState<string | null>(null);
  const [historySubTab, setHistorySubTab] = useState<"orders" | "deposits">("orders");
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [userDeposits, setUserDeposits] = useState<any[]>([]);
  const [systemNotifications, setSystemNotifications] = useState<any[]>([]);
  const [userTickets, setUserTickets] = useState<any[]>([]);
  const [supportTopic, setSupportTopic] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);

  const avatars = [
    { id: "vanguard", name: "Vanguard Gamer", bg: "from-red-600 to-red-950", color: "text-red-500" },
    { id: "jade", name: "Jade Warrior", bg: "from-emerald-600 to-emerald-950", color: "text-emerald-500" },
    { id: "ghost", name: "Cypher Ghost", bg: "from-cyan-600 to-cyan-950", color: "text-cyan-500" },
    { id: "elite", name: "Gold Elite", bg: "from-amber-600 to-amber-950", color: "text-amber-500" },
    { id: "ninja", name: "Shadow Ninja", bg: "from-purple-600 to-purple-950", color: "text-purple-500" },
    { id: "phoenix", name: "Phoenix Rise", bg: "from-orange-600 to-orange-950", color: "text-orange-500" },
  ];

  // Auth views
  const [authView, setAuthView] = useState<"login" | "register">("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");

  // Topup section state
  const [activeGame, setActiveGame] = useState<"Free Fire" | "PUBG Mobile" | "">("");
  const [selectedPkg, setSelectedPkg] = useState<GamePackage | null>(null);
  const [playerUid, setPlayerUid] = useState("");

  // Wallet deposit state
  const [walletAmt, setWalletAmt] = useState("");
  const [esewaNum, setEsewaNum] = useState("");
  const [esewaName, setEsewaName] = useState("");
  const [esewaTrx, setEsewaTrx] = useState("");

  // Modals state
  const [alertModal, setAlertModal] = useState<{ active: boolean; message: string }>({
    active: false,
    message: "",
  });
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

  const promoBanners = [
    "https://i.ibb.co/rG5h77vw/1770000367736-1a203456.jpg",
    "https://i.ibb.co/7tFsSW46/1770040656764-0a668a00.jpg",
  ];

  // Auto-rotating Banner carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev === 0 ? 1 : 0));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

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
          name: "Guest Gamer",
          email: currentUser.email || "guest@bnytopup.com",
          uniqueId: uniqueId,
          balance: 0,
          blocked: false,
          avatarId: "vanguard"
        }).catch((err) => console.error("Error initializing user data:", err));
      }
    });

    // Fetch user orders history
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

    // Fetch system notifications
    const notificationsRef = ref(db, "notifications");
    const unsubscribeNotifications = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b: any) => b.timestamp - a.timestamp);
        setSystemNotifications(list);
      } else {
        // Fallback default notifications if database node is empty
        setSystemNotifications([
          {
            id: "default-1",
            title: "🔥 Welcome to BNY TOPUP!",
            body: "Get instant diamonds and UC directly credited. Live support is available 24/7.",
            timestamp: Date.now() - 3600000 * 2,
            type: "info"
          },
          {
            id: "default-2",
            title: "⚡ FAST DELIVERY GUARANTEED",
            body: "All top-up orders are processed within 5-15 minutes. Contact support via WhatsApp if delay occurs.",
            timestamp: Date.now() - 3600000 * 24,
            type: "warning"
          },
          {
            id: "default-3",
            title: "💳 Esewa deposit method updated",
            body: "Please make sure you only scan the new QR code in the wallet tab or pay to the official number 9825880400.",
            timestamp: Date.now() - 3600000 * 48,
            type: "news"
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
      unsubscribeOrders();
      unsubscribeDeposits();
      unsubscribeNotifications();
      unsubscribeTickets();
    };
  }, [currentUser]);

  // Packages list
  const gamePackages = {
    "Free Fire": [
      { n: "25💎", p: 25 },
      { n: "50💎", p: 50 },
      { n: "115💎", p: 90 },
      { n: "240💎", p: 185 },
      { n: "355💎", p: 285 },
      { n: "480💎", p: 380 },
      { n: "610💎", p: 470 },
      { n: "725💎", p: 575 },
      { n: "850💎", p: 675 },
      { n: "965💎", p: 760 },
      { n: "1090💎", p: 870 },
      { n: "1240💎", p: 950 },
      { n: "1480💎", p: 1130 },
      { n: "1595💎", p: 1215 },
      { n: "1850💎", p: 1395 },
      { n: "2090💎", p: 1595 },
      { n: "2530💎", p: 1870 },
      { n: "5060💎", p: 3740 },
      { n: "10120💎", p: 7460 },
      { n: "Weekly Membership", p: 185 },
      { n: "Monthly Membership", p: 900 },
    ],
    "PUBG Mobile": [
      { n: "60 UC", p: 135 },
      { n: "120 UC", p: 280 },
      { n: "240 UC", p: 500 },
      { n: "325 UC", p: 700 },
      { n: "660 UC", p: 1300 },
      { n: "720 UC", p: 1580 },
      { n: "1500 UC", p: 3300 },
      { n: "1800 UC", p: 3700 },
      { n: "3850 UC", p: 7350 },
      { n: "8100 UC", p: 14300 },
    ],
  };

  // Auth Operations
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPass) {
      alert("Please enter both email and password.");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPass);
    } catch (err: any) {
      alert(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPass) {
      alert("Please fill all fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, regEmail, regPass);
      const uniqueId = "BNY-" + Math.floor(10000 + Math.random() * 90000);
      await set(ref(db, `users/${res.user.uid}`), {
        name: regName,
        email: regEmail,
        uniqueId: uniqueId,
        balance: 0,
        blocked: false,
      });
    } catch (err: any) {
      alert(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out?")) {
      await signOut(auth);
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

  const selectAvatar = async (avatarId: string) => {
    if (!currentUser) return;
    setLoading(true);
    try {
      await update(ref(db, `users/${currentUser.uid}`), {
        avatarId,
      });
      setAvatarMenuOpen(false);
    } catch (err: any) {
      alert(err.message || "Failed to update avatar");
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
      alert("Support query submitted successfully! We will get back to you shortly.");
    } catch (err: any) {
      alert(err.message || "Failed to submit support ticket");
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
  const openTopup = (gameName: "Free Fire" | "PUBG Mobile") => {
    setActiveGame(gameName);
    setSelectedPkg(null);
    setPlayerUid("");
    setActiveSection("topup");
  };

  const submitOrder = async () => {
    if (!playerUid || !selectedPkg || !currentUser || !userData) {
      alert("Select package & enter UID");
      return;
    }
    if (userData.balance < selectedPkg.p) {
      const missing = selectedPkg.p - userData.balance;
      setAlertModal({
        active: true,
        message: `Insufficient Balance! Please deposit RS ${missing} first.`,
      });
      return;
    }

    setLoading(true);
    try {
      const newBal = userData.balance - selectedPkg.p;
      await set(ref(db, `users/${currentUser.uid}/balance`), newBal);

      // Record order inside user-specific orders node
      const orderRef = ref(db, `orders/${currentUser.uid}`);
      await push(orderRef, {
        game: activeGame,
        packageName: selectedPkg.n,
        price: selectedPkg.p,
        playerUid: playerUid,
        status: "pending",
        timestamp: Date.now(),
      });

      const msg = `🛒 *BNY TOPUP NEW ORDER* 🚀\n\n📦 *Purchased Package:* ${selectedPkg.n}\n💰 *Package Price:* RS ${selectedPkg.p}\n👤 *User Full Name:* ${userData.name}\n📧 *User Email Address:* ${currentUser.email}\n🆔 *User Unique ID:* ${userData.uniqueId}\n🎮 *Selected Game:* ${activeGame}\n🆔 *Player Game UID:* ${playerUid}`;
      
      const whatsappUrl = `https://wa.me/9779825880400?text=${encodeURIComponent(msg)}`;
      window.open(whatsappUrl, "_blank");
      
      setSelectedPkg(null);
      setPlayerUid("");
      setActiveSection("home");
    } catch (err: any) {
      alert(err.message || "Order placement failed");
    } finally {
      setLoading(false);
    }
  };

  const goToWallet = () => {
    setAlertModal({ active: false, message: "" });
    setActiveSection("wallet");
  };

  // Deposit operations
  const submitDeposit = async () => {
    if (!walletAmt || !esewaNum || !esewaName || !esewaTrx) {
      alert("Fill all details");
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
        senderNum: esewaNum,
        senderName: esewaName,
        timestamp: Date.now(),
      });

      const msg = `🚀 *BNY TOPUP DEPOSIT REQUEST* 🚀\n\n🆔 *User Unique ID:* ${userData.uniqueId}\n👤 *User Full Name:* ${userData.name}\n📧 *User Email Address:* ${currentUser.email}\n💰 *Deposit Amount:* RS ${walletAmt}\n📞 *Sender Esewa Number:* ${esewaNum}\n📝 *Sender Esewa Name:* ${esewaName}\n🔢 *Transaction Code:* ${esewaTrx}`;
      
      const whatsappUrl = `https://wa.me/9779825880400?text=${encodeURIComponent(msg)}`;
      window.open(whatsappUrl, "_blank");

      // Reset fields
      setWalletAmt("");
      setEsewaNum("");
      setEsewaName("");
      setEsewaTrx("");
      alert("Deposit request submitted successfully! Redirecting to verification team...");
    } catch (err: any) {
      alert(err.message || "Failed to submit deposit");
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

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col antialiased selection:bg-red-600 selection:text-white">
      {/* 1. SPLASH LOADER */}

      {/* 2. AUTHENTICATION MODULE */}
      {!currentUser && !authInitializing && (
        <div id="auth-screen" className="flex-1 flex flex-col justify-center items-center px-4 py-12 bg-[radial-gradient(circle_at_center,_#1c0202_0%,_#000000_100%)]">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="font-orbitron text-4xl font-black text-red-600 mb-8 tracking-widest text-center"
            style={{ textShadow: "0 0 15px rgba(255, 0, 0, 0.7)" }}
          >
            BNY TOPUP
          </motion.div>

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full max-w-md bg-[#121212] rounded-2xl border border-red-950 p-8 shadow-[0_0_40px_rgba(139,0,0,0.15)]"
          >
            {authView === "login" ? (
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-orbitron font-bold tracking-wide">LOGIN</h2>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full bg-[#0a0a0a] border border-zinc-800 text-white placeholder-zinc-700 px-10 py-3 rounded-lg focus:outline-none focus:border-red-600 transition-all font-mono text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                      type="password"
                      value={loginPass}
                      onChange={(e) => setLoginPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#0a0a0a] border border-zinc-800 text-white placeholder-zinc-700 px-10 py-3 rounded-lg focus:outline-none focus:border-red-600 transition-all font-mono text-sm"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 active:scale-[0.98] transition-all py-3.5 rounded-lg font-bold tracking-widest text-sm flex items-center justify-center gap-2 cursor-pointer border border-red-500"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      LOGIN NOW
                    </>
                  )}
                </button>

                <p className="text-center text-zinc-400 text-sm mt-6">
                  New member?{" "}
                  <span
                    className="text-red-500 cursor-pointer hover:underline font-bold"
                    onClick={() => setAuthView("register")}
                  >
                    Register
                  </span>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-5">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-orbitron font-bold tracking-wide">CREATE ACCOUNT</h2>
                  <p className="text-zinc-500 text-xs mt-1">Join BNY TOPUP and unlock instant game credits</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Full Name</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-[#0a0a0a] border border-zinc-800 text-white placeholder-zinc-700 px-4 py-3 rounded-lg focus:outline-none focus:border-red-600 transition-all text-sm"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full bg-[#0a0a0a] border border-zinc-800 text-white placeholder-zinc-700 px-10 py-3 rounded-lg focus:outline-none focus:border-red-600 transition-all font-mono text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Create Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                      type="password"
                      value={regPass}
                      onChange={(e) => setRegPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#0a0a0a] border border-zinc-800 text-white placeholder-zinc-700 px-10 py-3 rounded-lg focus:outline-none focus:border-red-600 transition-all font-mono text-sm"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 active:scale-[0.98] transition-all py-3.5 rounded-lg font-bold tracking-widest text-sm flex items-center justify-center gap-2 cursor-pointer border border-red-500"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      CREATE ACCOUNT
                    </>
                  )}
                </button>

                <p className="text-center text-zinc-400 text-sm mt-6">
                  Already have an account?{" "}
                  <span
                    className="text-red-500 cursor-pointer hover:underline font-bold"
                    onClick={() => setAuthView("login")}
                  >
                    Login
                  </span>
                </p>
              </form>
            )}
          </motion.div>
        </div>
      )}

      {/* 3. MAIN APPLICATION INTERFACE */}
      {currentUser && !authInitializing && (
        <div id="app-content" className="flex-1 flex flex-col w-full max-w-3xl mx-auto pb-24 shadow-2xl min-h-screen bg-black">
          {/* Header Bar */}
          <header className="sticky top-0 bg-black/90 backdrop-blur-md px-4 py-4 flex justify-between items-center border-b-2 border-red-900 z-50">
            <div className="font-orbitron text-2xl font-black text-red-600 tracking-widest glow-red">
              BNY TOPUP
            </div>
            <div className="flex items-center gap-2 border border-red-600 bg-red-950/20 px-3 py-1.5 rounded-md shadow-[inset_0_0_10px_rgba(255,0,0,0.15)]">
              <span className="text-zinc-400 font-mono text-xs uppercase tracking-wider">Balance:</span>
              <span className="text-red-500 font-bold font-mono text-sm">
                RS {userData?.balance ?? 0}
              </span>
            </div>
          </header>

          {/* Dynamic home slider only shows in home section */}
          {activeSection === "home" && (
            <div id="home-slider" className="w-full aspect-video relative overflow-hidden border-b border-red-900 bg-zinc-950">
              <div
                className="flex w-full h-full transition-transform duration-1000 ease-in-out"
                style={{ transform: `translateX(-${slideIndex * 100}%)` }}
              >
                {promoBanners.map((url, index) => (
                  <div key={index} className="min-w-full h-full">
                    <img
                      src={url}
                      alt={`Banner ${index + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              {/* Pagination Dots */}
              <div className="absolute bottom-3 right-4 flex gap-1.5">
                {promoBanners.map((_, index) => (
                  <div
                    key={index}
                    onClick={() => setSlideIndex(index)}
                    className={`w-2.5 h-1.5 rounded-full transition-all cursor-pointer ${
                      slideIndex === index ? "w-6 bg-red-600" : "bg-zinc-700"
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic Render Section Router */}
          <main className="flex-1 px-4 py-6">
            <AnimatePresence mode="wait">
              {/* HOME SECTION */}
              {activeSection === "home" && (
                <motion.div
                  key="home"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="font-orbitron text-lg font-extrabold text-red-600 tracking-wider flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-red-600 animate-pulse rounded-full"></span>
                      POPULAR GAMES
                    </h3>
                    <p className="text-zinc-500 text-xs mt-1">Select a game title below to purchase packages instantly</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Free Fire Card */}
                    <div
                      onClick={() => openTopup("Free Fire")}
                      className="group bg-[#121212] rounded-2xl overflow-hidden border border-zinc-900 hover:border-red-600 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(255,0,0,0.1)] active:scale-95"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-black flex items-center justify-center p-2 border-b border-zinc-900/50">
                        <img
                          src="https://i.ibb.co/My1kJfTy/IMG-20260302-211532.jpg"
                          alt="Free Fire"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain group-hover:scale-105 transition-all duration-500"
                        />
                      </div>
                      <div className="p-3 text-center">
                        <p className="font-bold tracking-wider text-sm group-hover:text-red-500 transition-colors">Free Fire</p>
                      </div>
                    </div>

                    {/* PUBG Mobile Card */}
                    <div
                      onClick={() => openTopup("PUBG Mobile")}
                      className="group bg-[#121212] rounded-2xl overflow-hidden border border-zinc-900 hover:border-red-600 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(255,0,0,0.1)] active:scale-95"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-black flex items-center justify-center p-2 border-b border-zinc-900/50">
                        <img
                          src="https://i.ibb.co/jPZjCShd/IMG-20260302-211625.jpg"
                          alt="PUBG Mobile"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain group-hover:scale-105 transition-all duration-500"
                        />
                      </div>
                      <div className="p-3 text-center">
                        <p className="font-bold tracking-wider text-sm group-hover:text-red-500 transition-colors">PUBG Mobile</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* WALLET SECTION */}
              {activeSection === "wallet" && (
                <motion.div
                  key="wallet"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center py-6 bg-gradient-to-b from-[#121212] to-black rounded-2xl border border-zinc-900 space-y-1">
                    <p className="text-zinc-500 text-xs uppercase tracking-widest">Available Balance</p>
                    <h1 className="font-orbitron text-4xl font-extrabold text-red-600 tracking-wider">
                      RS {userData?.balance ?? 0}
                    </h1>
                  </div>

                  <div className="flex flex-col items-center space-y-4">
                    <div className="bg-white p-2.5 rounded-2xl border-4 border-red-600 shadow-[0_0_25px_rgba(255,0,0,0.2)] aspect-square w-52 h-52 flex items-center justify-center relative overflow-hidden">
                      <img
                        id="qr-display"
                        src="https://i.ibb.co/8nFCFgqw/WA-1772424062040.jpg"
                        alt="Esewa QR Code"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-zinc-400 text-xs">
                        Scan the QR code or pay manually to the number:
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <b className="text-red-500 text-lg tracking-wider">9825880400</b>
                        <button
                          onClick={() => copyToClipboard("9825880400", "esewa")}
                          className="bg-red-950/40 hover:bg-red-900/60 p-1.5 rounded-md text-red-500 hover:text-white transition-colors cursor-pointer"
                          title="Copy Number"
                        >
                          {copiedEsewa ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      {copiedEsewa && (
                        <p className="text-green-500 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                          Copied to clipboard!
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Deposit Form */}
                  <div className="bg-[#121212] p-6 rounded-2xl border border-zinc-900 space-y-4 shadow-md">
                    <h3 className="font-orbitron font-bold text-sm text-red-500 uppercase tracking-widest border-b border-zinc-800 pb-2.5">
                      SUBMIT TRANSACTION PROOF
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-zinc-400 block mb-1">Deposit Amount (RS)</label>
                        <input
                          type="number"
                          placeholder="e.g. 500"
                          value={walletAmt}
                          onChange={(e) => setWalletAmt(e.target.value)}
                          className="w-full bg-[#0a0a0a] border border-zinc-800 text-white placeholder-zinc-700 px-4 py-3 rounded-lg focus:outline-none focus:border-red-600 transition-all font-mono text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-zinc-400 block mb-1">Sender Esewa Number</label>
                          <input
                            type="text"
                            placeholder="e.g. 98XXXXXXXX"
                            value={esewaNum}
                            onChange={(e) => setEsewaNum(e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-zinc-800 text-white placeholder-zinc-700 px-4 py-3 rounded-lg focus:outline-none focus:border-red-600 transition-all font-mono text-sm"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-zinc-400 block mb-1">Sender Esewa Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Mandip Mahato"
                            value={esewaName}
                            onChange={(e) => setEsewaName(e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-zinc-800 text-white placeholder-zinc-700 px-4 py-3 rounded-lg focus:outline-none focus:border-red-600 transition-all text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-zinc-400 block mb-1">Transaction Code / ID</label>
                        <input
                          type="text"
                          placeholder="Enter exact Transaction ID"
                          value={esewaTrx}
                          onChange={(e) => setEsewaTrx(e.target.value)}
                          className="w-full bg-[#0a0a0a] border border-zinc-800 text-white placeholder-zinc-700 px-4 py-3 rounded-lg focus:outline-none focus:border-red-600 transition-all font-mono text-sm"
                        />
                      </div>

                      <button
                        onClick={submitDeposit}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 active:scale-[0.98] transition-all py-3.5 rounded-lg font-bold tracking-widest text-sm flex items-center justify-center gap-2.5 cursor-pointer border border-red-500 mt-2"
                      >
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <MessageCircle className="w-4 h-4" />
                            DEPOSIT VIA WHATSAPP
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* HISTORY SECTION */}
              {activeSection === "history" && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
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
                  />
                </motion.div>
              )}

              {/* PROFILE SECTION */}
              {activeSection === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
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

              {/* TOPUP SECTION (DYNAMIC GAME SELECT) */}
              {activeSection === "topup" && (
                <motion.div
                  key="topup"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <h2 className="font-orbitron text-xl font-black text-red-600 tracking-widest uppercase">
                      Topup {activeGame}
                    </h2>
                    <button
                      onClick={() => {
                        setSelectedPkg(null);
                        setPlayerUid("");
                        setActiveSection("home");
                      }}
                      className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors uppercase tracking-wider cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back to Home
                    </button>
                  </div>

                  {/* Packages grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {activeGame &&
                      gamePackages[activeGame]?.map((pkg, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setSelectedPkg(pkg);
                            // Scroll dynamically to buy-flow UID form
                            setTimeout(() => {
                              const elem = document.getElementById("buy-flow-section");
                              if (elem) elem.scrollIntoView({ behavior: "smooth" });
                            }, 100);
                          }}
                          className={`p-4 rounded-xl border text-center cursor-pointer transition-all duration-300 ${
                            selectedPkg?.n === pkg.n
                              ? "bg-red-950/20 border-red-600 shadow-[0_0_15px_rgba(255,0,0,0.1)]"
                              : "bg-[#111] border-zinc-900 hover:border-zinc-800"
                          }`}
                        >
                          <h4 className="font-bold text-white tracking-wide mb-1 text-sm">{pkg.n}</h4>
                          <p className="text-xs font-mono text-red-500 font-bold">RS {pkg.p}</p>
                        </div>
                      ))}
                  </div>

                  {/* Purchase details flow */}
                  {selectedPkg && (
                    <motion.div
                      id="buy-flow-section"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#121212] p-6 rounded-2xl border border-zinc-900 space-y-4 mt-8 shadow-md"
                    >
                      <div className="border-b border-zinc-800 pb-3 mb-1">
                        <span className="text-xs text-zinc-500 block uppercase tracking-widest">Selected Item</span>
                        <h3 className="font-orbitron font-bold text-red-500 text-lg">
                          {selectedPkg.n} &mdash; RS {selectedPkg.p}
                        </h3>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-zinc-400 block mb-1.5">
                            Enter Player Game UID
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 5839218392"
                            value={playerUid}
                            onChange={(e) => setPlayerUid(e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-zinc-800 text-white placeholder-zinc-700 px-4 py-3.5 rounded-lg focus:outline-none focus:border-red-600 transition-all font-mono text-sm"
                            required
                          />
                        </div>

                        <button
                          onClick={submitOrder}
                          disabled={loading}
                          className="w-full bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 active:scale-[0.98] transition-all py-3.5 rounded-lg font-bold tracking-widest text-sm flex items-center justify-center gap-2 cursor-pointer border border-red-500"
                        >
                          {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            "CONFIRM ORDER"
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* Bottom navigation bar */}
          <nav className="fixed bottom-0 left-0 right-0 max-w-3xl mx-auto bg-black border-t border-zinc-900 px-6 py-2.5 flex justify-around items-center z-40 shadow-2xl">
            <button
              onClick={() => {
                setSelectedPkg(null);
                setPlayerUid("");
                setActiveSection("home");
              }}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                activeSection === "home" || activeSection === "topup" ? "text-red-500" : "text-zinc-600 hover:text-zinc-400"
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
            </button>

            <button
              onClick={() => setActiveSection("wallet")}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                activeSection === "wallet" ? "text-red-500" : "text-zinc-600 hover:text-zinc-400"
              }`}
            >
              <Wallet className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Wallet</span>
            </button>

            <button
              onClick={() => setActiveSection("history")}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                activeSection === "history" ? "text-red-500" : "text-zinc-600 hover:text-zinc-400"
              }`}
            >
              <HistoryIcon className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">History</span>
            </button>

            <button
              onClick={() => {
                setProfileActiveTab("menu");
                setActiveSection("profile");
              }}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                activeSection === "profile" ? "text-red-500" : "text-zinc-600 hover:text-zinc-400"
              }`}
            >
              <UserIcon className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Profile</span>
            </button>
          </nav>
        </div>
      )}

      {/* 4. MODALS BACKDROP WRAPPERS */}
      {/* Alert Insufficient Balance Modal */}
      <AnimatePresence>
        {alertModal.active && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[999]">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xs bg-[#121212] border border-red-600 rounded-2xl p-6 text-center space-y-4 shadow-[0_0_30px_rgba(255,0,0,0.3)]"
            >
              <div className="text-red-500 flex justify-center">
                <AlertTriangle className="w-12 h-12" />
              </div>
              <h3 className="font-orbitron font-bold text-white text-lg tracking-wider">ALERT</h3>
              <p className="text-zinc-300 text-sm leading-relaxed">{alertModal.message}</p>
              <button
                onClick={goToWallet}
                className="w-full bg-red-600 hover:bg-red-500 transition-all text-white font-bold py-2.5 rounded-lg text-sm tracking-wider cursor-pointer border border-red-500"
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
              className="w-full max-w-xs bg-[#121212] border border-red-600 rounded-2xl p-6 space-y-4"
            >
              <h3 className="font-orbitron font-bold text-white tracking-widest text-center text-md uppercase">
                Update Name
              </h3>
              <input
                type="text"
                value={newNameInput}
                onChange={(e) => setNewNameInput(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-zinc-800 text-white placeholder-zinc-700 px-4 py-3 rounded-lg focus:outline-none focus:border-red-600 transition-all text-sm font-semibold"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setNameModal(false)}
                  className="flex-1 bg-[#222] hover:bg-zinc-800 text-zinc-400 font-bold py-2.5 rounded-lg text-xs tracking-wider cursor-pointer transition-colors"
                >
                  CANCEL
                </button>
                <button
                  onClick={saveNewName}
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-lg text-xs tracking-wider cursor-pointer transition-colors flex items-center justify-center gap-1"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "SAVE"}
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
              className="w-full max-w-sm bg-[#121212] border border-red-600 rounded-2xl p-6 space-y-4"
            >
              <h3 className="font-orbitron font-bold text-white tracking-widest text-center text-md uppercase">
                Change Password
              </h3>

              <div className="space-y-3">
                <input
                  type="password"
                  placeholder="Current Password"
                  value={oldPass}
                  onChange={(e) => setOldPass(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-zinc-800 text-white placeholder-zinc-700 px-4 py-2.5 rounded-lg focus:outline-none focus:border-red-600 transition-all text-sm"
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-zinc-800 text-white placeholder-zinc-700 px-4 py-2.5 rounded-lg focus:outline-none focus:border-red-600 transition-all text-sm"
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confPass}
                  onChange={(e) => setConfPass(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-zinc-800 text-white placeholder-zinc-700 px-4 py-2.5 rounded-lg focus:outline-none focus:border-red-600 transition-all text-sm"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setOldPass("");
                    setNewPass("");
                    setConfPass("");
                    setPassModal(false);
                  }}
                  className="flex-1 bg-[#222] hover:bg-zinc-800 text-zinc-400 font-bold py-2.5 rounded-lg text-xs tracking-wider cursor-pointer transition-colors"
                >
                  CANCEL
                </button>
                <button
                  onClick={saveNewPass}
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-lg text-xs tracking-wider cursor-pointer transition-colors flex items-center justify-center gap-1"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "UPDATE"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
