# Assigned API Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 탐색, 마이페이지, 장소 상세 중 계약이 충분한 조회 API를 기존 Axios·Zod·TanStack Query·MSW 흐름으로 UI까지 연결한다.

**Architecture:** 도메인별 Zod schema와 API 함수를 만들고 React Query hook을 통해 담당 page에 공급한다. 개발 환경에서는 Notion의 result 초안을 Swagger 공통 `ApiResponse<T>` 봉투로 감싼 MSW handler를 사용하며, 계약이 비어 있는 기능은 구현하지 않는다.

**Tech Stack:** React 19, TypeScript, Axios, TanStack Query, Zod, MSW, Vite

## Global Constraints

- API 공통 응답은 Swagger의 `isSuccess / code / message / result` 형식만 사용한다.
- 신규 dependency를 추가하지 않는다.
- 홈, 온보딩, 리포트, 기록과 후기 작성·수정 page는 변경하지 않는다.
- 알림, 사주 수정, 권한, 약관, 탈퇴, bookmark, 후기 목록·삭제는 계약 확정 전까지 구현하지 않는다.
- 49번 UI의 레이아웃, route와 기존 fallback 흐름을 유지한다.
- 모든 외부 응답은 UI 도달 전에 Zod로 검증한다.

---

### Task 1: 담당 API 계약 schema와 실행 가능한 계약 검사

**Files:**
- Create: `src/types/search/search.ts`
- Create: `src/types/place/place.ts`
- Create: `src/types/my/my.ts`
- Create: `scripts/check-assigned-api-contracts.ts`

**Interfaces:**
- Produces: `ExploreFiltersResponse`, `PlaceListResponse`, `EditorPicksResponse`
- Produces: `PlaceListParams`
- Produces: `PlaceDetailResponse`
- Produces: `MyPageResponse`, `SocialConnectionsResponse`

- [ ] **Step 1: 실패하는 계약 검사 작성**

`scripts/check-assigned-api-contracts.ts`에서 Node `assert`와 아직 존재하지 않는 schema를 import한다. 다음 최소 payload를 `parse`하고 nullable 필드를 검증한다.

```ts
import assert from 'node:assert/strict';

import {
  EditorPicksResponse,
  ExploreFiltersResponse,
  PlaceListResponse,
} from '../src/types/search/search';
import { PlaceDetailResponse } from '../src/types/place/place';
import { MyPageResponse, SocialConnectionsResponse } from '../src/types/my/my';

const filters = ExploreFiltersResponse.parse({
  regions: [{ code: 'ALL', name: '전체', displayOrder: 0 }],
  themes: [{ code: 'LOVE', name: '연애 터', placeCount: 3, displayOrder: 1 }],
  elements: [{ code: 'WATER', name: '수', displayOrder: 4 }],
});

const places = PlaceListResponse.parse({
  appliedFilters: {
    keyword: null,
    regionCode: 'ALL',
    themeType: null,
    elementType: 'WATER',
  },
  content: [{
    placeId: 2,
    placeName: '청계천 모전교',
    thumbnailUrl: null,
    summary: '도심 속 물길',
    element: { code: 'WATER', name: '수' },
    theme: { code: 'HEALTH', name: '건강 터' },
    averageRating: 4.8,
    distanceKm: null,
  }],
  page: { number: 0, size: 20, totalElements: 1, totalPages: 1, hasNext: false },
});

EditorPicksResponse.parse({
  content: [{
    placeId: 31,
    placeName: '북한산 둘레길',
    thumbnailUrl: null,
    summary: '목기 창작 코스',
    description: '창작 슬럼프를 깨는 오행 터',
    element: { code: 'WOOD', name: '목' },
    theme: { code: 'HEALTH', name: '건강 터' },
    averageRating: 4.9,
  }],
});

PlaceDetailResponse.parse({
  placeId: 2,
  placeName: '청계천 모전교',
  imageUrl: null,
  element: '수',
  hashtags: ['감정 회복'],
  description: {
    question: '이 터의 특징은 무엇인가요?',
    answer: '수 기운이 강한 장소예요.',
  },
  address: '서울 중구 무교동',
  latitude: 37.5665,
  longitude: 126.978,
  reviewCount: 9,
  isSaved: false,
  isVisited: false,
});

MyPageResponse.parse({
  nickname: '계수',
  profileImageUrl: null,
  email: 'user@example.com',
});

SocialConnectionsResponse.parse({
  connections: [{
    provider: 'KAKAO',
    isLinked: true,
    linkedEmail: 'user@kakao.com',
    linkedAt: '2026-07-19T10:00:00',
  }],
});

assert.equal(filters.regions[0].code, 'ALL');
assert.equal(places.content[0].distanceKm, null);
```

