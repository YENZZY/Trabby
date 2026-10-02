import { useTrabby } from './useTrabby';
import { LINE_DATA } from '../data';
import { metrics, stepsToMeters } from '../lib/progress';

// 지금 걷는 노선의 데이터와 진행 상태를 한 번에 돌려줘요
export function useActive() {
  const activeLine = useTrabby((s) => s.activeLine);
  const steps = useTrabby((s) => s.stepsByLine[activeLine] ?? 0);
  const cleared = useTrabby((s) => !!s.cleared[activeLine]);
  const cm = useTrabby((s) => s.clearedMeters[activeLine]);
  const data = LINE_DATA[activeLine];
  const { cum, total } = metrics(data);
  // 완주한 뒤 노선에 역이 늘었으면 extension (완주 기록은 그대로 두고 새 구간만 안내)
  const extension = cleared && cm !== undefined && cm < total - 1;
  const newStations = extension ? data.stations.filter((_, i) => cum[i] > cm + 1).length : 0;
  const meters = stepsToMeters(steps);
  return { data, line: data.line, stations: data.stations, cum, total, steps, meters, progress: Math.min(1, meters / total), cleared, extension, fullyDone: cleared && !extension, newStations };
}
