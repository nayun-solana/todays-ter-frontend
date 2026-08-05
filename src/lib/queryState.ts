/**
 * 쿼리 → 화면 상태 판정. 데이터가 실제로 손에 있는지를 기준으로 한다.
 *
 * `isError`만 보면 안 된다 — react-query는 브라우저가 오프라인이라고 판단하면 재시도를 멈추고
 * `fetchStatus: 'paused'` + `status: 'pending'`으로 붙잡아 둔다. 그러면 에러 UI가 영영 안 뜨고
 * 스켈레톤만 남는다. 멈춘 것도 실패로 보여줘야 사용자가 다시 시도할 수 있다.
 */
export type ViewState = 'loading' | 'failed' | 'ready';

export function viewStateOf(query: {
  data: unknown;
  isError: boolean;
  fetchStatus: 'fetching' | 'paused' | 'idle';
}): ViewState {
  if (query.data !== undefined) return 'ready';
  if (query.isError || query.fetchStatus === 'paused') return 'failed';
  return 'loading';
}
