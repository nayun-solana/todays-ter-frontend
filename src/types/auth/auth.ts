import { z } from 'zod';

/** POST /auth/kakao/login 요청: `{ authorizationCode: string }` (api 함수 파라미터로 전달) */

/** POST /auth/kakao/login 응답 result */
export const KakaoLoginResponse = z.object({
  memberId: z.number().int(),
  accessToken: z.string().min(1),
  isNewMember: z.boolean(),
  // STARTED | SAJU_COMPLETED | REPORT_GENERATED | COMPLETED (BE OnboardingStep)
  onboardingStep: z.string().min(1),
});
export type KakaoLoginResponse = z.infer<typeof KakaoLoginResponse>;

/**
 * POST /auth/reissue 응답 result.
 * refresh 토큰은 JSON에 실리지 않는다 — BE가 HttpOnly 쿠키(`refresh_token`)로만 내려준다.
 */
export const TokenResponse = z.object({
  accessToken: z.string().min(1),
});
export type TokenResponse = z.infer<typeof TokenResponse>;

/** POST /auth/dev/token 응답 result (개발·테스트용 토큰 발급) */
export const DevTokenResponse = z.object({
  memberId: z.number().int(),
  accessToken: z.string().min(1),
});
export type DevTokenResponse = z.infer<typeof DevTokenResponse>;
