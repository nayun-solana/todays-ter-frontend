import { useEffect, useRef, useState } from 'react';
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
 * 진입 시 통통 공 인트로 애니메이션(공 바운스 → 정착 → 폭발) 후 로그인 UI로 정착.
 * 공 폭발이 끝나는 시점에 phase가 'login'으로 전환된다.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  // 모션 최소화 설정이면 인트로를 건너뛰고 바로 로그인 화면을 보여준다.
  const [phase, setPhase] = useState<Phase>(() => (prefersReducedMotion() ? 'login' : 'intro'));

  const handleLogin = (provider: Provider) => {
    // TODO: 소셜 로그인 연동. 성공 시 사주 입력(온보딩)으로 이동.
    navigate('/onboarding/step-1', { state: { provider } });
  };

  const handleGuest = () => {
    // TODO: 비회원(게스트) 진입 처리. 사주 입력(온보딩)으로 이동.
    navigate('/onboarding/step-1', { state: { guest: true } });
  };

  return (
    <div className="relative mx-auto h-screen w-full max-w-[375px] overflow-hidden bg-primary">
      {phase === 'intro' && <BallIntro onDone={() => setPhase('login')} />}
      {phase === 'login' && <LoginContent onLogin={handleLogin} onGuest={handleGuest} />}
    </div>
  );
}

/**
 * 통통 공 인트로 — requestAnimationFrame 기반 물리 시뮬레이션.
 * CSS 베지어로는 진짜 중력 포물선/자연 감쇠를 내기 어려워(참고: joshwcomeau.com/animation/squash-and-stretch),
 * 프레임마다 직접 적분한다: 수평은 등속(vx), 수직은 중력(vy += g)·바닥에서 반전·감쇠(반발계수).
 * 스쿼시/스트레치는 접촉 순간 납작(scaleX↑ scaleY↓), 공중 고속 구간에선 세로로 늘어남으로 표현하고,
 * transform-origin을 바닥에 두어 접촉점이 땅에 붙어 보이게 한다. 정착 후 폭발해 화면을 채우면 onDone.
 */
