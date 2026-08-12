import { z } from 'zod';

import { ConcernType } from '../onboarding/guestOnboarding';

/**
 * GET /members/me 응답.
 *
 * 예전에는 `GET /mypage`에서 닉네임·프로필사진·reportId를 한 번에 받는 계약이었는데
 * **그 경로는 서버에 존재한 적이 없다**(배포 스펙 확인). 닉네임은 여기서, `reportId`는
 * `GET /fortune-reports/me`에서 받는다. 프로필 사진은 아직 어느 응답에도 없다(#156).
 */
export const MemberInfoResponse = z.object({
  memberId: z.number().int().positive(),
  email: z.string(),
  nickname: z.string().min(1),
  status: z.string(),
});
export type MemberInfoResponse = z.infer<typeof MemberInfoResponse>;

const SocialProvider = z.enum(['KAKAO', 'GOOGLE', 'APPLE']);

export const SocialConnectionsResponse = z.object({
  socialAccounts: z.array(
    z.object({
      provider: SocialProvider,
      email: z.string().min(1),
    }),
  ),
});
export type SocialConnectionsResponse = z.infer<typeof SocialConnectionsResponse>;

export const MemberSajuResponse = z.object({
  calendarType: z.enum(['SOLAR', 'LUNAR']),
  birthDate: z.string().min(1),
  birthTime: z.string(),
  birthTimeUnknown: z.boolean(),
});
export type MemberSajuResponse = z.infer<typeof MemberSajuResponse>;

export const MemberSajuUpdateRequest = z.object({
  calendarType: z.enum(['SOLAR', 'LUNAR']),
  birthDate: z.string().min(1),
  birthTime: z.string(),
  birthTimeUnknown: z.boolean(),
});
export type MemberSajuUpdateRequest = z.infer<typeof MemberSajuUpdateRequest>;

export const WithdrawReason = z.enum([
  'LOW_USAGE',
  'POOR_RECOMMENDATION',
  'PRIVACY_CONCERN',
  'MISSING_FEATURES',
  'INCONVENIENT_APP',
  'OTHER',
]);
export type WithdrawReason = z.infer<typeof WithdrawReason>;

export const MemberWithdrawRequest = z.object({
  withdrawReason: WithdrawReason,
});
export type MemberWithdrawRequest = z.infer<typeof MemberWithdrawRequest>;

/**
 * 회원 고민 유형. 게스트 온보딩과 같은 enum을 쓴다(BE도 `onboarding.enums.ConcernType` 하나다) —
 * 회원/게스트용으로 따로 정의하면 값이 갈릴 여지만 생긴다.
 */
export const MemberConcernsResponse = z.object({
  concernTypes: z.array(ConcernType),
});
export type MemberConcernsResponse = z.infer<typeof MemberConcernsResponse>;

/** PUT /members/me/concerns — BE가 `@NotEmpty`라 빈 배열은 400이다. */
export const MemberConcernsUpdateRequest = z.object({
  concernTypes: z.array(ConcernType).min(1),
});
export type MemberConcernsUpdateRequest = z.infer<typeof MemberConcernsUpdateRequest>;

const PolicyType = z.enum(['TERMS_OF_SERVICE', 'PRIVACY_POLICY', 'MARKETING_CONSENT']);

export const PoliciesResponse = z.object({
  policies: z.array(
    z.object({
      type: PolicyType,
      title: z.string().min(1),
      url: z.string().url(),
      isRequired: z.boolean(),
      isAgreed: z.boolean(),
      agreedAt: z.string().min(1).nullable(),
    }),
  ),
});
export type PoliciesResponse = z.infer<typeof PoliciesResponse>;
