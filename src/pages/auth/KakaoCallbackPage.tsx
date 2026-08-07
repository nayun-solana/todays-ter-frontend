import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import Button from '../../components/Button';
import StatusView from '../../components/StatusView';
import { useKakaoLogin } from '../../hooks/auth/useAuth';
import { nextPathForOnboardingStep } from '../../lib/onboardingRoute';

/**
 * 이미 교환을 시도한 인가코드.
 *
 * 인가코드는 1회용이라 두 번 보내면 두 번째가 반드시 실패한다. StrictMode는 이펙트를
 * mount → cleanup → mount로 두 번 돌리므로 가드가 필요한데, `useRef`는 컴포넌트가
 * 다시 마운트되면 초기화되므로 모듈 스코프에 둔다.
 */
const attemptedCodes = new Set<string>();

/**
 * 카카오 인가 콜백(`/oauth/kakao/callback`).
 * 쿼리의 인가코드를 BE에 넘겨 accessToken을 받고, 온보딩 진행도에 따라 다음 화면으로 보낸다.
 */
export default function KakaoCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const kakaoLogin = useKakaoLogin();
  const [requestFailed, setRequestFailed] = useState(false);

  const code = searchParams.get('code');
  // 사용자가 동의를 취소하면 code 대신 error가 온다(예: access_denied).
  const denied = searchParams.get('error') !== null;
  // 코드 없이 들어온 경우는 상태가 아니라 URL로 이미 정해져 있으므로 파생시킨다.
  const failed = denied || !code || requestFailed;

  useEffect(() => {
    if (denied || !code) return;
    if (attemptedCodes.has(code)) return;
    attemptedCodes.add(code);

    // `mutate`가 아니라 `mutateAsync`를 쓴다.
    // mutate에 넘긴 콜백은 **옵저버가 살아 있을 때만** 불린다. StrictMode의 이펙트 정리로
    // 구독이 한 번 끊기면 onSuccess/onError가 영영 안 불려, 요청이 끝났는데도 화면이
    // 로딩에 갇힌다(실측: 뮤테이션 캐시는 error인데 컴포넌트는 계속 pending).
    // mutateAsync가 돌려주는 프라미스는 구독과 무관하게 항상 끝난다.
    kakaoLogin
      .mutateAsync(code)
      .then(({ onboardingStep }) => {
        navigate(nextPathForOnboardingStep(onboardingStep), { replace: true });
      })
      .catch(() => setRequestFailed(true));
    // 마운트 시 1회. code/denied는 URL에서 오므로 이 화면이 사는 동안 바뀌지 않는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!failed) {
    return (
      <div
        className="min-h-dvh bg-gray-1"
        aria-busy="true"
        aria-label="카카오 로그인 처리 중"
        role="status"
      />
    );
  }

  return (
    <div className="flex min-h-dvh flex-col justify-center px-5">
      <StatusView
        title={denied ? '카카오 로그인을 취소했어요' : '카카오 로그인에 실패했어요'}
        description={
          denied
            ? '다시 시도하거나 비회원으로 둘러볼 수 있어요.'
            : '잠시 후 다시 시도해 주세요. 계속 실패하면 비회원으로 둘러볼 수 있어요.'
        }
        actions={
          <Button variant="primary" onClick={() => navigate('/login', { replace: true })}>
            로그인 화면으로
          </Button>
        }
      />
    </div>
  );
}
