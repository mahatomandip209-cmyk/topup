export interface GamePackage {
  n: string; // package name / quantity
  p: number; // base price in NPR (Rs.)
}

export interface ServiceItem {
  id: string;
  name: string;
  image: string;
  category: "gaming" | "streaming" | "design" | "crypto";
  description: string;
  fields: {
    label: string;
    placeholder: string;
    type: "text" | "number" | "email" | "password" | "select";
    key: string;
    options?: string[];
  }[];
  packages: GamePackage[];
}

export const servicesData: ServiceItem[] = [
  {
    id: "ff_topup",
    name: "Free Fire Topup",
    image: "https://i.ibb.co/My1kJfTy/IMG-20260302-211532.jpg",
    category: "gaming",
    description: "Instant in-game Free Fire Diamonds top-up directly to your UID",
    fields: [
      { label: "Player UID", placeholder: "e.g. 5839218392", type: "text", key: "playerUid" }
    ],
    packages: [
      { n: "25 Diamonds", p: 30 },
      { n: "50 Diamonds", p: 55 },
      { n: "115 Diamonds", p: 99 },
      { n: "240 Diamonds", p: 200 },
      { n: "480 Diamonds", p: 395 },
      { n: "505 Diamonds", p: 420 },
      { n: "610 Diamonds", p: 500 },
      { n: "850 Diamonds", p: 690 },
      { n: "1090 Diamonds", p: 875 },
      { n: "1240 Diamonds", p: 970 },
      { n: "2530 Diamonds", p: 1980 },
      { n: "5060 Diamonds", p: 3925 },
      { n: "10120 Diamonds", p: 7850 },
      { n: "15180 Diamonds", p: 11695 },
      { n: "20240 Diamonds", p: 15600 },
      { n: "101200 Diamonds", p: 78900 }
    ]
  },
  {
    id: "ff_levelup",
    name: "Free Fire Level Up Pass",
    image: "https://i.ibb.co/My1kJfTy/IMG-20260302-211532.jpg",
    category: "gaming",
    description: "Get Level Up Pass diamonds sent instantly to your player UID",
    fields: [
      { label: "Player UID", placeholder: "e.g. 5839218392", type: "text", key: "playerUid" }
    ],
    packages: [
      { n: "Level 6 💎 (120💎)", p: 65 },
      { n: "Level 10 💎 (200💎)", p: 95 },
      { n: "Level 15 💎 (200💎)", p: 95 },
      { n: "Level 20 💎 (200💎)", p: 95 },
      { n: "Level 25 💎 (200💎)", p: 95 },
      { n: "Level 30 💎 (350💎)", p: 140 },
      { n: "All Levels 💎 (1270💎)", p: 570 },
      { n: "weekly elite 💎 (90💎)", p: 65 }
    ]
  },
  {
    id: "ff_membership",
    name: "Free Fire Membership",
    image: "https://i.ibb.co/My1kJfTy/IMG-20260302-211532.jpg",
    category: "gaming",
    description: "Weekly & Monthly premium Free Fire subscription loaded via Player UID",
    fields: [
      { label: "Player UID", placeholder: "e.g. 5839218392", type: "text", key: "playerUid" }
    ],
    packages: [
      { n: "weekly elite 💎 (90💎)", p: 65 },
      { n: "Weekly Membership", p: 195 },
      { n: "Monthly Membership", p: 960 }
    ]
  },
  {
    id: "ff_likebot",
    name: "Free Fire Like Bot",
    image: "https://i.ibb.co/My1kJfTy/IMG-20260302-211532.jpg",
    category: "gaming",
    description: "Boost your Free Fire profile likes instantly and safely",
    fields: [
      { label: "Player UID", placeholder: "e.g. 5839218392", type: "text", key: "playerUid" }
    ],
    packages: [
      { n: "30 days - 6000 likes", p: 649 },
      { n: "60 Days - 12000 likes", p: 1298 },
      { n: "1 year - 72000 likes", p: 4650 }
    ]
  },
  {
    id: "ff_glorybot",
    name: "Free Fire Glory Bot",
    image: "https://i.ibb.co/My1kJfTy/IMG-20260302-211532.jpg",
    category: "gaming",
    description: "Level up your Guild Glory with our dedicated Squad Glory Bots",
    fields: [
      { label: "Player UID", placeholder: "e.g. 5839218392", type: "text", key: "playerUid" }
    ],
    packages: [
      { n: "1 sqd", p: 375 },
      { n: "2 sqd", p: 725 },
      { n: "3 sqd", p: 1075 },
      { n: "4 sqd", p: 1425 },
      { n: "5 sqd", p: 1750 },
      { n: "6 sqd", p: 2050 }
    ]
  },
  {
    id: "pubg_uc",
    name: "PUBG UC",
    image: "https://i.ibb.co/jPZjCShd/IMG-20260302-211625.jpg",
    category: "gaming",
    description: "Instant PUBG Mobile Unknown Cash top-up via Character ID",
    fields: [
      { label: "Player ID", placeholder: "e.g. 5183928192", type: "text", key: "playerUid" }
    ],
    packages: [
      { n: "60 UC", p: 147 },
      { n: "325 UC", p: 730 },
      { n: "660 UC", p: 1550 },
      { n: "1800 UC", p: 3550 },
      { n: "3850 UC", p: 7040 },
      { n: "8100 UC", p: 14050 }
    ]
  },
  {
    id: "netflix",
    name: "Netflix",
    image: "https://i.ibb.co/4gR7pM4C/netflix-logo.jpg",
    category: "streaming",
    description: "Ultra HD Netflix premium shared or private screen subscriptions",
    fields: [
      { label: "Customer Email Address", placeholder: "e.g. customer@gmail.com", type: "email", key: "customerEmail" }
    ],
    packages: [
      { n: "1 Month HD Screen", p: 399 },
      { n: "3 Months Ultra HD Screen", p: 1050 },
      { n: "6 Months Ultra HD Premium", p: 2049 },
      { n: "1 Year Premium VIP", p: 4099 }
    ]
  },
  {
    id: "canva",
    name: "Canva Pro",
    image: "https://i.ibb.co/hR28XWym/canva-logo.png",
    category: "design",
    description: "Premium Canva design workspace with unlimited assets and team premium features",
    fields: [
      { label: "Customer Email Address", placeholder: "e.g. creative@gmail.com", type: "email", key: "customerEmail" }
    ],
    packages: [
      { n: "Monthly Premium Invitation", p: 99 },
      { n: "Yearly Pro Workspace", p: 499 },
      { n: "LIFETIME Unlimited Access", p: 599 }
    ]
  },
  {
    id: "capcut",
    name: "CapCut Pro",
    image: "https://i.ibb.co/8DwV0v4L/capcut-logo.jpg",
    category: "design",
    description: "CapCut Pro license subscription with full filters, effects, and template access",
    fields: [
      { label: "CapCut Account Email", placeholder: "e.g. editor@gmail.com", type: "email", key: "customerEmail" },
      { label: "Account Password (for activation)", placeholder: "Enter account password", type: "password", key: "customerPassword" }
    ],
    packages: [
      { n: "Monthly License Activation", p: 1500 },
      { n: "Yearly Pro License", p: 10000 }
    ]
  },
  {
    id: "usdt",
    name: "USDT Buy/Sell",
    image: "https://i.ibb.co/ksG2j0xL/usdt-logo.png",
    category: "crypto",
    description: "Securely buy or sell TRC20/BEP20 Tether USD with premium rates",
    fields: [
      { label: "USDT Wallet Address", placeholder: "e.g. 0x... or T...", type: "text", key: "walletAddress" },
      { label: "Network Protocol", placeholder: "Select Network Type", type: "select", key: "network", options: ["TRC20", "BEP20"] },
      { label: "Your active WhatsApp number", placeholder: "e.g. 9827679425", type: "text", key: "whatsappNumber" },
      { label: "USDT Amount ($50 to $1000)", placeholder: "Enter USD amount (e.g. 100)", type: "number", key: "cryptoAmount" },
      { label: "Transaction Type", placeholder: "Select Action", type: "select", key: "txType", options: ["BUY (Rate: 152 NPR)", "SELL (Rate: 160 NPR)"] }
    ],
    packages: [
      { n: "USDT Purchase / Sale Transaction", p: 0 } // Computed pricing dynamically!
    ]
  }
];

export const exchangeRates = {
  NPR: 1.0,
  AED: 36.5, // 1 AED = 36.5 NPR
  USD: 134.0 // 1 USD = 134 NPR
};
