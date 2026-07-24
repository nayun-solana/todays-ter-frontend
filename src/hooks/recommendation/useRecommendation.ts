import { useQuery } from '@tanstack/react-query';

import { getRecommendationDetail } from '../../api/recommendation';

export const recommendationKeys = {
  detail: (id: string) => ['recommendation', id] as const,
};

/** 추천 장소 상세 조회 */
export function useRecommendationDetail(id: string | undefined) {
  return useQuery({
    queryKey: recommendationKeys.detail(id ?? ''),
    queryFn: () => getRecommendationDetail(id!),
    enabled: !!id,
  });
}
