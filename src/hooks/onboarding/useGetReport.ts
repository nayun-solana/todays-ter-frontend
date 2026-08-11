import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';

import {
  createFortuneReport,
  createSajuReportShare,
  getCategorySajuReport,
  getCurrentFortuneReport,
  getReportStatus,
  getSajuReportSummary,
  retryFortuneReport,
} from '../../api/report';
import type { SajuReportCategory } from '../../types/onboarding/report';

export const reportKeys = {
  current: () => ['fortune-report', 'current'] as const,
  summary: (reportId: number) => ['fortune-report', reportId] as const,
  status: (reportId: number) => ['fortune-report', reportId, 'status'] as const,
  detail: (reportId: number, category: SajuReportCategory) =>
    ['fortune-report', reportId, 'detail', category] as const,
};

export function setCurrentReportCache(queryClient: QueryClient, reportId: number) {
  queryClient.setQueryData(reportKeys.current(), { reportId });
}

/** 현재 회원이 조회할 리포트 id */
export function useCurrentFortuneReport(enabled = true) {
  return useQuery({
    queryKey: reportKeys.current(),
    queryFn: getCurrentFortuneReport,
    enabled,
    // 마이페이지에 들어올 때 서버의 최신 reportId를 확인한다.
    refetchOnMount: 'always',
  });
}

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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFortuneReport,
    onSuccess: (data) => {
      if (data.status !== 'failed') {
        setCurrentReportCache(queryClient, data.reportId);
      }
    },
  });
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
    // 일시적 실패는 폴링이 알아서 회복하지만, 계속 실패하면 화면이 0%에 갇힌다.
    // 이 화면에는 뒤로 갈 방법이 없으므로 몇 번 실패하면 포기하고 실패로 넘긴다.
    retry: STATUS_POLL_MAX_FAILURES,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'completed' || status === 'failed') return false;
      // 조회가 계속 실패하는 중이면 폴링도 멈춘다 — 멈춰야 isError가 확정돼 화면이 빠져나간다.
      if (query.state.fetchFailureCount > STATUS_POLL_MAX_FAILURES) return false;
      return 1000;
    },
  });
}

/**
 * 상태 조회를 몇 번까지 눌러볼지.
 * 한 번 실패했다고 리포트를 버리면 안 되지만, 무한정 기다리게 두면 화면이 갇힌다.
 */
export const STATUS_POLL_MAX_FAILURES = 4;

/** 실패한 리포트 재시도 */
export function useRetryFortuneReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportId: number) => retryFortuneReport(reportId),
    onSuccess: (data) => {
      if (data.status !== 'failed') {
        setCurrentReportCache(queryClient, data.reportId);
      }
    },
  });
}

/** 리포트 공유 링크 생성 */
export function useCreateSajuReportShare(reportId: number) {
  return useMutation({ mutationFn: () => createSajuReportShare({ reportId }) });
}
