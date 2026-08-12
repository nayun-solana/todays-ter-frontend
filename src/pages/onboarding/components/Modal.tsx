import { useEffect } from 'react';

// assets
import PartyIcon from '../../../assets/onboarding/party.svg';
import ErrorDotIcon from '../../../assets/onboarding/error-dot.svg';
import { useScrollLock } from '../../../lib/scrollLock';

type Props = {
  isOpen: boolean;
  onClick: () => void;
  isSuccess: boolean;
  /**
   * 실패 모달의 버튼 문구. 기본값은 '다시 시도'다.
   * 서버가 재시도를 허용하지 않으면(canRetry=false) 이 버튼은 재시도가 아니라 화면을
   * 빠져나가는 동작을 하므로, 호출부가 문구를 실제 동작에 맞게 바꿀 수 있어야 한다.
   */
  failureActionLabel?: string;
};

const MODAL_STATUS_BAR_COLOR = '#243364';

export default function Modal({
  isOpen,
  onClick,
  isSuccess,
  failureActionLabel = '다시 시도',
}: Props) {
  // 시트가 떠 있는 동안 뒤 화면이 스크롤되지 않게 한다.
  useScrollLock(isOpen);
  useEffect(() => {
    if (!isOpen) return;

    const existingThemeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');

    const themeColor = existingThemeColor ?? document.createElement('meta');

    const wasThemeColorCreated = !existingThemeColor;
    const previousThemeColor = themeColor.getAttribute('content');

    const previousHtmlBackground = document.documentElement.style.backgroundColor;

    const previousBodyBackground = document.body.style.backgroundColor;

    if (wasThemeColorCreated) {
      themeColor.name = 'theme-color';
      document.head.appendChild(themeColor);
    }

    // Safari 상태바 영역을 모달 오버레이와 비슷한 색으로 변경
    themeColor.setAttribute('content', MODAL_STATUS_BAR_COLOR);

    document.documentElement.style.backgroundColor = MODAL_STATUS_BAR_COLOR;

    document.body.style.backgroundColor = MODAL_STATUS_BAR_COLOR;

    return () => {
      // 모달 닫을 때 이전 theme-color 복구
      if (wasThemeColorCreated) {
        themeColor.remove();
      } else if (previousThemeColor !== null) {
        themeColor.setAttribute('content', previousThemeColor);
      } else {
        themeColor.removeAttribute('content');
      }

      document.documentElement.style.backgroundColor = previousHtmlBackground;

      document.body.style.backgroundColor = previousBodyBackground;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="
        fixed
        inset-y-0
        left-1/2
        z-50
        flex
        w-full
        -translate-x-1/2
        items-center
        justify-center
        bg-black/60
        px-4
        py-safe
      "
    >
      <div className="flex w-83.75 flex-col items-center justify-center gap-5 rounded-btn bg-white px-5 pt-7.5 pb-5 shadow-[0_1px_10px_0_rgba(0,0,0,0.10)]">
        <div className="flex flex-col items-center justify-center gap-5">
          {isSuccess ? (
            <img src={PartyIcon} alt="party" className="h-22.5 w-22.5" />
          ) : (
            <img src={ErrorDotIcon} alt="error" className="h-7 w-7" />
          )}

          <div className="flex flex-col items-center justify-center gap-3">
            <p className="text-center text-xl font-extrabold text-gray-6">
              {isSuccess ? (
                '리포트 생성 완료!'
              ) : (
                <>
                  리포트 생성에
                  <br />
                  실패했어요
                </>
              )}
            </p>

            <p className="text-center typo-sub-2 text-gray-6">
              {isSuccess ? (
                <>
                  생성된 리포트는 마이페이지에서
                  <br />
                  언제든 다시 볼 수 있어요
                </>
              ) : (
                <>
                  입력값은 임시 저장했어요.
                  <br />
                  다시 시도하거나 잠시 후 이용해주세요.
                </>
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClick}
          className="flex h-12 w-full items-center justify-center rounded-btn bg-primary py-4"
        >
          <span className="text-sm font-bold text-white">
            {isSuccess ? '리포트 보러가기' : failureActionLabel}
          </span>
        </button>
      </div>
    </div>
  );
}
