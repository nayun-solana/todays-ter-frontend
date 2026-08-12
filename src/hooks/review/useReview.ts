import { useQuery } from '@tanstack/react-query';

import { getRecordDetail } from '../../api/record';

export const reviewKeys = {
  all: ['review'] as const,
  detail: (recordId: string) => [...reviewKeys.all, 'detail', recordId] as const,
};

/** GET /records/{id} — id는 recordId 또는 reviewId */
export function useRecordDetail(recordId?: string) {
  return useQuery({
    queryKey: reviewKeys.detail(recordId ?? ''),
    queryFn: () => getRecordDetail(recordId!),
    enabled: Boolean(recordId),
  });
}
