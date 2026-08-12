import { useRegisterSW } from 'virtual:pwa-register/react';

export default function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;

      window.setInterval(() => void registration.update(), 60 * 60 * 1000);
    },
  });

  if (!needRefresh) return null;

  return (
    <section
      aria-live="polite"
      className="fixed right-5 bottom-[calc(1.25rem+env(safe-area-inset-bottom))] left-5 z-50 mx-auto flex max-w-[360px] items-center justify-between gap-3 rounded-btn bg-gray-6 px-4 py-3 text-gray-1 shadow-dialog"
    >
      <p className="typo-sub-3">새 버전이 있어요.</p>
      <button
        type="button"
        onClick={() => void updateServiceWorker(true)}
        className="typo-body-4 shrink-0 rounded-btn bg-primary px-3 py-2 text-white"
      >
        업데이트
      </button>
    </section>
  );
}
