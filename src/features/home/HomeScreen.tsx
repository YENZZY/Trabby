import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { RouteMap, mapHeight, yAt } from './RouteMap';
import { useTrabby } from '../../store/useTrabby';
import { useActive } from '../../store/useActive';
import { usePedometer } from './usePedometer';
import { DAILY_GOAL, metrics } from '../../lib/progress';
import NextLineSheet from '../lines/NextLineSheet';
import { themeBg } from '../settings/themes';
import { LINE_DATA, lineLabel } from '../../data';

export default function Home() {
  usePedometer();
  const { todaySteps, cleared: clearedMap, addSteps, claim, settings } = useTrabby();
  const [sheet, setSheet] = useState(false);
  const { data, line, meters, progress, total, fullyDone, extension, newStations } = useActive();
  const leftKm = ((total - Math.min(meters, total)) / 1000).toFixed(1);
  const showClear = progress >= 1 && !fullyDone;
  const { cum } = metrics(data);
  const reached = cum.filter((c) => c <= meters).length; // 지나온 역 개수
  const prev = useRef({ id: line.id, n: reached });
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    const p = prev.current;
    prev.current = { id: line.id, n: reached };
    if (p.id === line.id && reached > p.n && settings.arrivalAlert) {
      const name = data.stations[reached - 1].name;
      setToast(`${name.endsWith('역') ? name : name + '역'} 도착!`);
      const id = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(id);
    }
  }, [reached, line.id]);
  const next = Object.keys(LINE_DATA).map(Number).find((id) => id !== line.id && !clearedMap[id]);
  const router = useRouter();
  const sc = useRef<ScrollView>(null);
  const center = (m: number) => sc.current?.scrollTo({ y: Math.max(0, yAt(data, m) - 230), animated: true });
  useEffect(() => { center(meters); }, [meters]);

  const anim = useRef(new Animated.Value(0)).current;
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const id = anim.addListener(({ value }) => setShown((prev) => (Math.abs(prev - value) >= 4 || value === meters ? value : prev)));
    Animated.timing(anim, { toValue: meters, duration: 600, useNativeDriver: false }).start();
    return () => anim.removeListener(id);
  }, [meters]);

  return (
    <SafeAreaView style={[s.root, { backgroundColor: themeBg(settings.theme) }]}>
      <View style={[s.row, { justifyContent: 'space-between', paddingRight: 16 }]}>
        <Text style={s.logo}>🐢 Trabby</Text>
        <View style={s.bell}><Text style={{ fontSize: 18 }}>🔔</Text><View style={s.reddot} /></View>
      </View>

      <View style={s.card} onTouchEnd={() => router.push('/line')}>
        <View style={s.row}>
          <View style={[s.badge, { backgroundColor: line.color }]}><Text style={s.badgeTxt}>{line.id}</Text></View>
          <View style={{ flex: 1 }}>
            <View style={s.row}>
              <Text style={s.title}>{line.name}</Text>
              <View style={s.pill}><Text style={s.pillTxt}>진행중</Text></View>
            </View>
            <Text style={s.sub}>{line.from} → {line.to}</Text>
          </View>
          <Text style={[s.pct, { color: line.color }]}>{Math.floor(progress * 100)}%</Text>
        </View>
        <View style={s.bar}><View style={[s.fill, { width: `${progress * 100}%`, backgroundColor: line.color }]} /></View>
      </View>

      <View style={s.map}>
        <ScrollView ref={sc} contentContainerStyle={{ alignItems: 'center', minHeight: mapHeight(data.stations.length) }}>
          <RouteMap data={data} meters={shown} />
        </ScrollView>
        <Pressable style={s.nav} onPress={() => center(meters)}><Text style={{ fontSize: 18, color: '#F26B1D' }}>➤</Text></Pressable>
      </View>

      <View style={s.footer}>
        <View style={[s.card, s.half]}>
          <View style={s.row}>
            <Text style={{ fontSize: 26 }}>👣</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>오늘의 걸음 수</Text>
              <Text style={s.big}>{todaySteps.toLocaleString()} <Text style={s.sub}>/ {DAILY_GOAL.toLocaleString()}</Text></Text>
            </View>
          </View>
          <View style={s.bar}><View style={[s.fill, { width: `${Math.min(1, todaySteps / DAILY_GOAL) * 100}%`, backgroundColor: '#3DBE6B' }]} /></View>
        </View>
        <View style={[s.card, s.half]}>
          <View style={s.row}>
            <Text style={{ fontSize: 26 }}>📍</Text>
            <View>
              <Text style={s.label}>남은 거리</Text>
              <Text style={s.big}>{leftKm} km</Text>
            </View>
          </View>
        </View>
      </View>

      {__DEV__ && (
        <Pressable style={s.dev} onPress={() => addSteps(300)}><Text style={s.devTxt}>+300 걸음 (DEV)</Text></Pressable>
      )}

      {toast && (
        <View style={s.toast}><Text style={s.toastTxt}>🐢 {toast}</Text></View>
      )}
      {extension && settings.extAlert && (
        <View style={s.next}>
          <Text style={s.title}>🆕 새 구간이 열렸어요!</Text>
          <Text style={s.sub}>{line.name}에 역 {newStations}개가 늘었어요. 이어서 걸어보세요</Text>
        </View>
      )}
      {fullyDone && (
        <View style={s.next}>
          <Text style={s.title}>🎉 {line.name} 완주!</Text>
          <Text style={s.sub}>{next ? `${lineLabel(next)}에 도전해볼까요?` : '다른 노선은 곧 열려요!'}</Text>
          {next ? (
            <Pressable style={[s.btn, { backgroundColor: line.color, marginTop: 10, paddingVertical: 10 }]} onPress={() => setSheet(true)}>
              <Text style={s.btnTxt}>노선 고르러 가기</Text>
            </Pressable>
          ) : null}
        </View>
      )}
      {showClear && (
        <View style={s.overlay}>
          {[['#F26B1D',30,60],['#3DBE6B',80,140],['#2F9BD8',270,90],['#E5468C',320,50],['#C9A227',50,220],['#8A4FC9',330,200],['#F26B1D',150,40],['#3DBE6B',240,30],['#E5468C',20,300],['#2F9BD8',340,320]].map(([c, x, y], i) => (
            <View key={i} style={{ position: 'absolute', left: x as number, top: y as number, width: 10, height: 10, borderRadius: i % 2 ? 5 : 2, backgroundColor: c as string, transform: [{ rotate: `${i * 35}deg` }] }} />
          ))}
          <Text style={{ fontSize: 64 }}>🎉🐢🎉</Text>
          <Text style={[s.clear, { color: line.color }]}>🌿 CLEAR! 🌿</Text>
          <Text style={s.title}>{line.name} 완주!</Text>
          <Text style={s.sub}>수고했어요, 트라비! 멋진 여행이었어요!</Text>
          <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 16, marginTop: 10, width: 300 }}>
            <Text style={[s.title, { textAlign: 'center', fontSize: 15 }]}>획득한 보상</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 12 }}>
              {[['🐢', '새로운 트라비'], ['🎨', `${line.name} 테마 컬러`], ['🏅', `${line.name} 완주 뱃지`]].map(([e, n]) => (
                <View key={n} style={{ alignItems: 'center', width: 84 }}>
                  <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFE8D6', alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 28 }}>{e}</Text></View>
                  <Text style={[s.sub, { marginTop: 6, textAlign: 'center' }]}>{n}</Text>
                </View>
              ))}
            </View>
          </View>
          <Pressable style={[s.btn, { backgroundColor: line.color }]} onPress={() => { claim(); setSheet(true); }}>
            <Text style={s.btnTxt}>확인하기</Text>
          </Pressable>
        </View>
      )}
      <NextLineSheet visible={sheet} onClose={() => setSheet(false)} />
    </SafeAreaView>
  );
}

