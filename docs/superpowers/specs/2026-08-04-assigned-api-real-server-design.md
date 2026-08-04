# 담당 페이지 실서버 API 연동 설계

## 목표

`feat/todays-ter-81`에서 탐색, 장소 상세, 마이페이지 및 마이페이지 하위 화면을 Notion API 계약에 맞춰 실서버와 연결한다.

## 범위

- 탐색: `GET /places`, `GET /places/explore-filters`, `GET /places/editor-picks`
- 장소 상세: 인증 필요 `GET /places/{placeId}`
- 마이페이지: `GET /mypage`, `GET /mypage/social-connections`
- 마이페이지 하위: 사주 재생성, 알림 설정 조회·변경, 권한 조회·변경, 정책 조회

후기, 북마크 변경, 지도 SDK, 계정 연동 변경, 다른 도메인 API는 포함하지 않는다.

## 데이터 흐름

각 API는 `src/api`의 Axios 함수, `src/types`의 Zod 응답 스키마, `src/hooks`의 TanStack Query 훅 순으로 분리한다. 화면은 훅의 데이터·로딩·오류 상태를 소비하며 요청을 직접 수행하지 않는다. 공통 Axios 인스턴스가 로그인 사용자의 Bearer JWT와 JSON 헤더를 처리한다.

탐색의 `전체` 필터는 해당 쿼리 파라미터를 생략한다. 선택한 지역, 테마, 오행만 `/places` 요청에 전달한다.

장소 상세는 기존의 존재하지 않는 `/places/{placeId}` 가정 응답을 Notion 계약의 동일 경로·응답 형태로 확정한다. 이 API는 인증이 필요하므로 라우트 가드와 Axios 인터셉터의 기존 흐름을 그대로 사용한다.

마이페이지 프로필은 `reportId`, `nickname`, `profileImageUrl`을 소비한다. 계정 연결은 `policyUrl` 및 `connections` 배열을 소비한다. 알림·권한 수정은 저장 성공 시 관련 query key를 무효화하거나 반환 데이터를 갱신한다.

## 오류 처리와 검증

기존 Axios 오류 정규화를 유지한다. 화면은 가능한 범위에서 로딩과 오류를 표시하고, 기존 목 데이터는 API 응답이 없을 때만 화면 뼈대를 유지하는 용도로 남긴다. 각 스키마는 Notion 예시 payload를 계약 검증 스크립트로 검증하고, lint와 production build를 실행한다.
