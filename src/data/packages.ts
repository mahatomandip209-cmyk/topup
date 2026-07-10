export interface GamePackage {
  n: string; // package name / quantity
  p: number; // base price in NPR (Rs.)
}

export interface ServiceItem {
  id: string;
  name: string;
  image: string;
  category: "topup" | "voucher" | "subscription";
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
    category: "topup",
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
    category: "voucher",
    description: "Get Level Up Pass diamonds sent instantly to your player UID",
    fields: [
      { label: "Player UID", placeholder: "e.g. 5839218392", type: "text", key: "playerUid" }
    ],
    packages: [
      { n: "Level 6 (120 Diamonds)", p: 65 },
      { n: "Level 10 (200 Diamonds)", p: 95 },
      { n: "Level 15 (200 Diamonds)", p: 95 },
      { n: "Level 20 (200 Diamonds)", p: 95 },
      { n: "Level 25 (200 Diamonds)", p: 95 },
      { n: "Level 30 (350 Diamonds)", p: 140 },
      { n: "All Levels (1270 Diamonds)", p: 570 }
    ]
  },
  {
    id: "ff_membership",
    name: "Free Fire Membership",
    image: "https://i.ibb.co/My1kJfTy/IMG-20260302-211532.jpg",
    category: "subscription",
    description: "Weekly & Monthly premium Free Fire subscription loaded via Player UID",
    fields: [
      { label: "Player UID", placeholder: "e.g. 5839218392", type: "text", key: "playerUid" }
    ],
    packages: [
      { n: "Weekly Elite (90 Diamonds)", p: 65 },
      { n: "Weekly Membership", p: 195 },
      { n: "Monthly Membership", p: 960 }
    ]
  },
  {
    id: "ff_likebot",
    name: "Free Fire Like Bot",
    image: "https://i.ibb.co/My1kJfTy/IMG-20260302-211532.jpg",
    category: "voucher",
    description: "Boost your Free Fire profile likes instantly and safely",
    fields: [
      { label: "Player UID", placeholder: "e.g. 5839218392", type: "text", key: "playerUid" }
    ],
    packages: [
      { n: "30 Days — 6000 Likes", p: 649 },
      { n: "60 Days — 12000 Likes", p: 1298 },
      { n: "1 Year — 72000 Likes", p: 4650 }
    ]
  },
  {
    id: "ff_glorybot",
    name: "Free Fire Glory Bot",
    image: "https://i.ibb.co/My1kJfTy/IMG-20260302-211532.jpg",
    category: "voucher",
    description: "Level up your Guild Glory with our dedicated Squad Glory Bots",
    fields: [
      { label: "Player UID", placeholder: "e.g. 5839218392", type: "text", key: "playerUid" }
    ],
    packages: [
      { n: "1 Squad", p: 375 },
      { n: "2 Squad", p: 725 },
      { n: "3 Squad", p: 1075 },
      { n: "4 Squad", p: 1425 },
      { n: "5 Squad", p: 1750 },
      { n: "6 Squad", p: 2050 }
    ]
  },
  {
    id: "pubg_uc",
    name: "PUBG UC",
    image: "https://i.ibb.co/jPZjCShd/IMG-20260302-211625.jpg",
    category: "topup",
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
  }
];

export const exchangeRates = {
  NPR: 1.0,
  AED: 36.5, // 1 AED = 36.5 NPR
  USD: 134.0 // 1 USD = 134 NPR
};
