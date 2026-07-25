# 팀 협의 사항

PM, Design, FE, Backend가 기능 구현 전에 합의해야 하는 내용을 모아둔다.

## 사용 규칙

- `협의 필요`: 명세가 없거나 서로 충돌하여 구현에서 제외한 항목
- `협의 완료`: 담당자 간 결론이 나서 구현 가능한 항목
- 결론이 나면 결정 내용, 담당자, 반영할 Notion/Swagger 링크를 함께 기록한다.
- API 공통 응답은 Swagger의 `isSuccess / code / message / result` 형식을 기준으로 한다.
- Swagger에 아직 없는 API는 Notion 명세를 초안으로 MSW 선개발하되, 필수 계약이 비어 있으면 임의로 만들지 않는다.

## 공통

### 협의 필요

- [ ] **Notion 응답 예시 통일**
  - 대상: Backend, FE
  - 내용: 일부 명세가 `resultType / error / data` 형식을 사용하고 있다.
  - 필요 결정: Swagger 공통 응답 형식으로 Notion 예시를 수정한다.

- [ ] **담당 API의 Swagger 등록 시점**
  - 대상: Backend, FE
  - 내용: 현재 Swagger에는 게스트 세션·온보딩 API만 등록되어 있다.
  - 필요 결정: 탐색·마이페이지·장소 API가 배포되면 FE의 MSW 계약과 실제 OpenAPI를 대조한다.

## 탐색

### 협의 필요

- [ ] **목록 페이지네이션 방식**
  - 대상: PM, Design, FE, Backend
  - 관련 API: `GET /places`
  - 내용: API는 `page`, `size`, `hasNext`를 제공하지만 UI에는 더보기·무한 스크롤 상태가 없다.
  - 필요 결정: 첫 페이지만 표시할지, 무한 스크롤 또는 더보기 UI를 추가할지 정한다.

- [ ] **현재 위치와 거리 표시 정책**
  - 대상: PM, Design, FE, Backend
  - 관련 API: `GET /places`
  - 내용: `latitude`, `longitude`가 없으면 `distanceKm`은 `null`이다.
  - 필요 결정: 위치 권한 거부·미지원 시 거리 영역을 숨길지 대체 문구를 표시할지 정한다.

- [ ] **지도에서 탐색 동작**
  - 대상: PM, Design, FE
  - 내용: 검색창 문구는 `지도에서 탐색`이지만 연결할 지도 화면·경로·지도 SDK가 정해지지 않았다.
  - 필요 결정: 이동 경로와 지도 공급자를 정한다.

## 마이페이지

### 협의 필요

- [ ] **마이페이지 카드 응답 필드 보완**
  - 대상: PM, FE, Backend
  - 관련 API: `GET /mypage`
  - 내용: UI에는 닉네임, 프로필 이미지, 주 오행, 보완 오행, 현재 리포트 ID가 필요하다. Notion 예시에는 닉네임·이미지·이메일만 있다.
  - 필요 결정: `primaryElement`, `complementaryElement`, `reportId` 제공 위치를 정한다.

- [ ] **내 사주 정보 조회 명세 작성**
  - 대상: FE, Backend
  - 관련 API: `GET /birth-info/me`
  - 내용: 응답 필드가 비어 있고 불필요해 보이는 페이지네이션 파라미터가 적혀 있다.
  - 필요 결정: 달력 유형, 생년월일, 출생시간, 출생시간 모름 여부와 인증 방식을 확정한다.

- [ ] **사주 수정·리포트 재생성 입력 범위**
  - 대상: PM, Design, FE, Backend
  - 관련 API: `POST /mypage/birth-info/regenerate`
  - 내용: API는 이름·성별·달력 유형·생년월일·출생시간을 요구하지만 현재 UI는 생년월일·시간만 수정한다.
  - 필요 결정: 기존 조회값을 함께 재전송할지, 변경 필드만 받도록 API를 수정할지 정한다.

- [ ] **알림 설정 필드 보완**
  - 대상: PM, Design, FE, Backend
  - 관련 API: `GET/PATCH /mypage/notification-settings`
  - 내용: UI에는 리마인드 활성, 주기, 시간, 저장한 터 알림, 서비스 알림, 마케팅 알림이 필요하다. 명세에는 `isPushEnabled`, `isMarketingEnabled`, `isNightMarketingEnabled`만 있다.
  - 필요 결정: UI 각 항목에 대응하는 API 필드와 enum을 확정한다.
  - 현재 처리: API 연동에서 제외하고 UI 로컬 상태를 유지한다.

