import {
  SajuReportResponse,
  CategorySajuReportResponse,
  SajuReportCategory,
  SajuReportShareResult,
} from '../types/onboarding/report';
import axiosInstance from './axiosInstance';
import { getResult } from './helpers';
import type { ApiResponse } from './types';

/** GET /api/saju-reports/{reportId}/summary — 사주 리포트 조회 */
export async function getSajuReportSummary(reportId: number): Promise<SajuReportResponse> {
  const res = await axiosInstance.get<ApiResponse>(`/saju-reports/${reportId}/summary`);
  return SajuReportResponse.parse(getResult(res));
}

/** GET /api/saju-reports/{reportId}/detail — 사주 리포트 상세 조회 */
export async function getCategorySajuReport({
  reportId,
  category,
}: {
  reportId: number;
  category: SajuReportCategory;
}): Promise<CategorySajuReportResponse> {
  const res = await axiosInstance.get<ApiResponse>(`/saju-reports/${reportId}/detail`, {
    params: { category },
  });
  return CategorySajuReportResponse.parse(getResult(res));
}

/** POST /api/saju-reports/{reportId}/share — 리포트 공유 링크 생성 */
export async function createSajuReportShare({
  reportId,
}: {
  reportId: number;
}): Promise<SajuReportShareResult> {
  const res = await axiosInstance.post<ApiResponse>(`/saju-reports/${reportId}/share`);
  return SajuReportShareResult.parse(getResult(res));
}
