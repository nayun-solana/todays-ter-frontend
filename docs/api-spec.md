# API 명세서 (FE 연동 기준)

> 출처: `API 명세서`(Notion PDF, 2026-07) + BE 레포 `todays-ter/todays-ter-backend`(브랜치 `develop`) 소스 대조 + Swagger.
> 이 문서는 **FE 연동 관점** 정리본이다. 필드 스키마는 BE 소스(DTO/Controller)에서 확인한 것만 확정으로 적고, 나머지는 `(미확인)`.
>
> ⚠️ **유지보수 규칙**: API·스키마에 변경이 생길 때마다 이 문서를 갱신한다. **live source of truth = Swagger**(아래). 연동 작업 전 Swagger로 현재 상태를 재확인할 것.

## 서버 / 문서

- **백엔드 도메인(운영)**: https://today-ter.kr
- **Swagger UI**: https://today-ter.kr/swagger-ui/index.html
- **OpenAPI JSON**(스키마 원본): https://today-ter.kr/v3/api-docs
- **로컬**: localhost:8080 (BE 레포 기본, `server` 블록 없음)

## 공통 규약

- **응답 봉투**: 모든 응답은 `ApiResponse<T>` = `{ isSuccess, code, message, result }`. 실패 시 `result` 생략 가능. (FE `src/api/types.ts`와 일치)
- **성공 코드**: `COMMON200/201/202/204`. **에러 코드**: `COMMON400`, `COMMON400_1`(validation), `COMMON401`, `COMMON403`, `COMMON404`, `COMMON409`, `COMMON409_1`, `COMMON500`.
- **base URL**: `VITE_API_BASE_URL` → 운영 **https://today-ter.kr** / 로컬 **localhost:8080**.
- **인증 모델 2종**:
  - **회원**: `Authorization: Bearer <JWT>` (FE `token.ts`가 localStorage `accessToken` 주입). 401 시 인터셉터가 토큰 클리어.
  - **비회원(게스트)**: **HTTP 쿠키 `guest_id`** (`httpOnly`, `SameSite=Lax`, `secure=false`(운영 true), maxAge 30일). JS가 못 읽고 브라우저가 자동 전송.
