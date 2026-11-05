import type { Order, Product, ProductCategory, RestaurantSettings } from "@/types";
import { images } from "./images";

export const CATEGORIES: { id: ProductCategory | "all"; label: string }[] = [
  { id: "all", label: "All Items" },
  { id: "chicken-biriyani", label: "Chicken Biriyani" },
  { id: "mutton-biriyani", label: "Mutton Biriyani" },
  { id: "chicken-chaap", label: "Chicken Chaap" },
  { id: "combos", label: "Combos" },
  { id: "special", label: "Special Items" },
  { id: "beverages", label: "Beverages" },
];

export const categoryLabel = (id: ProductCategory) =>
  CATEGORIES.find((c) => c.id === id)?.label ?? id;

// Sample menu — prices and items are demo values for the owner to edit in /admin.
export const SEED_PRODUCTS: Product[] = [
  {
    id: "kolkata-chicken-biriyani",
    name: "Kolkata Chicken Biriyani",
    description: "Fragrant long-grain rice, tender chicken, the signature potato and a boiled egg.",
    longDescription:
      "Our house classic, slow-cooked on dum in the Kolkata tradition. Aged basmati is layered with marinated chicken, a golden potato and a boiled egg, then perfumed with kewra, rose water and a whisper of saffron.",
    price: 249,
    category: "chicken-biriyani",
    image: images.chickenBiriyani,
    isVeg: false,
    isAvailable: true,
    isBestseller: true,
    serves: "Serves 1",
  },
  {
    id: "hyderabadi-chicken-dum-biriyani",
    name: "Hyderabadi Chicken Dum Biriyani",
    description: "Kacchi-style dum biriyani with fried onions, mint and warming spices.",
    longDescription:
      "Raw-marinated chicken and half-cooked rice sealed together and cooked on dum, so every grain absorbs the spice. Finished with crisp birista, fresh mint and coriander.",
    price: 279,
    category: "chicken-biriyani",
    image: images.hyderabadiBiriyani,
    isVeg: false,
    isAvailable: true,
    isBestseller: true,
    serves: "Serves 1",
  },
  {
    id: "chicken-handi-biriyani",
    name: "Chicken Handi Biriyani",
    description: "Served in a copper handi with green peas, fresh coriander and rich masala.",
    longDescription:
      "Cooked and served in a traditional handi, this biriyani is richer and more masala-forward, with green peas and plenty of fresh coriander.",
    price: 329,
    category: "chicken-biriyani",
    image: images.handiBiriyani,
    isVeg: false,
    isAvailable: true,
    isBestseller: false,
    serves: "Serves 1–2",
  },
  {
    id: "kolkata-mutton-biriyani",
    name: "Kolkata Mutton Biriyani",
    description: "Melt-in-the-mouth mutton, aloo and egg with mild, aromatic spices.",
    longDescription:
      "Tender goat meat slow-cooked until it falls off the bone, layered with fragrant rice, potato and egg. Mild, aromatic and deeply satisfying.",
    price: 349,
    category: "mutton-biriyani",
    isVeg: false,
    isAvailable: true,
    isBestseller: true,
    serves: "Serves 1",
  },
  {
    id: "mutton-dum-biriyani",
    name: "Mutton Dum Biriyani",
    description: "Bone-in mutton sealed and slow-cooked on dum for a richer finish.",
    price: 379,
    category: "mutton-biriyani",
    isVeg: false,
    isAvailable: false,
    isBestseller: false,
    serves: "Serves 1",
  },
  {
    id: "chicken-chaap",
    name: "Chicken Chaap",
    description: "Bengali-style chicken simmered in a rich, nutty, mildly sweet gravy.",
    longDescription:
      "The perfect partner to biriyani. Chicken slow-cooked in a velvety gravy of poppy seed, cashew, yoghurt and ghee, with a gentle sweetness true to old Kolkata.",
    price: 199,
    category: "chicken-chaap",
    isVeg: false,
    isAvailable: true,
    isBestseller: true,
    serves: "2 pieces",
  },
  {
    id: "chicken-rezala",
    name: "Chicken Rezala",
    description: "A delicate white curry of yoghurt, cashew and green chilli.",
    price: 229,
    category: "chicken-chaap",
    isVeg: false,
    isAvailable: true,
    isBestseller: false,
    serves: "2 pieces",
  },
  {
    id: "babu-special-combo",
    name: "Babu Special Combo",
    description: "Kolkata Chicken Biriyani with one plate of Chicken Chaap.",
    longDescription:
      "Our most-loved pairing on one order: a full plate of Kolkata Chicken Biriyani with a plate of Chicken Chaap.",
    price: 429,
    category: "combos",
    image: images.chickenBiriyani,
    isVeg: false,
    isAvailable: true,
    isBestseller: true,
    serves: "Serves 1–2",
  },
  {
    id: "family-feast",
    name: "Family Feast",
    description: "Two Chicken Handi Biriyani, two Chicken Chaap and two Firni.",
    price: 1199,
    category: "combos",
    image: images.handiBiriyani,
    isVeg: false,
    isAvailable: true,
    isBestseller: false,
    serves: "Serves 3–4",
  },
  {
    id: "lucknowi-subz-biriyani",
    name: "Lucknowi Subz Biriyani",
    description: "Awadhi-style vegetable biriyani with cauliflower, carrot, peas and mint.",
    longDescription:
      "Delicately spiced in the Awadhi way, with seasonal vegetables, fresh mint and coriander. Served with cooling raita.",
    price: 229,
    category: "special",
    image: images.lucknowiBiriyani,
    isVeg: true,
    isAvailable: true,
    isBestseller: false,
    serves: "Serves 1",
  },
  {
    id: "egg-biriyani",
    name: "Egg Biriyani",
    description: "Fragrant biriyani rice with two masala-fried eggs and potato.",
    price: 179,
    category: "special",
    isVeg: false,
    isAvailable: true,
    isBestseller: false,
    serves: "Serves 1",
  },
  {
    id: "firni",
    name: "Firni",
    description: "Chilled ground-rice pudding with cardamom and pistachio.",
    price: 79,
    category: "special",
    isVeg: true,
    isAvailable: true,
    isBestseller: false,
  },
  {
    id: "mango-lassi",
    name: "Mango Lassi",
    description: "Thick, chilled yoghurt drink blended with ripe mango.",
    price: 89,
    category: "beverages",
    isVeg: true,
    isAvailable: true,
    isBestseller: false,
  },
  {
    id: "masala-chaas",
    name: "Masala Chaas",
    description: "Spiced buttermilk with roasted cumin and mint.",
    price: 59,
    category: "beverages",
    isVeg: true,
    isAvailable: true,
    isBestseller: false,
  },
];