- [ ] **알림 목록·읽음 처리 명세 작성**
  - 대상: PM, FE, Backend
  - 관련 API: `GET /notifications`, `PATCH /notifications/{notificationId}/read`, `PATCH /notifications/read-all`
  - 내용: 목록 응답, 페이지네이션, 알림 종류, 이동 대상, 읽음 처리 응답이 비어 있다.
  - 필요 결정: 필드와 알림 클릭 시 라우팅 규칙을 확정한다.

- [ ] **권한 설정의 책임 경계**
  - 대상: PM, FE, Backend
  - 관련 API: `GET/PATCH /mypage/permissions`
  - 내용: 브라우저/OS 권한은 서버 토글만으로 변경할 수 없다. UI는 위치·사진 두 항목이지만 API는 카메라·사진첩·위치 세 항목이다.
  - 필요 결정: 실제 기기 권한 안내인지 서버 동의 상태인지, 카메라와 사진첩을 UI에서 분리할지 정한다.

- [ ] **개인정보 및 약관 화면**
  - 대상: PM, Design, FE
  - 관련 API: `GET /mypage/policies`
  - 내용: API 초안은 있으나 현재 메뉴에 이동 경로와 상세 UI가 없다.
  - 필요 결정: 앱 내부 화면 또는 외부 URL 이동 방식을 정한다.

- [ ] **회원 탈퇴 계약 작성**
  - 대상: PM, FE, Backend
  - 관련 API: `DELETE /auth/withdraw`
  - 내용: 탈퇴 사유 request body, 성공·실패 응답, 인증 여부가 비어 있다. 문서에는 `토큰: No`로 적혀 있다.
  - 필요 결정: 탈퇴 사유 enum, 인증 방식, 성공 후 토큰·쿠키 정리 방식을 확정한다.

## 장소 상세

### 협의 완료

- [x] **후기 기능의 FE 담당 범위**
  - 결정: 장소 상세의 후기 목록 표시, 내 후기 상단 고정, 내 후기 삭제 요청까지 담당한다.
  - 제외: 후기 작성·수정 페이지의 API 연동은 다른 작업 범위로 남긴다.
  - 화면 동작: 수정 버튼은 기존 수정 페이지로 이동만 유지한다.

### 협의 필요

- [ ] **일반 장소 저장 API**
  - 대상: PM, FE, Backend
  - 내용: 현재 문서의 저장 API는 `/recommendations/{recommendationId}/bookmark`이며 일반 장소 상세의 `placeId`와 식별자가 다르다.
  - 필요 결정: 일반 장소용 bookmark API가 별도로 있는지, recommendation ID를 장소 상세까지 전달할지 정한다.

- [ ] **내 후기 식별 필드**
  - 대상: FE, Backend
  - 관련 API: `GET /places/{placeId}/reviews`
  - 내용: UI는 내 후기를 상단 고정하고 수정·삭제해야 하지만 응답 예시에 `isMine` 또는 작성자 ID가 없다.
  - 필요 결정: `isMine`, `reviewId`, 삭제 요청에 사용할 방문 기록 ID를 응답에 포함한다.
  - 현재 처리: 계약 확정 전까지 후기 목록·삭제 API 연동은 구현에서 제외한다.

- [ ] **후기 수정·삭제 식별자와 경로**
  - 대상: FE, Backend
  - 관련 API: `PATCH/DELETE /my-places/visited/{visitId}`
  - 내용: 문서 본문은 `visitId`, `recordId`, `reviewId`를 혼용한다.
  - 필요 결정: path variable 명칭과 실제 리소스 ID를 하나로 통일한다.

- [ ] **길찾기 동작**
  - 대상: PM, Design, FE
  - 내용: 장소 상세에 길찾기 버튼이 있지만 지도 공급자와 딥링크/웹 URL 정책이 없다.
  - 필요 결정: 사용할 지도 서비스와 앱 미설치 시 fallback을 정한다.

- [ ] **지도 표시 방식**
  - 대상: PM, Design, FE
  - 내용: 장소 상세 지도 영역은 placeholder이며 지도 SDK가 정해지지 않았다.
  - 필요 결정: 정적 지도 이미지, 웹 임베드, 지도 SDK 중 방식을 확정한다.
