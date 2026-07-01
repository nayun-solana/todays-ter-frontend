# 오늘의 터 Frontend

## 프로젝트 소개

오늘의 터 FE 레포지토리입니다.

## 기술 스택

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Zustand
- Tailwind CSS
- React Hook Form
- Zod
- Axios
- ESLint
- Prettier

## 주요 라이브러리 역할

프로젝트에서 사용하는 주요 라이브러리와 역할은 아래와 같습니다.

| 라이브러리      | 역할                                          | 사용 예시                                    |
| --------------- | --------------------------------------------- | -------------------------------------------- |
| React           | 화면을 컴포넌트 단위로 만드는 UI 라이브러리   | 버튼, 헤더, 페이지 구성                      |
| TypeScript      | JavaScript에 타입을 추가해 오류를 줄이는 도구 | props 타입, API 응답 타입 정의               |
| Vite            | 빠른 개발 서버와 빌드 도구                    | `pnpm dev`, `pnpm build`                     |
| React Router    | 페이지 이동과 라우팅 관리                     | 로그인 페이지, 메인 페이지, 상세 페이지 이동 |
| TanStack Query  | 서버 API 데이터 상태 관리                     | 게시글 목록 조회, 사용자 정보 조회           |
| Zustand         | 전역 상태 관리                                | 로그인 사용자 정보, 모달 열림 상태           |
| Tailwind CSS    | CSS 클래스로 빠르게 UI 스타일 작성            | 여백, 색상, 반응형 레이아웃                  |
| clsx            | 조건에 따라 `className` 조합                  | 선택된 탭 스타일 변경                        |
| tailwind-merge  | Tailwind 클래스 충돌 정리                     | `bg-black`과 `bg-red-500` 중 마지막 값 적용  |
| React Hook Form | 입력 폼 상태 관리                             | 로그인, 회원가입, 글 작성 폼                 |
| Zod             | 입력값 검증                                   | 이메일 형식, 비밀번호 길이, 필수값 확인      |
| Axios           | API 요청 관리                                 | 로그인 요청, 데이터 조회, 공통 에러 처리     |
| ESLint          | 코드 문제 검사                                | 사용하지 않는 변수, React Hook 규칙 검사     |
| Prettier        | 코드 포맷 자동 정리                           | 들여쓰기, 따옴표, 줄바꿈 통일                |

### 라이브러리 사용 기준

- 화면 이동이 필요한 경우 `React Router`를 사용합니다.
- 서버에서 데이터를 가져오거나 저장하는 경우 `TanStack Query`를 사용합니다.
- 여러 화면에서 공유해야 하는 클라이언트 상태는 `Zustand`를 사용합니다.
- 입력 폼은 `React Hook Form`으로 관리하고, 검증은 `Zod`를 사용합니다.
- API 요청 공통 설정이 필요하면 `Axios`를 사용합니다.
- UI 스타일은 `Tailwind CSS`를 기본으로 사용합니다.
- 조건부 클래스 조합은 `clsx`, Tailwind 클래스 충돌 정리는 `tailwind-merge`를 사용합니다.

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

## 협업 흐름

모든 작업은 GitHub Issue를 먼저 생성한 뒤, Notion 작업 티켓과 연결되는 브랜치를 생성해 진행합니다.

1. GitHub Issue 생성
2. Notion 작업 티켓 자동 생성 확인
3. `dev` 브랜치에서 최신 코드 반영
4. `feature/todays-ter-이슈번호` 형식으로 작업 브랜치 생성
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
- `feature/todays-ter-이슈번호`: 작업 브랜치

예시:

- `feature/todays-ter-12`
- `feature/todays-ter-15`
- `feature/todays-ter-21`

브랜치명은 `feature/todays-ter-숫자` 형식만 허용합니다.

잘못된 예시:

- `feature/12-login-page`
- `fix/todays-ter-12`
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
- 작업 브랜치: `feature/todays-ter-숫자` 형식만 사용

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
- `진행 중`: `feature/todays-ter-이슈번호` 브랜치가 생성된 상태
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