export const SEED_SETTINGS: RestaurantSettings = {
  isOpen: true,
  acceptingOrders: true,
  codEnabled: true,
  deliveryFee: 40,
  freeDeliveryAbove: 0,
  minOrderValue: 0,
  estimatedDeliveryMins: 45,
  phone: "",
  email: "",
  address: "",
  hours: [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ].map((day) => ({ day, open: "11:30", close: "23:00", closed: false })),
  offers: [
    {
      id: "offer-combo",
      title: "Try the Babu Special Combo",
      description: "Biriyani and Chicken Chaap together in one order.",
      active: true,
    },
  ],
  social: { instagram: "", facebook: "", youtube: "" },
};

// Deterministic demo orders so the admin dashboard has something to show.
const DEMO_NAMES = [
  ["Ananya Sen", "98300 11223"],
  ["Rahul Das", "90070 44556"],
  ["Priya Ghosh", "98311 77889"],
  ["Arif Khan", "97480 22110"],
  ["Sohini Roy", "98741 33221"],
  ["Vikram Shah", "99030 55667"],
  ["Mehul Jain", "98364 99880"],
  ["Tania Bose", "90513 12121"],
];

const STATUS_CYCLE: Order["status"][] = [
  "received",
  "preparing",
  "out-for-delivery",
  "delivered",
  "delivered",
  "accepted",
  "delivered",
  "cancelled",
  "ready",
  "delivered",
];

export function buildSeedOrders(now = new Date()): Order[] {
  const orders: Order[] = [];
  const picks = [
    [0, 5],
    [1],
    [7, 12],
    [3, 5],
    [0, 13],
    [9],
    [8],
    [1, 5, 12],
    [2],
    [3, 11],
    [0],
    [7],
    [4 - 1, 5],
    [1, 13],
  ];
  picks.forEach((idxs, i) => {
    const items = idxs.map((pi, j) => {
      const p = SEED_PRODUCTS[pi];
      return { productId: p.id, name: p.name, price: p.price, quantity: j === 0 ? 1 + (i % 2) : 1 };
    });
    const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
    const deliveryFee = SEED_SETTINGS.deliveryFee;
    const created = new Date(now);
    created.setDate(created.getDate() - Math.floor(i / 2));
    created.setHours(12 + (i % 9), (i * 17) % 60, 0, 0);
    const [fullName, phone] = DEMO_NAMES[i % DEMO_NAMES.length];
    const status = i < 2 ? (i === 0 ? "received" : "preparing") : STATUS_CYCLE[i % STATUS_CYCLE.length];
    const method = i % 3 === 0 ? "online" : "cod";
    orders.push({
      id: `BB-DEMO-${String(1001 + i)}`,
      customer: { fullName, phone: `+91 ${phone}` },
      address: {
        house: `${12 + i}B`,
        street: "Sample Street",
        area: ["Park Circus", "Salt Lake", "Gariahat", "New Town"][i % 4],
        fullAddress: `${12 + i}B, Sample Street, ${["Park Circus", "Salt Lake", "Gariahat", "New Town"][i % 4]}, Kolkata`,
      },
      items,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      paymentMethod: method,
      paymentStatus:
        status === "cancelled" ? "refunded" : method === "online" ? "paid" : status === "delivered" ? "paid" : "cod",
      status,
      createdAt: created.toISOString(),
      isDemo: true,
    });
  });
  return orders;
}
