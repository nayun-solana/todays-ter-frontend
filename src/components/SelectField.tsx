import { cn } from '../lib/cn';

interface SelectFieldProps {
  label: string;
  /** 선택된 값. 없으면 placeholder를 회색으로 보여준다. */
  value: string | null;
  placeholder: string;
  onClick: () => void;
  /** 필드 아래 좌측 슬롯 (예: '태어난 시간을 몰라요') */
  footer?: React.ReactNode;
}

/**
 * 눌러서 바텀시트를 여는 박스형 선택 필드. (Figma 3354:3057 · 3354:3241)
 *
 * 시안에 토글 화살표가 없다 — 펼쳐지는 게 아니라 시트가 뜨는 구조라 방향을 가리킬 대상이 없다.
 */
export default function SelectField({
  label,
  value,
  placeholder,
  onClick,
  footer,
}: SelectFieldProps) {
  return (
    <section className="flex flex-col gap-3">
      <p className="text-sm font-bold text-gray-6">{label}</p>

      <button
        type="button"
        onClick={onClick}
        className={cn(
          'w-full rounded-btn border bg-white px-5 py-4 text-left text-sm font-bold outline-none',
          value === null ? 'border-gray-2 text-gray-3' : 'border-primary-light text-gray-5',
        )}
      >
        {value ?? placeholder}
      </button>

      {footer}
    </section>
  );
}
