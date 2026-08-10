import { QueryClient } from '@tanstack/react-query';

/**
 * 쿼리 기본값.
 * 기본 설정(retry 3회 + 지수 백오프)이면 실패한 요청이 7초 넘게 로딩 상태로 남아,
 * 화면은 "불러오는 중"만 보여주고 사용자는 실패한 줄을 모른다.
 * 재시도는 1회로 줄여 실패를 빨리 드러내고, 포커스마다 다시 부르지 않게 한다.
 *
 * 세션 복원(api/session.ts)이 캐시를 비워야 해서 React 밖에서도 잡을 수 있게 모듈로 뺐다.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000, // 화면 전환마다 같은 데이터를 다시 부르지 않는다
      refetchOnWindowFocus: false,
      /**
       * 기본값('online')은 navigator.onLine이 false면 요청을 멈추고 fetchStatus를 'paused'로 둔다.
       * 이때 status는 'pending'에 머물러 **에러 UI가 영영 안 뜨고 스켈레톤만 남는다**(실측 확인).
       * 오프라인 판정이 틀리는 환경(프록시·인앱 브라우저 등)이 있어, 일단 보내고 실패를 드러낸다.
       */
      networkMode: 'always',
    },
  },
});
