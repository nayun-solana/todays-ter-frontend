# 화면 명세서 (FE 기준)

> 출처: Figma 메인 파일 `dS5IgZSx41mFaHY9lzvJ7f`. **화면 명세 보드(주석 포함) = node `1311:1314`**(대형 보드, 기능별 목업 + 회색 주석박스).
> 이 문서는 **화면 ↔ 필요 데이터 ↔ API 엔드포인트 매핑 + Figma node 레퍼런스**다. 각 화면의 **상세 동작 주석은 보드에서 직접 확대 판독**해야 하며, 여기 미기재분은 `(미확인 — Figma 주석 판독 필요)`.
> 엔드포인트 상세는 [api-spec.md](./api-spec.md) 참조.
>
> ⚠️ **유지보수 규칙**: 화면/명세 변경 시 이 문서를 갱신한다. Figma가 source of truth.

## 담당 (공식 역할표)
- **상우**: 로그인·인증실패·동일이메일, 온보딩1(사주입력)·출생시간·온보딩2(분석), 홈, 추천 결과(나와 어울리는 터)
- 수현: 후기/방문기록/내 터/공유카드 · 성원: 탐색/지도/장소상세/마이 · 은진: 사주리포트/온보딩3

---

## 상우 담당 화면 ↔ 데이터 ↔ 엔드포인트

### 로그인 `LoginPage`
- Figma: 최종 시안 개인파일 `SGNuCknXIVmH7i16Mbk74m` node `2:561`(플로우)·메인 `8:656`; 통통 인트로 키프레임 개인파일 `8:493`~`8:632`.
- 구현: 공 바운스 인트로(JS 물리) + 소셜 3종 + **비회원으로 시작하기**(#40 머지).
- 엔드포인트: `GET /auth/{kakao|apple|google}/login`, 콜백 `/auth/{provider}/callback`, `POST /auth/refresh`, `GET /auth/me`. **비회원**: `POST /api/guest-sessions`.
- 상태: auth BE **시작 전** → 소셜 로그인 실연동 대기. 게스트 세션은 **연동 가능**.

### 온보딩1 — 사주 입력 `OnboardingPage1`
- Figma: `1137:1430`(미래날짜 경고/피커). 명세 보드 "온보딩1 추가기능" 섹션.
- 표시/입력 데이터: 달력유형(양/음), 생년월일, 태어난시간(+시간모름).
- 엔드포인트: **`PUT /api/guest-onboarding/saju`** ✅(BE 완료).
  - body `{ calendarType: SOLAR|LUNAR, birthDate: yyyy-MM-dd, birthTime: HH:mm|null, birthTimeUnknown }`.
  - ⚠️ FE 현재 `calendarType`이 소문자(`solar|lunar`) → **대문자 매핑 필요**. `birthTimeUnknown=true`면 birthTime=null.
- 선행: `POST /api/guest-sessions`(쿠키 발급) 먼저.

### 온보딩2 — 분석/리포트 생성 `OnboardingPage2`
- Figma: 명세 보드 "사주결과 → 온보딩2" 섹션. (개별 시안 `(미확인)`)
- 엔드포인트: `POST /fortune-reports` → `GET /fortune-reports/{id}/status`(폴링) → 실패 시 `/retry`.
- 상태: 사주리포트 BE **시작 전**. (은진 리포트 도메인과 접점)

### 온보딩3 — 고민 유형 `OnboardingPage3` (은진 담당, 상우 대체분 존재)
- 엔드포인트: **`PUT /api/guest-onboarding/concerns`** ✅(BE 완료). body `{ concernTypes: ConcernType[] }`.
- `ConcernType`: LOVE/CAREER/WEALTH/RELATIONSHIP/HEALTH/OTHER.

### 홈 `HomePage`
- Figma: 홈 `1148:2060`(수), 로그인전 홈 `1752:1645`, 오행 variant earth `1148:2502`·fire `1148:2604`·wood `1148:2700`·metal `1148:2921`. 명세 보드 "홈 오행별" 섹션.
- 섹션별 데이터 ↔ 엔드포인트:
  | 섹션 | 엔드포인트 | 현재 하드코딩 |
  |---|---|---|
  | 인사 헤더(날짜·인사말) | `GET /home/header` | 리터럴 |
  | 오늘 나의 기운(오행) | `GET /home/today-energy` | **`HOME_OHAENG='water'`** |
  | 에너지 루틴 칩 | `GET /home/energy-routines` | placeholder |
  | 오늘 가장 잘 맞는 터(추천카드) | `GET /home/recommended-place` | 샘플 |
  | 로그인 전 게이트 | 회원토큰 유무 / 게스트세션 | **`IS_GUEST=false`** |
- 상태: 홈 BE **시작 전**. 오행 variant는 데이터만 채워짐(연동 시 key 교체).

### 추천 결과 — 나와 어울리는 터 `MatchedTerPage`
- Figma: `1148:3786`. 라우트 `/matched-ter/:id`(홈 추천카드 클릭 → 진입).
- 데이터: 장소명·이미지·매칭율·오행·"왜 나에게 맞나요?"·행동제안.
- 엔드포인트: **`GET /recommendations/{recommendationId}`** → `MATCHED_OHAENG` + 상세. 저장 `PUT .../bookmark`, 공유 `POST .../share`. "다녀왔어요" → `/review`.
- 상태: 추천 BE **시작 전**.

---

## 기타 화면 (참고, 상우 외 담당)
- 마이(회원·비회원 버튼) / 내 터·방문기록 / 후기작성 / 장소상세 / 알림 — 명세 보드 각 섹션 참조. 엔드포인트는 [api-spec.md](./api-spec.md) 6절. 상세 주석 `(미확인 — 판독 필요)`.

## 디자인 시스템
- 토큰/타이포 노드 `2370:1227`(Color 팔레트 + Typography). PR #51에서 `index.css` 토큰 등록.
- 주의: `gray-3(#c4c4c4)`는 원래 텍스트색(text/Gray3), border는 `gray-2(#f4f4f5)`. (상세 vault TIL `design-token-role-collision`)
