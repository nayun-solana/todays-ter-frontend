import { z } from 'zod';

import { ConcernType } from '../onboarding/guestOnboarding';

export const MyPageResponse = z.object({
  reportId: z.number().int().positive(),
  nickname: z.string().min(1),
  profileImageUrl: z.string().url().nullish(),
});
export type MyPageResponse = z.infer<typeof MyPageResponse>;

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
