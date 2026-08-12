import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const useAuthStatus = vi.fn();
const getGuestSessionStatus = vi.fn();

vi.mock('../hooks/auth/useAuthStatus', () => ({
  useAuthStatus: () => useAuthStatus() as unknown,
}));
vi.mock('../api/onboarding', () => ({
  getGuestSessionStatus: () => getGuestSessionStatus() as unknown,
}));

import SessionGate from './SessionGate';

function renderGate() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/home']}>
        <Routes>
          <Route element={<SessionGate />}>
            <Route path="/home" element={<p>홈 화면</p>} />
          </Route>
          <Route path="/login" element={<p>로그인 화면</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  useAuthStatus.mockReset();
  getGuestSessionStatus.mockReset();
});

describe('SessionGate', () => {
  it('회원은 게스트 세션을 물어보지 않고 통과한다', async () => {
    useAuthStatus.mockReturnValue({ isMember: true, isPending: false });
    renderGate();

    expect(await screen.findByText('홈 화면')).toBeInTheDocument();
    expect(getGuestSessionStatus).not.toHaveBeenCalled();
  });

  it('세션이 있는 게스트는 통과한다', async () => {
    useAuthStatus.mockReturnValue({ isMember: false, isPending: false });
    getGuestSessionStatus.mockResolvedValue({ hasGuestId: true });
    renderGate();

    expect(await screen.findByText('홈 화면')).toBeInTheDocument();
  });

  it('세션이 확실히 없으면 로그인으로 보낸다', async () => {
    useAuthStatus.mockReturnValue({ isMember: false, isPending: false });
    getGuestSessionStatus.mockResolvedValue({ hasGuestId: false });
    renderGate();

    expect(await screen.findByText('로그인 화면')).toBeInTheDocument();
  });

  it('조회가 실패하면 통과시킨다(fail-open) — 서버가 흔들려도 방문자를 가두지 않는다', async () => {
    useAuthStatus.mockReturnValue({ isMember: false, isPending: false });
    getGuestSessionStatus.mockRejectedValue(new Error('503'));
    renderGate();

    expect(await screen.findByText('홈 화면')).toBeInTheDocument();
  });

  it('회원 판정 전에는 아무 쪽으로도 보내지 않는다', () => {
    useAuthStatus.mockReturnValue({ isMember: false, isPending: true });
    renderGate();

    expect(screen.queryByText('홈 화면')).not.toBeInTheDocument();
    expect(screen.queryByText('로그인 화면')).not.toBeInTheDocument();
    expect(getGuestSessionStatus).not.toHaveBeenCalled();
  });
});
