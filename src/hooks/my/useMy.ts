import { useQuery } from '@tanstack/react-query';

import { getMyPage, getSocialConnections } from '../../api/my';

export const myKeys = {
  all: ['my'] as const,
  profile: () => [...myKeys.all, 'profile'] as const,
  socialConnections: () => [...myKeys.all, 'social-connections'] as const,
};

export function useMyPage() {
  return useQuery({
    queryKey: myKeys.profile(),
    queryFn: getMyPage,
  });
}

export function useSocialConnections() {
  return useQuery({
    queryKey: myKeys.socialConnections(),
    queryFn: getSocialConnections,
  });
}
