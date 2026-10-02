// 공공데이터 CSV (연번, 호선, 역명, 운행시간(분), 역간거리(km), 호선별누계(km))
const fs = require('fs');

exports.load = (file) => {
  const buf = fs.readFileSync(file);
  let text = new TextDecoder('utf-8').decode(buf);
  if (text.includes('\uFFFD')) text = new TextDecoder('euc-kr').decode(buf); // 공공데이터 CSV는 EUC-KR인 경우가 많아요
  const parse = (l) => (l.match(/("([^"]|"")*"|[^,]*)(,|$)/g) || []).map((c) => c.replace(/,$/, '').replace(/^"|"$/g, '').trim());
  const rows = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean).map(parse);
  const head = rows[0];
  const col = (k) => head.findIndex((h) => h.includes(k));
  const lineCol = [col('호선'), col('선명'), col('노선')].find((i) => i >= 0) ?? -1;
  const [cl, cn, cd, cc] = [lineCol, col('역명'), col('역간거리'), col('누계')];
  if ([cl, cn].some((i) => i < 0) || (cd < 0 && cc < 0)) throw new Error('헤더를 못 찾았어요: ' + head.join(' | '));
  return rows.slice(1).map((r) => ({ line: require('../lib/normalize').parseLine(r[cl]), name: r[cn], dist: parseFloat(r[cd]), cum: parseFloat(r[cc]) }));
};
