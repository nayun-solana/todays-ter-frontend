import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getMyPlaces, submitRecord } from '../../api/record';
import type { CreateRecordRequest } from '../../types/record/createRecord';
import type { MyPlaceListType } from '../../types/record/myPlace';

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
  type: CreateRecordRequest['type'];
  rating: number;
  content: string;
  files?: File[];
};

/** 이미지 업로드 → 기록/후기 생성 */
export function useSubmitRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SubmitRecordInput) => submitRecord(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: recordKeys.all });
    },
  });
}
