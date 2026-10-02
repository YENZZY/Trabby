# Trabby (트라비)

## 실행 (Windows + Android Studio 에뮬레이터)
1. 에뮬레이터를 먼저 켭니다.
2. `run.bat` 더블클릭 (또는 `npm install` → `npx expo start -c`), 터미널에서 `a` 키.
3. 에뮬레이터엔 걸음 센서가 없으니 홈 하단 `+300 걸음 (DEV)` 버튼으로 테스트하세요.
버전 경고가 뜨면 `npx expo install --fix`

## 폴더 구조 (탭별)
```
app/                     라우트 연결만 (각 파일은 한 줄)
src/
  features/
    home/                홈 탭: HomeScreen, RouteMap, usePedometer
    lines/               노선도 탭: LinesScreen(노선 선택), LineDetailScreen(노선 상세)
    dex/                 도감 탭: DexScreen
    settings/            설정 탭: SettingsScreen
  shared/                Turtle 등 공용 컴포넌트
  store/                 useTrabby(상태·저장), useActive(지금 걷는 노선)
  lib/                   progress(걸음→거리→위치 계산)
  data/                  index.ts(노선 등록), generated/lineN.json(자동 생성, 앱이 읽는 유일한 데이터)
scripts/                 데이터 생성: sources/csv.js · sources/api.js → lib/normalize.js → build-data.js
data/stations.csv        임시 CSV
```

## 규칙: 걸음은 한 번에 한 노선에만
- 걸음은 지금 선택한 노선(`activeLine`) 하나에만 쌓여요.
- 다른 노선으로 바꾸면 이전 노선 진행도는 저장된 채 "일시정지"예요.

## 데이터 (임시 CSV → API 교체)
앱은 `src/data/generated/*.json` 만 읽어요. 소스가 CSV든 API든 같은 JSON이 나오므로 앱 코드는 안 바뀌어요.
```
npm run build:data                                   # 임시 CSV로 생성 (지금)
npm run fetch:data -- --url "<Open API 샘플 URL>"    # API로 교체할 때
npm run build:data -- --line 2                       # 다른 노선 생성
```
새 노선을 앱에 켜려면 `src/data/index.ts` 에 import 한 줄 + `LINE_DATA` 등록 한 줄.
3호선 대화~삼송(코레일 구간)은 서울교통공사 데이터에 없어서 `scripts/prefix/line3.json` 을 이어 붙여요.

## 모든 노선 한꺼번에 추가
1. **추천: 공공데이터포털 `서울교통공사_역간거리` (15044418)** CSV를 받아 `data/stations.csv` 로 저장 (로그인 없이 다운로드, 컬럼: 연번·호선·역명·역간거리·호선별누계)
   - 이 파일은 역간거리가 '이 역→다음 역' 방식이에요. 스크립트가 자동 판별하고, 안 맞으면 `--dist-mode prev|next` 로 지정하세요.
2. `npm run build:data -- --all` → 노선별 JSON과 `generated/index.ts`(등록)가 자동으로 만들어져요. 코드 수정 없음.
3. 출력의 노선별 역 개수를 확인하세요. 너무 적으면 ⚠ 가 떠요. (2호선 순환/지선, 5·6호선 지선은 직선 노선 기준이라 확인이 필요해요)

## 노선에 역이 늘어나면
- 완주 기록(`cleared`)은 그대로 유지돼요. 다시 클리어할 필요 없음.
- 완주 시점의 노선 길이(`clearedMeters`)를 저장해 두고, 지금 노선이 더 길면 홈에 "새 구간이 열렸어요!"를 보여주고 이어서 걸을 수 있어요.
- 끝까지 걸으면 CLEAR 화면이 다시 한 번 나와요.
## 데이터 갱신 (Windows)
`data/stations.csv` 를 새로 받아 넣고 `update-data.bat` 더블클릭.

## 설정 기능
- 닉네임 변경 / 알림(도착 알림: 앱을 켜 둔 동안 역 통과 시 안내, 새 구간 안내) / 테마(홈 배경, 3호선 테마는 3호선 완주 시 해금) / 언어(한국어만, English 준비 중) / FAQ·문의(`SUPPORT_EMAIL` 교체 필요) / 진행 초기화
- 걸음 센서 상태와 고정 보폭(60cm)을 보여줘요. Health Connect 연동은 아직 없어요.

## data 폴더의 CSV
- `data/*.csv` 를 전부 읽어요. 지금: `stations.csv`(3호선 임시), `everline.csv`(에버라인, 철도운영기관명/선명/역명/역간거리 형식)
- 같은 노선이 두 파일에 있으면 에러로 알려줘요. 서울교통공사 공식 CSV를 넣을 땐 임시 `stations.csv` 는 지우세요.
- 이름 노선(에버라인 등)은 `scripts/lines.json` 에 id(100 이상)/name/color 를 등록해야 만들어져요.
- '다음 역까지 거리'가 빈 구간이 중간에 있으면 어느 역인지 알려주고 멈춰요 (종점의 빈칸은 정상).

## 거리가 비었거나 0인 구간 (종점 제외)
- CSV의 거리는 "이 역 → 다음 역" 구간 값이고, 첫 행이 시점, 마지막 행(종점)은 빈칸이 정상이에요.
- 종점이 아닌데 비었거나 0이면: ① `data/fill.json` 수동값 → ② CSV의 누계 컬럼 차이 순으로 자동 보완해요.
- 둘 다 없으면 어느 구간인지 목록을 보여주고 멈춰요. 예: `{ "3호선/약수": 0.7 }` 를 `data/fill.json` 에 추가.

## 섞인 형식 CSV (data/subway.csv) 읽는 방식
- 이 파일은 코레일 구간(다음 역 거리 + 앞 역 거리)과 서울교통공사 구간(앞 역 거리 + 누계)이 섞여 있고, 일부 구간은 두 열이 뒤바뀌어 있어요.
- `scripts/lib/resolve.js` 가 인접한 두 역의 값이 서로 맞는 해석을 고르고, 후보가 갈리면 이웃 구간의 방식을 따라가요.
- `scripts/routes.json` 이 노선별로 파일의 조각들을 이어 붙여요 (가지 코스, 순서 보정, 파일에 없는 구간 직접 입력, 역 이름 변경).
- 확인된 보완값은 `data/fill.json`, 위키백과 누계와 대조한 결과는 아래 표 참고.
  - 1호선 경인선: 광운대 55.1 / 청량리 60.6 / 서울역 68.4 / 용산 71.6 / 구로 80.1 / 인천 107.1 (모두 일치)
  - 5호선: 방화~하남검단산 52.9km = 본선 45.2 + 하남선 7.7
- 8호선 별내선은 파일의 행 순서가 실제와 달라서(동구릉·구리·장자호수공원·별내·다산 순) 값의 연결 관계를 따라 순서를 바로잡았어요. 구간 값은 파일 그대로예요.
