import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Modal, Switch, TextInput, Linking, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pedometer } from 'expo-sensors';
import { useTrabby } from '../../store/useTrabby';
import { STRIDE_M } from '../../lib/progress';
import { THEMES } from './themes';

const SUPPORT_EMAIL = 'support@trabby.app'; // TODO: 실제 문의 메일로 교체
const FAQ = [
  ['걸음 수가 안 올라가요', '처음 실행할 때 나오는 동작/피트니스 권한을 허용했는지 확인해 주세요. 에뮬레이터에는 걸음 센서가 없어요.'],
  ['노선을 바꾸면 진행도는요?', '이전 노선 진행도는 저장돼요. 걸음은 한 번에 한 노선에만 쌓여요.'],
  ['보폭은 왜 고정인가요?', '설정 부담을 없애려고 모두 60cm 기준으로 계산해요.'],
  ['노선에 역이 늘어나면요?', '완주 기록은 그대로 유지되고, 새 구간만 이어서 걸을 수 있어요.'],
];
type Sheet = null | 'steps' | 'alert' | 'theme' | 'lang' | 'faq' | 'nick';

export default function Settings() {
  const { settings, setSetting, cleared, reset } = useTrabby();
  const [sheet, setSheet] = useState<Sheet>(null);
  const [avail, setAvail] = useState<boolean | null>(null);
  const [nick, setNick] = useState(settings.nickname);
  useEffect(() => { Pedometer.isAvailableAsync().then(setAvail).catch(() => setAvail(false)); }, []);
  const close = () => setSheet(null);
  const themeName = THEMES.find((t) => t.id === settings.theme)?.name ?? '하늘';
  const sensor = avail === null ? '확인 중' : avail ? '연결됨' : '사용 불가';
  const rows: [string, string, string, Sheet][] = [
    ['👣', '걸음 수 설정', `걸음 센서 ${sensor} · 보폭 ${Math.round(STRIDE_M * 100)}cm`, 'steps'],
    ['🔔', '알림 설정', `도착 알림 ${settings.arrivalAlert ? '켜짐' : '꺼짐'}`, 'alert'],
    ['🎨', '테마 설정', themeName, 'theme'],
    ['🌐', '언어 설정', '한국어', 'lang'],
    ['💬', '고객센터', 'FAQ / 문의하기', 'faq'],
  ];
  const Toggle = ({ label, desc, k }: { label: string; desc: string; k: 'arrivalAlert' | 'extAlert' }) => (
    <View style={s.srow}><View style={{ flex: 1 }}><Text style={s.t}>{label}</Text><Text style={s.d}>{desc}</Text></View>
      <Switch value={settings[k]} onValueChange={(v) => setSetting(k, v)} trackColor={{ true: '#F26B1D' }} /></View>
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8EF' }}>
      <ScrollView>
        <Text style={s.h}>⚙️  설정</Text>
        <Pressable style={[s.card, s.profile]} onPress={() => { setNick(settings.nickname); setSheet('nick'); }}>
          <View style={s.av}><Text style={{ fontSize: 34 }}>🐢</Text></View>
          <View style={{ flex: 1 }}><Text style={s.t}>{settings.nickname} 🌱</Text><Text style={s.d}>오늘도 걷는 중!</Text></View>
          <Text style={s.chev}>›</Text>
        </Pressable>
        <View style={[s.card, { paddingHorizontal: 16 }]}>
          {rows.map(([e, t, d, k]) => (
            <Pressable key={t} style={s.row} onPress={() => setSheet(k)}>
              <Text style={{ fontSize: 24 }}>{e}</Text>
              <View style={{ flex: 1 }}><Text style={s.t}>{t}</Text><Text style={s.d}>{d}</Text></View>
              <Text style={s.chev}>›</Text>
            </Pressable>
          ))}
          <Pressable style={[s.row, { borderBottomWidth: 0 }]} onPress={() => Alert.alert('진행 초기화', '모든 노선 진행도와 완주 기록을 지울까요?', [{ text: '취소' }, { text: '초기화', style: 'destructive', onPress: reset }])}>
            <Text style={{ fontSize: 24 }}>♻️</Text>
            <View style={{ flex: 1 }}><Text style={s.t}>진행 초기화</Text><Text style={s.d}>테스트용</Text></View>
          </Pressable>
        </View>
        <View style={s.promo}>
          <View style={{ flex: 1 }}><Text style={s.d}>걷는 즐거움,</Text><Text style={s.t}>더 특별해지는 순간!</Text><Text style={s.logo}>Trabby</Text></View>
          <Text style={{ fontSize: 44 }}>🐢</Text>
        </View>
      </ScrollView>

      <Modal visible={sheet !== null} transparent animationType="slide" onRequestClose={close}>
        <Pressable style={s.back} onPress={close}>
          <Pressable style={s.sheet} onPress={() => {}}>
            {sheet === 'steps' && (<>
              <Text style={s.sh}>걸음 수 설정</Text>
              <Text style={s.body}>걸음 센서: {sensor}{'\n'}보폭: {Math.round(STRIDE_M * 100)}cm 고정 (모든 사용자 동일){'\n\n'}에뮬레이터에는 걸음 센서가 없어서 "사용 불가"로 나와요. 홈 화면의 +300 걸음 버튼으로 테스트하세요.</Text>
            </>)}
            {sheet === 'alert' && (<>
              <Text style={s.sh}>알림 설정</Text>
              <Toggle label="도착 알림" desc="앱을 켜 둔 동안 역을 지날 때 알려줘요" k="arrivalAlert" />
              <Toggle label="새 구간 안내" desc="완주한 노선에 역이 늘면 알려줘요" k="extAlert" />
            </>)}
            {sheet === 'theme' && (<>
              <Text style={s.sh}>테마 설정</Text>
              {THEMES.map((t) => {
                const locked = t.needLine !== undefined && !cleared[t.needLine];
                return (
                  <Pressable key={t.id} disabled={locked} onPress={() => { setSetting('theme', t.id); close(); }} style={[s.srow, locked && { opacity: 0.5 }]}>
                    <View style={[s.sw, { backgroundColor: t.bg }]} />
                    <Text style={[s.t, { flex: 1 }]}>{t.name}</Text>
                    <Text style={s.d}>{locked ? `🔒 ${t.needLine}호선 완주 시 해금` : settings.theme === t.id ? '✔ 사용 중' : ''}</Text>
                  </Pressable>
                );
              })}
            </>)}
            {sheet === 'lang' && (<>
              <Text style={s.sh}>언어 설정</Text>
              <View style={s.srow}><Text style={[s.t, { flex: 1 }]}>한국어</Text><Text style={s.d}>✔ 사용 중</Text></View>
              <View style={[s.srow, { opacity: 0.5 }]}><Text style={[s.t, { flex: 1 }]}>English</Text><Text style={s.d}>준비 중</Text></View>
            </>)}
            {sheet === 'faq' && (<>
              <Text style={s.sh}>FAQ</Text>
              {FAQ.map(([q, a]) => (<View key={q} style={{ marginBottom: 12 }}><Text style={s.t}>Q. {q}</Text><Text style={s.body}>{a}</Text></View>))}
              <Pressable style={s.btn} onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Trabby 문의')}`)}><Text style={s.btnT}>문의하기</Text></Pressable>
            </>)}
            {sheet === 'nick' && (<>
              <Text style={s.sh}>닉네임 변경</Text>
              <TextInput value={nick} onChangeText={setNick} maxLength={12} style={s.input} placeholder="트라비러버" />
              <Pressable style={s.btn} onPress={() => { setSetting('nickname', nick.trim() || '트라비러버'); close(); }}><Text style={s.btnT}>저장</Text></Pressable>
            </>)}
            <Pressable style={s.later} onPress={close}><Text style={s.laterT}>닫기</Text></Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  h: { fontSize: 22, fontWeight: '800', color: '#3A2F26', padding: 20 },
  card: { marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 24 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, marginBottom: 12 },
  av: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFE8D6', alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3EBE1' },
  t: { fontSize: 15, fontWeight: '700', color: '#3A2F26' },
  d: { fontSize: 12, color: '#8A7B6D', marginTop: 2 },
  chev: { color: '#A89B8E', fontSize: 20 },
  promo: { backgroundColor: '#DFF1FA', borderRadius: 22, margin: 16, padding: 18, flexDirection: 'row', alignItems: 'center' },
  logo: { fontSize: 18, fontWeight: '900', color: '#3A2F26', marginTop: 4 },
  back: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFF8EF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 30 },
  sh: { fontSize: 20, fontWeight: '800', color: '#3A2F26', marginBottom: 12 },
  body: { fontSize: 13, color: '#6F6459', lineHeight: 20, marginTop: 4 },
  srow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 18, padding: 14, marginBottom: 8 },
  sw: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: '#E3DCD3' },
  btn: { backgroundColor: '#F26B1D', borderRadius: 24, padding: 14, alignItems: 'center', marginTop: 8 },
  btnT: { color: '#fff', fontWeight: '800', fontSize: 15 },
  input: { backgroundColor: '#fff', borderRadius: 16, padding: 14, fontSize: 16, fontWeight: '700', color: '#3A2F26' },
  later: { alignItems: 'center', padding: 12 },
  laterT: { color: '#8A7B6D', fontWeight: '800' },
});
