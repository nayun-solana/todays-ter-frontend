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

export function PencilIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 13 13" className={cn('size-[13px]', className)}>
      <path
        d="M9 1L12 4L4 12H1V9L9 1Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TrashIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 12 14" className={cn('h-3.5 w-3', className)}>
      <path
        d="M1 3.5H11M4.5 1H7.5M2.5 3.5L3 13H9L9.5 3.5M5 6V10.5M7 6V10.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 내 후기 상단 고정 표시 */
export function PinIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className={cn('size-5', className)}>
      <path
        d="M11.5 2.5L17.5 8.5L14.5 9.5L11 13L7 9L10.5 5.5L11.5 2.5Z"
        fill="currentColor"
        opacity="0.35"
      />
      <path
        d="M11.5 2.5L17.5 8.5L14.5 9.5L11 13L7 9L10.5 5.5L11.5 2.5ZM7 13L2.5 17.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
