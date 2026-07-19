import { useEffect } from 'react';

const STATUS_BAR_COLOR = '#5a81fa';

export default function OnboardingStep2Page() {
  // status bar 색상 변경 (iOS Safari, Android Chrome)
  useEffect(() => {
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

    themeColor.setAttribute('content', STATUS_BAR_COLOR);
    document.documentElement.style.backgroundColor = STATUS_BAR_COLOR;
    document.body.style.backgroundColor = STATUS_BAR_COLOR;

    return () => {
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
  }, []);

  return (
    <main
      className="
        min-h-screen
        min-h-[100dvh]
        bg-primary
        px-5
        pb-[env(safe-area-inset-bottom)]
        pt-[calc(1.25rem+env(safe-area-inset-top))]
      "
    >
      온보딩 2 · 분석 (준비 중)
    </main>
  );
}
