import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getMemberInfo,
  getMemberConcerns,
  getMemberSaju,
  getPolicies,
  getSocialConnections,
  isMemberOnboardingMissing,
  updateMemberConcerns,
  updateMemberSaju,
  withdrawMember,
} from '../../api/my';
import type {
  MemberConcernsUpdateRequest,
  MemberSajuUpdateRequest,
  MemberWithdrawRequest,
} from '../../types/my/my';
import { homeKeys } from '../home/useHome';
import { recommendationKeys } from '../recommendation/useRecommendation';

export const myKeys = {
  all: ['my'] as const,
  memberInfo: () => [...myKeys.all, 'member-info'] as const,
  socialConnections: () => [...myKeys.all, 'social-connections'] as const,
  saju: () => [...myKeys.all, 'saju'] as const,
  concerns: () => [...myKeys.all, 'concerns'] as const,
  policies: () => [...myKeys.all, 'policies'] as const,
};

/** 게스트도 /my에 들어오므로(로그인 유도 화면) 회원일 때만 호출한다. */
export function useMemberInfo(enabled = true) {
  return useQuery({
    queryKey: myKeys.memberInfo(),
    queryFn: getMemberInfo,
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

/**
 * 회원 고민 유형 조회.
 *
 * `enabled`로 호출 시점을 막을 수 있다 — 온보딩3 화면은 회원 수정 모드일 때만 부른다
 * (게스트가 부르면 인증이 없어 401이다).
 */
export function useMemberConcerns(enabled = true) {
  return useQuery({
    queryKey: myKeys.concerns(),
    queryFn: getMemberConcerns,
    enabled,
    // 온보딩 정보가 없는 회원(MEMBER404_3)은 다시 시도해도 계속 404다.
    retry: (failureCount, error) => !isMemberOnboardingMissing(error) && failureCount < 1,
  });
}

/**
 * 회원 고민 유형 수정.
 *
 * ⚠️ **무효화가 이 훅의 핵심이다.** 고민 유형은 리포트 문구용이 아니라 장소 추천 **점수에 직접**
 * 들어간다(BE `RecommendationMatchingService.concernCompatibilityScore`). 저장만 하고 캐시를
 * 그대로 두면 "고민을 바꿨는데 추천이 그대로"로 보인다 — 완료 화면은 재생성됐다고 말하는데도.
 *
 * 서버 쪽은 알아서 다시 계산된다. 추천 스냅샷 캐시 키가 `(reportId, placeId, concernKey)`이고
 * `concernKey`가 고민 목록에서 파생되므로, 고민이 바뀌면 키가 달라져 새 스냅샷이 생긴다
 * (BE `PlaceRecommendationSnapshotService`). 즉 리포트를 재생성할 필요가 없다.
 * FE는 들고 있던 옛 응답만 버리면 된다.
 */
export function useUpdateMemberConcerns() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: MemberConcernsUpdateRequest) => updateMemberConcerns(body),
    onSuccess: (data) => {
      queryClient.setQueryData(myKeys.concerns(), data);
      // 홈 4개(기운·루틴·추천·헤더)와 추천 상세가 전부 고민에서 파생된다.
      void queryClient.invalidateQueries({ queryKey: homeKeys.all });
      // 공유 토큰 쿼리(`recommendationKeys.share`)는 제외한다. 그쪽 queryFn은 서버에 토큰을
      // 만드는 POST고 `staleTime: Infinity`로 재발급을 막아둔 건데, invalidate는 staleTime을
      // 무시하므로 프리픽스로 싹 쓸면 고민 수정만으로 발급 요청이 다시 나간다.
      void queryClient.invalidateQueries({
        queryKey: recommendationKeys.all,
        predicate: (query) => query.queryKey[2] !== 'share',
      });
    },
  });
}

export function usePolicies() {
  return useQuery({
    queryKey: myKeys.policies(),
    queryFn: getPolicies,
  });
}
