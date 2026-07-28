import { z } from 'zod';

/** POST /auth/kakao/login 요청 */
export const KakaoLoginRequest = z.object({
  authorizationCode: z.string().min(1),
});
export type KakaoLoginRequest = z.infer<typeof KakaoLoginRequest>;

/** POST /auth/kakao/login 응답 result */
export const KakaoLoginResponse = z.object({
  memberId: z.number().int(),
  accessToken: z.string().min(1),
  isNewMember: z.boolean(),
  // STARTED | SAJU_COMPLETED | REPORT_GENERATED | COMPLETED (BE OnboardingStep)
  onboardingStep: z.string().min(1),
});
export type KakaoLoginResponse = z.infer<typeof KakaoLoginResponse>;
