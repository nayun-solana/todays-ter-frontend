# 담당 페이지 실서버 API 연동 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 탐색, 장소 상세, 마이페이지의 확정된 Notion API 계약을 현재 화면과 TanStack Query 훅에 연결한다.

**Architecture:** `src/types`에서 Zod 계약을 정의하고, `src/api`의 Axios 함수가 이를 검증한다. `src/hooks`는 query key와 mutation을 제공하며, 페이지는 해당 훅의 데이터와 변경 함수를 소비한다.

**Tech Stack:** React, TypeScript, Zod, Axios, TanStack Query, Vite.

## Global Constraints

- Notion에서 확정된 API 경로와 request/response shape만 사용한다.
- 전체 탐색 필터는 query parameter를 생략한다.
- 로그인 필수 장소 상세와 마이페이지 API는 기존 Axios JWT 인터셉터를 재사용한다.
- 사주 재생성은 필수 `name`·`gender`의 출처가 확정되지 않아 이번 변경에서 제외한다.
- 후기, 북마크 변경, 지도 SDK, 회원 탈퇴, 다른 담당 도메인은 변경하지 않는다.

---

### Task 1: API 계약 타입과 검증 갱신

**Files:**
- Modify: `src/types/search/search.ts`
- Modify: `src/types/place/place.ts`
- Modify: `src/types/my/my.ts`
- Modify: `scripts/check-assigned-api-contracts.ts`

**Interfaces:**
- Produces: 탐색 선택 파라미터, 일반 장소 상세, 마이페이지·알림·권한·정책의 Zod schema와 TypeScript 타입

- [ ] 확정 응답 예시를 Zod schema에 반영한다.
- [ ] 탐색 요청 타입에 `keyword`, `latitude`, `longitude`를 선택값으로 포함하고, UI의 전체 선택값은 타입에 넣지 않는다.
- [ ] 계약 검증 스크립트에서 모든 새 schema의 성공 payload를 `parse`한다.
- [ ] `pnpm exec tsx scripts/check-assigned-api-contracts.ts`를 실행한다.

### Task 2: API 함수와 Query 훅 구현

**Files:**
- Modify: `src/api/place.ts`
- Modify: `src/api/my.ts`
- Modify: `src/hooks/my/useMy.ts`
- Modify: `scripts/check-assigned-api-flow.ts`

**Interfaces:**
- Consumes: Task 1의 schema와 request type
- Produces: `getPlaceDetail`, `usePlaceDetail`, `useMyPage`, `useSocialConnections`, 알림·권한·정책 query/mutation hook

- [ ] `GET /places/{placeId}`의 result를 일반 장소 상세 schema로 검증한다.
- [ ] `/mypage` 계열 조회·PATCH 요청을 실서버 경로와 body로 교체한다.
- [ ] mutation 성공 후 해당 query key를 무효화하거나 서버 반환 상태로 갱신한다.
- [ ] 흐름 검증 스크립트의 기대 URL·payload를 새 계약과 일치시킨다.

### Task 3: 담당 화면 연결

**Files:**
- Modify: `src/pages/search/SearchPage.tsx`
- Modify: `src/pages/place/PlaceDetailPage.tsx`
- Modify: `src/pages/my/MyPage.tsx`
- Modify: `src/pages/my/AccountLinkPage.tsx`
- Modify: `src/pages/my/NotificationSettingsPage.tsx`
- Modify: `src/pages/my/PermissionsPage.tsx`

**Interfaces:**
- Consumes: Task 2의 query/mutation hook
- Produces: 선택 필터에 따른 탐색 요청, 인증 장소 상세 조회, 마이페이지 설정 조회·변경 UI

- [ ] 테마 카드 선택을 `themeType` 요청 파라미터와 연결하고 전체 선택은 파라미터를 생략한다.
- [ ] 장소 상세의 loading/error 상태와 서버 상세 필드 사용을 유지한다.
- [ ] 프로필, 계정 연결 및 연결 정책 URL을 서버 데이터로 렌더링한다.
- [ ] 알림은 `isPushEnabled`·`isMarketingEnabled`를, 권한은 `isLocationAllowed`·`isPhotoLibraryAllowed`를 서버 상태와 연결하고 API에 없는 필드는 서버 값을 보존한다.

### Task 4: 검증과 정리

**Files:**
- Modify only when verification exposes an API-contract issue in Tasks 1-3

- [ ] `pnpm exec tsx scripts/check-assigned-api-contracts.ts`를 실행한다.
- [ ] `pnpm exec tsx scripts/check-assigned-api-flow.ts`를 실행한다.
- [ ] `pnpm exec tsx scripts/check-assigned-msw.ts`를 실행한다.
- [ ] `pnpm lint`와 `pnpm build`를 실행한다.
- [ ] 변경 파일만 커밋한다.
