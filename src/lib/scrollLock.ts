import { useEffect } from 'react';

/**
 * 모달·바텀시트가 떠 있는 동안 뒤 화면이 스크롤되지 않게 막는다.
 *
 * `overflow: hidden`만으로는 iOS에서 부족하다 — 터치 스크롤이 문서를 계속 움직인다.
 * 그래서 body를 `position: fixed`로 띄우고 지금 스크롤 위치만큼 위로 당겨, 보이는 화면은
 * 그대로인 채 스크롤 대상 자체를 없앤다. 닫을 때 원래 위치로 되돌린다 —
 * 안 되돌리면 시트를 닫는 순간 화면이 맨 위로 튄다.
 */

/**
 * 열려 있는 잠금 개수.
 *
 * 시트가 겹칠 때 필요하다 — 온보딩1은 시간 시트를 닫으면서 '시간 모름' 시트를 연다.
 * 각자 풀어버리면 먼저 닫힌 쪽이 잠금을 해제해, 아직 떠 있는 시트 뒤가 다시 스크롤된다.
 * 마지막 하나가 닫힐 때만 되돌린다.
 */
let lockCount = 0;
let savedScrollY = 0;
let savedStyle: Pick<CSSStyleDeclaration, 'position' | 'top' | 'width' | 'overflow'> | null = null;

function lock(): void {
  lockCount += 1;
  if (lockCount > 1) return;

  const { style } = document.body;
  savedScrollY = window.scrollY;
  savedStyle = {
    position: style.position,
    top: style.top,
    width: style.width,
    overflow: style.overflow,
  };

  style.position = 'fixed';
  style.top = `-${savedScrollY}px`;
  // fixed가 되면 body가 콘텐츠 폭으로 줄어든다. 100%로 고정해 레이아웃이 흔들리지 않게 한다.
  style.width = '100%';
  style.overflow = 'hidden';
}

function unlock(): void {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0 || !savedStyle) return;

  const { style } = document.body;
  style.position = savedStyle.position;
  style.top = savedStyle.top;
  style.width = savedStyle.width;
  style.overflow = savedStyle.overflow;
  savedStyle = null;

  window.scrollTo(0, savedScrollY);
}

/** `locked`가 true인 동안 뒤 화면 스크롤을 막는다. */
export function useScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;

    lock();
    return unlock;
  }, [locked]);
}
