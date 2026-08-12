import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const getMemberSaju = vi.fn();

vi.mock('../../api/my', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../api/my')>()),
  getMemberSaju: () => getMemberSaju() as unknown,
}));

import SajuEditPage from './SajuEditPage';

/** 음력 + 태어난 시간 있음. 기본값(양력·모름·1995-06-15)과 모든 필드가 다르다. */
const SERVER_SAJU = {
  calendarType: 'LUNAR' as const,
  birthDate: '1988-03-02',
  birthTime: '07:20',
  birthTimeUnknown: false,
};

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <SajuEditPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

/** 조회 응답을 테스트가 원하는 시점에 도착시킨다. */
function deferSaju() {
  let resolve!: (value: typeof SERVER_SAJU) => void;
  getMemberSaju.mockReturnValue(
    new Promise<typeof SERVER_SAJU>((r) => {
      resolve = r;
    }),
  );
  return () => resolve(SERVER_SAJU);
}

beforeEach(() => {
  getMemberSaju.mockReset();
});

describe('SajuEditPage 프리필 잠금', () => {
  it('불러오는 동안에는 생년월일 시트가 열리지 않는다', async () => {
    deferSaju();
    renderPage();

    fireEvent.click(screen.getAllByText('불러오는 중…', { selector: 'button' })[0]);

    expect(screen.queryByRole('heading', { name: '생년월일 입력' })).not.toBeInTheDocument();
  });

  it('불러오는 동안 기본값(1995년)을 진짜 저장값처럼 보여주지 않는다', () => {
    deferSaju();
    renderPage();

    expect(screen.queryByText(/1995년/)).not.toBeInTheDocument();
  });

  it('응답이 도착하면 서버 값이 보인다 — 로딩 중 눌러도 기본값이 눌러앉지 않는다', async () => {
    const arrive = deferSaju();
    renderPage();

    // 응답 전에 두 필드를 다 눌러본다. 잠금이 없으면 여기서 draft가 기본값으로 굳고,
    // 뒤늦게 온 서버 값(음력 1988-03-02 07:20)이 화면에 영영 안 나온다.
    fireEvent.click(screen.getAllByText('불러오는 중…', { selector: 'button' })[0]);
    arrive();

    // 입력 필드는 button이라 카드의 요약 텍스트와 구분된다.
    expect(await screen.findByRole('button', { name: '1988년 03월 02일' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '오전 7시 20분' })).toBeInTheDocument();
    // 달력 종류는 이 화면에서 고칠 수 없다 — 기본값(양력)으로 덮이면 되돌릴 방법이 없다.
    expect(document.body.textContent).toContain('음력');
  });

  it('응답이 도착한 뒤에는 시트가 열린다', async () => {
    getMemberSaju.mockResolvedValue(SERVER_SAJU);
    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: '1988년 03월 02일' }));

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: '생년월일 입력' })).toBeInTheDocument(),
    );
  });
});
