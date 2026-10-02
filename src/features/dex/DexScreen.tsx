import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTrabby } from '../../store/useTrabby';
import { stepsToMeters, metrics } from '../../lib/progress';
import { LINES, LINE_DATA, lineLabel, lineBadge } from '../../data';

const TABS = ['노선 도감', '캐릭터 도감', '뱃지'];
const PILL: Record<string, [string, string]> = {
  CLEAR: ['#FFE8D6', '#F26B1D'], '진행중': ['#FFE1DE', '#E5484D'], LOCKED: ['#EFEAE3', '#8A7B6D'], '일시정지': ['#FFF1CC', '#B8860B'], '시작 전': ['#E6F0FA', '#2F6FA8'], '보유중': ['#DDF3E4', '#2E9E55'], '획득': ['#FFE8D6', '#F26B1D'],
};

export default function Dex() {
  const router = useRouter();
  const { stepsByLine, cleared, activeLine } = useTrabby();
  const pctOf = (id: number) => {
    const d = LINE_DATA[id];
    return d ? Math.min(1, stepsToMeters(stepsByLine[id] ?? 0) / metrics(d).total) : 0;
  };
  const totalSteps = Object.values(stepsByLine).reduce((a, b) => a + b, 0);
  const clearedCount = Object.values(cleared).filter(Boolean).length;
  const [tab, setTab] = useState(0);
  const Cell = ({ icon, color, name, status, sub, on }: any) => {
    const [pb, pc] = PILL[status];
    return (
      <View style={[s.cell, { backgroundColor: on ? color + '22' : '#F5F1EA' }]}>
        <View style={[s.badge, { backgroundColor: on ? color : '#CFC6BC' }]}><Text style={s.bt}>{icon}</Text></View>
        <Text style={s.name}>{name}</Text>
        <View style={[s.pill, { backgroundColor: pb }]}><Text style={[s.pt, { color: pc }]}>{status}</Text></View>
        {sub ? <Text style={s.sub}>{sub}</Text> : null}
      </View>
    );
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8EF' }}>
      <View style={s.head}>
        <Pressable onPress={() => router.navigate('/')}><Text style={s.back}>←</Text></Pressable>
        <Text style={s.h}>도감</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={s.tabs}>
        {TABS.map((t, i) => (
          <Pressable key={t} onPress={() => setTab(i)} style={[s.tab, tab === i && s.tabOn]}>
            <Text style={[s.tabTxt, tab === i && { color: '#fff' }]}>{t}</Text>
          </Pressable>
        ))}
      </View>
      <ScrollView contentContainerStyle={s.grid}>
        {tab === 0 && (<>
          <View style={s.sec}>
            <Text style={s.secT}>서울 지하철 노선도감</Text>
            <View style={[s.pill, { backgroundColor: '#FFE8D6' }]}><Text style={[s.pt, { color: '#F26B1D' }]}>{clearedCount}/{LINES.length}</Text></View>
          </View>
          {LINES.map(([n, c]) => {
            const id = Number(n);
            const has = !!LINE_DATA[id];
            const done = !!cleared[id];
            const pc = pctOf(id);
            const st = done ? 'CLEAR' : has ? (id === activeLine ? '진행중' : pc > 0 ? '일시정지' : '시작 전') : 'LOCKED';
            return <Cell key={n} icon={lineBadge(Number(n))} color={c} name={lineLabel(Number(n))} status={st} sub={has && !done ? `${Math.floor(pc * 100)}%` : ''} on={has} />;
          })}
          <View style={s.banner}>
            <Text style={{ fontSize: 40 }}>🐢</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.bannerTxt}>더 많은 노선을{'\n'}수집해보세요!</Text>
              <View style={s.bar}><View style={{ width: `${Math.max(8, pctOf(activeLine) * 100)}%`, height: 8, borderRadius: 4, backgroundColor: '#F26B1D' }} /></View>
            </View>
            <Text style={{ fontSize: 24, color: '#3A2F26' }}>›</Text>
          </View>
        </>)}
        {tab === 1 && (<>
          <Cell icon="🐢" color="#3DBE6B" name="기본 트라비" status="보유중" on />
          <Cell icon="🐶" color="#C9A227" name="강아지" status={clearedCount > 0 ? '보유중' : 'LOCKED'} on={clearedCount > 0} />
          <Cell icon="🐯" color="#F26B1D" name="호랑이" status="LOCKED" />
        </>)}
        {tab === 2 && (<>
          <Cell icon="🏅" color="#F26B1D" name="3호선 완주" status={cleared[3] ? '획득' : 'LOCKED'} on={!!cleared[3]} />
          <Cell icon="🏅" color="#2F9BD8" name="첫 걸음" status={totalSteps > 0 ? '획득' : 'LOCKED'} on={totalSteps > 0} />
          <Cell icon="🏅" color="#8A4FC9" name="누적 1만 보" status={totalSteps >= 10000 ? '획득' : 'LOCKED'} on={totalSteps >= 10000} />
        </>)}
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  back: { fontSize: 24, color: '#3A2F26' },
  h: { fontSize: 19, fontWeight: '800', color: '#3A2F26' },
  tabs: { flexDirection: 'row', backgroundColor: '#F1E6DA', borderRadius: 22, marginHorizontal: 16, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 18, alignItems: 'center' },
  tabOn: { backgroundColor: '#F26B1D' },
  tabTxt: { fontWeight: '800', color: '#8A7B6D', fontSize: 13 },
  sec: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  secT: { fontSize: 16, fontWeight: '800', color: '#3A2F26' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 10 },
  cell: { width: '31%', borderRadius: 20, paddingVertical: 14, alignItems: 'center', gap: 4 },
  badge: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  bt: { color: '#fff', fontWeight: '800', fontSize: 20 },
  name: { marginTop: 4, fontWeight: '700', color: '#3A2F26', fontSize: 13 },
  pill: { borderRadius: 10, paddingHorizontal: 9, paddingVertical: 2 },
  pt: { fontSize: 11, fontWeight: '800' },
  sub: { fontSize: 11, fontWeight: '700', color: '#8A7B6D' },
  banner: { width: '100%', backgroundColor: '#FFE8D6', borderRadius: 22, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 },
  bannerTxt: { fontWeight: '800', color: '#3A2F26', fontSize: 14 },
  bar: { height: 8, borderRadius: 4, backgroundColor: '#fff', marginTop: 8, overflow: 'hidden' },
});
