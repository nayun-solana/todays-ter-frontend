import { cn } from '../lib/cn';

interface ToggleProps {
  checked: boolean;
  label: string;
  onChange: () => void;
  /** 좌측에 켜짐/꺼짐 텍스트 표시 (알림 설정) */
  showState?: boolean;
}

/** 공용 스위치. Figma: 40×24, 노브 18px, 켜짐 primary / 꺼짐 gray-3. */
export default function Toggle({ checked, label, onChange, showState = false }: ToggleProps) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      {showState ? (
        <span className="typo-sub-2 text-gray-4">{checked ? '켜짐' : '꺼짐'}</span>
      ) : null}
      <button
        type="button"
        role="switch"
        aria-label={label}
        aria-checked={checked}
        onClick={onChange}
        className={cn(
          'relative h-6 w-10 rounded-full transition-colors',
          checked ? 'bg-primary' : 'bg-gray-3',
        )}
      >
        <span
          className={cn(
            'absolute top-[3px] left-[3px] size-[18px] rounded-full bg-white transition-transform',
            checked && 'translate-x-4',
          )}
        />
      </button>
    </div>
  );
}
