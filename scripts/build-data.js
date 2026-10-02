// 사용법
//   npm run build:data -- --all          ← data 폴더의 모든 CSV를 읽어 모든 노선 생성 (추천)
//   npm run build:data -- --line 3       ← 특정 노선만 (이름 노선은 --line 에버라인)
//   npm run build:data -- --file data/a.csv,data/b.csv
//   npm run fetch:data -- --all --url "<Open API URL>"   ← API (또는 환경변수 STATION_API_URL)
// 실행할 때마다 src/data/generated/index.ts(노선 등록)도 자동 갱신돼요.
const fs = require('fs');
const path = require('path');
const { toLineData, parseLine } = require('./lib/normalize');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i >= 0 ? process.argv[i + 1] : d; };
const source = arg('source', 'csv');
const all = process.argv.includes('--all');
const only0 = null;
const distMode = arg('dist-mode', 'auto'); // prev | next | auto
const outdir = arg('outdir', path.join(__dirname, '../src/data/generated'));
const dataDir = path.join(__dirname, '../data');
const fillFile = path.join(dataDir, 'fill.json'); // 수동 보완값: { "3호선/약수": 0.7 } = 약수→다음 역 거리(km)
const fills = fs.existsSync(fillFile) ? JSON.parse(fs.readFileSync(fillFile, 'utf8')) : {};

const writeIndex = () => {
  const ids = fs.readdirSync(outdir).map((f) => f.match(/^line(\d+)\.json$/)).filter(Boolean).map((m) => Number(m[1])).sort((a, b) => a - b);
  const body = [
    '// 자동 생성 파일 — scripts/build-data.js 가 실행될 때마다 갱신돼요. 직접 수정하지 마세요.',
    "import type { LineData } from '../index';",
    ...ids.map((i) => `import line${i} from './line${i}.json';`),
    '',
    'export const GENERATED: Record<number, LineData> = {',
    ...ids.map((i) => `  ${i}: line${i} as LineData,`),
    '};',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(outdir, 'index.ts'), body, 'utf8');
  return ids;
};

(async () => {
  let rows;
  if (source === 'csv') {
    const files = arg('file') ? arg('file').split(',') : fs.readdirSync(dataDir).filter((f) => f.toLowerCase().endsWith('.csv')).map((f) => path.join(dataDir, f));
    if (!files.length) throw new Error('data 폴더에 CSV가 없어요');
    rows = files.flatMap((f) => { const r = require('./sources/csv').load(f).map((x) => ({ ...x, file: path.basename(f) })); console.log(`읽음: ${path.basename(f)} (${r.length}행)`); return r; });
  } else if (source === 'api') {
    const url = arg('url', process.env.STATION_API_URL);
    if (!url) throw new Error('--url 또는 환경변수 STATION_API_URL 이 필요해요');
    rows = await require('./sources/api').load(url);
  } else throw new Error('--source 는 csv 또는 api');

  // routes.json: 조각난 CSV(섞인 형식)를 코스별로 이어 붙여요
  const rc = JSON.parse(fs.readFileSync(path.join(__dirname, 'routes.json'), 'utf8'));
  const routeRows = rows.filter((r) => r.file === rc.file);
  const only = arg('line');
  if (routeRows.length) {
    fs.mkdirSync(outdir, { recursive: true });
    for (const def of rc.routes) {
      if (only && String(def.id) !== String(only)) continue;
      const { stations, unresolved, how, checks } = require('./lib/assemble').assemble(routeRows, def, fills, rc.rename || {});
      const total = stations.reduce((a, s) => a + s.distFromPrev, 0);
      const info = `${def.name}: ${stations.length}개 역, 총 ${(total / 1000).toFixed(1)}km  (${Object.entries(how).map(([k, v]) => k + v).join(' ')})`;
      if (unresolved.length) { console.warn(`  ✗ ${info}\n    거리를 못 읽은 구간 ${unresolved.length}곳 → data/fill.json 에 "${def.name}/출발역→도착역": km 로 보완하세요:\n      ` + unresolved.join('\n      ')); continue; }
      const data = { line: { id: def.id, name: def.name, color: def.color, from: stations[0].name, to: stations[stations.length - 1].name }, stations };
      fs.writeFileSync(path.join(outdir, `line${def.id}.json`), JSON.stringify(data, null, 1), 'utf8');
      console.log(`  ✓ ${info}` + (checks.length ? `\n    ⚠ 확인 필요: ${checks.join(' / ')}` : ''));
    }
  }
  rows = rows.filter((r) => r.file !== rc.file);
  const keys = all
    ? [...new Set(rows.map((r) => r.line).filter((l) => l !== '' && !Number.isNaN(l)))].sort((a, b) => String(a).localeCompare(String(b), 'ko', { numeric: true }))
    : [parseLine(arg('line', '3'))];
  const registry = JSON.parse(fs.readFileSync(path.join(__dirname, 'lines.json'), 'utf8'));
  fs.mkdirSync(outdir, { recursive: true });
  for (const key of keys) {
    let meta = null;
    if (typeof key === 'string') {
      meta = registry[key];
      if (!meta) { console.warn(`  건너뜀: '${key}' 노선은 scripts/lines.json 에 id/name/color 를 등록해야 해요`); continue; }
    }
    const srcs = new Set(rows.filter((r) => String(r.line) === String(key)).map((r) => r.file).filter(Boolean));
    if (srcs.size > 1) throw new Error(`'${key}' 노선이 여러 파일에 겹쳐 있어요 (${[...srcs].join(', ')}). 임시/중복 파일을 data 폴더에서 빼세요`);
    const data = toLineData(rows, key, distMode, meta, fills);
    const total = data.stations.reduce((a, s) => a + s.distFromPrev, 0);
    fs.writeFileSync(path.join(outdir, `line${data.line.id}.json`), JSON.stringify(data, null, 1), 'utf8');
    console.log(`[${source}] ${data.line.name}: ${data.stations.length}개 역, 총 ${(total / 1000).toFixed(1)}km` + (data.stations.length < 10 && typeof key === 'number' ? '  ⚠ 역이 너무 적어요. 원본 데이터를 확인하세요' : ''));
  }
  console.log('등록된 노선 id:', writeIndex().join(', '));
})().catch((e) => { console.error('실패:', e.message); process.exit(1); });
