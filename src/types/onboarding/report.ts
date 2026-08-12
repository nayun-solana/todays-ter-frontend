import { z } from 'zod';

/**
 * 사주 리포트 API 계약.
 * **BE 실응답으로 검증함**(2026-08-09, 게스트 온보딩 → 리포트 생성 → 조회 전 과정 실호출).
 *
 * 이전 스키마는 배포 전에 추측으로 작성한 것이라 필드 이름이 BE와 거의 전부 달랐고,
 * MSW 목이 그 모양에 맞춰져 있어 로컬에서만 동작했다. 여기 있는 것은 전부 실응답 기준이다.
 */

// ── Enum ──

export const ElementCode = z.enum(['WOOD', 'FIRE', 'EARTH', 'METAL', 'WATER']);
export type ElementCode = z.infer<typeof ElementCode>;

/**
 * 리포트 생성 상태. BE enum은 대문자지만 `@JsonValue`로 **소문자 문자열**이 나간다
 * (실응답 `"completed"`). 대문자로 파싱하면 zod가 throw한다.
 */
export const ReportStatus = z.enum(['processing', 'completed', 'failed']);
export type ReportStatus = z.infer<typeof ReportStatus>;

/**
 * 상세 리포트 카테고리 (`FortuneReportCategory`).
 *
 * ⚠️ 고민 유형(`ConcernType`)과 다르다 — 고민에는 `OTHER`가 있지만 리포트 카테고리에는 없다.
 *    `category=OTHER`로 부르면 **400**이다(실측). 고민을 그대로 넘기지 말 것.
 */
export const SajuReportCategory = z.enum([
  'GENERAL',
  'LOVE',
  'CAREER',
  'WEALTH',
  'RELATIONSHIP',
  'HEALTH',
]);
export type SajuReportCategory = z.infer<typeof SajuReportCategory>;

export const DetailSajuReportCategory = z.enum([
  'LOVE',
  'CAREER',
  'WEALTH',
  'RELATIONSHIP',
  'HEALTH',
]);
export type DetailSajuReportCategory = z.infer<typeof DetailSajuReportCategory>;

// ── 기본 리포트 (GET /fortune-reports/{reportId}) ──

export const ElementDistribution = z.object({
  element: ElementCode,
  /** 화면 표기용 한글 한 글자("목"·"화"…). BE가 주므로 FE에서 매핑하지 않는다. */
  label: z.string(),
  percentage: z.number(),
});
export type ElementDistribution = z.infer<typeof ElementDistribution>;

export const ElementAnalysis = z.object({
  summary: z.string(),
  primaryElements: z.array(ElementCode),
  complementaryElement: ElementCode,
  distribution: z.array(ElementDistribution),
});
export type ElementAnalysis = z.infer<typeof ElementAnalysis>;

// ─────────────────────────────────────
// 기본 리포트 - 종합 성향
// ─────────────────────────────────────

export const OverallTendency = z.object({
  label: z.string(),
  text: z.string(),
});
export type OverallTendency = z.infer<typeof OverallTendency>;

export const BasicReport = z.object({
  typeTitle: z.string(),
  typeName: z.string(),
  elementSummary: z.string(),

  primaryElements: z.array(ElementCode).default([]),

  /**
   * 보완 오행은 하나.
   * 기존 complementaryElements 배열 구조가 아님.
   */
  complementElement: ElementCode.nullish(),

  elementDistribution: z.array(ElementDistribution).default([]),

  overallTendencies: z.array(OverallTendency).default([]),
});
export type BasicReport = z.infer<typeof BasicReport>;

export const SajuReportResponse = z.object({
  reportId: z.number().int(),
  basic: BasicReport,
});
export type SajuReportResponse = z.infer<typeof SajuReportResponse>;

// ─────────────────────────────────────
// 카테고리별 사주 리포트
// ─────────────────────────────────────

// ── 상세 리포트 (GET /fortune-reports/{reportId}/details?category=) ──

/** 상세 리포트 내부의 공통 라벨·본문 구조. */
export const LabeledText = z.object({
  label: z.string(),
  text: z.string(),
});
export type LabeledText = z.infer<typeof LabeledText>;

export const PillarCard = z.object({
  label: z.string(),
  displayText: z.string(),
  description: z.string(),
});
export type PillarCard = z.infer<typeof PillarCard>;