- [ ] **Step 2: 계약 검사가 실패하는지 확인**

Run: `pnpm exec tsx scripts/check-assigned-api-contracts.ts`

Expected: FAIL with module-not-found for the new schema files.

- [ ] **Step 3: 최소 Zod schema와 type 구현**

`src/types/search/search.ts`:

```ts
import { z } from 'zod';

export const ElementCode = z.enum(['WOOD', 'FIRE', 'EARTH', 'METAL', 'WATER']);
const ElementFilterCode = z.union([z.literal('ALL'), ElementCode]);
const NamedCode = z.object({ code: z.string().min(1), name: z.string().min(1) });
const Element = z.object({ code: ElementCode, name: z.string().min(1) });

export const ExploreFiltersResponse = z.object({
  regions: z.array(NamedCode.extend({ displayOrder: z.number().int() })),
  themes: z.array(NamedCode.extend({
    placeCount: z.number().int().nonnegative(),
    displayOrder: z.number().int(),
  })),
  elements: z.array(z.object({
    code: ElementFilterCode,
    name: z.string().min(1),
    displayOrder: z.number().int(),
  })),
});

export const PlaceListResponse = z.object({
  appliedFilters: z.object({
    keyword: z.string().nullable(),
    regionCode: z.string().nullable(),
    themeType: z.string().nullable(),
    elementType: ElementCode.nullable(),
  }),
  content: z.array(z.object({
    placeId: z.number().int().positive(),
    placeName: z.string().min(1),
    thumbnailUrl: z.string().url().nullable(),
    summary: z.string(),
    element: Element,
    theme: NamedCode,
    averageRating: z.number().min(0).max(5),
    distanceKm: z.number().nonnegative().nullable(),
  })),
  page: z.object({
    number: z.number().int().nonnegative(),
    size: z.number().int().positive(),
    totalElements: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
    hasNext: z.boolean(),
  }),
});

export const EditorPicksResponse = z.object({
  content: z.array(z.object({
    placeId: z.number().int().positive(),
    placeName: z.string().min(1),
    thumbnailUrl: z.string().url().nullable(),
    summary: z.string(),
    description: z.string(),
    element: Element,
    theme: NamedCode,
    averageRating: z.number().min(0).max(5),
  })),
});

export type PlaceListParams = {
  regionCode?: string;
  themeType?: string;
  elementType?: z.infer<typeof ElementCode>;
  page?: number;
  size?: number;
};
```

`src/types/place/place.ts`는 상세 응답을 위 검사 payload와 같은 필드로 정의하고 `element`는 `목/화/토/금/수` enum으로 제한한다.

`src/types/my/my.ts`는 profile image와 연결 email/date를 nullable로 정의하고 social provider는 Notion에 명시된 `KAKAO/NAVER/APPLE` enum으로 제한한다.

- [ ] **Step 4: 계약 검사가 통과하는지 확인**

Run: `pnpm exec tsx scripts/check-assigned-api-contracts.ts`

Expected: exit 0.

- [ ] **Step 5: 타입 검사**

Run: `pnpm build`

Expected: PASS.

- [ ] **Step 6: 커밋**

```bash
git add scripts/check-assigned-api-contracts.ts src/types/search/search.ts src/types/place/place.ts src/types/my/my.ts
git commit -m "feat: 담당 API 응답 계약 정의"
```

---

### Task 2: 탐색 API·query·MSW와 화면 연결

**Files:**
- Create: `src/api/search.ts`
- Create: `src/hooks/search/useSearch.ts`
- Modify: `src/mocks/handlers.ts`
- Modify: `src/pages/search/SearchPage.tsx`
- Modify: `src/components/PlaceListItem.tsx`

**Interfaces:**
- Consumes: Task 1의 search schema와 `PlaceListParams`
- Produces: `searchKeys`, `useExploreFilters`, `usePlaces`, `useEditorPicks`
- Produces: `getExploreFilters()`, `getPlaces(params)`, `getEditorPicks(limit)`

- [ ] **Step 1: search API 함수 작성**

`src/api/search.ts`:

