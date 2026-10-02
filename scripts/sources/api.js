// OpenAPI -> rows. 두 가지 형식을 알아서 구분해요.
//  1) 서울 열린데이터광장: .../json/<서비스명>/1/5/   (응답 {서비스명:{row:[...]}})
//  2) 공공데이터포털 파일→API 변환(odcloud): https://api.odcloud.kr/api/....?serviceKey=...  (응답 {data:[...]})
// 활용신청 후 나오는 샘플/Swagger의 요청 URL을 그대로 넣으세요.
const pick = (row, re) => {
  const k = Object.keys(row).find((key) => re.test(key));
  return k === undefined ? undefined : row[k];
};
const PER = 1000;

exports.load = async (base) => {
  const odcloud = /odcloud\.kr|\/api\/\d+\/v1\//.test(base);
  const all = [];
  for (let page = 1; ; page++) {
    let url;
    if (odcloud) {
      const u = new URL(base);
      u.searchParams.set('page', String(page));
      u.searchParams.set('perPage', String(PER));
      url = u.toString();
    } else {
      const start = (page - 1) * PER + 1;
      url = base.replace('/xml/', '/json/').replace(/\/(\d+)\/(\d+)\/?$/, `/${start}/${start + PER - 1}/`);
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} (인증키/URL/활용신청 승인 여부 확인)`);
    const json = await res.json();
    const svc = Object.keys(json).find((k) => json[k] && json[k].row);
    const rows = odcloud ? json.data : svc && json[svc].row;
    if (!Array.isArray(rows)) throw new Error('응답을 읽지 못했어요: ' + JSON.stringify(json).slice(0, 300));
    all.push(...rows);
    if (rows.length < PER) break;
  }
  return all.map((r) => {
    const v = [pick(r, /LINE|호선|선명/i), pick(r, /(STATION|STN|SBWY).*NM|^NM$|역명/i), pick(r, /^DIST(_KM)?$|역간거리/i), pick(r, /ACML|누계/i)];
    if (v[0] === undefined || v[1] === undefined || v[2] === undefined) throw new Error('필드 이름을 못 찾았어요. 응답 필드: ' + Object.keys(r).join(', '));
    return { line: require('../lib/normalize').parseLine(v[0]), name: v[1], dist: parseFloat(v[2]), cum: parseFloat(v[3]) };
  });
};
