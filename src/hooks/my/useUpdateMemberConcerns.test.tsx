import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const updateMemberConcerns = vi.fn();

vi.mock('../../api/my', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../api/my')>()),
  updateMemberConcerns: (...args: unknown[]) => updateMemberConcerns(...args) as unknown,
}));

import { homeKeys } from '../home/useHome';
import { recommendationKeys } from '../recommendation/useRecommendation';
import { myKeys, useUpdateMemberConcerns } from './useMy';

/**
 * "고민을 바꾸면 홈이 갱신된다"의 FE 쪽 절반을 실행으로 확인한다.
 *
 * 무효화는 **비활성 쿼리를 즉시 부르지 않는다** — stale 표시만 하고, 화면이 다시 마운트될 때
 * `refetchOnMount`가 그 표시를 보고 다시 부른다. 사용자는 완료 화면을 거쳐 홈으로 가므로
 * 실제 경로가 정확히 이 모양이다. 그래서 여기서 보는 것은 요청이 나갔는지가 아니라
 * **`isInvalidated` 표시가 붙었는지**다.
 */
function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  // 실제 화면이 채워두는 캐시를 흉내낸다. 옵저버가 없는 '비활성' 상태 그대로 둔다.
  queryClient.setQueryData(homeKeys.todayEnergy, { element: { code: 'WATER', name: '수' } });
  queryClient.setQueryData(homeKeys.header, { greeting: '안녕하세요' });
  queryClient.setQueryData(homeKeys.routines, { routines: [] });
  queryClient.setQueryData(homeKeys.recommended({ latitude: 37.5, longitude: 127 }), {
    recommendations: [],
  });
  queryClient.setQueryData(recommendationKeys.detail('12'), { placeName: '옛 추천' });
  queryClient.setQueryData(recommendationKeys.share('12'), { shareToken: 'token-abc' });
  queryClient.setQueryData(myKeys.saju(), { birthDate: '1995-06-15' });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const { result } = renderHook(() => useUpdateMemberConcerns(), { wrapper });
  const isStale = (key: readonly unknown[]) =>
    queryClient.getQueryState(key)?.isInvalidated ?? false;

  return { queryClient, result, isStale };
}

beforeEach(() => {
  updateMemberConcerns.mockReset();
  updateMemberConcerns.mockResolvedValue({ concernTypes: ['CAREER'] });
});

describe('useUpdateMemberConcerns', () => {
  it('저장에 성공하면 홈 4개가 전부 stale이 된다 — 홈에 들어갈 때 다시 불린다', async () => {
    const { result, isStale } = setup();

    result.current.mutate({ concernTypes: ['CAREER'] });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(isStale(homeKeys.todayEnergy)).toBe(true);
    expect(isStale(homeKeys.header)).toBe(true);
    expect(isStale(homeKeys.routines)).toBe(true);
    // 좌표가 키에 들어가 있어도 `['home']` 프리픽스로 걸린다.
    expect(isStale(homeKeys.recommended({ latitude: 37.5, longitude: 127 }))).toBe(true);
  });

  it('추천 상세도 stale이 된다 — 같은 고민으로 매칭 점수를 다시 계산해야 한다', async () => {
    const { result, isStale } = setup();

    result.current.mutate({ concernTypes: ['CAREER'] });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(isStale(recommendationKeys.detail('12'))).toBe(true);
  });

  it('공유 토큰 쿼리는 건드리지 않는다 — queryFn이 서버에 토큰을 만드는 POST다', async () => {
    const { result, isStale } = setup();

    result.current.mutate({ concernTypes: ['CAREER'] });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(isStale(recommendationKeys.share('12'))).toBe(false);
  });

  it('무관한 캐시는 남긴다 — 사주는 고민과 함께 바뀌지 않는다', async () => {
    const { result, isStale } = setup();

    result.current.mutate({ concernTypes: ['CAREER'] });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(isStale(myKeys.saju())).toBe(false);
  });

  it('저장한 값은 재조회 없이 캐시에 반영된다', async () => {
    const { queryClient, result } = setup();

    result.current.mutate({ concernTypes: ['CAREER'] });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryData(myKeys.concerns())).toEqual({ concernTypes: ['CAREER'] });
  });

  it('저장이 실패하면 아무것도 비우지 않는다 — 옛 값이 지워진 채 새 값도 없는 상태를 만들지 않는다', async () => {
    updateMemberConcerns.mockRejectedValue({ status: 404, code: 'MEMBER404_3' });
    const { result, isStale } = setup();

    result.current.mutate({ concernTypes: ['CAREER'] });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(isStale(homeKeys.todayEnergy)).toBe(false);
    expect(isStale(recommendationKeys.detail('12'))).toBe(false);
  });
});