```ts
export async function getExploreFilters() {
  const response = await axiosInstance.get<ApiResponse>('/places/explore-filters');
  return ExploreFiltersResponse.parse(getResult(response));
}

export async function getPlaces(params: PlaceListParams) {
  const response = await axiosInstance.get<ApiResponse>('/places', { params });
  return PlaceListResponse.parse(getResult(response));
}

export async function getEditorPicks(limit = 3) {
  const response = await axiosInstance.get<ApiResponse>('/places/editor-picks', {
    params: { limit },
  });
  return EditorPicksResponse.parse(getResult(response));
}
```

- [ ] **Step 2: query key와 hook 작성**

`src/hooks/search/useSearch.ts`:

```ts
export const searchKeys = {
  all: ['search'] as const,
  filters: () => [...searchKeys.all, 'filters'] as const,
  places: (params: PlaceListParams) => [...searchKeys.all, 'places', params] as const,
  editorPicks: (limit: number) => [...searchKeys.all, 'editor-picks', limit] as const,
};

export function useExploreFilters() {
  return useQuery({ queryKey: searchKeys.filters(), queryFn: getExploreFilters });
}

export function usePlaces(params: PlaceListParams) {
  return useQuery({ queryKey: searchKeys.places(params), queryFn: () => getPlaces(params) });
}

export function useEditorPicks(limit = 3) {
  return useQuery({
    queryKey: searchKeys.editorPicks(limit),
    queryFn: () => getEditorPicks(limit),
  });
}
```

- [ ] **Step 3: MSW handler 추가**

`src/mocks/handlers.ts`에 다음 GET handler를 추가한다.

- `/places/explore-filters`: region/theme/element metadata
- `/places`: `regionCode`, `elementType`, `page`, `size`를 읽고 mock 장소를 필터링
- `/places/editor-picks`: `limit`만큼 mock editor pick 반환

모든 handler는 기존 `ok(result)`를 사용하고 `PlaceListResponse`와 같은 pagination shape를 반환한다.
정적 `/places/editor-picks` handler는 이후 Task 3에서 추가할 동적 `/places/:placeId` handler보다 앞에 둔다.

- [ ] **Step 4: 탐색 화면 연결**

`SearchPage.tsx`에서:

- 지역 state를 표시명이 아닌 `regionCode`로 저장한다.
- `element` URL parameter를 uppercase `elementType`으로 변환한다.
- `useExploreFilters`, `usePlaces`, `useEditorPicks`를 호출한다.
- 응답이 아직 없거나 실패하면 기존 상수 데이터를 fallback으로 사용한다.
- API의 single theme은 기존 `tags` prop에 `[theme.name.replace(/ 터$/, '')]`로 전달한다.
- `distanceKm === null`이면 거리 prop을 생략한다.
- theme icon은 code별 기존 SVG map으로 연결하고 알 수 없는 code는 기존 `themeOther`를 사용한다.
- editor pick은 API의 summary와 description을 그대로 표시한다.

- [ ] **Step 5: nullable 이미지·거리 지원**

`PlaceListItem.tsx`에 `thumbnailUrl?: string | null`, `distance?: string`을 추가한다.

- image가 있으면 `<img>`를 렌더링하고 없으면 기존 placeholder를 렌더링한다.
- distance가 없으면 별점 뒤 separator와 거리 텍스트를 렌더링하지 않는다.

- [ ] **Step 6: 검증**

Run:

```bash
pnpm exec tsx scripts/check-assigned-api-contracts.ts
pnpm lint
pnpm build
```

Expected: 모두 PASS.

- [ ] **Step 7: 커밋**

```bash
git add src/api/search.ts src/hooks/search/useSearch.ts src/mocks/handlers.ts src/pages/search/SearchPage.tsx src/components/PlaceListItem.tsx
git commit -m "feat: 탐색 API와 MSW 연결"
```

---

### Task 3: 장소 상세 기본 조회 연결

**Files:**
- Create: `src/api/place.ts`
- Create: `src/hooks/place/usePlace.ts`
- Modify: `src/mocks/handlers.ts`
- Modify: `src/pages/place/PlaceDetailPage.tsx`

**Interfaces:**
- Consumes: Task 1의 `PlaceDetailResponse`
- Produces: `placeKeys.detail(placeId)`, `usePlaceDetail(placeId)`
- Produces: `getPlaceDetail(placeId)`

