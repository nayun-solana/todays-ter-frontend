import { z } from 'zod';

/**
 * 사주 리포트 API 응답 계약
 * API 응답의 result를 런타임에서 검증하고,
 * TypeScript 타입은 z.infer로 파생한다.
 */

// ── Enum ──

export const ElementCode = z.enum(['WOOD', 'FIRE', 'EARTH', 'METAL', 'WATER']);
export type ElementCode = z.infer<typeof ElementCode>;

export const ReportType = z.enum(['BASIC']);
export type ReportType = z.infer<typeof ReportType>;

export const OverallTendencyCode = z.enum(['EMOTION_THOUGHT', 'CHOICE_ACTION', 'RECOVERY']);
export type OverallTendencyCode = z.infer<typeof OverallTendencyCode>;

// ── 오행 분석 ──

export const ElementDistribution = z.object({
  code: ElementCode,
  percentage: z.number().min(0).max(100),
});
export type ElementDistribution = z.infer<typeof ElementDistribution>;

export const ElementAnalysis = z.object({
  summary: z.string(),
  primaryElements: z.array(ElementCode),
  complementaryElements: z.array(ElementCode),
  distribution: z.array(ElementDistribution),
});
export type ElementAnalysis = z.infer<typeof ElementAnalysis>;

// ── 종합 성향 ──

export const OverallTendencyItem = z.object({
  code: OverallTendencyCode,
  title: z.string(),
  description: z.string(),
  displayOrder: z.number().int(),
});
export type OverallTendencyItem = z.infer<typeof OverallTendencyItem>;

export const OverallTendency = z.object({
  title: z.string(),
  items: z.array(OverallTendencyItem),
});
export type OverallTendency = z.infer<typeof OverallTendency>;

// ── 사주 리포트 응답 ──

export const SajuReportResponse = z.object({
  reportId: z.string(),
  reportType: ReportType,
  headline: z.string(),
  sajuTypeName: z.string(),
  elementAnalysis: ElementAnalysis,
  overallTendency: OverallTendency,
});
export type SajuReportResponse = z.infer<typeof SajuReportResponse>;

// ── 카테고리 별 사주 리포트 응답 ──

export const SajuReportCategory = z.enum([
  'GENERAL',
  'LOVE',
  'CAREER',
  'WEALTH',
  'RELATIONSHIP',
  'HEALTH',
]);
export type SajuReportCategory = z.infer<typeof SajuReportCategory>;

export const SajuCoreType = z.enum(['DAY_STEM', 'DAY_BRANCH', 'DAY_PILLAR']);
export type SajuCoreType = z.infer<typeof SajuCoreType>;

export const FlowAnalysisType = z.enum([
  'EMOTIONAL_FLOW',
  'RELATIONSHIP_PATTERN',
  'ACTION_STYLE',
  'RECOVERY_POINT',
]);
export type FlowAnalysisType = z.infer<typeof FlowAnalysisType>;

export const SajuReportSummary = z.object({
  description: z.string(),
  primaryElement: ElementCode,
});
export type SajuReportSummary = z.infer<typeof SajuReportSummary>;

export const SajuCoreItem = z.object({
  type: SajuCoreType,
  title: z.string(),
  value: z.string(),
  description: z.string(),
  displayOrder: z.number().int(),
});
export type SajuCoreItem = z.infer<typeof SajuCoreItem>;

export const FlowAnalysisItem = z.object({
  type: FlowAnalysisType,
  title: z.string(),
  description: z.string(),
  displayOrder: z.number().int(),
});
export type FlowAnalysisItem = z.infer<typeof FlowAnalysisItem>;

export const RecommendationItem = z.object({
  description: z.string(),
  displayOrder: z.number().int(),
});
export type RecommendationItem = z.infer<typeof RecommendationItem>;

export const CategorySajuReportResponse = z.object({
  reportId: z.string(),
  category: SajuReportCategory,
  summary: SajuReportSummary,
  sajuCore: z.array(SajuCoreItem),
  flowAnalysis: z.array(FlowAnalysisItem),
  complementaryElement: ElementCode,
  recommendations: z.array(RecommendationItem),
});
export type CategorySajuReportResponse = z.infer<typeof CategorySajuReportResponse>;

// ── 사주 리포트 공유 링크 생성 응답 ──

export const SajuReportShareResult = z.object({
  shareId: z.string(),
  shareUrl: z.string().url(),
});
export type SajuReportShareResult = z.infer<typeof SajuReportShareResult>;
