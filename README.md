# 오늘의 터 Frontend

## 프로젝트 소개

오늘의 터 웹 서비스의 프론트엔드 레포지토리입니다. 오행 기반 홈, 장소 탐색·상세, 온보딩·사주 리포트, 방문 기록과 후기, 마이페이지를 제공합니다. 모바일 화면을 기준으로 만든 PWA입니다.

## 배포 주소

https://todays-ter-frontend.vercel.app

## 주요 기능

- 홈: 오늘의 기운, 에너지 루틴, 추천 장소
- 탐색: 키워드 검색, 지역·고민·오행 필터, 무한 스크롤, 에디터 픽
- 온보딩: 사주 입력 → 리포트 생성(진행률 폴링) → 고민 유형 선택
- 리포트: 요약과 카테고리별 상세, 공유 링크 생성
- 장소: 상세 정보, 네이버 지도, 후기 목록·작성·수정·삭제, 저장, 길찾기
- 기록: 방문 기록 목록과 작성·수정
- 마이: 프로필, 계정 연결, 사주·고민 수정, 권한, 약관, 탈퇴
- PWA: 홈 화면 설치, 정적 자산 캐시, 새 버전 안내

## 구현 현황

배포된 API 명세(`/v3/api-docs`)와 실제 호출로 대조한 결과입니다. (2026-08-11 기준)

