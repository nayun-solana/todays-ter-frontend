import { useState } from 'react';
import { useNavigate } from 'react-router';

import { AppleIcon, GoogleIcon, KakaoIcon } from './components/BrandIcons';

type Phase = 'intro' | 'login';
type Provider = 'kakao' | 'apple' | 'google';

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * 로그인 화면.
 * 진입 시 통통 공 인트로 애니메이션(공 바운스 → '오' 도달 → 폭발) 후 로그인 UI로 정착.
 * 애니메이션 완료(공 폭발 종료) 시점에 phase가 'login'으로 전환된다.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  // 모션 최소화 설정이면 인트로를 건너뛰고 바로 로그인 화면을 보여준다.
  const [phase, setPhase] = useState<Phase>(() => (prefersReducedMotion() ? 'login' : 'intro'));

  const handleLogin = (provider: Provider) => {
    // TODO: 소셜 로그인 연동. 성공 시 사주 입력(온보딩)으로 이동.
    navigate('/onboarding/step-1', { state: { provider } });
  };

  return (
    <div className="relative mx-auto h-screen w-full max-w-[375px] overflow-hidden bg-primary">
      {phase === 'intro' && (
        <div className="absolute inset-0 bg-white">
          <p className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 text-2xl font-extrabold text-gray-6">
            오늘의 터
          </p>
          <span
            className="absolute block size-5 rounded-full bg-primary"
            style={{ animation: 'login-ball-bounce 1.9s linear forwards' }}
            onAnimationEnd={() => setPhase('login')}
          />
        </div>
      )}

      {phase === 'login' && <LoginContent onLogin={handleLogin} />}
    </div>
  );
}

function LoginContent({ onLogin }: { onLogin: (provider: Provider) => void }) {
  return (
    <div className="absolute inset-0">
      {/* 흰 헤더 원 (Figma 551px, 상단 곡선 헤더) */}
      <div
        className="absolute left-1/2 rounded-full bg-white"
        style={{
          width: 551,
          height: 551,
          top: 130.5,
          transform: 'translate(-50%, -50%)',
          animation: 'login-header-in 0.5s ease-out both',
        }}
      />

      {/* 로고 */}
      <div
        className="absolute left-1/2 top-[200px] flex w-40 -translate-x-1/2 flex-col items-center gap-2.5 text-center"
        style={{ animation: 'login-rise-in 0.45s ease-out 0.35s both' }}
      >
        <p className="text-2xl font-extrabold text-primary">오늘의 터</p>
        <p className="text-sm text-gray-4">사주 기반 장소 추천 서비스</p>
      </div>

      {/* 소셜 로그인 버튼 */}
      <div
        className="absolute inset-x-5 flex flex-col gap-2"
        style={{ bottom: 72, animation: 'login-rise-in 0.5s ease-out 0.55s both' }}
      >
        <button
          type="button"
          onClick={() => onLogin('kakao')}
          className="flex h-12 items-center justify-center gap-2.5 rounded-full bg-kakao"
        >
          <KakaoIcon className="size-5" />
          <span className="text-sm font-bold text-black/85">카카오로 로그인</span>
        </button>
        <button
          type="button"
          onClick={() => onLogin('apple')}
          className="flex h-12 items-center justify-center gap-2.5 rounded-full bg-white"
        >
          <AppleIcon className="h-5 w-4" />
          <span className="text-sm font-bold text-black/85">Apple로 로그인</span>
        </button>
        <button
          type="button"
          onClick={() => onLogin('google')}
          className="flex h-12 items-center justify-center gap-2.5 rounded-full bg-white"
        >
          <GoogleIcon className="size-5" />
          <span className="text-sm font-bold text-black/85">구글로 로그인</span>
        </button>
      </div>

      {/* 약관 */}
      <p
        className="absolute inset-x-0 text-center text-[10px] leading-none text-white"
        style={{ bottom: 38, animation: 'login-rise-in 0.5s ease-out 0.7s both' }}
      >
        시작하면 이용약관 및 개인정보 처리방침에 동의하게 됩니다
      </p>
    </div>
  );
}
