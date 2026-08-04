import { z } from 'zod';

export const MyPageResponse = z.object({
  reportId: z.number().int().nonnegative(),
  nickname: z.string().min(1),
  profileImageUrl: z.string().url().nullable(),
});
export type MyPageResponse = z.infer<typeof MyPageResponse>;

const SocialProvider = z.enum(['KAKAO', 'NAVER', 'APPLE']);

export const SocialConnectionsResponse = z.object({
  policyUrl: z.string().url(),
  connections: z.array(
    z.object({
      provider: SocialProvider,
      isLinked: z.boolean(),
      linkedEmail: z.string().email().nullable(),
      linkedAt: z.string().nullable(),
    }),
  ),
});
export type SocialConnectionsResponse = z.infer<typeof SocialConnectionsResponse>;

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
