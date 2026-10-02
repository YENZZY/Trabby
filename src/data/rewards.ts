import { LINE_GROUPS, LINE_DATA } from './index';

// 보상 규칙
//  · 노선(본선) 완주  → 그 노선 색 테마 (settings/themes.ts)
//  · 추가 코스 완주   → 캐릭터  (갈래가 있는 노선의 코스: 1호선 코스들, 2호선·5호선 지선)
// 캐릭터를 늘리려면 추가 코스(routes.json 의 kind: "extra")를 만들고 아래에 route(코스 id)와 함께 한 줄 추가하세요.
// 그림은 임시로 이모지를 써요 (나중에 일러스트로 교체).
export type Character = { id: string; name: string; emoji: string; route?: number };
export const CHARACTERS: Character[] = [
  { id: 'turtle', name: '기본 트라비', emoji: '🐢' },
  { id: 'dog', name: '강아지 트라비', emoji: '🐶', route: 12 }, // 1호선 광명선
  { id: 'rabbit', name: '토끼 트라비', emoji: '🐰', route: 13 }, // 1호선 서동탄선
  { id: 'tiger', name: '호랑이 트라비', emoji: '🐯', route: 11 }, // 1호선 경부선 (가장 긴 코스)
  { id: 'cat', name: '고양이 트라비', emoji: '🐱', route: 21 }, // 2호선 성수지선
  { id: 'fox', name: '여우 트라비', emoji: '🦊', route: 22 }, // 2호선 신정지선
  { id: 'bear', name: '곰 트라비', emoji: '🐻', route: 51 }, // 5호선 마천지선
];

// 그 노선의 본선을 완주했는지 (테마 해금 조건)
export const mainCleared = (group: string, cleared: Record<number, boolean>) =>
  (LINE_GROUPS.find((g) => g.name === group)?.ids ?? []).some((id) => LINE_DATA[id].line.kind !== 'extra' && cleared[id]);

export const charUnlocked = (c: Character, cleared: Record<number, boolean>) => !c.route || !!cleared[c.route];
