import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Check } from 'lucide-react';

import Button from '../../components/Button';
import ProgressBar from '../../components/ProgressBar';
import { cn } from '../../lib/cn';
import BirthTimeSkipSheet from './components/BirthTimeSkipSheet';

type CalendarType = 'solar' | 'lunar';

/** 오늘 날짜(yyyy-mm-dd). 미래 생년월일 선택 방지용 max 값. */
function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** 온보딩1 — 내 사주 입력 (달력 종류 → 생년월일 → 태어난 시간). */
export default function OnboardingPage1() {
  const navigate = useNavigate();

  const [calendarType, setCalendarType] = useState<CalendarType | null>(null);
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [unknownTime, setUnknownTime] = useState(false);
  const [skipSheetOpen, setSkipSheetOpen] = useState(false);

  const canSubmit =
    calendarType !== null && birthDate !== '' && (unknownTime || birthTime !== '');

  /** '시간 모름' 선택 → 출생시간 없이 진행 안내 바텀시트를 연다. */
  const openSkipSheet = () => {
    setUnknownTime(true);
    setBirthTime('');
    setSkipSheetOpen(true);
  };

  /** 바텀시트 '출생시간 입력하기' → 시간 입력을 계속한다. */
  const cancelSkip = () => {
    setUnknownTime(false);
    setSkipSheetOpen(false);
  };

  /** 바텀시트 '간이 리포트 생성하기' → 출생시간 없이 분석으로 진행한다. */
  const confirmSkip = () => {
    setSkipSheetOpen(false);
    // TODO: 사주 정보(간이) 저장 후 분석(온보딩2)으로 이동
    navigate('/onboarding/step-2');
  };

  return (
    <div className="flex min-h-screen w-full flex-col px-5 pb-8 pt-4">
      {/* 상단 진행바 — 사주입력은 온보딩 1/3 단계 (시안 3분할 세그먼트를 연속형으로 근사) */}
      <ProgressBar step={1} total={3} />

      <header className="mt-11 flex flex-col gap-4">
        <p className="text-base font-bold text-primary">내 사주 입력</p>
        <h1 className="text-2xl font-extrabold leading-8 text-gray-6">
          입력하신 생년월일시로
          <br />
          오행을 계산해요
        </h1>
      </header>

      <div className="mt-8 flex flex-col gap-9">
        {/* 달력 종류 */}
        <section className="flex flex-col gap-3">
          <p className="text-sm font-bold text-gray-6">달력 종류</p>
          <div className="flex gap-2.5">
            {(
              [
                { value: 'solar', label: '양력' },
                { value: 'lunar', label: '음력' },
              ] as const
            ).map(({ value, label }) => {
              const active = calendarType === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCalendarType(value)}
                  className={cn(
                    'flex h-13 flex-1 items-center justify-center rounded-full text-sm transition-colors',
                    active
                      ? 'bg-primary font-bold text-white'
                      : 'bg-gray-2 font-normal text-gray-disabled',
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        {/* 생년월일 — 달력 종류 선택 후 노출 */}
        {calendarType !== null && (
          <section className="flex flex-col gap-3">
            <p className="text-sm font-bold text-gray-6">생년월일</p>
            <input
              type="date"
              value={birthDate}
              max={todayISO()}
              onChange={(e) => setBirthDate(e.target.value)}
              className={cn(
                'w-full border-b bg-transparent pb-2 text-sm font-bold outline-none',
                birthDate ? 'border-primary text-primary' : 'border-gray-3 text-gray-disabled',
              )}
            />
          </section>
        )}

        {/* 태어난 시간 — 생년월일 입력 후 노출 */}
        {birthDate !== '' && (
          <section className="flex flex-col gap-3">
            <p className="text-sm font-bold text-gray-6">태어난 시간</p>
            <div className="flex items-end justify-between gap-3">
              <input
                type="time"
                value={birthTime}
                disabled={unknownTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className={cn(
                  'min-w-0 flex-1 border-b bg-transparent pb-2 text-sm font-bold outline-none',
                  unknownTime && 'opacity-40',
                  birthTime ? 'border-primary text-primary' : 'border-gray-3 text-gray-disabled',
                )}
              />
              <button
                type="button"
                onClick={openSkipSheet}
                className={cn(
                  'flex shrink-0 items-center gap-1 pb-2 text-xs font-bold',
                  unknownTime ? 'text-primary' : 'text-gray-disabled',
                )}
              >
                <span
                  className={cn(
                    'flex size-5 items-center justify-center rounded-full border',
                    unknownTime
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-disabled text-transparent',
                  )}
                >
                  <Check size={12} strokeWidth={3} />
                </span>
                시간 모름
              </button>
            </div>
          </section>
        )}
      </div>

      <Button
        variant="primary"
        fullWidth
        disabled={!canSubmit}
        className="mt-auto"
        onClick={() => {
          // TODO: 사주 정보(달력종류/생년월일/시간) 저장 후 분석(온보딩2)으로 이동
          navigate('/onboarding/step-2');
        }}
      >
        내 기운 확인하기
      </Button>

      <BirthTimeSkipSheet open={skipSheetOpen} onClose={cancelSkip} onConfirm={confirmSkip} />
    </div>
  );
}
