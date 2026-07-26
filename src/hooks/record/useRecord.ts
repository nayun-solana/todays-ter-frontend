import { useQuery } from '@tanstack/react-query';

import { getMyPlaces } from '../../api/record';
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
