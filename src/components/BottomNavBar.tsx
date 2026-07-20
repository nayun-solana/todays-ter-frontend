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

const TAB_POSITIONS: Record<NavTabKey, Record<NavTabKey, string>> = {
  home: {
    home: 'left-[4px] w-[92px]',
    search: 'left-[124px] w-6',
    record: 'left-[199px] w-6',
    my: 'left-[290px] w-6',
  },
  search: {
    home: 'left-8 w-6',
    search: 'left-[83px] w-[92px]',
    record: 'left-[203px] w-6',
    my: 'left-[290px] w-6',
  },
  record: {
    home: 'left-8 w-6',
    search: 'left-[106px] w-6',
    record: 'left-[162px] w-[92px]',
    my: 'left-[290px] w-6',
  },
  my: {
    home: 'left-[42px] w-6',
    search: 'left-[117px] w-6',
    record: 'left-[192px] w-6',
    my: 'left-[290px] w-6',
  },
};

interface BottomNavBarProps {
  active: NavTabKey;
  onChange: (tab: NavTabKey) => void;
}

export default function BottomNavBar({ active, onChange }: BottomNavBarProps) {
  return (
    <nav className="fixed bottom-5 left-1/2 z-50 h-[62px] w-[332px] -translate-x-1/2">
      <div className="absolute inset-y-0 left-0 right-[74px] rounded-[30px] bg-white/90" />
      <div className="absolute inset-y-0 right-0 w-[61px] rounded-[30px] bg-white/90" />
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={cn(
            'absolute top-1 flex h-[54px] flex-col items-center justify-center gap-1 rounded-[30px]',
            TAB_POSITIONS[active][tab.key],
            active === tab.key && tab.key !== 'my' ? 'bg-gray-disabled text-gray-6' : 'text-gray-4',
          )}
        >
          <img
            src={tab.icon}
            alt=""
            className={cn(
              'max-h-6 max-w-6',
              active === tab.key && 'brightness-0',
              active !== tab.key && tab.key === 'search' && 'opacity-[0.55]',
            )}
          />
          {tab.key === 'my' ? null : (
            <span className={cn('text-[10px] font-bold', active === tab.key && 'font-extrabold')}>
              {tab.label}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}