- [ ] **Step 1: 장소 상세 API와 hook 작성**

```ts
export async function getPlaceDetail(placeId: string) {
  const response = await axiosInstance.get<ApiResponse>(`/places/${placeId}`);
  return PlaceDetailResponse.parse(getResult(response));
}
```

```ts
export const placeKeys = {
  all: ['places'] as const,
  detail: (placeId: string) => [...placeKeys.all, 'detail', placeId] as const,
};

export function usePlaceDetail(placeId?: string) {
  return useQuery({
    queryKey: placeKeys.detail(placeId ?? ''),
    queryFn: () => getPlaceDetail(placeId!),
    enabled: Boolean(placeId),
  });
}
```

- [ ] **Step 2: placeId별 MSW handler 추가**

`GET /places/:placeId`가 `PlaceDetailResponse` shape의 result를 반환하도록 한다. search mock에 존재하는 ID는 상세 mock과 연결하고, 알 수 없는 ID는 HTTP 404와 `ApiResponse` 실패 봉투를 반환한다. 동적 handler는 `/places/editor-picks` handler보다 뒤에 둔다.

- [ ] **Step 3: 장소 상세 화면 연결**

- `usePlaceDetail(id)` 결과를 사용한다.
- query가 준비되지 않았거나 실패하면 기존 `PLACE`를 fallback으로 유지한다.
- `ohaengByLabel(place.element)`로 오행 UI meta를 선택한다.
- `imageUrl`이 있으면 API 이미지를, 없으면 기존 local image를 사용한다.
- hashtags 첫 값을 현재 theme chip에 표시한다.
- description question/answer, address를 응답으로 표시한다.
- API에 없는 `addressDetail`은 fallback 장소에서만 표시한다.
- 후기 목록 state와 후기 수정·삭제 handler는 변경하지 않는다.
- 후기 tab의 숫자는 후기 목록 API가 제외된 동안 기존 `reviews.length`를 유지한다.

- [ ] **Step 4: 검증**

Run:

```bash
pnpm exec tsx scripts/check-assigned-api-contracts.ts
pnpm lint
pnpm build
```

Expected: 모두 PASS.

- [ ] **Step 5: 커밋**

```bash
git add src/api/place.ts src/hooks/place/usePlace.ts src/mocks/handlers.ts src/pages/place/PlaceDetailPage.tsx
git commit -m "feat: 장소 상세 기본 정보 API 연결"
```

---

### Task 4: 마이페이지 프로필·계정 연동 조회

**Files:**
- Create: `src/api/my.ts`
- Create: `src/hooks/my/useMy.ts`
- Modify: `src/mocks/handlers.ts`
- Modify: `src/pages/my/MyPage.tsx`
- Modify: `src/pages/my/AccountLinkPage.tsx`

**Interfaces:**
- Consumes: Task 1의 `MyPageResponse`, `SocialConnectionsResponse`
- Produces: `myKeys.profile()`, `myKeys.socialConnections()`
- Produces: `useMyPage`, `useSocialConnections`

- [ ] **Step 1: my API와 query hook 작성**

`GET /mypage`, `GET /mypage/social-connections`를 `axiosInstance`와 `getResult`로 호출하고 각각 Zod parse한다. query key는 `['my', 'profile']`, `['my', 'social-connections']`를 사용한다.

- [ ] **Step 2: MSW handler 추가**

- `/mypage`: nickname, nullable profile image, email 반환
- `/mypage/social-connections`: KAKAO linked connection과 나머지 unlinked connection 반환

- [ ] **Step 3: 마이페이지 프로필 연결**

- `useMyPage()`를 호출한다.
- data가 있으면 nickname과 profile image를 표시한다.
- image가 null이면 기존 `DefaultAvatar`를 사용한다.
- 주 오행·보완 오행·리포트 버튼은 계약이 없으므로 변경하지 않는다.

- [ ] **Step 4: 계정 연동 조회 연결**

- `useSocialConnections()`를 호출한다.
- `connections.find(connection => connection.isLinked)`를 표시한다.
- provider는 `KAKAO → 카카오`, `NAVER → 네이버`, `APPLE → 애플`로 화면에서 최소 매핑한다.
- 연결이 없으면 `연결된 계정이 없습니다.`를 표시한다.
- query가 준비되지 않았거나 실패하면 기존 카카오 계정 시안 값을 fallback으로 유지한다.
- 버튼 동작은 변경하지 않는다.