function BallIntro({ onDone }: { onDone: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLSpanElement>(null);
  const oCharRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const ball = ballRef.current;
    const oChar = oCharRef.current;
    if (!container || !ball) return;

    const W = container.clientWidth;
    const H = container.clientHeight;

    // 공이 튕기는 바닥선·최종 안착점 = 로고 '오늘의 터'의 '오' 글자 위치에서 파생.
    // 하드코딩 %가 아니라 실제 '오' 글자를 실측해 폰트/화면 크기와 무관하게 정렬한다.
    const measureO = (): { floor: number; centerX: number } => {
      if (!oChar) return { floor: 0.5 * H, centerX: 0.5 * W }; // 폴백
      const gr = oChar.getBoundingClientRect();
      const cr = container.getBoundingClientRect();
      return {
        // 튕기는 선 = '오'의 ㅇ 상단끝. 글자 상자(line-box) 위쪽 leading을 감안해 살짝 안쪽(≈0.15).
        floor: gr.top - cr.top + gr.height * 0.15,
        centerX: gr.left - cr.left + gr.width / 2,
      };
    };
    const { floor: FLOOR, centerX: O_X } = measureO();

    // 물리 상수 — 컨테이너 크기에 비례시켜 화면 크기와 무관하게 일관된 느낌을 낸다.
    const GRAVITY = 3.2 * H; // px/s²
    const RESTITUTION = 0.66; // 반발계수: 튈수록 높이·주기가 자동 감쇠
    const START_X = -0.1 * W; // 화면 밖 왼쪽에서 진입
    const START_Y = 0.15 * H;
    const VX = (O_X - START_X) / 1.45; // 좌→우 등속: 3회째 바닥(≈1.45s)에서 '오' 위치 도달
    const SQUASH_DUR = 0.09; // 접촉 스쿼시 지속(초)
    const SETTLE_BOUNCES = 3; // 이만큼 튄 뒤 폭발
    const SETTLE_HOLD = 0.12; // 마지막 접촉 후 '오'에 얹혀 정지하는 시간(초) — 색 변화만 스치듯 보이고 바로 폭발
    const EXPLODE_DUR = 0.42; // 폭발 지속(초)
    const EXPLODE_SCALE = 64;

    let cx = START_X; // 공 중심 x
    let cy = START_Y; // 공 바닥(접촉점) y
    let vy = 0;
    let squashT = 0;
    let bounces = 0;
    let settling = false; // 마지막 접촉 후 폭발 전 정지 구간
    let settleT = 0;
    let exploding = false;
    let explodeT = 0;
    let last = performance.now();
    let raf = 0;
    let done = false;

    // 정상 흐름은 폭발 완료 시 finish()가 호출된다. 백그라운드 탭 등으로 rAF가 멈춰
    // 인트로에 갇히는 것을 막는 안전장치로, 최대 대기 후 강제로 로그인 화면으로 넘어간다.
    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      clearTimeout(fallback);
      onDone();
    };
    const fallback = setTimeout(finish, 4000);

    const tick = (now: number) => {
      if (done) return;
      const dt = Math.min((now - last) / 1000, 1 / 30); // 탭 전환 등으로 dt 폭주 방지
      last = now;

      if (!exploding && !settling) {
        cx += VX * dt; // 수평 등속
        vy += GRAVITY * dt; // 수직 중력 가속
        cy += vy * dt;

        if (cy >= FLOOR) {
          cy = FLOOR;
          squashT = SQUASH_DUR;
          bounces += 1;
          if (bounces >= SETTLE_BOUNCES) {
            // 마지막 접촉: '오'에 얹혀 잠시 정지. 이 순간에만 '오'를 공과 같은 색으로 점등.
            vy = 0;
            settling = true;
            settleT = SETTLE_HOLD;
            if (oChar) oChar.classList.add('text-primary');
          } else {
            vy = -vy * RESTITUTION; // 바닥 반사 + 감쇠
          }
        }

        let sx: number;
        let sy: number;
        if (squashT > 0) {
          const p = squashT / SQUASH_DUR; // 1→0
          sx = 1 + 0.45 * p; // 접촉: 가로로 퍼지고
          sy = 1 - 0.35 * p; // 세로로 눌림
          squashT -= dt;
        } else {
          const stretch = Math.min(0.28, Math.abs(vy) / (3 * H)); // 빠를수록 세로로 늘어남
          sy = 1 + stretch;
          sx = 1 - stretch * 0.5;
        }

        ball.style.left = `${cx}px`;
        ball.style.top = `${cy}px`;
        ball.style.transformOrigin = 'center bottom';
        ball.style.transform = `translate(-50%, -100%) scale(${sx}, ${sy})`;
      } else if (settling) {
        // '오' 위에 정지: 잔여 스쿼시만 풀어주고 대기 → 시간이 다 되면 폭발.
        settleT -= dt;
        let sx = 1;
        let sy = 1;
        if (squashT > 0) {
          const p = squashT / SQUASH_DUR;
          sx = 1 + 0.45 * p;
          sy = 1 - 0.35 * p;
          squashT -= dt;
        }
        ball.style.left = `${cx}px`;
        ball.style.top = `${cy}px`;
        ball.style.transformOrigin = 'center bottom';
        ball.style.transform = `translate(-50%, -100%) scale(${sx}, ${sy})`;
        if (settleT <= 0) {
          settling = false; // 정지 해제 → 아래 폭발 분기로 넘어감
          exploding = true;
        }
      } else {
        explodeT += dt;
        const p = Math.min(explodeT / EXPLODE_DUR, 1);
        const scale = 1 + (EXPLODE_SCALE - 1) * (p * p); // ease-in 팽창
        ball.style.transformOrigin = 'center center';
        ball.style.transform = `translate(-50%, -50%) scale(${scale})`;
        if (p >= 1) {
          finish();
          return;
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fallback);
    };
    // 마운트 시 1회만 구동. onDone은 부모의 안정적인 setState 래퍼라 의존성에서 제외.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 bg-white">
      <p className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 text-2xl font-extrabold text-gray-6">
        {/* '오'만 분리 — 공이 닿는 순간 색을 공과 일치시키기 위함 */}
        <span ref={oCharRef} className="transition-colors duration-100">
          오
        </span>
        늘의 터
      </p>
      <span
        ref={ballRef}
        className="absolute block size-5 rounded-full bg-primary"
        style={{ left: '-10%', top: '15%', transform: 'translate(-50%, -100%)' }}
      />
    </div>
  );
}

function LoginContent({
  onLogin,
  onGuest,
}: {
  onLogin: (provider: Provider) => void;
  onGuest: () => void;
}) {
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

      {/* 비회원 시작 + 구분선 + 소셜 로그인 버튼 */}
      <div
        className="absolute inset-x-5 flex flex-col"
        style={{ bottom: 72, animation: 'login-rise-in 0.5s ease-out 0.55s both' }}
      >
        <button
          type="button"
          onClick={onGuest}
          className="flex h-12 items-center justify-center rounded-full bg-white text-sm font-bold text-primary"
        >
          비회원으로 시작하기
        </button>

        <div aria-hidden className="mx-auto mt-2.5 h-px w-[300px] bg-white/40" />

        <button
          type="button"
          onClick={() => onLogin('kakao')}
          className="mt-2.5 flex h-12 items-center justify-center gap-2.5 rounded-full bg-kakao"
        >
          <KakaoIcon className="size-5" />
          <span className="text-sm font-bold text-black/85">카카오로 로그인</span>
        </button>
        <button
          type="button"
          onClick={() => onLogin('apple')}
          className="mt-2 flex h-12 items-center justify-center gap-2.5 rounded-full bg-white"
        >
          <AppleIcon className="h-5 w-4" />
          <span className="text-sm font-bold text-black/85">Apple로 로그인</span>
        </button>
        <button
          type="button"
          onClick={() => onLogin('google')}
          className="mt-2 flex h-12 items-center justify-center gap-2.5 rounded-full bg-white"
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
