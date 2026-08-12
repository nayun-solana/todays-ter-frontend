import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';

import {
  createRecord,
  deleteRecord,
  getMyPlaces,
  submitRecord,
  submitRecordUpdate,
  updateRecord,
  uploadRecordImages,
} from '../../api/record';
import type { RecordCreateRequest, RecordUpdateRequest } from '../../types/record/record';
import type { MyPlaceListType } from '../../types/record/myPlace';
import { placeKeys } from '../place/placeKeys';
import { reviewKeys } from '../review/useReview';

export const recordKeys = {
  all: ['record'] as const,
  myPlaces: (type: MyPlaceListType) => [...recordKeys.all, 'places-me', type] as const,
};

/**
 * 후기를 쓰거나 고치거나 지우면 그 장소 화면도 옛것이 된다.
 *
 * ⚠️ `recordKeys.all`(=`['record']`) 무효화로는 **절대 안 걸린다.** 장소 상세가 별점을 읽는
 * 쿼리는 `['places','reviews',id]`라 접두사가 하나도 겹치지 않는다. 이게 빠져 있어서
 * "별점을 고쳐도 화면이 그대로"인 증상이 있었다(#174). `staleTime: 30_000`이라 저장 직후
 * 재요청조차 나가지 않아 30초쯤 지나야 저절로 반영됐다.
 *
 * `placeKeys`는 `usePlace`가 아니라 `placeKeys` 모듈에서 가져온다 — `usePlace`가 이미
 * `recordKeys`를 쓰고 있어서 훅끼리 직접 물리면 순환 참조가 된다.
 */
function invalidatePlaceReviews(queryClient: QueryClient, placeId: number | string) {
  const id = String(placeId);
  void queryClient.invalidateQueries({ queryKey: placeKeys.reviews(id) });
  // 상세도 함께 — 후기 수·평균 별점이 여기 들어 있다.
  void queryClient.invalidateQueries({ queryKey: placeKeys.detail(id) });
}

export function useMyPlaces(type: MyPlaceListType) {
  return useQuery({
    queryKey: recordKeys.myPlaces(type),
    queryFn: () => getMyPlaces(type),
  });
}

type SubmitRecordInput = {
  placeId: number;
  type: RecordCreateRequest['type'];
  rating: number;
  content: string;
  files?: File[];
};

/** 이미지 업로드 → 기록/후기 생성 (matched-ter ReviewPage) */
export function useSubmitRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SubmitRecordInput) => submitRecord(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: recordKeys.all });
      invalidatePlaceReviews(queryClient, variables.placeId);
    },
  });
}

/** 기록/후기 생성 — PlaceReviewPage */
export function useCreateRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: RecordCreateRequest) => createRecord(body),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: recordKeys.all });
      invalidatePlaceReviews(queryClient, variables.placeId);
    },
  });
}

type SubmitRecordUpdateInput = {
  recordId: number | string;
  /**
   * 이 후기가 달린 장소. 장소 상세의 후기 목록을 비우는 데 쓴다.
   *
   * 선택값이 아니라 **필수다.** 처음에는 `placeId?`로 뒀다가 `ReviewPage`에서 빠뜨렸고,
   * 타입이 통과시켜서 "별점을 고쳐도 장소 상세가 그대로"인 증상이 그대로 남았다(#191).
   */
  placeId: number | string;
  rating: number;
  content: string;
  files?: File[];
  replaceImages?: boolean;
  keepImageIds?: number[];
};

/** 기록/후기 수정 + 이미지 업로드 (matched-ter ReviewPage edit) */
export function useSubmitRecordUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SubmitRecordUpdateInput) => submitRecordUpdate(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: recordKeys.all });
      void queryClient.invalidateQueries({
        queryKey: reviewKeys.detail(String(variables.recordId)),
      });
      invalidatePlaceReviews(queryClient, variables.placeId);
    },
  });
}

/** 기록/후기 수정 — PlaceReviewPage */
export function useUpdateRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      recordId,
      body,
    }: {
      recordId: number | string;
      body: RecordUpdateRequest;
      /** 이 후기가 달린 장소. 빠뜨리면 장소 상세가 옛 별점을 계속 보여준다 — 필수다(#191). */
      placeId: number | string;
    }) => updateRecord(recordId, body),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: recordKeys.all });
      void queryClient.invalidateQueries({
        queryKey: reviewKeys.detail(String(variables.recordId)),
      });
      invalidatePlaceReviews(queryClient, variables.placeId);
    },
  });
}

type DeleteRecordInput = {
  recordId: number | string;
  /** 이 후기가 달린 장소. 빠뜨리면 장소 상세가 지운 후기를 계속 보여준다 — 필수다(#191). */
  placeId: number | string;
};

/**
 * 기록/후기 삭제 — DELETE /records/{id}
 *
 * 장소 후기 무효화가 예전에는 `PlaceDetailPage`의 `onSuccess`에만 손으로 들어가 있었다.
 * 작성·수정에는 같은 처리가 없어서 삭제만 화면에 반영되던 것이라, 세 경로 규칙을 여기 모은다.
 */
export function useDeleteRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recordId }: DeleteRecordInput) => deleteRecord(recordId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: recordKeys.all });
      void queryClient.removeQueries({
        queryKey: reviewKeys.detail(String(variables.recordId)),
      });
      invalidatePlaceReviews(queryClient, variables.placeId);
    },
  });
}

export function useUploadRecordImages() {
  return useMutation({ mutationFn: uploadRecordImages });
}
