import React, { useRef } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg from 'react-native-svg';
import { useCharacter } from '../../store/useCharacter';
import { Turtle } from '../../shared/Turtle';
import { useActive } from '../../store/useActive';

const GRAY = '#D9CFC3';

export default function LineDetail() {
  const router = useRouter();
  const sc = useRef<ScrollView>(null);
  const character = useCharacter();
  const { line, stations, cum, total: totalMeters, meters: m, progress } = useActive();
  const done = progress >= 1;
  const cur = done ? stations.length - 1 : cum.reduce((a, c, i) => (m >= c ? i : a), 0);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8EF' }}>
      <View style={s.head}>
        <Pressable onPress={() => router.back()} style={{ width: 60 }}><Text style={s.back}>←</Text></Pressable>
        <Text style={s.h}>{line.name}</Text>
        <View style={{ width: 60, alignItems: 'flex-end' }}><View style={s.pill}><Text style={s.pillTxt}>{done ? '완주' : '진행중'}</Text></View></View>
      </View>
      <View style={s.banner}>
        <Text style={{ fontSize: 54 }}>🐢</Text>
        <View style={s.bubble}><Text style={s.bubbleTxt}>지금, {line.name}을{'\n'}여행 중이에요!</Text></View>
      </View>
      <View style={s.info}>
        <View style={s.col}><Text style={s.k}>{line.from}</Text><View style={[s.dot, { backgroundColor: line.color }]} /><View style={s.tag}><Text style={s.tagTxt}>출발역</Text></View></View>
        <View style={[s.col, s.mid]}><Text style={s.big}>{line.name}</Text><Text style={s.v}>총 {(totalMeters / 1000).toFixed(1)} km</Text><Text style={s.v}>총 {stations.length}개 역</Text></View>
        <View style={s.col}><Text style={s.k}>{line.to}</Text><Text style={{ fontSize: 16 }}>📍</Text><View style={s.tag}><Text style={s.tagTxt}>종점역</Text></View></View>
      </View>
      <ScrollView ref={sc} onLayout={() => sc.current?.scrollTo({ y: Math.max(0, cur * 54 - 80), animated: false })} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 90 }}>
        {stations.map((st, i) => {
          const ok = i < cur || done;
          const isCur = i === cur && !done;
          return (
            <View key={`${i}-${st.name}`} style={[s.row, isCur && s.curRow]}>
              <View style={s.rail}>
                {i > 0 && <View style={[s.seg, { top: 0, bottom: '50%', backgroundColor: i <= cur || done ? line.color : GRAY }]} />}
                {i < stations.length - 1 && <View style={[s.seg, { top: '50%', bottom: 0, backgroundColor: i < cur || done ? line.color : GRAY }]} />}
                {isCur ? (
                  <View style={s.avatar}>{character.emoji ? <Text style={{ fontSize: 26 }}>{character.emoji}</Text> : <Svg width={34} height={38} viewBox="-30 -46 60 66"><Turtle x={0} y={0} color={line.color} /></Svg>}</View>
                ) : (
                  <View style={[s.node, { borderColor: ok ? line.color : GRAY }]} />
                )}
              </View>
              <View style={[s.body, !isCur && s.bodyLine]}>
                <View style={{ flex: 1, paddingVertical: 8 }}>
                  {isCur && <Text style={[s.cl, { color: '#E5484D' }]}>현재 위치</Text>}
                  <Text style={[s.name, !ok && !isCur && { color: '#6F6459' }]}>{st.name}</Text>
                </View>
                {ok && <Text style={s.ok}>✔ 완료</Text>}
                {isCur && <View style={s.pill}><Text style={s.pillTxt}>진행중</Text></View>}
              </View>
            </View>
          );
        })}
      </ScrollView>
      <Pressable style={s.fab} onPress={() => router.navigate('/')}><Text style={{ fontSize: 20 }}>🗺️</Text><Text style={s.fabTxt}>전체보기</Text></Pressable>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  back: { fontSize: 24, color: '#3A2F26' },
  h: { fontSize: 19, fontWeight: '800', color: '#3A2F26' },
  pill: { backgroundColor: '#FFE8D6', borderRadius: 10, paddingHorizontal: 9, paddingVertical: 3 },
  pillTxt: { color: '#F26B1D', fontSize: 11, fontWeight: '800' },
  banner: { height: 110, backgroundColor: '#D9EEF8', borderRadius: 22, marginHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  bubble: { backgroundColor: '#fff', borderRadius: 16, padding: 10 },
  bubbleTxt: { fontSize: 12, fontWeight: '700', color: '#3A2F26', textAlign: 'center' },
  info: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 22, marginHorizontal: 16, marginTop: 10, padding: 14 },
  col: { flex: 1, alignItems: 'center', gap: 4 },
  mid: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#F3EBE1' },
  dot: { width: 16, height: 16, borderRadius: 8 },
  tag: { backgroundColor: '#FFE8D6', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  tagTxt: { color: '#F26B1D', fontSize: 10, fontWeight: '800' },
  k: { fontWeight: '800', color: '#3A2F26', fontSize: 15 },
  v: { fontSize: 11, color: '#8A7B6D' },
  big: { fontSize: 18, fontWeight: '900', color: '#3A2F26' },
  name: { fontSize: 16, fontWeight: '700', color: '#3A2F26' },
  cl: { fontSize: 11, fontWeight: '800' },
  ok: { color: '#3DBE6B', fontSize: 12, fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'stretch', minHeight: 54 },
  curRow: { backgroundColor: '#FFE8D6', borderRadius: 22, minHeight: 68, marginVertical: 2 },
  rail: { width: 46, alignItems: 'center', justifyContent: 'center' },
  seg: { position: 'absolute', left: 21, width: 4 },
  node: { width: 18, height: 18, borderRadius: 9, borderWidth: 4, backgroundColor: '#fff' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', borderWidth: 3, borderColor: '#F26B1D', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  body: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingRight: 10 },
  bodyLine: { borderBottomWidth: 1, borderBottomColor: '#F3EBE1' },
  fab: { position: 'absolute', right: 16, bottom: 24, width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#C9A98A', shadowOpacity: 0.3, shadowRadius: 8 },
  fabTxt: { fontSize: 9, fontWeight: '800', color: '#3A2F26' },
});
