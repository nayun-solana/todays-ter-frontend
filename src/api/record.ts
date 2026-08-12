import {
  ImageUploadResponse,
  RecordCreateRequest,
  RecordDetailResponse,
  RecordResponse,
  RecordUpdateRequest,
  RecordUpdateResponse,
  type RecordCreateRequest as RecordCreateRequestType,
  type RecordUpdateRequest as RecordUpdateRequestType,
} from '../types/record/record';
import { MyPlaceListResponse, type MyPlaceListType } from '../types/record/myPlace';
import axiosInstance from './axiosInstance';
import { getResult } from './helpers';
import type { ApiResponse } from './types';

/** 저장한 터 / 다녀온 터 목록 조회 — GET /places/me?type=saved|visited */
export async function getMyPlaces(type: MyPlaceListType) {
  const response = await axiosInstance.get<ApiResponse>('/places/me', {
    params: { type },
  });

  return MyPlaceListResponse.parse(getResult(response));
}

/**
 * 기록/후기 상세 조회 — GET /records/{id}
 * id = recordId(다녀온 터) | reviewId(장소 후기)
 */
export async function getRecordDetail(id: number | string) {
  const response = await axiosInstance.get<ApiResponse & { data?: unknown }>(`/records/${id}`);
  const body = response.data;
  const payload = body.result ?? body.data;
  return RecordDetailResponse.parse(payload);
}

/** 다녀온 터 기록/후기 이미지 업로드 — POST /records/images */
export async function uploadRecordImages(files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));

  const response = await axiosInstance.post<ApiResponse>('/records/images', formData, {
    transformRequest: [
      (data, headers) => {
        if (data instanceof FormData && headers && typeof headers === 'object') {
          delete (headers as Record<string, unknown>)['Content-Type'];
        }
        return data;
      },
    ],
  });

  return ImageUploadResponse.parse(getResult(response));
}

/** 다녀온 터 기록/후기 작성 — POST /records */
export async function createRecord(body: RecordCreateRequestType) {
  const payload = RecordCreateRequest.parse(body);
  const response = await axiosInstance.post<ApiResponse>('/records', payload);
  return RecordResponse.parse(getResult(response));
}

/** 다녀온 터 기록/후기 수정 — PATCH /records/{id} */
export async function updateRecord(id: number | string, body: RecordUpdateRequestType) {
  const payload = RecordUpdateRequest.parse(body);
  const response = await axiosInstance.patch<ApiResponse>(`/records/${id}`, payload);
  return RecordUpdateResponse.parse(getResult(response));
}

/** 다녀온 터 기록/후기 삭제 — DELETE /records/{id} */
export async function deleteRecord(id: number | string) {
  await axiosInstance.delete<ApiResponse>(`/records/${id}`);
}

/**
 * 이미지 업로드(있을 때) → 기록/후기 생성.
 */
export async function submitRecord(input: {
  placeId: number;
  type: RecordCreateRequestType['type'];
  rating: number;
  content: string;
  files?: File[];
}) {
  const files = input.files ?? [];
  let imageIds: number[] = [];

  if (files.length > 0) {
    const uploaded = await uploadRecordImages(files);
    imageIds = uploaded.images.map((image) => image.imageId);
  }

  return createRecord({
    placeId: input.placeId,
    type: input.type,
    rating: input.rating,
    content: input.content,
    imageIds,
  });
}

/**
 * 기록/후기 수정.
 * replaceImages면 imageIds를 최종 목록으로 보냄(기존 유지 id + 신규 업로드).
 */
export async function submitRecordUpdate(input: {
  recordId: number | string;
  rating: number;
  content: string;
  files?: File[];
  replaceImages?: boolean;
  keepImageIds?: number[];
}) {
  const files = input.files ?? [];
  const body: RecordUpdateRequestType = {
    rating: input.rating,
    content: input.content,
  };

  if (input.replaceImages) {
    let uploadedIds: number[] = [];
    if (files.length > 0) {
      const uploaded = await uploadRecordImages(files);
      uploadedIds = uploaded.images.map((image) => image.imageId);
    }
    body.imageIds = [...(input.keepImageIds ?? []), ...uploadedIds];
  }

  return updateRecord(input.recordId, body);
}