| 기능                                                 | 상태       | 비고                                               |
| ---------------------------------------------------- | ---------- | -------------------------------------------------- |
| 카카오 로그인·로그아웃·토큰 재발급                   | 실연동     |                                                    |
| 소셜 로그인(Apple·Google)                            | UI만       | BE 미구현 — 버튼 비활성 상태로 노출                |
| 게스트 세션·비회원 온보딩(사주·고민)                 | 실연동     |                                                    |
| 사주 리포트 생성·진행률 폴링·요약·카테고리 상세      | 실연동     |                                                    |
| 홈(인사말·오늘의 기운·에너지 루틴·추천 장소)         | 실연동     |                                                    |
| 탐색(검색·지역/고민/오행 필터·무한 스크롤·에디터 픽) | 실연동     |                                                    |
| 장소 상세(정보·후기·저장·길찾기)                     | 실연동     | 지도는 네이버 지도 SDK, 길찾기는 서버 `mapUrl`     |
| 방문 기록(목록·작성·수정·삭제)                       | 실연동     |                                                    |
| 추천 터 상세·공유 링크                               | 실연동     |                                                    |
| 마이(프로필·계정 연결·사주 수정·탈퇴)                | 실연동     |                                                    |
| PWA(설치·자산 캐시·새 버전 안내)                     | 실연동     | 빌드 설정                                          |
| 알림(목록·미읽음 개수·읽음 처리·설정)                | **미노출** | `/notifications/*` 서버 미배포 — 진입점 제거(#186) |
| 권한·약관 화면                                       | **UI만**   | `/mypage/*` 서버 미배포                            |
| 마이 → 사주 리포트 다시보기                          | **UI만**   | `GET /fortune-reports/me` 서버 미배포              |
| 고민 유형 수정                                       | **UI만**   | 회원용 저장 API 없음(게스트 전용만 존재)           |

**목데이터로 동작하는 화면은 없습니다.** 개발용 MSW 모킹을 제거했고, 서버 응답이 없으면 화면을 임의의 값으로 채우지 않고 로딩·에러 상태를 그대로 드러냅니다. 위 `UI만` 항목은 화면과 API 호출까지 구현돼 있고 서버 배포만 남은 상태입니다. `미노출` 항목은 화면·API 코드는 그대로 두되 앱 안에서 들어가는 경로를 없앤 상태로, 서버가 배포되면 진입점만 되살리면 됩니다.

## 기술 스택

| 구분         | 사용 기술                                                      |
| ------------ | -------------------------------------------------------------- |
| UI           | React 19, TypeScript, Tailwind CSS 4, `clsx`, `tailwind-merge` |
| 라우팅       | React Router 8, 라우트 단위 lazy loading                       |
| 상태·폼·통신 | TanStack Query 5, Zustand, React Hook Form, Axios, Zod         |
| 시각화·모션  | Recharts, Motion, Lucide React                                 |
| 테스트       | Vitest                                                         |
| PWA          | `vite-plugin-pwa`, Workbox                                     |
| 개발 환경    | Vite, pnpm, ESLint, Prettier                                   |

## 프로젝트 구조

```text
src/
├── app/          # 라우팅, 라우트 가드, QueryClient 설정
├── pages/        # 화면 단위 기능
├── components/   # 버튼, 헤더, 입력, 네비게이션 등 공용 UI
├── api/          # Axios 인스턴스, 도메인별 API 함수, 토큰 재발급
├── hooks/        # TanStack Query 도메인 훅
├── stores/       # Zustand 전역 상태(인증)
├── lib/          # 날짜·오행·지도 로더 등 순수 유틸
├── types/        # Zod 스키마와 API 타입
└── assets/       # 아이콘과 이미지
```

## 실행 방법

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

환경 변수는 `.env.local`에 넣습니다.

- `VITE_NAVER_MAP_CLIENT_ID`: 네이버 지도 Client ID. 없으면 장소 상세의 지도가 회색 박스로 대체됩니다.
- **API 주소를 지정하는 환경 변수는 없습니다.** Axios는 항상 상대 경로로 호출하고, 아래 프록시·rewrite가 운영 API로 넘깁니다.

## 자주 사용하는 명령어

```bash
pnpm dev
pnpm lint
pnpm test
pnpm build
pnpm format
```

- `pnpm dev`: 개발 서버 실행
- `pnpm lint`: 코드 규칙 검사
- `pnpm test`: Vitest 단위 테스트 실행
- `pnpm build`: 타입 검사와 프로덕션 빌드
- `pnpm format`: Prettier 기준으로 코드 포맷 정리

CI가 `pnpm lint` → `pnpm test` → `pnpm build` 순으로 실행하므로, PR을 올리기 전에 셋 다 확인합니다.

```bash
pnpm lint
pnpm test
pnpm build
```

## API 연동

- 도메인별 API 함수와 TanStack Query 훅으로 화면에 연결합니다.
- 응답은 `ApiResponse.result`를 꺼낸 뒤 Zod로 검증합니다. 계약이 어긋나면 화면이 아니라 파싱에서 먼저 드러납니다.
- Axios는 `baseURL` 없이 **상대 경로**로만 호출합니다. 게스트 세션 쿠키가 `SameSite` 제약을 받기 때문에, 브라우저 관점에서 같은 오리진이어야 쿠키가 실립니다.
  - 개발: `vite.config.ts`의 `API_PATHS` 프록시
  - 운영: `vercel.json`의 `rewrites`
- ⚠️ **BE 경로를 추가할 때는 두 파일을 함께 수정해야 합니다.** 한쪽만 고치면 개발이나 운영 중 한 곳에서만 동작합니다.
- BE가 `/api` 접두어 없이 도메인 루트에 경로를 열어둬서(`/home`, `/places` 등) 프록시 대상 경로를 하나씩 나열합니다.
- 그 결과 앱 라우트와 API 접두어가 겹칩니다(`/home`, `/records` 등). 개발 서버는 문서 요청(`Accept: text/html`)을 프록시에서 제외해, 주소창으로 연 화면이 API JSON으로 뜨는 것을 막습니다.

## 인증 구조

- **회원**: 카카오 로그인으로 `accessToken`을 받습니다. 단일 소스는 Zustand 스토어이고 `localStorage`에는 새로고침 복원용으로만 미러링합니다. refresh 토큰은 BE가 HttpOnly 쿠키로만 내려주므로 프론트가 보관하지 않습니다.
- **게스트**: `guest_id` 쿠키로 비회원 온보딩을 진행합니다. 세션 없이 주소만으로 들어온 방문자는 `SessionGate`가 로그인 화면으로 보냅니다.
- **토큰 재발급**: 401 응답을 받으면 `POST /auth/reissue`로 한 번 재발급한 뒤 원 요청을 재시도합니다. 재발급이 401·403이면 세션을 종료하고, 라우트 가드가 로그인 화면으로 보냅니다.
- **라우트 가드**: `SessionGate`(세션 유무), `RequireMember`(회원 전용 화면), `RequireMemberTab`(탭은 잠금 화면 표시), `RequireRecommendationAccess`(추천 상세 접근)를 씁니다.

## 트러블슈팅

개발하면서 실제로 겪고 해결한 문제들입니다. 같은 함정을 다시 밟지 않도록 원인까지 남깁니다.

### 로컬에서는 되는데 배포본에서만 비회원 온보딩이 401

게스트 세션은 `guest_id` 쿠키로 식별하는데, 이 쿠키가 `SameSite` 제약을 받아 다른 오리진으로 나가는 요청에는 실리지 않았습니다. Axios에서 BE 도메인을 직접 부르면 쿠키가 빠져 매번 401이 났습니다.

→ Axios는 `baseURL` 없이 **상대 경로로만** 호출하고, 개발은 Vite 프록시, 운영은 Vercel rewrite로 브라우저 관점의 같은 오리진을 만들어 해결했습니다.

### 주소창으로 화면을 열었는데 API JSON이 뜸

BE가 `/api` 접두어 없이 도메인 루트에 경로를 열어둬서(`/home`, `/records` 등) 앱 라우트와 프록시 대상 경로가 겹쳤습니다. 그대로 두면 `/home`을 주소창에 입력했을 때 화면 대신 JSON이 떴습니다.

→ 개발 프록시에서 문서 요청(`Accept: text/html`)을 제외해, 화면 이동은 SPA가, XHR은 프록시가 처리하도록 나눴습니다.

### 오프라인일 때 에러 화면이 안 뜨고 스켈레톤만 남음

TanStack Query는 브라우저가 오프라인이라고 판단하면 재시도를 멈추고 `fetchStatus: 'paused'` + `status: 'pending'` 상태로 붙잡아 둡니다. `isError`만 보고 분기하면 에러 UI가 영영 뜨지 않아 사용자가 다시 시도할 방법이 없었습니다.

→ 데이터가 실제로 손에 있는지(`data`)와 `fetchStatus`까지 함께 보고 로딩·실패·정상을 판정합니다.

### 로그인 실패 한 번에 멀쩡한 세션이 날아감

401 응답을 전부 "세션 만료"로 간주해 토큰을 지우고 있었습니다. 그러다 보니 로그인 시도가 실패했을 뿐인데 이미 로그인돼 있던 세션까지 함께 사라졌습니다.

→ 401은 "세션 만료"와 "이 요청이 거부됨"을 구분해야 합니다. 세션 종료는 **토큰 재발급이 401·403으로 실패했을 때만** 하도록 좁혔습니다.

### 카카오 인가 코드가 두 번 전송돼 로그인 실패

인가 코드는 1회용이라 두 번 보내면 두 번째가 반드시 실패합니다. StrictMode가 이펙트를 mount → cleanup → mount로 두 번 실행하는데, `useRef` 가드는 컴포넌트가 다시 마운트되면 초기화돼 막지 못했습니다.

→ 이미 시도한 코드를 모듈 스코프에 기억해 재마운트와 무관하게 한 번만 보냅니다. 콜백도 구독이 끊겨도 완결되도록 `mutateAsync`로 바꿨습니다.

### 사주 저장이 실패해도 다음 단계로 넘어가 리포트 생성이 400

저장 결과와 무관하게(`onSettled`) 다음 화면으로 이동하던 코드가 남아 있었습니다. 사주가 저장되지 않은 채 리포트 생성으로 넘어가 400이 났고, 사용자에게는 원인이 보이지 않았습니다.

→ 성공했을 때만 이동하고, 실패는 화면에 문구로 드러냅니다.

## 협업 흐름

모든 작업은 GitHub Issue를 먼저 생성한 뒤, Notion 작업 티켓과 연결되는 브랜치를 생성해 진행합니다.

1. GitHub Issue 생성
2. Notion 작업 티켓 자동 생성 확인
3. `dev` 브랜치에서 최신 코드 반영
4. `<type>/todays-ter-이슈번호` 형식으로 작업 브랜치 생성
5. 작업 후 커밋 및 push
6. 작업 브랜치에서 `dev` 브랜치로 PR 생성
7. 최소 1명 이상 리뷰 후 merge
8. 평가 또는 배포 시점에만 `dev`에서 `main`으로 PR 생성

```bash
git checkout dev
git pull origin dev
git checkout -b feature/todays-ter-12
```

## 브랜치 전략

- `main`: 배포 가능한 안정 버전
- `dev`: 개발 통합 브랜치
- `<type>/todays-ter-이슈번호`: 작업 브랜치

예시:

- `feature/todays-ter-12`
- `fix/todays-ter-15`
- `chore/todays-ter-21`

브랜치명은 `feature`, `fix`, `chore`, `design`, `docs`, `refactor`, `test` 유형의 `<type>/todays-ter-숫자` 형식만 허용합니다.

잘못된 예시:

- `feature/12-login-page`
- `hotfix/todays-ter-12`
- `feature/todays-ter-login`

`main` 브랜치는 평가 또는 배포 시점 전까지 직접 작업하지 않습니다. 모든 기능은 `dev`에 먼저 통합하고, 필요한 시점에만 `dev`에서 `main`으로 PR을 생성합니다.

## 커밋 컨벤션

- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 스타일 변경
- `refactor`: 리팩터링
- `chore`: 설정/기타 작업
- `design`: UI 디자인/레이아웃 변경

커밋 메시지는 가능하면 관련 이슈 번호를 함께 작성합니다.

```bash
git commit -m "feat: 로그인 페이지 구현 (#12)"
```

## PR 규칙

- 작업 브랜치에서 `dev`로 PR 생성
- 최소 1명 이상 리뷰 후 merge
- PR 본문에 관련 이슈 번호 작성
- merge 전 `pnpm lint`, `pnpm build` 확인
- `main`, `dev` 브랜치에는 직접 push 금지

PR 본문에는 아래 형식으로 관련 이슈를 연결합니다.

```md
Refs #12
```

PR merge 시 이슈까지 자동으로 닫고 싶다면 아래 형식을 사용합니다.

```md
Closes #12
```

## GitHub 보호 규칙

- `main`: 직접 push 금지, PR 필수, 평가/배포 시점에만 merge
- `dev`: 직접 push 금지, PR 필수, 리뷰 1명 이상 필수
- 작업 브랜치: `<type>/todays-ter-숫자` 형식만 사용

## Issue 라벨

- `feature`: 기능 개발
- `bug`: 버그 수정
- `docs`: 문서 수정
- `chore`: 설정/기타 작업
- `design`: UI 디자인/레이아웃
- `refactor`: 리팩터링
- `test`: 테스트
- `question`: 논의가 필요한 내용

## Project 보드

작업 상태는 Notion 작업 티켓 보드에서 자동으로 관리합니다.

- `이슈`: GitHub Issue가 생성된 상태
- `진행 중`: `<type>/todays-ter-이슈번호` 브랜치가 생성된 상태
- `리뷰 중`: PR이 생성된 상태
- `완료`: PR이 merge된 상태

예시:

1. GitHub Issue `#13` 생성
2. Notion 티켓 `todays-ter-13` 자동 생성
3. `feature/todays-ter-13` 브랜치 생성
4. Notion 상태가 `진행 중`으로 변경
5. PR 생성 시 `리뷰 중`으로 변경
6. PR merge 시 `완료`로 변경

작업 티켓 보드: https://app.notion.com/p/71b6e18aff5e45759bd893b57a3ee9da?v=390ca071b41481c4aadd000c2a647bde
