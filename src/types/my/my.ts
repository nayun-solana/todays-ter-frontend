import { z } from 'zod';

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
