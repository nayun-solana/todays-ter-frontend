import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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
import { reviewKeys } from '../review/useReview';

export const recordKeys = {
  all: ['record'] as const,
  myPlaces: (type: MyPlaceListType) => [...recordKeys.all, 'places-me', type] as const,
};

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
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: recordKeys.all });
    },
  });
}

/** 기록/후기 생성 — PlaceReviewPage */
export function useCreateRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: RecordCreateRequest) => createRecord(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: recordKeys.all });
    },
  });
}

type SubmitRecordUpdateInput = {
  recordId: number | string;
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
    },
  });
}

/** 기록/후기 수정 — PlaceReviewPage */
export function useUpdateRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recordId, body }: { recordId: number | string; body: RecordUpdateRequest }) =>
      updateRecord(recordId, body),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: recordKeys.all });
      void queryClient.invalidateQueries({
        queryKey: reviewKeys.detail(String(variables.recordId)),
      });
    },
  });
}

/** 기록/후기 삭제 — DELETE /records/{id} */
export function useDeleteRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recordId: number | string) => deleteRecord(recordId),
    onSuccess: (_data, recordId) => {
      void queryClient.invalidateQueries({ queryKey: recordKeys.all });
      void queryClient.removeQueries({
        queryKey: reviewKeys.detail(String(recordId)),
      });
    },
  });
}

export function useUploadRecordImages() {
  return useMutation({ mutationFn: uploadRecordImages });
}
