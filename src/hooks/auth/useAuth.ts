import { useMutation } from '@tanstack/react-query';

import { kakaoLogin } from '../../api/auth';
import { setAccessToken } from '../../api/token';

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
