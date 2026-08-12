import {
  CategorySajuReportResponse,
  ReportCreateResponse,
  ReportStatusResponse,
  SajuReportResponse,
  SajuReportShareResult,
  type SajuReportCategory,
} from '../types/onboarding/report';
import axiosInstance from './axiosInstance';
import { getResult } from './helpers';
import type { ApiResponse } from './types';

/**
 * 사주 리포트 API. **경로는 `/fortune-reports`다** — 예전 `/saju-reports/*`는 실서버에 없는 경로였고
 * MSW 목이 가리고 있어 로컬에서만 동작했다(2026-08-09 실호출 검증).
 *
 * 전부 permitAll이라 게스트 쿠키·회원 토큰 어느 쪽으로도 동작한다.
 */

/**
 * POST /fortune-reports — 온보딩 정보로 리포트 생성 시작.
 * 202로 즉시 돌아오고 완료 여부는 `getReportStatus`로 확인한다(실측에서는 바로 completed였지만
 * 계약이 비동기라 폴링을 전제로 쓴다).
 */
export async function createFortuneReport(): Promise<ReportCreateResponse> {
  const res = await axiosInstance.post<ApiResponse>('/fortune-reports');
  return ReportCreateResponse.parse(getResult(res));
}

/** GET /fortune-reports/{reportId}/status — 상태 + 0~100 진행률. */
export async function getReportStatus(reportId: number): Promise<ReportStatusResponse> {
  const res = await axiosInstance.get<ApiResponse>(`/fortune-reports/${reportId}/status`);
  return ReportStatusResponse.parse(getResult(res));
}

/** POST /fortune-reports/{reportId}/retry — 실패한 리포트를 같은 id로 다시 생성. */
export async function retryFortuneReport(reportId: number): Promise<ReportStatusResponse> {
  const res = await axiosInstance.post<ApiResponse>(`/fortune-reports/${reportId}/retry`);
  return ReportStatusResponse.parse(getResult(res));
}

/** GET /fortune-reports/{reportId} — 기본 리포트(요약 + 오행 분포). */
export async function getSajuReportSummary(reportId: number): Promise<SajuReportResponse> {
  const res = await axiosInstance.get<ApiResponse>(`/fortune-reports/${reportId}`);
  return SajuReportResponse.parse(getResult(res));
}

/**
 * GET /fortune-reports/{reportId}/details — 카테고리별 상세.
 * ⚠️ `category`는 **필수**다. 빼면 400이고, 고민 유형의 `OTHER`를 그대로 넘겨도 400이다.
 */
export async function getCategorySajuReport({
  reportId,
  category,
}: {
  reportId: number;
  category: SajuReportCategory;
}): Promise<CategorySajuReportResponse> {
  const res = await axiosInstance.get<ApiResponse>(`/fortune-reports/${reportId}/details`, {
    params: { category },
  });

  return CategorySajuReportResponse.parse(res.data.result);
}

/** POST /fortune-reports/{reportId}/share — 공유 링크 생성. */
export async function createSajuReportShare({
  reportId,
}: {
  reportId: number;
}): Promise<SajuReportShareResult> {
  const res = await axiosInstance.post<ApiResponse>(`/fortune-reports/${reportId}/share`);
  return SajuReportShareResult.parse(getResult(res));
}
