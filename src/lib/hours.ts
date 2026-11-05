import type { OpeningHours } from "@/types";

export function to12h(t: string) {
  const [h, m] = t.split(":").map(Number);
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
    const value = h.closed ? "Closed" : `${to12h(h.open)} – ${to12h(h.close)}`;
    let j = i;
    while (
      j + 1 < hours.length &&
      (hours[j + 1].closed ? "Closed" : `${to12h(hours[j + 1].open)} – ${to12h(hours[j + 1].close)}`) === value
    )
      j++;
    out.push({ label: i === j ? h.day : `${h.day.slice(0, 3)} – ${hours[j].day.slice(0, 3)}`, value });
    i = j + 1;
  }
  return out;
}
