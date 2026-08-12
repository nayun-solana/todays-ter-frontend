import GuestLoginPrompt from '../components/GuestLoginPrompt';
import TabPageHeader from '../components/TabPageHeader';

/**
 * 기록·마이 탭에 게스트가 들어왔을 때 보여주는 잠금 화면 (Figma 3509:4479 · 3509:4591).
 *
 * 리다이렉트가 아니라 **그 자리에 렌더한다** — 탭은 사용자가 직접 누르는 곳이라
 * 화면이 홱 바뀌는 것보다 왜 못 보는지 알려주는 편이 낫다. 하단 탭바는 레이아웃이
 * 계속 그려주므로 다른 탭으로 빠져나갈 수 있다.
 *
 * ⚠️ 흐림 뒤는 **정적 플레이스홀더**다. 게스트는 기록·마이 API를 못 부르므로(401)
 *    실제 화면을 렌더하면 흐림 뒤에 에러 UI가 깔린다. 시안도 내용을 읽으라는 게 아니라
 *    "여기 뭔가 있다"는 인상만 준다.
 */
type GuestTabGateProps = {
  /** 잠겨도 제목은 그대로 보인다(시안). */
  title: string;
  /** 흐림 뒤에 깔 자리표시자 모양 — 화면마다 다르다. */
  variant: 'record' | 'my';
};

export default function GuestTabGate({ title, variant }: GuestTabGateProps) {
  return (
    <div className="relative min-h-dvh bg-gray-1">
      <TabPageHeader title={title} />

      <div aria-hidden className="px-5 pt-4">
        {variant === 'record' ? <RecordPlaceholder /> : <MyPlaceholder />}
      </div>

      {/*
        시안 그라데이션: rgba(255,255,255,0.2) 13.67% → rgba(255,255,255,0.8) 22.3% → #fff.
        헤더(111px) 아래부터 덮어 제목은 선명하게 남긴다.
        pointer-events-none — 아래 자리표시자는 어차피 못 누르지만, 위에 얹는 안내 블록의
        클릭을 이 층이 가로채면 안 된다.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 top-[calc(4.25rem+env(safe-area-inset-top))] backdrop-blur-[2px]"
        style={{
          background:
            'linear-gradient(to bottom, rgba(255,255,255,0.2) 13.67%, rgba(255,255,255,0.8) 22.3%, #ffffff 100%)',
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center px-5">
        <GuestLoginPrompt />
      </div>
    </div>
  );
}

/** 기록 탭 — 필터 칩 + 저장한 터 카드 3장 (시안 3509:4479). */
function RecordPlaceholder() {
  return (
    <>
      <div className="flex gap-1">
        <span className="h-9 w-[76px] rounded-btn bg-primary" />
        <span className="h-9 w-[76px] rounded-btn border border-gray-2 bg-white" />
      </div>
      <div className="mt-3 flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-2.5 rounded-btn bg-white p-3 shadow-card">
            <span className="size-16 shrink-0 rounded-xl bg-placeholder opacity-40" />
            <div className="flex flex-col gap-4">
              <span className="block h-4 w-24 rounded bg-gray-2" />
              <span className="block h-2.5 w-32 rounded bg-gray-2" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/** 마이 탭 — 프로필 카드 (시안 3509:4591). */
function MyPlaceholder() {
  return (
    <div className="flex flex-col items-center gap-5 rounded-btn bg-white p-5 shadow-card-lg">
      <div className="flex flex-col items-center gap-2">
        <span className="size-20 rounded-full bg-primary-light opacity-60" />
        <span className="block h-4 w-16 rounded bg-gray-2" />
      </div>
    </div>
  );
}
