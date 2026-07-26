import { useQuery } from '@tanstack/react-query';

import { getVisitedReviewDetail } from '../../api/record';

export const reviewKeys = {
  all: ['review'] as const,
  visitedDetail: (visitId: string) => [...reviewKeys.all, 'visited', visitId] as const,
};

export function useVisitedReviewDetail(visitId?: string) {
  return useQuery({
    queryKey: reviewKeys.visitedDetail(visitId ?? ''),
    queryFn: () => getVisitedReviewDetail(visitId!),
    enabled: Boolean(visitId),
  });
}
