import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../api/report', () => ({
  createFortuneReport: vi.fn(),
  createSajuReportShare: vi.fn(),
  getCategorySajuReport: vi.fn(),
  getCurrentFortuneReport: vi.fn(),
  getReportStatus: vi.fn(),
  getSajuReportSummary: vi.fn(),
  retryFortuneReport: vi.fn(),
}));

import { reportKeys, setCurrentReportCache } from './useGetReport';

describe('current report cache', () => {
  it('stores the latest report id under the shared current key', () => {
    const queryClient = new QueryClient();

    setCurrentReportCache(queryClient, 102);

    expect(queryClient.getQueryData(reportKeys.current())).toEqual({ reportId: 102 });
  });
});
