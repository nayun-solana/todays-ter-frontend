import { z } from 'zod';

export const MyPageResponse = z.object({
  memberId: z.number().int().positive(),
  email: z.string().min(1),
  nickname: z.string().min(1),
  status: z.enum(['ACTIVE', 'WITHDRAWN']),
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

export const NotificationSettingsResponse = z.object({
  isPushEnabled: z.boolean(),
  isMarketingEnabled: z.boolean(),
  isNightMarketingEnabled: z.boolean(),
});
export type NotificationSettingsResponse = z.infer<typeof NotificationSettingsResponse>;

export const NotificationSettingsRequest = NotificationSettingsResponse;
export type NotificationSettingsRequest = z.infer<typeof NotificationSettingsRequest>;

export const PermissionSettingsResponse = z.object({
  isCameraAllowed: z.boolean(),
  isPhotoLibraryAllowed: z.boolean(),
  isLocationAllowed: z.boolean(),
});
export type PermissionSettingsResponse = z.infer<typeof PermissionSettingsResponse>;

export const PermissionSettingsRequest = PermissionSettingsResponse;
export type PermissionSettingsRequest = z.infer<typeof PermissionSettingsRequest>;

export const UpdatedAtResponse = z.object({
  updatedAt: z.string().min(1),
});
export type UpdatedAtResponse = z.infer<typeof UpdatedAtResponse>;

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
