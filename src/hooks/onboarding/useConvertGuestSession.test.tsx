import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const convertGuestSession = vi.fn();

vi.mock('../../api/onboarding', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../api/onboarding')>()),
  convertGuestSession: () => convertGuestSession() as unknown,
}));

import { onboardingKeys, useConvertGuestSession } from './useGuestOnboarding';

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  // SessionGate가 "세션 있음"으로 채워둔 상태에서 시작한다.
  queryClient.setQueryData(onboardingKeys.sessionStatus, { hasGuestId: true });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const { result } = renderHook(() => useConvertGuestSession(), { wrapper });

  return { queryClient, result };
}

beforeEach(() => {
  convertGuestSession.mockReset().mockResolvedValue(undefined);
});

describe('useConvertGuestSession', () => {
  it('이전에 성공하면 세션 유무 캐시를 "없음"으로 내린다', async () => {
    // 서버가 게스트 쿠키를 지운다. 캐시는 staleTime: Infinity라 안 내리면 실제와 어긋난 채 남는다.
    const { queryClient, result } = setup();

    result.current.mutate();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryData(onboardingKeys.sessionStatus)).toEqual({ hasGuestId: false });
  });

  it('실패하면 캐시를 건드리지 않는다 — 쿠키가 아직 살아 있다', async () => {
    convertGuestSession.mockRejectedValue({ status: 400, code: 'GUEST_COOKIE_REQUIRED' });
    const { queryClient, result } = setup();

    result.current.mutate();
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(queryClient.getQueryData(onboardingKeys.sessionStatus)).toEqual({ hasGuestId: true });
  });
});
