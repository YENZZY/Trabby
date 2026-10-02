import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { useTrabby } from '../../store/useTrabby';
import { LINES, LINE_DATA, lineLabel, lineBadge } from '../../data';

// 완주 후(또는 홈 카드에서) 다음 노선을 고르는 시트
export default function NextLineSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { activeLine, cleared, selectLine } = useTrabby();
  const options = LINES.filter(([n]) => Number(n) !== activeLine);
  const anyOpen = options.some(([n]) => LINE_DATA[Number(n)] && !cleared[Number(n)]);
  const pick = (id: number) => { selectLine(id); onClose(); };
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.back} onPress={onClose}>
        <Pressable style={s.sheet} onPress={() => {}}>
          <Text style={s.h}>다음 노선을 골라요</Text>
          <Text style={s.sub}>걸음은 한 번에 한 노선에만 쌓여요. 이전 노선 진행도는 저장돼요.</Text>
          {options.map(([n, c]) => {
            const id = Number(n);
            const has = !!LINE_DATA[id];
            const done = !!cleared[id];
            const ok = has && !done;
            return (
              <Pressable key={n} disabled={!ok} onPress={() => pick(id)} style={[s.row, !ok && { opacity: 0.5 }]}>
                <View style={[s.b, { backgroundColor: c }]}><Text style={s.bt}>{lineBadge(Number(n))}</Text></View>
                <Text style={s.t}>{lineLabel(Number(n))}</Text>
                <Text style={[s.st, ok && { color: c }]}>{done ? 'CLEAR' : has ? '도전하기' : '준비 중'}</Text>
              </Pressable>
            );
          })}
          {!anyOpen && <Text style={s.empty}>다른 노선은 곧 열려요!</Text>}
          <Pressable style={s.later} onPress={onClose}><Text style={s.laterT}>나중에</Text></Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
const s = StyleSheet.create({
  back: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFF8EF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 30, maxHeight: '80%' },
  h: { fontSize: 20, fontWeight: '800', color: '#3A2F26' },
  sub: { fontSize: 12, color: '#8A7B6D', marginTop: 4, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 18, padding: 12, marginBottom: 8 },
  b: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  bt: { color: '#fff', fontWeight: '800', fontSize: 16 },
  t: { flex: 1, fontSize: 15, fontWeight: '700', color: '#3A2F26' },
  st: { fontSize: 12, fontWeight: '800', color: '#8A7B6D' },
  empty: { textAlign: 'center', color: '#8A7B6D', marginVertical: 8, fontWeight: '700' },
  later: { alignItems: 'center', padding: 12 },
  laterT: { color: '#8A7B6D', fontWeight: '800' },
});
