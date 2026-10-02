# scripts — 원본 데이터를 앱 데이터로 바꾸는 도구
- `build-data.js`  실행 진입점 (`npm run build:data -- --all`)
- `config/`        노선 조립 설정: `routes.json`(코스), `lines.json`(이름 있는 노선)
- `sources/`       csv.js(CSV 읽기), api.js(API 읽기)
- `lib/`           resolve.js(두 열 해석), assemble.js(조각 이어붙이기), normalize.js(단일 노선 처리)
결과는 `src/data/generated/` 에 저장됩니다. 자세한 내용: ../docs/데이터-갱신.md
