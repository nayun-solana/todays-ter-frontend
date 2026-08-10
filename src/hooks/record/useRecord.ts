import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createRecord,
  deleteRecord,
  getMyPlaces,
  updateRecord,
  uploadRecordImages,
} from '../../api/record';
import type { RecordCreateRequest, RecordUpdateRequest } from '../../types/record/record';
import type { MyPlaceListType } from '../../types/record/myPlace';

export const recordKeys = {
  all: ['record'] as const,
  myPlaces: (type: MyPlaceListType) => [...recordKeys.all, 'my-places', type] as const,
};

export function useMyPlaces(type: MyPlaceListType) {
  return useQuery({
    queryKey: recordKeys.myPlaces(type),
    queryFn: () => getMyPlaces(type),
  });
}

export function useCreateRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: RecordCreateRequest) => createRecord(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recordKeys.all }),
  });
}

export function useUpdateRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recordId, body }: { recordId: number | string; body: RecordUpdateRequest }) =>
      updateRecord(recordId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recordKeys.all }),
  });
}

export function useDeleteRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recordId: number | string) => deleteRecord(recordId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recordKeys.all }),
  });
}

export function useUploadRecordImages() {
  return useMutation({ mutationFn: uploadRecordImages });
}
