import {
  ImageUploadResponse,
  RecordCreateRequest,
  RecordDetailResponse,
  RecordResponse,
  RecordUpdateRequest,
  RecordUpdateResponse,
} from '../types/record/record';
import { MyPlaceListResponse, type MyPlaceListType } from '../types/record/myPlace';
import axiosInstance from './axiosInstance';
import { getResult } from './helpers';
import type { ApiResponse } from './types';

/** 저장한 터 / 다녀온 터 목록 조회 */
export async function getMyPlaces(type: MyPlaceListType) {
  const response = await axiosInstance.get<ApiResponse>('/places/me', {
    params: { type },
  });

  return MyPlaceListResponse.parse(getResult(response));
}

/** 다녀온 터 후기 상세 조회 */
export async function getVisitedReviewDetail(visitId: number | string) {
  const response = await axiosInstance.get<ApiResponse>(`/records/${visitId}`);
  return RecordDetailResponse.parse(getResult(response));
}

export async function createRecord(body: RecordCreateRequest): Promise<RecordResponse> {
  const response = await axiosInstance.post<ApiResponse>('/records', body);
  return RecordResponse.parse(getResult(response));
}

export async function updateRecord(
  recordId: number | string,
  body: RecordUpdateRequest,
): Promise<RecordUpdateResponse> {
  const response = await axiosInstance.patch<ApiResponse>(`/records/${recordId}`, body);
  return RecordUpdateResponse.parse(getResult(response));
}

export async function deleteRecord(recordId: number | string): Promise<void> {
  await axiosInstance.delete<ApiResponse>(`/records/${recordId}`);
}

export async function uploadRecordImages(files: File[]): Promise<ImageUploadResponse> {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));
  const response = await axiosInstance.post<ApiResponse>('/records/images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return ImageUploadResponse.parse(getResult(response));
}
