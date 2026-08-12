import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const createRecord = vi.fn();
const updateRecord = vi.fn();
const deleteRecord = vi.fn();

vi.mock('../../api/record', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../api/record')>()),
  createRecord: (...args: unknown[]) => createRecord(...args) as unknown,
  updateRecord: (...args: unknown[]) => updateRecord(...args) as unknown,
  deleteRecord: (...args: unknown[]) => deleteRecord(...args) as unknown,
}));

import { placeKeys } from '../place/placeKeys';
import { recordKeys } from './useRecord';
import { useCreateRecord, useDeleteRecord, useUpdateRecord } from './useRecord';

/**
 * "후기를 쓰거나 고치면 장소 상세가 갱신된다"를 실행으로 고정한다.
 *
 * 예전에는 `recordKeys.all`(=`['record']`)만 비웠다. 장소 상세가 별점을 읽는 쿼리는
 * `['places','reviews',id]`라 접두사가 하나도 겹치지 않아 아무 일도 일어나지 않았고,
 * `staleTime: 30_000` 때문에 저장 직후 재요청조차 나가지 않았다 — 이게 "별점이 반영 안 됨"의
 * 정체다(#174). 그래서 여기서 보는 것은 요청이 나갔는지가 아니라 `isInvalidated` 표시다.
 */
const PLACE_ID = '7';
const OTHER_PLACE_ID = '99';

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  queryClient.setQueryData(placeKeys.reviews(PLACE_ID), { totalCount: 1, reviews: [] });
  queryClient.setQueryData(placeKeys.detail(PLACE_ID), { placeName: '옛 장소' });
  queryClient.setQueryData(placeKeys.reviews(OTHER_PLACE_ID), { totalCount: 0, reviews: [] });
  queryClient.setQueryData(recordKeys.myPlaces('visited'), { places: [] });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const isStale = (key: readonly unknown[]) =>
    queryClient.getQueryState(key)?.isInvalidated ?? false;

  return { queryClient, wrapper, isStale };
}

beforeEach(() => {
  createRecord.mockReset().mockResolvedValue({ recordId: 1 });
  updateRecord.mockReset().mockResolvedValue({ rating: 5 });
  deleteRecord.mockReset().mockResolvedValue(undefined);
});

describe('후기 작성·수정·삭제 후 장소 캐시 무효화', () => {
  it('후기를 쓰면 그 장소의 후기 목록과 상세가 stale이 된다', async () => {
    const { wrapper, isStale } = setup();
    const { result } = renderHook(() => useCreateRecord(), { wrapper });

    result.current.mutate({
      placeId: Number(PLACE_ID),
      type: 'REVIEW',
      rating: 5,
      content: '좋았어요',
      imageIds: [],
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(isStale(placeKeys.reviews(PLACE_ID))).toBe(true);
    // 후기 수·평균 별점이 상세에 들어 있다.
    expect(isStale(placeKeys.detail(PLACE_ID))).toBe(true);
  });

  it('별점을 고치면 그 장소의 후기 목록이 stale이 된다 — #174의 증상', async () => {
    const { wrapper, isStale } = setup();
    const { result } = renderHook(() => useUpdateRecord(), { wrapper });

    result.current.mutate({ recordId: 12, placeId: PLACE_ID, body: { rating: 3 } });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(isStale(placeKeys.reviews(PLACE_ID))).toBe(true);
  });

  it('후기를 지우면 그 장소의 후기 목록이 stale이 된다', async () => {
    const { wrapper, isStale } = setup();
    const { result } = renderHook(() => useDeleteRecord(), { wrapper });

    result.current.mutate({ recordId: 12, placeId: PLACE_ID });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(isStale(placeKeys.reviews(PLACE_ID))).toBe(true);
  });

  it('다른 장소의 후기 목록은 건드리지 않는다', async () => {
    const { wrapper, isStale } = setup();
    const { result } = renderHook(() => useUpdateRecord(), { wrapper });

    result.current.mutate({ recordId: 12, placeId: PLACE_ID, body: { rating: 3 } });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(isStale(placeKeys.reviews(OTHER_PLACE_ID))).toBe(false);
  });

  it('placeId를 모르면 장소 캐시는 건드리지 않는다 — 내 기록 목록만 비운다', async () => {
    const { wrapper, isStale } = setup();
    const { result } = renderHook(() => useUpdateRecord(), { wrapper });

    result.current.mutate({ recordId: 12, body: { rating: 3 } });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(isStale(placeKeys.reviews(PLACE_ID))).toBe(false);
    expect(isStale(recordKeys.myPlaces('visited'))).toBe(true);
  });

  it('저장이 실패하면 아무것도 비우지 않는다', async () => {
    updateRecord.mockRejectedValue({ status: 500 });
    const { wrapper, isStale } = setup();
    const { result } = renderHook(() => useUpdateRecord(), { wrapper });

    result.current.mutate({ recordId: 12, placeId: PLACE_ID, body: { rating: 3 } });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(isStale(placeKeys.reviews(PLACE_ID))).toBe(false);
  });
});