const shadow = { shadowColor: '#C9A98A', shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 };
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EAF5FB' },
  logo: { fontSize: 24, fontWeight: '900', color: '#F26B1D', paddingHorizontal: 18, paddingTop: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 14, marginHorizontal: 14, marginTop: 10, ...shadow },
  half: { flex: 1, marginHorizontal: 0, marginTop: 0 },
  badge: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  badgeTxt: { color: '#fff', fontSize: 24, fontWeight: '900' },
  title: { fontSize: 19, fontWeight: '800', color: '#3A2F26' },
  pill: { backgroundColor: '#FFE8D6', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  pillTxt: { color: '#F26B1D', fontSize: 11, fontWeight: '800' },
  sub: { fontSize: 13, fontWeight: '500', color: '#8A7B6D' },
  pct: { fontSize: 22, fontWeight: '900' },
  bar: { height: 12, borderRadius: 6, backgroundColor: '#F1E6DA', marginTop: 10, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 6 },
  map: { flex: 1, marginTop: 6 },
  toast: { position: 'absolute', top: 110, alignSelf: 'center', backgroundColor: '#3A2F26', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 10 },
  toastTxt: { color: '#fff', fontWeight: '800' },
  next: { position: 'absolute', left: 14, right: 14, bottom: 130, backgroundColor: '#fff', borderRadius: 22, padding: 16, alignItems: 'center', ...shadow },
  nav: { position: 'absolute', right: 16, bottom: 12, width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...shadow },
  bell: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  reddot: { position: 'absolute', top: 7, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#F26B1D' },
  footer: { flexDirection: 'row', gap: 10, paddingHorizontal: 14, paddingVertical: 10 },
  label: { fontSize: 12, color: '#8A7B6D', fontWeight: '600' },
  big: { fontSize: 20, fontWeight: '900', color: '#3A2F26' },
  dev: { alignSelf: 'center', paddingBottom: 6 },
  devTxt: { color: '#8A7B6D', fontSize: 12 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,248,239,0.97)', alignItems: 'center', justifyContent: 'center', gap: 10 },
  clear: { fontSize: 58, fontWeight: '900' },
  btn: { paddingHorizontal: 44, paddingVertical: 15, borderRadius: 28, marginTop: 14 },
  btnTxt: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
