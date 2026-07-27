# 오늘의 터 Frontend

## 프로젝트 소개

오늘의 터 웹 서비스의 프론트엔드 레포지토리입니다. 오행 기반 홈, 장소 탐색·상세, 온보딩·리포트, 방문 기록, 마이페이지를 제공합니다.

## 배포 주소

https://todays-ter-frontend.vercel.app

## 주요 기능

- 홈: 오늘의 기운, 에너지 루틴, 추천 장소
- 탐색: 지역·오행 필터, 에디터 픽, 장소 상세 이동
- 온보딩: 비회원 사주 입력, 고민 선택, 분석 리포트
- 기록·후기: 방문 기록과 장소·추천 터 후기 작성 UI
- 마이: 프로필, 계정 연결, 알림·권한·사주·탈퇴 화면

## 기술 스택

| 구분         | 사용 기술                                                      |
| ------------ | -------------------------------------------------------------- |
| UI           | React 19, TypeScript, Tailwind CSS 4, `clsx`, `tailwind-merge` |
| 라우팅       | React Router 8, 라우트 단위 lazy loading                       |
| 상태·폼·통신 | TanStack Query, Zustand, React Hook Form, Axios, Zod           |
| 시각화·모션  | Recharts, Motion, Lucide React                                 |
| 개발 환경    | Vite, MSW, ESLint, Prettier                                    |

## 프로젝트 구조

```text
src/
├── app/          # 라우팅과 앱 레이아웃
├── components/   # 버튼, 헤더, 입력, 네비게이션 등 공용 UI
├── pages/        # 화면 단위 기능
├── api/          # Axios 기반 API 호출과 공통 응답 처리
├── hooks/        # TanStack Query 도메인 훅
├── types/        # Zod 스키마와 API 타입
└── mocks/        # 개발 환경 MSW 핸들러
```

## API와 개발 모킹

- 홈, 탐색, 마이페이지, 장소 상세, 온보딩, 추천 상세 API를 도메인별 API 함수와 Query 훅으로 연결합니다.
- 응답은 `ApiResponse.result`를 꺼낸 뒤 Zod로 검증합니다.
- 개발 환경에서는 MSW가 미배포 API를 모킹하고, 처리하지 않은 요청은 그대로 통과시킵니다.
- 비회원 온보딩은 쿠키 기반 세션을 사용하며, 개발 서버에서 `/api`, `/auth` 요청을 운영 API로 프록시합니다.

## 실행 방법

```bash
pnpm install
pnpm dev
```

## 자주 사용하는 명령어

```bash
pnpm dev
pnpm lint
pnpm build
pnpm format
```

- `pnpm dev`: 개발 서버 실행
- `pnpm lint`: 코드 규칙 검사
- `pnpm build`: 배포 가능한 상태로 빌드되는지 확인
- `pnpm format`: Prettier 기준으로 코드 포맷 정리

배포 전에는 아래 명령으로 타입 검사와 프로덕션 빌드를 확인합니다.

```bash
pnpm lint
pnpm build
```

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
