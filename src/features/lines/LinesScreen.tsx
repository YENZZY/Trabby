import React from 'react';
import { Text, Pressable, StyleSheet, ScrollView, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTrabby } from '../../store/useTrabby';
import { LINES, LINE_DATA, LINE_GROUPS, lineLabel, lineBadge, courseName } from '../../data';
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
    Alert.alert(`${lineLabel(id)}으로 바꿀까요?`, `${lineLabel(activeLine)} 진행도는 저장돼요. 걸음은 한 번에 한 코스에만 쌓여요.`, [{ text: '취소' }, { text: '바꾸기', onPress: go }]);
  };
  const comingSoon = LINES.filter(([n]) => !LINE_DATA[Number(n)]);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8EF' }}>
      <Text style={s.h}>노선도</Text>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        {LINE_GROUPS.map((g) => {
          const done = g.ids.filter((id) => cleared[id]).length;
          return (
            <View key={g.name} style={{ marginBottom: 14 }}>
              <View style={s.gh}>
                <Text style={s.gt}>{g.name}</Text>
                {g.ids.length > 1 && <Text style={s.gc}>{done}/{g.ids.length} 코스 완주</Text>}
              </View>
              {g.ids.map((id) => {
                const { line, stations } = LINE_DATA[id];
                const st = cleared[id] ? 'CLEAR' : id === activeLine ? `진행중 ${Math.floor(pct(id) * 100)}%` : pct(id) > 0 ? `일시정지 ${Math.floor(pct(id) * 100)}%` : '시작 전';
                return (
                  <Pressable key={id} onPress={() => open(id)} style={[s.row, id === activeLine && { borderColor: line.color }]}>
                    <View style={[s.b, { backgroundColor: line.color }]}><Text style={s.bt}>{lineBadge(id)}</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.t}>{courseName(id)}</Text>
                      <Text style={s.sub}>{stations.length}개 역 · {line.from} → {line.to}</Text>
                    </View>
                    <Text style={[s.st, { color: line.color }]}>{st}</Text>
                  </Pressable>
                );
              })}
            </View>
          );
        })}
        {comingSoon.map(([n, c]) => (
          <View key={n} style={[s.row, { opacity: 0.5 }]}>
            <View style={[s.b, { backgroundColor: c }]}><Text style={s.bt}>{n}</Text></View>
            <Text style={[s.t, { flex: 1 }]}>{n}호선</Text>
            <Text style={s.st}>준비 중</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  h: { fontSize: 22, fontWeight: '800', color: '#3A2F26', padding: 20 },
  gh: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: 4, marginBottom: 6 },
  gt: { fontSize: 16, fontWeight: '800', color: '#3A2F26' },
  gc: { fontSize: 11, fontWeight: '800', color: '#F26B1D' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 20, padding: 12, marginBottom: 8, borderWidth: 2, borderColor: 'transparent' },
  b: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  bt: { color: '#fff', fontWeight: '800', fontSize: 16 },
  t: { fontSize: 15, fontWeight: '700', color: '#3A2F26' },
  sub: { fontSize: 11, color: '#8A7B6D', marginTop: 2 },
  st: { fontSize: 12, fontWeight: '800', color: '#8A7B6D' },
});
