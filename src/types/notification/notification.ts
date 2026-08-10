import { z } from 'zod';

/** 목록 응답은 백엔드 DTO가 공개되기 전까지 이 형태를 프론트 계약으로 사용한다. */
export const NotificationItem = z.object({
  notificationId: z.number().int().positive(),
  type: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1),
  isRead: z.boolean(),
  createdAt: z.string().min(1),
});
export type NotificationItem = z.infer<typeof NotificationItem>;

export const NotificationListResponse = z.object({
  notifications: z.array(NotificationItem),
  unreadCount: z.number().int().nonnegative().optional(),
});
export type NotificationListResponse = z.infer<typeof NotificationListResponse>;

export const NotificationReadResponse = z.object({
  notificationId: z.number().int().positive(),
});
export type NotificationReadResponse = z.infer<typeof NotificationReadResponse>;

export const NotificationReadAllResponse = z.object({
  updatedCount: z.number().int().nonnegative(),
});
export type NotificationReadAllResponse = z.infer<typeof NotificationReadAllResponse>;

export const NotificationSettingsResponse = z.object({
  isTodayRemind: z.boolean(),
  remindCycle: z.string().min(1),
  remindTime: z.string().min(1),
  isSavedPlace: z.boolean(),
  isServiceNotice: z.boolean(),
  isMarketing: z.boolean(),
});
export type NotificationSettingsResponse = z.infer<typeof NotificationSettingsResponse>;

export const NotificationSettingsRequest = NotificationSettingsResponse;
export type NotificationSettingsRequest = z.infer<typeof NotificationSettingsRequest>;
