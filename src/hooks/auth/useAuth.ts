import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import { issueDevToken, kakaoLogin, logout } from '../../api/auth';
import { clearAccessToken, setAccessToken } from '../../api/token';

/**
 * 카카오 로그인: 인가코드 → accessToken 저장.
 * 성공 후 화면 분기(신규/온보딩 단계)는 호출부에서 `isNewMember`/`onboardingStep`으로 처리.
 */
export function useKakaoLogin() {
  return useMutation({
    mutationFn: (authorizationCode: string) => kakaoLogin(authorizationCode),
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
    },
  });
}

/**
 * 로그아웃: 서버 refresh 폐기 → 로컬 토큰·캐시 정리 → 로그인 화면.
 * 서버 호출이 실패해도(이미 만료 등) 로컬 정리는 반드시 수행한다.
 */
export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearAccessToken();
      queryClient.clear();
      navigate('/login', { replace: true });
    },
  });
}

/**
 * 개발용 로그인 — 카카오 키 발급 전(#72) 회원 상태를 테스트하기 위한 우회 경로.
 * dev 빌드에서만 노출한다.
 */
export function useDevLogin() {
  return useMutation({
    mutationFn: issueDevToken,
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
    },
  });
}
