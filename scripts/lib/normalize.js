// 어떤 소스(csv/api)든 rows = [{ line, name, dist(km), cum(km) }] 모양으로만 맞추면
// 앱이 읽는 src/data/generated/line{id}.json 을 똑같이 만들어 줘요.
const COLORS = { 1: '#0052A4', 2: '#00A84D', 3: '#F26B1D', 4: '#00A5DE', 5: '#996CAC', 6: '#CD7C2F', 7: '#747F00', 8: '#E6186C', 9: '#BDB092' };
const clean = (s) => String(s).replace(/\(.*?\)/g, '').replace(/\s/g, '');
// '시청역'처럼 '역'이 붙어 있어도 화면 이름은 '시청'으로 통일 (서울역만 예외). '기흥(백남준아트센터)' -> '기흥'
const nameOf = (s) => { const c = clean(s); return c.length > 2 && c.endsWith('역') && c !== '서울역' ? c.slice(0, -1) : c; };

exports.nameOf = nameOf;

// '3호선' / '3' -> 3, '에버라인' 같은 이름은 그대로 (scripts/config/lines.json 에 등록해 id를 줘요)
exports.parseLine = (raw) => { const s = String(raw).trim(); const m = s.match(/^(\d+)\s*(호선)?$/); return m ? Number(m[1]) : s; };

// mode: 'prev' = 역간거리가 "앞 역 → 이 역", 'next' = "이 역 → 다음 역"(마지막 역은 빈칸), 'auto' = 첫 행 거리가 0/빈칸이면 prev
exports.toLineData = (rows, key, mode = 'auto', meta = null, fills = {}) => {
  let mine = rows.filter((r) => String(r.line) === String(key));
  if (!mine.length) throw new Error(`${key} 행이 없어요.`);
  const first = mine[0];
  const last = mine[mine.length - 1];
  if (mode === 'auto') mode = first.dist > 0 ? 'next' : 'prev';
  if (mode === 'next') {
    // 종점(마지막 행)이 아닌데 거리가 비었거나 0이면: ① data-source/fill.json 수동값 ② 누계 컬럼 차이 순으로 보완하고, 못 채우면 목록을 알려줘요
    const unresolved = [];
    mine = mine.map((r, i) => {
      if (i === mine.length - 1 || (Number.isFinite(r.dist) && r.dist > 0)) return r;
      const nx = mine[i + 1];
      const manual = fills[`${key}/${r.name}`];
      const byCum = Number.isFinite(r.cum) && Number.isFinite(nx.cum) && nx.cum - r.cum > 0 ? Math.round((nx.cum - r.cum) * 1000) / 1000 : NaN;
      const km = manual > 0 ? manual : byCum;
      if (!(km > 0)) { unresolved.push(`${r.name}→${nx.name}`); return r; }
      console.log(`  ℹ 보완: ${key} ${r.name}→${nx.name} ${km}km (${manual > 0 ? 'fill.json' : '누계 차이'})`);
      return { ...r, dist: km };
    });
    if (unresolved.length) throw new Error(`${key}: 거리가 비었거나 0인 구간 ${unresolved.length}곳 → ${unresolved.join(', ')}\n  data-source/fill.json 에 {"${key}/출발역명": km} 형식으로 넣고 다시 실행하세요`);
  }
  const useCum = mine.every((r) => Number.isFinite(r.cum));
  let stations = mine.map((r, i) => {
    const km = i === 0 ? 0 : mode === 'next' ? mine[i - 1].dist : useCum ? r.cum - mine[i - 1].cum : r.dist;
    if (!(km >= 0)) throw new Error(`${key} 거리 값 이상: ${r.name} (${km}) — 빈칸이거나 --dist-mode 가 맞는지 확인하세요`);
    return { name: nameOf(r.name), distFromPrev: Math.round(km * 1000) };
  });
  // 순환선(2호선): 마지막 행에도 '다음 역' 거리가 있으면 출발역으로 돌아오는 구간을 추가
  if (mode === 'next' && last.dist > 0) stations.push({ name: nameOf(first.name), distFromPrev: Math.round(last.dist * 1000) });

  const sum = stations.reduce((a, s) => a + s.distFromPrev, 0) / 1000;
  const closing = mode === 'next' && last.dist > 0 ? last.dist : 0;
  if (Number.isFinite(last.cum) && [sum, sum + (last.dist || 0), sum - closing].every((c) => Math.abs(c - last.cum) > 0.25)) {
    console.warn(`  ⚠ ${key} 합계 ${sum.toFixed(1)}km 가 CSV 누계 ${last.cum}km 와 달라요 (--dist-mode prev|next 를 바꿔 보세요)`);
  }

  const id = meta ? meta.id : Number(key);
  return {
    line: { id, name: meta ? meta.name : `${key}호선`, group: meta ? (meta.group || meta.name) : `${key}호선`, color: (meta && meta.color) || COLORS[id] || '#F26B1D', from: stations[0].name, to: stations[stations.length - 1].name },
    stations,
  };
};
