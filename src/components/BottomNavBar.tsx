import { cn } from '../lib/cn';

import homeActiveIcon from '../assets/navigation/home-active.svg';
import homeIcon from '../assets/navigation/home.svg';
import myActiveIcon from '../assets/navigation/my-active.svg';
import myIcon from '../assets/navigation/my.svg';
import recordActiveIcon from '../assets/navigation/record-active.svg';
import recordIcon from '../assets/navigation/record.svg';
import searchActiveIcon from '../assets/navigation/search-active.svg';
import searchIcon from '../assets/navigation/search.svg';

export type NavTabKey = 'home' | 'search' | 'record' | 'my';

const TABS: { key: NavTabKey; label: string; icon: string; activeIcon: string; position: string; iconClass: string }[] = [
  { key: 'home', label: '홈', icon: homeIcon, activeIcon: homeActiveIcon, position: 'left-7', iconClass: 'h-[19.5px] w-[21.5px]' },
  { key: 'search', label: '탐색', icon: searchIcon, activeIcon: searchActiveIcon, position: 'left-[107px]', iconClass: 'size-6' },
  { key: 'record', label: '기록', icon: recordIcon, activeIcon: recordActiveIcon, position: 'left-[186px]', iconClass: 'h-[18px] w-[23px]' },
  { key: 'my', label: '마이', icon: myIcon, activeIcon: myActiveIcon, position: 'left-[280px]', iconClass: 'h-[21.875px] w-5' },
];

const ACTIVE_BACKGROUND_POSITIONS: Record<Exclude<NavTabKey, 'my'>, string> = {
  home: 'left-[4px]',
  search: 'left-[83px]',
  record: 'left-[162px]',
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
      {active !== 'my' && (
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute top-1 z-0 h-[54px] w-[92px] rounded-[30.5px] bg-gray-disabled',
            ACTIVE_BACKGROUND_POSITIONS[active],
          )}
        />
      )}
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={cn(
            'absolute top-[9px] z-10 flex size-11 flex-col items-center justify-center gap-1',
            tab.position,
          )}
        >
          <span className="flex size-6 items-center justify-center">
            <img src={active === tab.key ? tab.activeIcon : tab.icon} alt="" className={tab.iconClass} />
          </span>
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
