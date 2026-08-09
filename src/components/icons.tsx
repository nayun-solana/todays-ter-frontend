import { cn } from '../lib/cn';

/**
 * 공용 인라인 아이콘. Figma stroke 1.2px 기준.
 * 색은 currentColor로 받으므로 부모에서 text-* 로 지정한다.
 */

type IconProps = { className?: string };

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 5 10" className={cn('h-2.5 w-[5px]', className)}>
      <path
        d="M0.6 0.6L4 5L0.6 9.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 10 6" className={cn('h-[5px] w-2.5', className)}>
      <path
        d="M1 1L5 5L9 1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Figma 실측(수정·사주완료·탈퇴완료 공통): 12×12, stroke 2px, 24×24 버튼 정중앙 */
export function CloseIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 12 12" className={cn('size-3', className)}>
      <path
        d="M1 1L11 11M1 11L11 1"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 후기 수정 — Figma 2380:1754 vector 그대로 (20×20, stroke 1.2, Gray5) */
export function PencilIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className={cn('size-5', className)}>
      <path
        d="M12.3535 6.14692L14.3535 8.14692M3.35352 16.6469L4.17705 13.3528L13.6767 3.85316C14.3429 3.18697 15.423 3.18697 16.0892 3.85316L16.1473 3.91126C16.8135 4.57745 16.8135 5.65756 16.1473 6.32375L6.64763 15.8234L3.35352 16.6469Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 후기 삭제 — Figma 2380:1790 vector 그대로 (20×20, stroke 1.2, Gray5) */
export function TrashIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className={cn('size-5', className)}>
      <path
        d="M11.5556 9.22222V13.8889M8.4445 9.22222V13.8889M5.33339 6.11111V15.4444C5.33339 16.3036 6.02983 17 6.88894 17H13.1112C13.9703 17 14.6667 16.3036 14.6667 15.4444V6.11111M5.33339 6.11111H3.77783M5.33339 6.11111H6.11117M14.6667 6.11111H13.8889M14.6667 6.11111H16.2223M6.11117 6.11111H13.8889M6.11117 6.11111L7.66672 3H12.3334L13.8889 6.11111"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 내 후기 상단 고정 표시 — Figma 2380:1640 vector 그대로 (20×20, 채움, Primary3) */
export function PinIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className={cn('size-5', className)}>
      <path d="M16.3205 8.71579C16.931 8.41055 17.0631 7.5969 16.5804 7.11426L12.8857 3.41952C12.4031 2.93688 11.5894 3.06892 11.2842 3.67942L9.39855 7.45065C9.20605 7.83564 9.28151 8.30061 9.58587 8.60497L11.395 10.4141C11.6993 10.7185 12.1643 10.7939 12.5493 10.6014L16.3205 8.71579Z" />
      <path d="M12.7105 15.0166C12.6727 15.8859 11.6196 16.2955 11.0043 15.6803L4.31967 8.99563C3.70441 8.38037 4.11406 7.32726 4.98334 7.28947L10.4045 7.05377C10.6845 7.04159 10.9568 7.14751 11.155 7.34572L12.6542 8.84492C12.8524 9.04313 12.9584 9.31542 12.9462 9.59547L12.7105 15.0166Z" />
      <path d="M9.78332 11.6309C10.1738 11.2403 10.1738 10.6072 9.78332 10.2166C9.39279 9.82611 8.75963 9.82611 8.36911 10.2166L3.41936 15.1664C3.02883 15.5569 3.02883 16.1901 3.41936 16.5806C3.80988 16.9711 4.44305 16.9711 4.83357 16.5806L9.78332 11.6309Z" />
    </svg>
  );
}

/** 케밥 메뉴 (세로 점 3개) */
export function MoreVerticalIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 2 12" className={cn('h-3 w-0.5', className)}>
      <circle cx="1" cy="1" r="1" fill="currentColor" />
      <circle cx="1" cy="6" r="1" fill="currentColor" />
      <circle cx="1" cy="11" r="1" fill="currentColor" />
    </svg>
  );
}
