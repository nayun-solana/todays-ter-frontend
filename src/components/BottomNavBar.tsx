import { cn } from '../lib/cn';

export type NavTabKey = 'home' | 'search' | 'record' | 'my';

const TABS: { key: NavTabKey; label: string }[] = [
  { key: 'home', label: '홈' },
  { key: 'search', label: '탐색' },
  { key: 'record', label: '기록' },
  { key: 'my', label: '마이' },
];

interface BottomNavBarProps {
  active: NavTabKey;
  onChange: (tab: NavTabKey) => void;
}

export default function BottomNavBar({ active, onChange }: BottomNavBarProps) {
  return (
    <nav className="fixed bottom-0 left-1/2 z-50 flex h-16 w-full max-w-[390px] -translate-x-1/2 items-center justify-around border-t border-gray-3 bg-white">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={cn('font-sans', active === tab.key ? 'font-bold text-primary' : 'text-gray-4')}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
