// 인접한 두 행 A→B 사이 거리를 읽어요. 파일에 섞여 있는 형식들을 "서로 맞는 열"로 판별해요.
//  누계   : B.역간거리(앞 역에서) + 누계 열        (서울교통공사 방식)
//  다음역 : A.역간거리(다음 역까지) == B.누계 열     (코레일 방식)
//  앞역   : B.역간거리(앞 역에서) == A.누계 열       (코레일 방식, 열이 뒤바뀐 구간)
//  동일열 : B의 두 열이 같은 값(앞 역에서)
const tol = 0.051;
const eq = (x, y) => Number.isFinite(x) && Number.isFinite(y) && Math.abs(x - y) <= tol;

exports.step = (A, B, C) => {
  const [a4, a5, b4, b5] = [A.dist, A.cum, B.dist, B.cum];
  if (b4 > 0 && eq(b5 - a5, b4)) return { km: b4, how: '누계' };
  if (a4 > 0 && eq(a4, b5)) return { km: a4, how: '다음역' };
  if (b4 > 0 && eq(b4, a5)) return { km: b4, how: '앞역' };
  if (b4 > 0 && eq(b4, b5)) return { km: b4, how: '동일열' };
  if (b4 === 0 && b5 === 0 && a4 > 0) return { km: a4, how: '구간연결' }; // 새 구간 시작행(0,0): 앞 행의 '다음 역' 거리
  if (!Number.isFinite(b5) && a4 > 0) return { km: a4, how: '다음역(누계없음)' };
  // 다음 행(C)까지 봐서 B의 두 열이 어느 방식인지 판별 (※ = 앞 행 값과 어긋나서 확인이 필요한 구간)
  if (C && b4 > 0 && eq(b5, C.dist)) return { km: b4, how: '앞역※', check: !eq(a4, b4) && !eq(a5, b4) };
  if (C && b5 > 0 && eq(b4, C.cum)) return { km: b5, how: '다음역※', check: !eq(a4, b5) };
  return null;
};

// 가능한 해석을 모두 돌려줘요. 두 해석이 우연히 모두 맞는 경우(예: 1.5,2.6 / 2.6,1.5)는 이웃 구간의 방식을 따라 결정해요.
exports.cands = (A, B) => {
  const [a4, a5, b4, b5] = [A.dist, A.cum, B.dist, B.cum];
  const out = [];
  if (b4 > 0 && eq(b5 - a5, b4)) out.push({ km: b4, how: '누계' });
  if (a4 > 0 && eq(a4, b5)) out.push({ km: a4, how: '다음역' });
  if (b4 > 0 && eq(b4, a5)) out.push({ km: b4, how: '앞역' });
  if (b4 > 0 && eq(b4, b5)) out.push({ km: b4, how: '동일열' });
  return out;
};
