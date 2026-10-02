import { LINE_GROUPS, LINE_DATA } from '../../data';
import { mainCleared } from '../../data/rewards';

// 홈 화면 배경 테마. 노선(본선)을 완주하면 그 노선 색 테마가 열려요 (needGroup)
const tint = (hex: string, a = 0.2) => {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * (1 - a)).toString(16).padStart(2, '0');
  return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(mix).join('');
};

export type Theme = { id: string; name: string; bg: string; needGroup?: string };
export const THEMES: Theme[] = [
  { id: 'sky', name: '하늘', bg: '#EAF5FB' },
  { id: 'cream', name: '크림', bg: '#FFF3E3' },
  { id: 'mint', name: '민트', bg: '#E4F6EC' },
  ...LINE_GROUPS.map((g) => ({ id: `g:${g.name}`, name: `${g.name} 컬러`, bg: tint(LINE_DATA[g.ids[0]].line.color), needGroup: g.name })),
];
export const themeBg = (id: string) => (THEMES.find((t) => t.id === id) ?? THEMES[0]).bg;
export const themeUnlocked = (t: Theme, cleared: Record<number, boolean>) => !t.needGroup || mainCleared(t.needGroup, cleared);
