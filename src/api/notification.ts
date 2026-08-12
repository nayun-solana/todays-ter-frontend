import {
  NotificationListResponse,
  NotificationReadAllResponse,
  NotificationReadResponse,
  NotificationSettingsResponse,
  UnreadNotificationCountResponse,
  type NotificationListParams,
  type NotificationSettingsRequest,
} from '../types/notification/notification';
import axiosInstance from './axiosInstance';
import { getResult } from './helpers';
import type { ApiResponse } from './types';

export async function getNotifications(
  params: NotificationListParams,
): Promise<NotificationListResponse> {
  const response = await axiosInstance.get<ApiResponse>('/notifications', { params });
  return NotificationListResponse.parse(getResult(response));
}

export async function getUnreadNotificationCount(): Promise<UnreadNotificationCountResponse> {
  const response = await axiosInstance.get<ApiResponse>('/notifications/unread-count');
  return UnreadNotificationCountResponse.parse(getResult(response));
}

export async function markNotificationAsRead(
  notificationId: number,
): Promise<NotificationReadResponse> {
  const response = await axiosInstance.patch<ApiResponse>(`/notifications/${notificationId}/read`);
  return NotificationReadResponse.parse(getResult(response));
}

export async function markAllNotificationsAsRead(): Promise<NotificationReadAllResponse> {
  const response = await axiosInstance.patch<ApiResponse>('/notifications/read-all');
  return NotificationReadAllResponse.parse(getResult(response));
}

export async function getNotificationSettings(): Promise<NotificationSettingsResponse> {
  const response = await axiosInstance.get<ApiResponse>('/notifications/settings');
  return NotificationSettingsResponse.parse(getResult(response));
}

export async function updateNotificationSettings(
  body: NotificationSettingsRequest,
): Promise<NotificationSettingsResponse> {
  const response = await axiosInstance.patch<ApiResponse>('/notifications/settings', body);
  return NotificationSettingsResponse.parse(getResult(response));
}
