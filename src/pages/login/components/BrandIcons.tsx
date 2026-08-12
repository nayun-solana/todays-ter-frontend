interface IconProps {
  className?: string;
}

/** 카카오 말풍선 (버튼 텍스트와 같은 검정 계열, currentColor). */
export function KakaoIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 3C6.48 3 2 6.58 2 11c0 2.86 1.9 5.37 4.75 6.78-.21.75-.75 2.72-.86 3.14-.13.52.19.51.4.37.17-.11 2.66-1.81 3.74-2.55.64.09 1.3.14 1.97.14 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
    </svg>
  );
}
