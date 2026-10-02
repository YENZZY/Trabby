// 홈 화면 배경 테마. needLine 이 있으면 그 노선을 완주해야 해금돼요 (CLEAR 보상 "테마 컬러")
export const THEMES: { id: string; name: string; bg: string; needLine?: number }[] = [
  { id: 'sky', name: '하늘', bg: '#EAF5FB' },
  { id: 'cream', name: '크림', bg: '#FFF3E3' },
  { id: 'mint', name: '민트', bg: '#E4F6EC' },
  { id: 'line3', name: '3호선 주황', bg: '#FFE6D2', needLine: 3 },
];
export const themeBg = (id: string) => (THEMES.find((t) => t.id === id) ?? THEMES[0]).bg;
