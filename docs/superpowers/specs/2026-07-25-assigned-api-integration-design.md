# 담당 영역 API 연동 설계

## 목표

현재 브랜치에 반영된 49번 UI를 기준으로 탐색, 마이페이지, 장소 상세 중 계약이 충분한 API만 MSW 선개발 방식으로 연결한다. 다른 담당자의 화면과 기존 API 흐름은 변경하지 않는다.

## 기준

- 실제 Swagger의 `isSuccess / code / message / result` 공통 응답을 사용한다.
- Swagger에 아직 없는 API의 path와 result 필드는 Notion 명세를 초안으로 사용한다.
- 필수 필드가 없거나 문서가 충돌하는 기능은 추측하지 않고 `docs/team-discussions.md`에 기록한 뒤 제외한다.
- 기존 `axiosInstance`, `getResult`, Zod parse, TanStack Query, dev 전용 MSW 흐름을 재사용한다.
- 새 라이브러리를 추가하지 않는다.
- 기존 UI 배치와 라우팅은 유지한다.

## 구현 범위

### 탐색

연결 대상:

- `GET /places/explore-filters`
- `GET /places`
- `GET /places/editor-picks`

화면 동작:

- 지역·테마·오행 메타데이터는 서버 응답으로 표시한다.
- 지역과 오행 선택을 `/places` query parameter에 반영한다.
- 장소 카드와 에디터 픽은 응답의 `placeId`로 `/place/:id`에 이동한다.
- 위치 좌표를 요청하지 않은 경우 거리 영역은 표시하지 않는다.
- 페이지네이션 UI가 없으므로 첫 페이지 20개만 조회한다.
- 검색창의 지도 이동과 테마 카드 클릭 동작은 정책이 없어 기존 상태를 유지한다.

### 마이페이지

연결 대상:

- `GET /mypage`
- `GET /mypage/social-connections`

화면 동작:

- 마이페이지 프로필의 닉네임과 프로필 이미지만 서버 응답으로 교체한다.
- 주 오행, 보완 오행, 리포트 ID는 응답 계약이 없어 기존 시안 값을 유지한다.
- 계정 연동 관리에서는 `isLinked`인 첫 연결의 provider와 email을 표시한다.
- 연결 변경·정책 버튼의 동작은 별도 계약이 없어 유지한다.

### 장소 상세

연결 대상:

- `GET /places/{placeId}`

화면 동작:

- 장소명, 이미지, 오행, 해시태그, 특징 설명, 주소를 응답으로 교체한다.
- 지도 SDK, 길찾기, 저장 토글은 계약 또는 공급자 결정이 없어 기존 상태를 유지한다.
- 후기 목록·내 후기 상단 고정·삭제는 담당 범위지만 필요한 소유자/식별자 계약이 없어 이번 구현에서는 제외한다.
- 후기 수정 버튼은 기존 수정 페이지로 이동만 유지하며 수정 페이지 API는 건드리지 않는다.
- 후기 tab의 숫자는 API 목록 계약이 확정될 때까지 기존 화면의 후기 state를 기준으로 유지한다.

## 제외 범위

- 알림 목록·읽음 처리·알림 설정
- 사주 정보 조회·수정·리포트 재생성
- 권한 설정
- 개인정보 및 약관
- 회원 탈퇴
- 일반 장소 저장
- 장소 후기 목록·작성·수정·삭제
- 지도와 길찾기
- 다른 담당자의 홈, 온보딩, 리포트, 기록 화면

제외 사유와 필요한 결정을 `docs/team-discussions.md`에서 관리한다.

## 구조

도메인별로 기존 패턴을 따른다.

```text
UI page
  → domain query hook
  → domain API function
  → axiosInstance
  → MSW handler
  → ApiResponse.result
  → Zod parse
  → UI
```

예상 파일:

- `src/types/search/search.ts`
- `src/api/search.ts`
- `src/hooks/search/useSearch.ts`
- `src/types/place/place.ts`
- `src/api/place.ts`
- `src/hooks/place/usePlace.ts`
- `src/types/my/my.ts`
- `src/api/my.ts`
- `src/hooks/my/useMy.ts`
- `src/mocks/handlers.ts`
- 담당 페이지와 장소 목록 공용 컴포넌트

## 상태 및 오류 처리

- MSW가 제공하는 정상 응답으로 UI 연동을 검증한다.
- 조회 중에는 현재 레이아웃이 크게 흔들리지 않도록 기존 시안 데이터를 fallback으로 유지한다.
- 빈 장소 목록은 빈 배열로 렌더링하고 별도의 새 UI를 추측해 추가하지 않는다.
- API 또는 Zod 오류 시 기존 시안 fallback을 유지한다. 실제 서버 배포 후 확정된 오류 UI로 교체한다.
- mutation은 이번 확정 범위에 없으므로 cache invalidation을 추가하지 않는다.

## 검증

- 각 MSW 응답이 Zod schema를 통과하는지 개발 화면에서 확인한다.
- 탐색 필터 변경 시 요청 query와 목록이 함께 변경되는지 확인한다.
- 탐색 카드에서 numeric `placeId` 상세 이동을 확인한다.
- 마이페이지와 계정 연결의 응답 반영을 확인한다.
- 장소 상세의 route parameter별 응답 반영을 확인한다.
- `pnpm lint`
- `pnpm build`

## 완료 조건

- 담당 세 화면이 raw Axios 호출 없이 query hook을 통해 데이터를 사용한다.
- mock payload와 Zod schema가 Notion 초안 및 Swagger 공통 응답 형식에 맞는다.
- 담당 외 화면과 기존 홈·온보딩 API 파일은 변경하지 않는다.
- 협의 대기 항목이 코드에 임의 계약으로 들어가지 않는다.
