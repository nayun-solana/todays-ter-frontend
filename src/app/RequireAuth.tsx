import { Navigate, Outlet, useLocation, useParams } from 'react-router';

import { useAuthStatus } from '../hooks/auth/useAuthStatus';
import { useRecommendedPlaces } from '../hooks/home/useHome';

/** 게스트에게 열어주는 추천 카드 수. TODO: BE 배포 후 응답의 visibleCount로 교체. */
const GUEST_VISIBLE_RECOMMENDATIONS = 1;

/** 가드가 판정을 못 내린 동안 보여줄 자리(라우트 청크 로딩과 같은 톤). */
function GuardFallback() {
  return <div className="min-h-dvh bg-gray-1" aria-busy="true" aria-label="불러오는 중" />;
}

/**
 * 회원 전용 라우트.
 * 토큰이 없으면 로그인으로 보내고, 원래 가려던 경로를 state.from에 실어 로그인 후 복귀할 수 있게 한다.
 * 세션 만료(인터셉터가 토큰을 비움) 시에도 이 가드가 리다이렉트를 맡는다.
 */
export function RequireMember() {
  const { isMember, isPending } = useAuthStatus();
  const location = useLocation();

  // 부팅 복원이 끝나기 전엔 토큰이 없어도 게스트로 단정하면 안 된다
  // (localStorage가 지워진 회원을 /login으로 튕겨버린다).
  if (isPending) {
    return <GuardFallback />;
  }

  if (!isMember) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return <Outlet />;
}

/**
 * 추천 상세(/matched-ter/:id) 접근 가드.
 * 회원은 전부 통과. 게스트는 홈에서 노출이 허용된 추천 카드로 들어온 경우에만 통과시킨다
 * (URL을 직접 쳐서 잠긴 추천을 열어보는 것을 막는다).
 * 추천 목록을 못 불러와 판정이 불가능하면 홈으로 되돌린다.
 */
export function RequireRecommendationAccess() {
  const { isMember, isPending: isAuthPending } = useAuthStatus();
  const { id } = useParams();
  // 회원 판정 전에 목록을 부르면 게스트로 나가서 잠긴 카드를 잘못 판정한다.
  const { data, isPending, isError } = useRecommendedPlaces({
    enabled: !isAuthPending && !isMember,
  });

  if (isAuthPending) return <GuardFallback />;
  if (isMember) return <Outlet />;

  if (isPending) return <GuardFallback />;
  if (isError) return <Navigate to="/home" replace />;

  const allowedIds = data.places
    .slice(0, GUEST_VISIBLE_RECOMMENDATIONS)
    .map((place) => place.recommendationId);

  if (!id || !allowedIds.includes(id)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
