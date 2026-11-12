import type { OpeningHours } from "@/types";

export function to12h(t: string) {
  const parts = t.split(":");
  const h = Number(parts[0] ?? 0);
  const m = Number(parts[1] ?? 0);
  const suffix = h >= 12 ? "PM" : "AM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** Collapse identical consecutive days ("Monday – Sunday · 11:30 AM – 11:00 PM"). */
export function summariseHours(hours: OpeningHours[]) {
  const out: { label: string; value: string }[] = [];
  let i = 0;
  while (i < hours.length) {
    const h = hours[i];
    if (!h) break;
    const value = h.closed ? "Closed" : `${to12h(h.open)} – ${to12h(h.close)}`;
    let j = i;
    while (j + 1 < hours.length) {
      const nextH = hours[j + 1];
      if (!nextH) break;
      const nextVal = nextH.closed ? "Closed" : `${to12h(nextH.open)} – ${to12h(nextH.close)}`;
      if (nextVal !== value) break;
      j++;
    }
    const endH = hours[j] ?? h;
    out.push({ label: i === j ? h.day : `${h.day.slice(0, 3)} – ${endH.day.slice(0, 3)}`, value });
    i = j + 1;
  }
  return out;
}
