export type MenuCategory =
  "chicken-biriyani" | "mutton-biriyani" | "chicken-chaap" | "combos" | "special" | "beverages";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  price: number;
  category: MenuCategory;
  image?: string;
  isVeg: boolean;
  isAvailable: boolean;
  isBestseller: boolean;
  serves?: string;
}

export const CATEGORIES: { id: MenuCategory | "all"; label: string }[] = [
  { id: "all", label: "All Items" },
  { id: "chicken-biriyani", label: "Chicken Biriyani" },
  { id: "mutton-biriyani", label: "Mutton Biriyani" },
  { id: "chicken-chaap", label: "Chicken Chaap" },
  { id: "combos", label: "Combos" },
  { id: "special", label: "Special Items" },
  { id: "beverages", label: "Beverages" },
];

export const categoryLabel = (id: MenuCategory) =>
  CATEGORIES.find((category) => category.id === id)?.label ?? id;

export const MENU_ORDER_SETTINGS = {
  acceptingOrders: true,
  codEnabled: true,
  deliveryFee: 40,
  freeDeliveryAbove: 0,
  minOrderValue: 0,
};

// Keep this module runtime-independent so the storefront and trusted Edge Function share prices.
export const MENU_ITEMS: MenuItem[] = [
  {
    id: "kolkata-chicken-biriyani",
    name: "Kolkata Chicken Biriyani",
    description: "Fragrant long-grain rice, tender chicken, the signature potato and a boiled egg.",
    longDescription:
      "Our house classic, slow-cooked on dum in the Kolkata tradition. Aged basmati is layered with marinated chicken, a golden potato and a boiled egg, then perfumed with kewra, rose water and a whisper of saffron.",
    price: 249,
    category: "chicken-biriyani",
    image: "/images/chicken-biriyani.png",
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
    image: "/images/hyderabadi-biriyani.png",
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
    image: "/images/handi-biriyani.png",
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
    image:
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=900&q=80",
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
    image: "/images/lucknowi-biriyani.jpg",
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
    image:
      "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=80",
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
    image:
      "https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&w=900&q=80",
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
    image: "/images/chicken-biriyani.png",
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
    image: "/images/handi-biriyani.png",
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
    image: "/images/lucknowi-biriyani.jpg",
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
    image: "/images/lucknowi-biriyani.jpg",
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
    image:
      "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=900&q=80",
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
    image:
      "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=900&q=80",
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
    image:
      "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80",
    isVeg: true,
    isAvailable: true,
    isBestseller: false,
  },
];

export interface PricedMenuOrderItem {
  product_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
}

export function priceMenuOrderItems(input: unknown): {
  items: PricedMenuOrderItem[];
  subtotal: number;
} {
  if (!Array.isArray(input) || input.length < 1 || input.length > 50) {
    throw new Error("An order must contain between 1 and 50 menu items.");
  }

  const seenProductIds = new Set<string>();
  const items = input.map((entry): PricedMenuOrderItem => {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
      throw new Error("An order item is invalid.");
    }
    const product =
      "productId" in entry && typeof entry.productId === "string"
        ? MENU_ITEMS.find((candidate) => candidate.id === entry.productId)
        : undefined;
    const quantity = "quantity" in entry ? entry.quantity : undefined;
    if (!product || !product.isAvailable) {
      throw new Error("One or more dishes are unavailable. Refresh your cart and try again.");
    }
    if (seenProductIds.has(product.id)) {
      throw new Error("Each dish can only appear once in an order. Combine duplicate quantities.");
    }
    seenProductIds.add(product.id);
    if (
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 20
    ) {
      throw new Error("Each dish quantity must be between 1 and 20.");
    }
    return {
      product_id: product.id,
      product_name: product.name,
      unit_price: product.price,
      quantity,
    };
  });

  return {
    items,
    subtotal: items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0),
  };
}
