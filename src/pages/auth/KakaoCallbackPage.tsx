import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import Button from '../../components/Button';
import StatusView from '../../components/StatusView';
import { useKakaoLogin } from '../../hooks/auth/useAuth';
import { nextPathForOnboardingStep } from '../../lib/onboardingRoute';

/**
 * 카카오 인가 콜백(`/oauth/kakao/callback`).
 * 쿼리의 인가코드를 BE에 넘겨 accessToken을 받고, 온보딩 진행도에 따라 다음 화면으로 보낸다.
 */
export default function KakaoCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const kakaoLogin = useKakaoLogin();

  // 인가코드는 1회용이다. StrictMode의 이중 실행으로 두 번 보내면 두 번째가 반드시 실패한다.
  const requestedRef = useRef(false);

  const code = searchParams.get('code');
  // 사용자가 동의를 취소하면 code 대신 error가 온다(예: access_denied).
  const denied = searchParams.get('error') !== null;

  useEffect(() => {
    if (requestedRef.current) return;
    requestedRef.current = true;

    if (denied || !code) return;

    kakaoLogin.mutate(code, {
      onSuccess: ({ onboardingStep }) => {
        navigate(nextPathForOnboardingStep(onboardingStep), { replace: true });
      },
    });
    // 마운트 시 1회. code/denied는 URL에서 오므로 이 화면이 사는 동안 바뀌지 않는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const failed = denied || !code || kakaoLogin.isError;

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
