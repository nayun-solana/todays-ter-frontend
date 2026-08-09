import { Lock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';

type GuestLoginPromptProps = {
  /** 안내 문구. 서버가 loginPrompt를 주면 그 값을 넘긴다. */
  title?: string;
  /** 버튼 문구. 서버가 loginPrompt를 주면 그 값을 넘긴다. */
  buttonText?: string;
};

/** 시안 문구(Figma 3509:4479 · 3509:4591). 서버가 loginPrompt를 안 줄 때 쓴다. */
const DEFAULT_TITLE = "로그인하고 나에게 꼭 맞는\n'오늘의 터'를 찾아보세요";
const DEFAULT_BUTTON_TEXT = '로그인/회원가입 하러가기';

/**
 * 게스트에게 로그인을 유도하는 블록 — 자물쇠 + 문구 + 버튼.
 *
 * 홈의 잠긴 추천 카드와 기록·마이 잠금 화면이 같은 시안이라 한 컴포넌트로 쓴다.
 * 감싸는 쪽(오버레이·카드 배경)은 화면마다 다르므로 여기서는 내용만 그린다.
 *
 * 로그인 후 원래 있던 화면으로 돌려보내기 위해 현재 경로를 `state.from`에 싣는다
 * (RequireMember가 리다이렉트할 때 쓰는 규약과 같다).
 */
export default function GuestLoginPrompt({
  title = DEFAULT_TITLE,
  buttonText = DEFAULT_BUTTON_TEXT,
}: GuestLoginPromptProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex w-[295px] flex-col items-center gap-5">
      <div className="flex w-[248px] flex-col items-center gap-3">
        <Lock className="size-6 text-primary" strokeWidth={2.2} />
        {/* 시안은 두 줄 고정 — 서버 문구가 길어질 수 있어 whitespace-pre-line으로 개행만 살린다 */}
        <p className="whitespace-pre-line text-center text-base leading-[22px] font-bold text-gray-6">
          {title}
        </p>
      </div>
      <button
        type="button"
        onClick={() => navigate('/login', { state: { from: location.pathname + location.search } })}
        className="h-12 w-full rounded-btn bg-primary text-sm font-bold text-white"
      >
        {buttonText}
      </button>
    </div>
  );
}
