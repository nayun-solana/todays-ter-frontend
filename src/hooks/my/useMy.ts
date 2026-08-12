import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getMyPage,
  getMemberSaju,
  getPolicies,
  getSocialConnections,
  updateMemberSaju,
  withdrawMember,
} from '../../api/my';
import type { MemberSajuUpdateRequest, MemberWithdrawRequest } from '../../types/my/my';

export const myKeys = {
  all: ['my'] as const,
  profile: () => [...myKeys.all, 'profile'] as const,
  socialConnections: () => [...myKeys.all, 'social-connections'] as const,
  saju: () => [...myKeys.all, 'saju'] as const,
  policies: () => [...myKeys.all, 'policies'] as const,
};

/** 게스트도 /my에 들어오므로(로그인 유도 화면) 회원일 때만 호출한다. */
export function useMyPage(enabled = true) {
  return useQuery({
    queryKey: myKeys.profile(),
    queryFn: getMyPage,
    enabled,
  });
}

export function useSocialConnections() {
  return useQuery({
    queryKey: myKeys.socialConnections(),
    queryFn: getSocialConnections,
  });
}

export function useMemberSaju() {
  return useQuery({
    queryKey: myKeys.saju(),
    queryFn: getMemberSaju,
  });
}

export function useUpdateMemberSaju() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: MemberSajuUpdateRequest) => updateMemberSaju(body),
    onSuccess: (data) => queryClient.setQueryData(myKeys.saju(), data),
  });
}

export function useWithdrawMember() {
  return useMutation({
    mutationFn: (body: MemberWithdrawRequest) => withdrawMember(body),
  });
}

export function usePolicies() {
  return useQuery({
    queryKey: myKeys.policies(),
    queryFn: getPolicies,
  });
}
