# 프로젝트 컨벤션 / 규칙

> 팀에서 확정된 작업 규칙 모음. 상세는 각 출처(README·AGENTS.md·docs/\*)로 연결. **규칙이 바뀌면 이 문서를 갱신.**

## 브랜치 / 이슈 / 커밋

- **작업 시작**: GitHub Issue 먼저 생성 → Notion 작업 티켓 `todays-ter-N` 자동 동기화(Action) → 브랜치 생성.
- **브랜치명**: `<type>/todays-ter-<이슈번호>`. type = `feature | fix | chore | design | docs | refactor | test` (CI `branch-name-check`가 강제). **작업 성격에 맞는 type을 쓸 것**(전부 feature 금지).
- **커밋**: Conventional (`feat|fix|docs|style|refactor|test|chore: ...`). 본문에 `Refs #N`. **`Co-Authored-By: Claude` 금지**(팀 지시).
- **PR**: base=`dev`, 리뷰 1명 이상. 본문 3섹션 필수 — `## 작업 내용` / `## 관련 이슈`(Closes/Refs #N) / `## 확인 사항`(lint·build 체크박스). `main`은 배포 시점에만.

## 검증

- UI/토큰/코드 변경 후 **`pnpm lint` + `pnpm build`** 실행(통과 확인).

## 디자인 시스템 (출처: `AGENTS.md`, node `2370:1227`)

- 색은 `primary`·`gray-*`·`ohaeng-*` 토큰 사용. **브랜드색·Figma 자산 외 raw hex 추가 금지.**
- Figma Typography = `typo-head-*`·`typo-body-*`·`typo-sub-*`·`typo-caption` 유틸 사용(임의 `text-[..]`/`leading-[..]` 조합 금지).
- Figma 명세 없는 variant/spacing/radius/shadow는 추측해 전역화하지 않음.
- ⚠️ 주의: `gray-3`(#c4c4c4)는 원래 텍스트색(text/Gray3). **border는 `gray-2`(#f4f4f5)**. (vault TIL `design-token-role-collision`)

## 명세 문서 (docs/)

- `docs/api-spec.md`(API), `docs/screen-spec.md`(화면), `docs/conventions.md`(이 문서). **명세 변경 시마다 갱신.**
- API **live source of truth = Swagger** `https://today-ter.kr/swagger-ui/index.html` (OpenAPI `/v3/api-docs`). BE 레포 `todays-ter/todays-ter-backend`(develop)로 필드 검증.
- 화면 명세 보드 = Figma `1311:1314`.

## API 연동 (데이터 레이어)

- **폴더 구조** (도메인별):
  - `src/api/<domain>.ts` — 엔드포인트 함수 (기존 `axiosInstance` + `getResult` 사용, #38 인프라 재사용)
  - `src/types/<domain>/*.ts` — 요청/응답 타입
  - `src/hooks/<domain>/*.ts` — react-query 훅 (`useQuery`/`useMutation`)
- **응답 봉투**: 모든 응답 `ApiResponse<T>` = `{ isSuccess, code, message, result }`. `getResult()`로 `result`만 추출.
- **타입 정의**: **API 경계(요청/응답)는 zod 스키마로 정의하고 `z.infer`로 타입 파생**(런타임 검증 — 개발 중 BE 계약 드리프트 방지). 순수 UI 타입은 plain TS 가능(예: `types/onboarding/report.ts`).
- **인증 2종**:
  - 회원 = `Authorization: Bearer <JWT>` (`token.ts` localStorage). dev JWT = `POST /auth/dev/token`.
  - 게스트 = HTTP 쿠키 `guest_id`(httpOnly, SameSite=Lax) → axios **`withCredentials: true`** + **dev Vite 프록시**(`/api`·`/auth` → today-ter.kr)로 same-origin 처리.
- **연동 대상**: **Swagger에 배포된 것만 실연동**. 미배포분은 스캐폴드/`(미확인)`/MSW mock. (현재 배포: 게스트 온보딩 + dev토큰)
- base URL: dev는 상대경로(프록시), prod `VITE_API_BASE_URL=https://today-ter.kr`. (`.env`는 gitignore, `.env.example` 참고)
