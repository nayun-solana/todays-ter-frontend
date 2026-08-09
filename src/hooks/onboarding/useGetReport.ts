import { useMutation, useQuery } from '@tanstack/react-query';

import {
  createFortuneReport,
  createSajuReportShare,
  getCategorySajuReport,
  getReportStatus,
  getSajuReportSummary,
  retryFortuneReport,
} from '../../api/report';
import type { SajuReportCategory } from '../../types/onboarding/report';

export const reportKeys = {
  summary: (reportId: number) => ['fortune-report', reportId] as const,
  status: (reportId: number) => ['fortune-report', reportId, 'status'] as const,
  detail: (reportId: number, category: SajuReportCategory) =>
    ['fortune-report', reportId, 'detail', category] as const,
};

/** 기본 리포트 조회 */
export function useGetSajuReport(reportId: number) {
  return useQuery({
    queryKey: reportKeys.summary(reportId),
    queryFn: () => getSajuReportSummary(reportId),
    enabled: Number.isFinite(reportId) && reportId > 0,
  });
}

/** 카테고리별 상세 리포트 조회 */
export function useGetCategorySajuReport(reportId: number, category: SajuReportCategory) {
  return useQuery({
    queryKey: reportKeys.detail(reportId, category),
    queryFn: () => getCategorySajuReport({ reportId, category }),
    enabled: Number.isFinite(reportId) && reportId > 0,
  });
}

/** 리포트 생성 시작 (202) */
export function useCreateFortuneReport() {
  return useMutation({ mutationFn: createFortuneReport });
}

/**
 * 생성 진행 상태 폴링.
 *
 * 완료·실패면 멈춘다 — 계속 돌면 리포트를 다 본 뒤에도 백그라운드 요청이 남는다.
 * 실측에서는 생성 직후 바로 `completed`라 대개 1회로 끝나지만, 계약이 비동기라 폴링을 둔다.
 */
export function useReportStatus(reportId: number | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: reportKeys.status(reportId ?? 0),
    queryFn: () => getReportStatus(reportId!),
    enabled: (options?.enabled ?? true) && !!reportId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'completed' || status === 'failed' ? false : 1000;
    },
  });
}

/** 실패한 리포트 재시도 */
export function useRetryFortuneReport() {
  return useMutation({ mutationFn: (reportId: number) => retryFortuneReport(reportId) });
}

/** 리포트 공유 링크 생성 */
export function useCreateSajuReportShare(reportId: number) {
  return useMutation({ mutationFn: () => createSajuReportShare({ reportId }) });
}
