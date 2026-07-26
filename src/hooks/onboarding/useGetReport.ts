import { useMutation, useQuery } from '@tanstack/react-query';

import {
  getSajuReportSummary,
  getCategorySajuReport,
  createSajuReportShare,
} from '../../api/report';

import type { SajuReportCategory } from '../../types/onboarding/report';

/** 사주리포트 조회 */
export function useGetSajuReport(id: string) {
  return useQuery({ queryKey: [id], queryFn: () => getSajuReportSummary(id) });
}

/** 사주리포트 카테고리별 조회 */
export function useGetCategorySajuReport(id: string, category: SajuReportCategory) {
  return useQuery({
    queryKey: [id, category],
    queryFn: () => getCategorySajuReport({ reportId: id, category }),
  });
}

/** 사주리포트 공유 링크 생성 */
export function useCreateSajuReportShare(id: string) {
  return useMutation({ mutationFn: () => createSajuReportShare({ reportId: id }) });
}
