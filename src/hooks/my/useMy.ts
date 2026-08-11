import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getMyPage,
  getMemberSaju,
  getPermissionSettings,
  getPolicies,
  getSocialConnections,
  updateMemberSaju,
  updatePermissionSettings,
  withdrawMember,
} from '../../api/my';
import type {
  MemberSajuUpdateRequest,
  MemberWithdrawRequest,
  PermissionSettingsRequest,
} from '../../types/my/my';

export const myKeys = {
  all: ['my'] as const,
  profile: () => [...myKeys.all, 'profile'] as const,
  socialConnections: () => [...myKeys.all, 'social-connections'] as const,
  saju: () => [...myKeys.all, 'saju'] as const,
  permissions: () => [...myKeys.all, 'permissions'] as const,
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

export function usePermissionSettings() {
  return useQuery({
    queryKey: myKeys.permissions(),
    queryFn: getPermissionSettings,
  });
}

export function useUpdatePermissionSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: PermissionSettingsRequest) => updatePermissionSettings(body),
    onMutate: async (body) => {
      await queryClient.cancelQueries({ queryKey: myKeys.permissions() });
      const previous = queryClient.getQueryData(myKeys.permissions());
      queryClient.setQueryData(myKeys.permissions(), body);
      return { previous };
    },
    onError: (_error, _body, context) => {
      queryClient.setQueryData(myKeys.permissions(), context?.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: myKeys.permissions() }),
  });
}

export function usePolicies() {
  return useQuery({
    queryKey: myKeys.policies(),
    queryFn: getPolicies,
  });
}
