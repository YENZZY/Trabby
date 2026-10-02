// scripts/config/routes.json 의 parts(파일 안 조각들)를 이어 붙여 한 코스의 역 목록과 거리를 만들어요.
const { nameOf } = require('./normalize');
const { step, cands } = require('./resolve');

const blocksOf = (rows) => {
  const b = [];
  for (const r of rows) {
    const last = b[b.length - 1];
    if (last && last.label === String(r.line)) last.rows.push(r);
    else b.push({ label: String(r.line), rows: [r] });
  }
  return b;
};
const distinct = (c) => new Set(c.map((x) => Math.round(x.km * 10))).size;

exports.assemble = (rows, def, fills = {}, rename = {}) => {
  const blocks = blocksOf(rows);
  const nm = (s) => { const n = nameOf(s); return rename[n] || n; };
  const seq = [];
  const unresolved = [];
  const checks = [];
  const how = {};
  const push = (name, km, row, h) => seq.push({ name, km, row, how: h });

  for (const p of def.parts) {
    // 직접 입력한 구간 (파일에 없는 역: [[역명, 앞 역에서 거리km], ...])
    if (p.manual) {
      p.manual.forEach(([n, km]) => {
        const first = seq.length === 0;
        push(nm(n), first ? 0 : km, { name: n, dist: km, cum: NaN }, '직접입력');
        if (!first) how['직접입력'] = (how['직접입력'] || 0) + 1;
      });
      continue;
    }
    const blk = blocks.filter((b) => b.label === String(p.label))[(p.occ || 1) - 1];
    if (!blk) throw new Error(`${def.name}: '${p.label}' 조각을 못 찾았어요`);
    const names = blk.rows.map((r) => nameOf(r.name));
    let part;
    if (p.order) part = p.order.map((n) => { const i = names.indexOf(nameOf(n)); if (i < 0) throw new Error(`${def.name}: '${n}' 역을 못 찾았어요`); return blk.rows[i]; });
    else {
      const i0 = p.from ? names.indexOf(nameOf(p.from)) : 0;
      if (i0 < 0) throw new Error(`${def.name}: '${p.from}' 역을 못 찾았어요`);
      const i1 = p.count ? i0 + p.count - 1 : p.to ? names.findIndex((n, i) => i > i0 && n === nameOf(p.to)) : blk.rows.length - 1;
      if (i1 < 0) throw new Error(`${def.name}: '${p.to}' 역을 못 찾았어요`);
      part = blk.rows.slice(i0, i1 + 1);
    }
    // 1단계: 구간 안 인접 행의 해석 후보. 2단계: 후보가 갈리면 이웃 구간이 따르는 방식으로 결정
    const C = part.map((r, j) => (j === 0 ? [] : cands(part[j - 1], r)));
    const pick = C.map((c) => (c.length && distinct(c) === 1 ? c[0].how : null));
    let known = null;
    const fwd = pick.map((h) => (h ? (known = h) : known));
    known = null;
    const bwd = pick.map((h, j) => { const k = pick.length - 1 - j; return pick[k] ? (known = pick[k]) : known; }).reverse();
    part.forEach((row, j) => {
      const prev = j > 0 ? part[j - 1] : seq.length ? seq[seq.length - 1].row : null;
      let km = 0;
      if (prev) {
        const key = `${def.name}/${nm(prev.name)}→${nm(row.name)}`;
        let r = null;
        if (fills[key] > 0) r = { km: fills[key], how: 'fill.json' };
        else if (j === 0 && p.join === 'b4' && row.dist > 0) r = { km: row.dist, how: '가지첫구간' };
        else if (j === 0 && row.dist === 0 && row.cum === 0 && prev.dist > 0) {
          // 새 구간의 시작행(0,0): 앞 행이 '앞 역에서' 방식이면 다음 역 거리는 두 번째 열
          const lastHow = seq.length ? seq[seq.length - 1].how : '';
          const km0 = /앞역/.test(lastHow) && prev.cum > 0 ? prev.cum : prev.dist;
          r = { km: km0, how: '구간연결' };
        } else if (j > 0 && C[j].length) {
          const want = fwd[j] || bwd[j];
          r = C[j].find((x) => x.how === want) || C[j][0];
        } else r = step(prev, row, part[j + 1]);
        if (r && r.km > 0) {
          km = r.km;
          how[r.how] = (how[r.how] || 0) + 1;
          if (r.check) checks.push(`${nm(prev.name)}→${nm(row.name)} ${r.km}km (앞 행 값 ${prev.dist}/${prev.cum} 와 달라요)`);
        } else { km = NaN; unresolved.push(`${key.split('/')[1]} (${prev.dist},${prev.cum} | ${row.dist},${row.cum})`); }
        push(nm(row.name), km, row, r ? r.how : '');
        return;
      }
      push(nm(row.name), 0, row, '');
    });
  }
  return { stations: seq.map((s) => ({ name: s.name, distFromPrev: Math.round((s.km || 0) * 1000) })), unresolved, how, checks };
};
