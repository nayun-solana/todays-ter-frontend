import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * `unavailable`은 공유 링크 자체를 못 받은 경우다(리포트 없는 회원 → 서버 PLACE409_1).
 * 공유 실행이 실패한 `failed`와 원인이 달라서 문구도 달라야 한다.
 */
export type ShareResult = 'shared' | 'copied' | 'failed' | 'unavailable';

/**
 * 링크 공유 실행. Web Share가 되면 OS 공유 시트, 안 되면 클립보드 복사로 떨어진다.
 *
 * 두 API 모두 사용자 제스처 안에서 호출해야 하므로 이 함수 안에서는 절대 await 하지 않는다
 * (공유 URL은 화면 진입 시 useShareLink가 미리 받아둔다).
 * 공유 시트를 사용자가 그냥 닫은 것(AbortError)은 실패가 아니므로 알림을 띄우지 않는다.
 */
export function useShareAction() {
  const [result, setResult] = useState<ShareResult | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const notify = useCallback((next: ShareResult) => {
    setResult(next);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setResult(null), 2000);
  }, []);

  const share = useCallback(
    async (params: { url: string; title: string; text?: string }) => {
      const { url, title, text } = params;

      if (navigator.share) {
        try {
          await navigator.share({ title, text, url });
          notify('shared');
          return;
        } catch (error) {
          // 사용자가 공유 시트를 닫은 경우 — 조용히 종료
          if (error instanceof DOMException && error.name === 'AbortError') return;
          // 그 외(미지원 대상 등)는 복사로 폴백
        }
      }

      try {
        await navigator.clipboard.writeText(url);
        notify('copied');
      } catch {
        notify('failed');
      }
    },
    [notify],
  );

  return { share, result, notify };
}