export const DayPillarCards = z.object({
  dayStem: PillarCard,
  dayBranch: PillarCard,
  dayPillar: PillarCard,
});
export type DayPillarCards = z.infer<typeof DayPillarCards>;

export const SajuReportContentBlock = z.object({
  title: z.string(),
  content: z.string(),
});
export type SajuReportContentBlock = z.infer<typeof SajuReportContentBlock>;

export const ActionItem = z.object({
  order: z.number().int(),
  type: z.string(),
  text: z.string(),
});
export type ActionItem = z.infer<typeof ActionItem>;

export const ComplementActionGuide = z.object({
  element: ElementCode,
  label: z.string(),
  actions: z.array(ActionItem),
});
export type ComplementActionGuide = z.infer<typeof ComplementActionGuide>;

/** GENERAL과 개별 카테고리가 공유하는 실제 상세 응답 구조. */
export const SajuReportDetail = z.object({
  // 개별 카테고리 응답에만 내려오지만, Swagger 응답에서는 선택 필드다.
  code: DetailSajuReportCategory.nullish(),
  title: z.string().nullish(),
  coreSummary: z.string(),
  primaryElements: z.array(ElementCode).default([]),
  dayPillars: DayPillarCards.nullish(),
  contentBlocks: z.array(SajuReportContentBlock).default([]),
  flowAnalysis: z.array(LabeledText).default([]),
  keyPoints: z.array(LabeledText).default([]),
});
export type SajuReportDetail = z.infer<typeof SajuReportDetail>;

/** GENERAL 카테고리 응답. */
export const GeneralSajuReportResponse = z.object({
  reportId: z.number().int(),
  category: z.literal('GENERAL'),
  detail: SajuReportDetail,
  complementActionGuide: ComplementActionGuide.nullish(),
});
export type GeneralSajuReportResponse = z.infer<typeof GeneralSajuReportResponse>;

/** LOVE / CAREER / WEALTH / RELATIONSHIP / HEALTH 카테고리 응답. */
export const DetailSajuReportResponse = z.object({
  reportId: z.number().int(),
  category: DetailSajuReportCategory,
  detail: SajuReportDetail,
  complementActionGuide: ComplementActionGuide.nullish(),
});
export type DetailSajuReportResponse = z.infer<typeof DetailSajuReportResponse>;

export const CategorySajuReportResponse = z.discriminatedUnion('category', [
  GeneralSajuReportResponse,
  DetailSajuReportResponse,
]);
export type CategorySajuReportResponse = z.infer<typeof CategorySajuReportResponse>;

/**
 * GET /fortune-reports/shared/{shareToken}/details — 공유 링크로 여는 상세.
 * 본인 조회와 형태가 같고 `sharerNickname`만 더 온다.
 * 게스트가 공유했으면 닉네임이 없어 `null`로 온다(실측) → 화면에서 폴백을 둘 것.
 */
const SharerNickname = z.object({ sharerNickname: z.string().nullish() });

export const SharedSajuReportResponse = z.discriminatedUnion('category', [
  GeneralSajuReportResponse.extend(SharerNickname.shape),
  DetailSajuReportResponse.extend(SharerNickname.shape),
]);
export type SharedSajuReportResponse = z.infer<typeof SharedSajuReportResponse>;

// ── 생성·진행 상태 ──

/** POST /fortune-reports — 202로 즉시 반환되고, 완료는 status로 확인한다. */
export const ReportCreateResponse = z.object({
  reportId: z.number().int(),
  status: ReportStatus,
});
export type ReportCreateResponse = z.infer<typeof ReportCreateResponse>;

/** GET /fortune-reports/{reportId}/status — `failureMessage`는 실패했을 때만 온다. */
export const ReportStatusResponse = z.object({
  reportId: z.number().int(),
  status: ReportStatus,
  /** 0~100 */
  progress: z.number(),
  canRetry: z.boolean(),
  retryCount: z.number().int(),
  failureMessage: z.string().nullish(),
});
export type ReportStatusResponse = z.infer<typeof ReportStatusResponse>;

// ── 공유 ──

/**
 * POST /fortune-reports/{reportId}/share.
 * 추천 공유와 같은 `ShareLinkResponse` 형태다(`shareToken`은 조건부 포함).
 */
export const SajuReportShareResult = z.object({
  shareToken: z.string().nullish(),
  shareUrl: z.string(),
});
export type SajuReportShareResult = z.infer<typeof SajuReportShareResult>;