- **FE 필수 설정**:
  - axios `withCredentials: true` **필요**(게스트 쿠키 전송용, 현재 `axiosInstance`에 없음).
  - **dev는 Vite 프록시(`/api` → https://today-ter.kr, 또는 localhost:8080)로 same-origin 처리 필수.** FE(localhost)→운영 도메인은 cross-site라 `SameSite=Lax` 게스트 쿠키가 XHR로 전송 안 됨. 프록시로 브라우저 관점 same-origin이 되면 쿠키가 흐르고 CORS도 우회. (BE `SecurityConfig` = `permitAll`·csrf disable, CORS allowCredentials/allowedOrigins `(미확인)`)

## 실제 배포 현황 (2026-07-24, Swagger `/v3/api-docs` 라이브 확인)

**운영 서버(today-ter.kr)에 실제 배포된 엔드포인트 = 7개뿐** (이게 실연동 가능한 전부):
- `GET /actuator/health`
- `POST /api/guest-sessions`
- `PUT /api/guest-onboarding/saju`
- `PUT /api/guest-onboarding/concerns`
- `GET /api/guest-onboarding`
- `POST /auth/dev/token` (dev JWT 발급)
- `GET /auth/test` (인증 테스트, `result: string`)

⚠️ **PDF "개발 상태"와 라이브가 다름**: PDF가 "진행중"이라던 `/places/explore-filters`·`/mypage`는 **아직 배포 안 됨**(develop 브랜치/미배포). PDF "개발 상태"는 계획, **배포 진실은 Swagger**. → 실연동은 위 7개만, 나머지는 스캐폴드/mock.

💡 `POST /auth/dev/token` req `{ email, nickname }` → res `{ memberId, accessToken }`. 이 JWT를 `token.setAccessToken()`에 넣으면 회원(Bearer) 흐름을 OAuth 없이 테스트 가능(단 현재 배포된 회원 엔드포인트는 `/auth/test`뿐).

---

## 1. 온보딩 / 게스트 — ✅ BE 완료 (연동 가능)

BE 소스에서 확정한 실제 계약. 신원은 `guest_id` 쿠키.

### `POST /api/guest-sessions` — 비회원 세션 생성·조회
- 요청: 없음(쿠키 있으면 재사용, 없으면 신규 발급 + `Set-Cookie: guest_id`)
- 응답 `result`: `{ onboardingStep: OnboardingStep }`

### `PUT /api/guest-onboarding/saju` — 사주 정보 저장·수정 (온보딩1)
- 요청 body:
  ```jsonc
  {
    "calendarType": "SOLAR" | "LUNAR",   // 필수
    "birthDate": "yyyy-MM-dd",           // 필수, 미래 불가(PastOrPresent)
    "birthTime": "HH:mm" | null,         // birthTimeUnknown=true면 반드시 null
    "birthTimeUnknown": true | false     // 필수
  }
  ```
  - 검증: `birthTimeUnknown=true` → `birthTime`은 null이어야, `false` → non-null이어야(AssertTrue).
- 응답 `result`: `{ onboardingStep }`
- ⚠️ FE 주의: 온보딩1이 현재 `'solar' | 'lunar'`(소문자) → **`SOLAR`/`LUNAR` 대문자 매핑 필요**.

### `PUT /api/guest-onboarding/concerns` — 고민 유형 저장·수정 (온보딩3)
- 요청 body: `{ "concernTypes": ConcernType[] }` (1개 이상, null 불가)
- 응답 `result`: `{ concernTypes: ConcernType[], onboardingStep }`

### `GET /api/guest-onboarding` — 비회원 온보딩 조회
- 응답 `result`:
  ```jsonc
  {
    "calendarType": "SOLAR" | "LUNAR",
    "birthDate": "yyyy-MM-dd",
    "birthTime": "HH:mm",       // null 가능
    "birthTimeUnknown": boolean,
    "concernTypes": ConcernType[],
    "onboardingStep": OnboardingStep
  }
  ```

### enum (BE 확정)
- `CalendarType`: `SOLAR`, `LUNAR`
- `ConcernType`: `LOVE`, `CAREER`, `WEALTH`, `RELATIONSHIP`, `HEALTH`, `OTHER`
- `OnboardingStep`: `STARTED` → `SAJU_COMPLETED` → `REPORT_GENERATED` → `COMPLETED`

---

## 2. 회원(auth)

**배포된 것 (Swagger 확정):**
- `POST /auth/dev/token` — req `{ email: string, nickname: string }` → res `{ memberId: number, accessToken: string }`. dev용 JWT 발급.
- `GET /auth/test` — res `result: string`. 인증 동작 확인용.

**나머지 = ⚠️ BE 시작 전 (경로만, 스키마 `(미확인)`)** — 토큰 불필요(로그인·콜백).

| 기능 | Method | Path | BE |
|---|---|---|---|
| 카카오 로그인 요청 | GET | `/auth/kakao/login` | 시작전 |
| 애플 로그인 요청 | GET | `/auth/apple/login` |
| 구글 로그인 요청 | GET | `/auth/google/login` |
| 소셜 로그인 콜백 처리 | GET | `/auth/{provider}/callback` |
| 로그아웃 | POST | `/auth/logout` |
| 토큰 재발급 | POST | `/auth/refresh` |
| 내 정보 조회 | GET | `/auth/me` |
| 동일 이메일 중복 확인 | GET | `/auth/email/duplicate` |
| 계정 연동 목록 조회 | GET | `/auth/social-connections` |
| 소셜 계정 연동 | POST | `/auth/social-connections/{provider}` |
| 소셜 계정 연동 해제 | DELETE | `/auth/social-connections/{provider}` |
| 회원 탈퇴 | DELETE | `/auth/withdraw` |

---

## 3. 사주 리포트 — ⚠️ BE 시작 전 (담당 성민주)

| 기능 | Method | Path |
|---|---|---|
| 내 사주 정보 조회 | GET | `/birth-info/me` |
| 기본 리포트 생성 요청 | POST | `/fortune-reports` |
| 리포트 생성 상태 | GET | `/fortune-reports/{reportId}/status` |
| 리포트 생성 실패 재시도 | POST | `/fortune-reports/{reportId}/retry` |
| 리포트 요약 조회 | GET | `/saju-reports/{reportId}/summary` |
| 리포트 상세 조회 | GET | `/saju-reports/{reportId}/detail` |
| 리포트 공유 링크 생성 | POST | `/saju-reports/{reportId}/share` |

---

## 4. 홈 — ⚠️ BE 시작 전 (담당 신현우)

FE 하드코딩(`HOME_OHAENG`·추천카드) 해소 대상.

| 기능 | Method | Path | FE 하드코딩 대응 |
|---|---|---|---|
| 홈 인사 헤더 조회 | GET | `/home/header` | 인사말·날짜 |
| 오늘 나의 기운 조회 | GET | `/home/today-energy` | **`HOME_OHAENG`(오행)** |
| 오늘 에너지 루틴 조회 | GET | `/home/energy-routines` | RoutineChips |
| 오늘 가장 잘 맞는 터 조회 | GET | `/home/recommended-place` | 추천 카드 |

---

## 5. 추천 — ⚠️ BE 시작 전 (담당 성민주)

| 기능 | Method | Path | 토큰 | FE 대응 |
|---|---|---|---|---|
| 추천 장소 상세 조회 | GET | `/recommendations/{recommendationId}` | X | **`MATCHED_OHAENG` + 장소상세** |
| 추천 장소 공유 링크 생성 | POST | `/recommendations/{recommendationId}/share` | X | |
| 추천 장소 저장 | PUT | `/recommendations/{recommendationId}/bookmark` | O | |

---

## 6. 탐색 / 장소 / 기록 / 마이 / 알림 — ⚠️ BE 시작 전~기능확인중 (담당 신현우/유진/성헌정)

상우 담당 외 화면. 참고용 경로 목록. 토큰 대부분 필요(O).

| 분류 | 기능 | Method | Path | 토큰 |
|---|---|---|---|---|
| 탐색 | 탐색 필터·테마 컬렉션 | GET | `/places/explore-filters` | X |
| 탐색 | 장소 검색·필터·목록 | GET | `/places` | X |
| 탐색 | 에디터 오행 픽 목록 | GET | `/places/editor-picks` | X |
| 장소 | 장소 상세(기본+지도) | GET | `/places/{placeId}` | O |
| 장소 | 장소 후기 목록 | GET | `/places/{placeId}/reviews` | O |
| 기록 | 저장한/다녀온 터 목록 | GET | `/my-places?type=` | O |
| 기록 | 터 저장/취소 | PUT | `/my-places/saved` | O |
| 기록 | 터 기록 이미지 업로드 | POST | `/my-places/visited/images` | O |
| 기록 | 다녀온 터 기록 | POST | `/my-places/visited` | O |
| 기록 | 다녀온 터 상세 | GET | `/my-places/visited/{visitId}` | O |
| 기록 | 다녀온 터 수정 | PATCH | `/my-places/visited/{visitId}` | O |
| 기록 | 다녀온 터 삭제 | DELETE | `/my-places/visited/{visitId}` | O |
| 공유 | 스토리 공유 카드 이미지 | GET | `/share-cards/{placeId}` | O |
| 마이 | 마이페이지 조회 | GET | `/mypage` | O |
| 마이 | 사주 수정 후 리포트 재생성 | POST | `/mypage/birth-info/regenerate` | O |
| 마이 | 계정 연동 관리 | GET | `/mypage/social-connections` | O |
| 마이 | 알림 설정 조회/변경 | GET/PATCH | `/mypage/notification-settings` | O |
| 마이 | 권한 설정 조회/저장 | GET/PATCH | `/mypage/permissions` | O |
| 마이 | 개인정보·약관 조회 | GET | `/mypage/policies` | O |
| 알림 | 알림 목록 | GET | `/notifications` | O |
| 알림 | 알림 읽음 | PATCH | `/notifications/{notificationId}/read` | O |
| 알림 | 전체 알림 읽음 | PATCH | `/notifications/read-all` | O |

> 토큰 열은 PDF 체크박스 기준. 개별 정확도는 BE 컨트롤러 구현 시 재확인 `(미확인)`.
