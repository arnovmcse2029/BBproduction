import { Flame, MapPin, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface OrderActivity {
  id: string;
  item: string;
  area: string;
  time: string;
  count: number;
}

const ACTIVITIES: OrderActivity[] = [
  {
    id: "1",
    item: "Kolkata Chicken Biriyani Handi",
    area: "Park Circus",
    time: "2 mins ago",
    count: 2,
  },
  {
    id: "2",
    item: "Babu Special Feast Combo",
    area: "Salt Lake Sec V",
    time: "4 mins ago",
    count: 3,
  },
  { id: "3", item: "Mutton Dum Biriyani & Chaap", area: "Ballygunge", time: "just now", count: 1 },
  { id: "4", item: "Royal Awadhi Chicken Handi", area: "New Town", time: "6 mins ago", count: 2 },
  { id: "5", item: "Kolkata Mutton Biriyani", area: "Alipore", time: "8 mins ago", count: 4 },
  { id: "6", item: "Chicken Chaap & Extra Aloo", area: "Behala", time: "11 mins ago", count: 2 },
];

export function LiveOrderTicker({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % ACTIVITIES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const current = ACTIVITIES[index] ?? ACTIVITIES[0];
  if (!current) return null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full border border-gold/30 bg-charcoal/90 px-4 py-1.5 text-xs text-ivory/95 shadow-gold backdrop-blur-md transition-all duration-500",
        className,
      )}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <span className="flex items-center gap-1 font-semibold text-gold">
        <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /> Live Kitchen:
      </span>
      <div className="flex items-center gap-1.5 truncate">
        <span className="font-medium text-ivory truncate">{current.item}</span>
        <span className="text-ivory-muted/70">dispatched to</span>
        <span className="inline-flex items-center gap-0.5 text-gold-soft font-medium">
          <MapPin className="h-3 w-3 text-gold" /> {current.area}
        </span>
        <span className="text-ivory-muted/60 text-[0.7rem]">({current.time})</span>
      </div>
    </div>
  );
}
