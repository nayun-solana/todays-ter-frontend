# 오늘의 터 Frontend

## 프로젝트 소개

오늘의 터 프론트엔드 레포지토리입니다.

## 기술 스택

- React
- TypeScript
- Vite
- ESLint
- Prettier

## 실행 방법

```bash
pnpm install
pnpm dev
```

## 협업 흐름

모든 작업은 GitHub Issue를 먼저 생성한 뒤, 이슈 번호를 기준으로 브랜치를 생성해 진행합니다.

1. GitHub Issue 생성
2. `dev` 브랜치에서 최신 코드 반영
3. 이슈 번호 기반 작업 브랜치 생성
4. 작업 후 커밋 및 push
5. 작업 브랜치에서 `dev` 브랜치로 PR 생성
6. 최소 1명 이상 리뷰 후 merge
7. 평가 또는 배포 시점에만 `dev`에서 `main`으로 PR 생성

```bash
git checkout dev
git pull origin dev
git checkout -b feature/12-login-page
```

## 브랜치 전략

- `main`: 배포 가능한 안정 버전
- `dev`: 개발 통합 브랜치
- `feature/이슈번호-작업명`: 기능 개발 브랜치
- `fix/이슈번호-작업명`: 버그 수정 브랜치
- `docs/이슈번호-작업명`: 문서 수정 브랜치
- `chore/이슈번호-작업명`: 설정/기타 작업 브랜치

예시:

- `feature/12-login-page`
- `feature/15-common-button`
- `docs/18-update-readme`
- `chore/21-branch-protection`

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
- `feature/*`, `fix/*`, `docs/*`, `chore/*`: 작업자 push 가능

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

작업 상태는 GitHub Project 보드에서 관리합니다.

- `Todo`: 작업 예정
- `In Progress`: 작업 진행 중
- `Review`: PR 리뷰 중
- `Done`: 완료

Issue 생성 후 담당자, 라벨, Project 상태를 지정합니다. 작업이 끝나면 PR을 생성하고, PR이 merge되면 Issue와 Project 상태를 완료 처리합니다.
