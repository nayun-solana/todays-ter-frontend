import {
  CreateRecordRequest,
  CreateRecordResponse,
  RecordImagesUploadResponse,
  type CreateRecordRequest as CreateRecordRequestType,
} from '../types/record/createRecord';
import { MyPlaceListResponse, type MyPlaceListType } from '../types/record/myPlace';
import { RecordDetail } from '../types/review/visitedReview';
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
  return RecordDetail.parse(payload);
}

/** @deprecated getRecordDetail 사용 */
export const getVisitedReviewDetail = getRecordDetail;

/**
 * 다녀온 터 기록/후기 이미지 업로드 — POST /records/images
 * multipart field: images (최대 5장, 장당 10MB, jpg/jpeg/png)
 */
export async function uploadRecordImages(files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));

  const response = await axiosInstance.post<ApiResponse>('/records/images', formData, {
    transformRequest: [
      (data, headers) => {
        // FormData는 브라우저가 boundary 포함 Content-Type을 붙이도록 둔다.
        if (data instanceof FormData && headers && typeof headers === 'object') {
          delete (headers as Record<string, unknown>)['Content-Type'];
        }
        return data;
      },
    ],
  });

  return RecordImagesUploadResponse.parse(getResult(response));
}

/** 다녀온 터 기록/후기 작성 — POST /records */
export async function createRecord(body: CreateRecordRequestType) {
  const payload = CreateRecordRequest.parse(body);
  const response = await axiosInstance.post<ApiResponse>('/records', payload);
  return CreateRecordResponse.parse(getResult(response));
}

/**
 * 이미지 업로드(있을 때) → 기록/후기 생성.
 * Swagger: 이미지를 먼저 올리고 imageId를 받아 POST /records에 넘긴다.
 */
export async function submitRecord(input: {
  placeId: number;
  type: CreateRecordRequestType['type'];
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
