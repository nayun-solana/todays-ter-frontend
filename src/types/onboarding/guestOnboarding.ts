import { z } from 'zod';

/**
 * 비회원(게스트) 온보딩 API 계약. Swagger(`/v3/api-docs`) 기준.
 * API 경계라 zod로 정의하고 z.infer로 타입 파생(런타임 검증). 관련 docs/api-spec.md.
 */

export const CalendarType = z.enum(['SOLAR', 'LUNAR']);
export type CalendarType = z.infer<typeof CalendarType>;

export const ConcernType = z.enum(['LOVE', 'CAREER', 'WEALTH', 'RELATIONSHIP', 'HEALTH', 'OTHER']);
export type ConcernType = z.infer<typeof ConcernType>;

export const OnboardingStep = z.enum([
  'STARTED',
  'SAJU_COMPLETED',
  'REPORT_GENERATED',
  'COMPLETED',
]);
export type OnboardingStep = z.infer<typeof OnboardingStep>;

// ── 요청 ──

export const GuestSajuRequest = z.object({
  calendarType: CalendarType,
  birthDate: z.string(), // yyyy-MM-dd
  birthTime: z.string().nullable(), // HH:mm. birthTimeUnknown=true면 null
  birthTimeUnknown: z.boolean(),
});
export type GuestSajuRequest = z.infer<typeof GuestSajuRequest>;

export const GuestConcernRequest = z.object({
  concernTypes: z.array(ConcernType).min(1),
});
export type GuestConcernRequest = z.infer<typeof GuestConcernRequest>;

// ── 응답 ──

export const GuestSessionResponse = z.object({ onboardingStep: OnboardingStep });
export type GuestSessionResponse = z.infer<typeof GuestSessionResponse>;

export const GuestSajuResponse = z.object({ onboardingStep: OnboardingStep });
export type GuestSajuResponse = z.infer<typeof GuestSajuResponse>;

export const GuestConcernResponse = z.object({
  concernTypes: z.array(ConcernType),
  onboardingStep: OnboardingStep,
});
export type GuestConcernResponse = z.infer<typeof GuestConcernResponse>;

export const GuestOnboardingResponse = z.object({
  calendarType: CalendarType,
  birthDate: z.string(),
  birthTime: z.string().nullable(),
  birthTimeUnknown: z.boolean(),
  concernTypes: z.array(ConcernType),
  onboardingStep: OnboardingStep,
});
export type GuestOnboardingResponse = z.infer<typeof GuestOnboardingResponse>;
