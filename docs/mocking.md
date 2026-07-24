# MSW Mock 가이드 (BE 미배포 엔드포인트 선개발)

> BE가 아직 배포 안 된 엔드포인트(Swagger에 없는 것)를 **dev에서 mock으로 선개발**하기 위한 MSW 세팅.
> ⚠️ mock 응답 계약은 **추측**(화면·API 명세서 경로 기준). **BE 배포(Swagger) 시 실제 스키마로 교체**하고 해당 핸들러를 제거한다. 관련 [api-spec.md](./api-spec.md).

## 구성

- `public/mockServiceWorker.js` — MSW 서비스워커 (`npx msw init public/`로 생성, 커밋됨)
- `src/mocks/handlers.ts` — 목 핸들러 (엔드포인트별 응답). `ok()`로 `ApiResponse<T>` 봉투 래핑
- `src/mocks/browser.ts` — `setupWorker(...handlers)`
- `src/main.tsx` — **dev 전용** 부트스트랩:
  ```ts
  async function enableMocking() {
    if (!import.meta.env.DEV) return;         // prod 빌드엔 미포함
    const { worker } = await import('./mocks/browser');
    await worker.start({ onUnhandledRequest: 'bypass' }); // 목에 없는 요청은 통과
  }
  enableMocking().then(() => { /* render */ });
  ```

## 목 추가하기

`src/mocks/handlers.ts`에 핸들러 추가:

```ts
http.get('/home/today-energy', () =>
  ok({ element: 'WATER', label: '수', description: '...' }),
),
```

- 응답은 반드시 `ApiResponse<T>` 형태(`{ isSuccess, code, message, result }`) — FE `getResult()`가 `result`를 꺼내므로 `ok(result)` 사용.
- 대응하는 타입은 `src/types/<domain>/`에 zod로 정의(추측 스키마, `(미확인)` 표기).

## BE 배포되면 (목 제거 절차)

1. Swagger `/v3/api-docs`로 **실제 스키마 확인** → `src/types/<domain>` zod를 실제에 맞게 수정.
2. `src/mocks/handlers.ts`에서 해당 핸들러 **삭제**.
3. `onUnhandledRequest: 'bypass'`라 삭제 즉시 **실 API로 자동 pass-through**(별도 스위치 불필요).
4. 필요 시 프록시/withCredentials(#55) 확인.

## 현재 목 목록 (BE 배포 전까지)

| 엔드포인트 | 화면 | 상태 |
|---|---|---|
| `GET /home/today-energy` | 홈 오늘의 기운(오행) | mock |
| (추가 예정) `/home/header`·`/home/energy-routines`·`/home/recommended-place` | 홈 | — |
| (추가 예정) `GET /recommendations/{id}` | 추천 상세(나와 어울리는 터) | — |
