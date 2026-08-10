import { useQuery } from '@tanstack/react-query';
import { Navigate, Outlet, useLocation } from 'react-router';

import { getGuestSessionStatus } from '../api/onboarding';
import { useAuthStatus } from '../hooks/auth/useAuthStatus';
import { onboardingKeys } from '../hooks/onboarding/useGuestOnboarding';

/**
 * 세션이 **아예 없는** 방문자를 로그인으로 보낸다.
 *
 * 게스트 개방 정책(#109)이 말하는 "게스트"는 세션이 있는 비회원이다. 세션 없이 URL을 직접
 * 쳐서 들어온 사람은 그 정의에 들어가지 않는데, BE 경로 상당수가 permitAll이라 화면이
 * 그대로 열려 있었다.
 *
 * `guest_id`는 HttpOnly라 JS로 못 읽는다 → 서버에 물어보는 수밖에 없고,
 * `POST /api/guest-sessions`는 물어보는 순간 만들어버려서 쓸 수 없다.
 * 그래서 부작용 없는 `GET /api/guest-sessions/status`를 쓴다.
 *
 * ⚠️ **fail-open이 핵심이다.** 조회가 실패하면(엔드포인트 미배포·5xx·네트워크 단절)
 * 통과시킨다. 확실한 "세션 없음"(`hasGuestId: false`)일 때만 막는다.
 * fail-closed로 만들면 서버가 잠깐 흔들릴 때 **모든 방문자가 로그인 화면에 갇힌다.**
 */
export default function SessionGate() {
  const { isMember, isPending: isAuthPending } = useAuthStatus();
  const location = useLocation();

  // 회원이면 게스트 세션을 물어볼 이유가 없다. 부팅 복원 중에도 아직 회원일 수 있으므로
  // 판정이 끝난 뒤에만 조회한다.
  const shouldCheck = !isAuthPending && !isMember;

  const { data, isPending, isError } = useQuery({
    queryKey: onboardingKeys.sessionStatus,
    queryFn: getGuestSessionStatus,
    enabled: shouldCheck,
    // 세션 유무는 한 번 확인하면 이 방문 동안 바뀌지 않는다(바뀌면 로그인/온보딩을 거친다).
    staleTime: Infinity,
    retry: false,
  });

  if (isAuthPending) return <GateFallback />;
  if (isMember) return <Outlet />;
  if (isPending) return <GateFallback />;

  // 판정 불가는 통과 — 위 주석의 fail-open.
  if (isError) return <Outlet />;

  if (data?.hasGuestId === false) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return <Outlet />;
}

/** 판정 중 자리. 라우트 청크 로딩·다른 가드와 같은 톤. */
function GateFallback() {
  return <div className="min-h-dvh bg-gray-1" aria-busy="true" aria-label="불러오는 중" />;
}
