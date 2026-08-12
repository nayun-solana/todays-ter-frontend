import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const useAuthStatus = vi.fn();
const useRecommendedPlaces = vi.fn();

vi.mock('../hooks/auth/useAuthStatus', () => ({
  useAuthStatus: () => useAuthStatus() as unknown,
}));
vi.mock('../hooks/home/useHome', () => ({
  useRecommendedPlaces: (options?: unknown) => useRecommendedPlaces(options) as unknown,
}));

import { RequireMember, RequireMemberTab, RequireRecommendationAccess } from './RequireAuth';

function renderAt(path: string, element: ReactNode, guarded: ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={element}>
            <Route path="/matched-ter/:id" element={guarded} />
            <Route path="/my" element={guarded} />
          </Route>
          <Route path="/login" element={<p>로그인 화면</p>} />
          <Route path="/home" element={<p>홈 화면</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const PROTECTED = <p>보호된 화면</p>;

beforeEach(() => {
  useAuthStatus.mockReset();
  useRecommendedPlaces.mockReset();
  useRecommendedPlaces.mockReturnValue({ data: undefined, isPending: true, isError: false });
});

describe('RequireMember', () => {
  it('복원 중에는 게스트로 단정하지 않고 대기 화면을 보여준다', () => {
    useAuthStatus.mockReturnValue({ isMember: false, isPending: true });
    renderAt('/my', <RequireMember />, PROTECTED);

    expect(screen.queryByText('로그인 화면')).not.toBeInTheDocument();
    expect(screen.queryByText('보호된 화면')).not.toBeInTheDocument();
    expect(screen.getByLabelText('불러오는 중')).toBeInTheDocument();
  });

  it('게스트는 로그인으로 보낸다', () => {
    useAuthStatus.mockReturnValue({ isMember: false, isPending: false });
    renderAt('/my', <RequireMember />, PROTECTED);

    expect(screen.getByText('로그인 화면')).toBeInTheDocument();
  });

  it('회원은 통과시킨다', () => {
    useAuthStatus.mockReturnValue({ isMember: true, isPending: false });
    renderAt('/my', <RequireMember />, PROTECTED);

    expect(screen.getByText('보호된 화면')).toBeInTheDocument();
  });
});

describe('RequireMemberTab', () => {
  it('게스트에게는 리다이렉트 대신 잠금 화면을 그 자리에 렌더한다', () => {
    useAuthStatus.mockReturnValue({ isMember: false, isPending: false });
    renderAt('/my', <RequireMemberTab title="마이페이지" variant="my" />, PROTECTED);

    expect(screen.queryByText('로그인 화면')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '마이페이지' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '로그인/회원가입 하러가기' })).toBeInTheDocument();
  });

  it('회원은 통과시킨다', () => {
    useAuthStatus.mockReturnValue({ isMember: true, isPending: false });
    renderAt('/my', <RequireMemberTab title="마이페이지" variant="my" />, PROTECTED);

    expect(screen.getByText('보호된 화면')).toBeInTheDocument();
  });
});

describe('RequireRecommendationAccess', () => {
  it('회원은 추천 목록을 조회하지 않고 통과한다', () => {
    useAuthStatus.mockReturnValue({ isMember: true, isPending: false });
    renderAt('/matched-ter/7', <RequireRecommendationAccess />, PROTECTED);

    expect(screen.getByText('보호된 화면')).toBeInTheDocument();
    expect(useRecommendedPlaces).toHaveBeenCalledWith({ enabled: false });
  });

  it('게스트는 visibleCount 안에 든 추천만 열 수 있다', () => {
    useAuthStatus.mockReturnValue({ isMember: false, isPending: false });
    useRecommendedPlaces.mockReturnValue({
      data: { recommendations: [{ placeId: 7 }, { placeId: 8 }], visibleCount: 1 },
      isPending: false,
      isError: false,
    });

    renderAt('/matched-ter/7', <RequireRecommendationAccess />, PROTECTED);
    expect(screen.getByText('보호된 화면')).toBeInTheDocument();
  });

  it('게스트가 잠긴 추천을 직접 열면 로그인으로 보낸다', () => {
    useAuthStatus.mockReturnValue({ isMember: false, isPending: false });
    useRecommendedPlaces.mockReturnValue({
      data: { recommendations: [{ placeId: 7 }, { placeId: 8 }], visibleCount: 1 },
      isPending: false,
      isError: false,
    });

    renderAt('/matched-ter/8', <RequireRecommendationAccess />, PROTECTED);
    expect(screen.getByText('로그인 화면')).toBeInTheDocument();
  });

  it('추천 목록을 못 불러와 판정이 불가능하면 홈으로 되돌린다', () => {
    useAuthStatus.mockReturnValue({ isMember: false, isPending: false });
    useRecommendedPlaces.mockReturnValue({ data: undefined, isPending: false, isError: true });

    renderAt('/matched-ter/8', <RequireRecommendationAccess />, PROTECTED);
    expect(screen.getByText('홈 화면')).toBeInTheDocument();
  });
});
