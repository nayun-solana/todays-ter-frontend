import { cn } from '../lib/cn';

export type PillTabItem<T extends string = string> = {
  value: T;
  label: string;
};

type PillTabsProps<T extends string> = {
  items: readonly PillTabItem<T>[];
  value: NoInfer<T>;
  onChange: (value: NoInfer<T>) => void;
  className?: string;
};

export default function PillTabs<T extends string>({
  items,
  value,
  onChange,
  className,
}: PillTabsProps<T>) {
  return (
    <div className={cn('flex flex-wrap gap-1', className)} role="tablist">
      {items.map((item) => {
        const isActive = item.value === value;

        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.value)}
            className={cn(
              'rounded-full px-4 py-2 text-sm shadow-btn transition-colors',
              isActive
                ? 'bg-primary font-extrabold text-white'
                : 'border border-gray-3 bg-white font-extrabold text-gray-4',
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
