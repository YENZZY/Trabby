import type { LineData } from '../data';

export const STRIDE_M = 0.6; // 고정 보폭 60cm
export const DAILY_GOAL = 8000;

export const stepsToMeters = (steps: number) => steps * STRIDE_M;

const cache = new WeakMap<LineData, { cum: number[]; total: number }>();
export function metrics(d: LineData) {
  let c = cache.get(d);
  if (!c) {
    const cum: number[] = [];
    d.stations.forEach((s, i) => cum.push((cum[i - 1] ?? 0) + s.distFromPrev));
    c = { cum, total: cum[cum.length - 1] };
    cache.set(d, c);
  }
  return c;
}

// 현재 구간 index(seg)와 구간 내 비율(t)
export function locate(d: LineData, meters: number) {
  const { cum, total } = metrics(d);
  const m = Math.min(meters, total);
  let j = 0;
  while (j < cum.length - 2 && m >= cum[j + 1]) j++;
  const t = (m - cum[j]) / (cum[j + 1] - cum[j]);
  return { seg: j, t: Math.min(1, Math.max(0, t)) };
}