- [ ] **Step 5: 검증**

Run:

```bash
pnpm exec tsx scripts/check-assigned-api-contracts.ts
pnpm lint
pnpm build
```

Expected: 모두 PASS.

- [ ] **Step 6: 커밋**

```bash
git add src/api/my.ts src/hooks/my/useMy.ts src/mocks/handlers.ts src/pages/my/MyPage.tsx src/pages/my/AccountLinkPage.tsx
git commit -m "feat: 마이페이지 조회 API 연결"
```

---

### Task 5: 구현 1차 검토 — 범위·계약·불필요 코드

**Files:**
- Review: all files changed by Tasks 1-4
- Modify: only files with confirmed findings

- [ ] **Step 1: 변경 범위 확인**

Run:

```bash
git diff --name-only 823cfc7..HEAD -- src scripts
```

Expected: 계획에 적힌 담당 API/types/hooks/mocks/pages/components/scripts 파일만 출력된다.

- [ ] **Step 2: 계약 검토**

- 모든 request가 `axiosInstance`를 사용하는지 확인한다.
- 모든 response가 `getResult` 후 Zod parse되는지 확인한다.
- MSW payload가 contract 검사와 같은 field/nullability를 사용하는지 확인한다.
- Notion의 `resultType / data` 형식이 코드에 없는지 `rg "resultType|\\bdata:" src/api src/types src/mocks`로 확인한다.
- 제외 endpoint가 추가되지 않았는지 `rg "notifications|withdraw|birth-info|permissions|bookmark|reviews" src/api src/hooks`로 확인한다.

- [ ] **Step 3: YAGNI 검토**

- 한 번만 쓰는 factory, generic wrapper, 새 dependency가 없는지 확인한다.
- server state를 Zustand 또는 page local state에 복제하지 않았는지 확인한다.
- 발견 사항은 즉시 최소 수정한다.

- [ ] **Step 4: 수정 후 검증**

Run:

```bash
pnpm exec tsx scripts/check-assigned-api-contracts.ts
pnpm lint
pnpm build
```

Expected: 모두 PASS.

- [ ] **Step 5: 검토 수정 커밋**

변경이 있을 때만:

```bash
git add <수정된 담당 파일>
git commit -m "fix: 담당 API 1차 검토 반영"
```

---

### Task 6: 구현 2차 검토 — 화면 데이터 흐름·경계 상태

**Files:**
- Review: `src/pages/search/SearchPage.tsx`
- Review: `src/pages/place/PlaceDetailPage.tsx`
- Review: `src/pages/my/MyPage.tsx`
- Review: `src/pages/my/AccountLinkPage.tsx`
- Review: domain query keys and MSW handlers
- Modify: only files with confirmed findings

- [ ] **Step 1: 화면별 데이터 흐름 검토**

- 탐색 region/element 변경이 `searchKeys.places(params)`를 바꾸는지 확인한다.
- nullable thumbnail/distance가 깨진 img 또는 불필요한 separator를 만들지 않는지 확인한다.
- 장소 detail route ID가 query key, request path, MSW route에 동일하게 쓰이는지 확인한다.
- MyPage의 null profile과 social connection 없음 상태를 확인한다.
- 기존 fallback이 query data를 덮어쓰지 않는지 확인한다.

- [ ] **Step 2: React Query 경계 검토**

- query key에 모든 request parameter가 포함되는지 확인한다.
- render 중 새 API 호출이나 직접 Axios 호출이 없는지 확인한다.
- `enabled`가 없는 route ID로 요청을 만들지 않는지 확인한다.
- mutation/cache invalidation이 필요 없는 조회 범위만 존재하는지 확인한다.

- [ ] **Step 3: 개발 화면 smoke check**

Run: `pnpm exec vite --host --port 5174`

Check:

- `/search`
- `/place/2`
- `/my`
- `/my/account-links`

Expected: console error 없이 MSW 데이터가 표시되고 기존 라우팅이 유지된다.

- [ ] **Step 4: 발견 사항 수정과 최종 검증**

Run:

```bash
pnpm exec tsx scripts/check-assigned-api-contracts.ts
pnpm lint
pnpm build
```

Expected: 모두 PASS.

- [ ] **Step 5: 검토 수정 커밋**

변경이 있을 때만:

```bash
git add <수정된 담당 파일>
git commit -m "fix: 담당 API 2차 검토 반영"
```
