import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LINE_DATA } from '../data';
import { metrics } from '../lib/progress';

export type Settings = { nickname: string; arrivalAlert: boolean; extAlert: boolean; theme: string; character: string };

type State = {
  activeLine: number; // 지금 걷는 노선 (한 번에 하나만)
  stepsByLine: Record<number, number>; // 노선별 저장된 걸음 수 (노선을 바꿔도 유지)
  cleared: Record<number, boolean>;
  clearedMeters: Record<number, number>; // 완주했을 때의 노선 길이(m) — 나중에 역이 늘었는지 비교용
  todaySteps: number;
  todayDate: string;
  settings: Settings;
  setSetting: <K extends keyof Settings>(k: K, v: Settings[K]) => void;
  addSteps: (n: number) => void;
  selectLine: (id: number) => void;
  claim: () => void;
  reset: () => void;
};

export const useTrabby = create<State>()(
  persist(
    (set) => ({
      activeLine: 3,
      stepsByLine: {},
      cleared: {},
      clearedMeters: {},
      todaySteps: 0,
      todayDate: '',
      settings: { nickname: '트라비러버', arrivalAlert: true, extAlert: true, theme: 'sky', character: 'turtle' },
      setSetting: (k, v) => set((s) => ({ settings: { ...s.settings, [k]: v } })),
      addSteps: (n) =>
        set((s) => {
          const d = new Date().toDateString();
          const today = { todaySteps: (s.todayDate === d ? s.todaySteps : 0) + n, todayDate: d };
          // 완주했고 새 구간도 없을 때만 더 쌓지 않아요 (역이 늘면 이어서 걸을 수 있어요)
          const total = metrics(LINE_DATA[s.activeLine]).total;
          const cm = s.clearedMeters[s.activeLine];
          if (s.cleared[s.activeLine] && (cm === undefined || cm >= total - 1)) return today;
          return { ...today, stepsByLine: { ...s.stepsByLine, [s.activeLine]: (s.stepsByLine[s.activeLine] ?? 0) + n } };
        }),
      selectLine: (id) => set({ activeLine: id }),
      claim: () =>
        set((s) => ({
          cleared: { ...s.cleared, [s.activeLine]: true },
          clearedMeters: { ...s.clearedMeters, [s.activeLine]: metrics(LINE_DATA[s.activeLine]).total },
        })),
      reset: () => set({ activeLine: 3, stepsByLine: {}, cleared: {}, clearedMeters: {}, todaySteps: 0 }),
    }),
    { name: 'trabby-v2', storage: createJSONStorage(() => AsyncStorage) }
  )
);
