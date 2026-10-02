import { useTrabby } from './useTrabby';
import { CHARACTERS } from '../data/rewards';

// 지금 쓰는 캐릭터. 기본 거북이는 SVG 그림을 쓰므로 emoji 가 null
export function useCharacter() {
  const id = useTrabby((s) => s.settings.character);
  const c = CHARACTERS.find((x) => x.id === id) ?? CHARACTERS[0];
  return { id: c.id, name: c.name, emoji: c.id === 'turtle' ? null : c.emoji };
}
