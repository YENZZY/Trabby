import { GENERATED } from './generated';

export type LineData = {
  line: { id: number; name: string; group?: string; kind?: 'main' | 'extra'; color: string; from: string; to: string };
  stations: { name: string; distFromPrev: number }[];
};

// 노선 추가는 `npm run build:data -- --all` 한 번이면 끝 (generated/index.ts 가 자동으로 갱신돼요)
export const LINE_DATA: Record<number, LineData> = GENERATED;

const BASE: [string, string][] = [
  ['1', '#0B3D91'], ['2', '#2DB34A'], ['3', '#F26B1D'], ['4', '#2F9BD8'], ['5', '#8A4FC9'],
  ['6', '#B0651F'], ['7', '#5E6B1E'], ['8', '#E5468C'], ['9', '#C9A227'],
];

// 서울 1~9호선 + 데이터가 생성된 이름 노선(에버라인 등, id 100 이상)
const EXTRA: [string, string][] = Object.values(LINE_DATA).filter((d) => d.line.id > 9).map((d) => [String(d.line.id), d.line.color]);
export const LINES: [string, string][] = [...BASE, ...EXTRA];
export const lineLabel = (id: number) => LINE_DATA[id]?.line.name ?? `${id}호선`;
export const lineBadge = (id: number) => (id > 9 ? (LINE_DATA[id]?.line.name ?? '?').slice(0, 1) : String(id));

// 같은 노선의 코스끼리 묶음 (예: 1호선 = 경인선·경부선·광명선·서동탄선). 노선도 탭·뱃지에서 사용
export type LineGroup = { name: string; ids: number[] };
export const LINE_GROUPS: LineGroup[] = (() => {
  const m = new Map<string, number[]>();
  Object.keys(LINE_DATA).map(Number).sort((a, b) => a - b).forEach((id) => {
    const g = LINE_DATA[id].line.group ?? LINE_DATA[id].line.name;
    m.set(g, [...(m.get(g) ?? []), id]);
  });
  return [...m].map(([name, ids]) => ({ name, ids }));
})();
// '1호선 경인선' → '경인선', 코스가 하나뿐이면 '본선'
export const courseName = (id: number) => {
  const l = LINE_DATA[id].line;
  const g = l.group ?? l.name;
  return l.name === g ? '본선' : l.name.replace(g, '').trim() || l.name;
};
