import { cn } from '../lib/cn';

import homeIcon from '../assets/navigation/home.svg';
import myIcon from '../assets/navigation/my.svg';
import recordIcon from '../assets/navigation/record.svg';
import searchIcon from '../assets/navigation/search.svg';

export type NavTabKey = 'home' | 'search' | 'record' | 'my';

const TABS: { key: NavTabKey; label: string; icon: string }[] = [
  { key: 'home', label: '홈', icon: homeIcon },
  { key: 'search', label: '탐색', icon: searchIcon },
  { key: 'record', label: '기록', icon: recordIcon },
  { key: 'my', label: '마이', icon: myIcon },
];

interface BottomNavBarProps {
  active: NavTabKey;
  onChange: (tab: NavTabKey) => void;
}

export default function BottomNavBar({ active, onChange }: BottomNavBarProps) {
  return (
    <nav className="fixed bottom-5 left-1/2 z-50 flex h-[62px] w-[332px] -translate-x-1/2 items-center justify-around rounded-[30px] bg-white/90">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={cn(
            'flex h-[54px] w-[76px] flex-col items-center justify-center gap-1 rounded-[30px]',
            active === tab.key ? 'bg-gray-disabled text-gray-6' : 'text-gray-4',
          )}
        >
          <img
            src={tab.icon}
            alt=""
            className={cn('max-h-6 max-w-6', active === tab.key && 'brightness-0')}
          />
          {tab.key === 'my' ? null : <span className="text-[10px] font-bold">{tab.label}</span>}
        </button>
      ))}
    </nav>
  );
}
