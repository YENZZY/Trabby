import React from 'react';
import { Text, Pressable, StyleSheet, ScrollView, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTrabby } from '../../store/useTrabby';
import { LINES, LINE_DATA, lineLabel, lineBadge } from '../../data';
import { metrics, stepsToMeters } from '../../lib/progress';

export default function Lines() {
  const router = useRouter();
  const { activeLine, stepsByLine, cleared, selectLine } = useTrabby();
  const pct = (id: number) => {
    const d = LINE_DATA[id];
    return d ? Math.min(1, stepsToMeters(stepsByLine[id] ?? 0) / metrics(d).total) : 0;
  };
  const open = (id: number) => {
    if (id === activeLine) return router.push('/line');
    const go = () => { selectLine(id); router.push('/line'); };
    Alert.alert(`${lineLabel(id)}으로 바꿀까요?`, `${lineLabel(activeLine)} 진행도는 저장돼요. 걸음은 한 번에 한 노선에만 쌓여요.`, [{ text: '취소' }, { text: '바꾸기', onPress: go }]);
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8EF' }}>
      <Text style={s.h}>노선도</Text>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
        {LINES.map(([n, c]) => {
          const id = Number(n);
          const has = !!LINE_DATA[id];
          const st = cleared[id] ? 'CLEAR' : !has ? '준비 중' : id === activeLine ? `진행중 ${Math.floor(pct(id) * 100)}%` : pct(id) > 0 ? `일시정지 ${Math.floor(pct(id) * 100)}%` : '시작 전';
          return (
            <Pressable key={n} disabled={!has} onPress={() => open(id)} style={[s.row, !has && { opacity: 0.55 }, id === activeLine && { borderColor: c, borderWidth: 2 }]}>
              <View style={[s.b, { backgroundColor: c }]}><Text style={s.bt}>{lineBadge(Number(n))}</Text></View>
              <Text style={s.t}>{lineLabel(Number(n))}</Text>
              <Text style={[s.st, has && { color: c }]}>{st}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  h: { fontSize: 22, fontWeight: '800', color: '#3A2F26', padding: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 20, padding: 14, borderWidth: 2, borderColor: 'transparent' },
  b: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  bt: { color: '#fff', fontWeight: '800', fontSize: 18 },
  t: { flex: 1, fontSize: 16, fontWeight: '700', color: '#3A2F26' },
  st: { fontSize: 12, fontWeight: '800', color: '#8A7B6D' },
});
