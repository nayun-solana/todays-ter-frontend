import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Check } from 'lucide-react';

import Button from '../../components/Button';
import { cn } from '../../lib/cn';
import BirthTimeSkipSheet from './components/BirthTimeSkipSheet';
import WheelSelect, { type WheelColumnSpec } from './components/WheelSelect';

type CalendarType = 'solar' | 'lunar';
type OpenField = 'date' | 'time' | null;
interface DateValue {
  year: number;
  month: number;
  day: number;
}
interface TimeValue {
  hour: number;
  minute: number;
}

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1900 + 1 }, (_, i) => 1900 + i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const DEFAULT_DATE: DateValue = { year: 2000, month: 1, day: 1 };
const DEFAULT_TIME: TimeValue = { hour: 0, minute: 0 };

const pad = (n: number) => String(n).padStart(2, '0');

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function isFutureDate({ year, month, day }: DateValue) {
  const d = new Date(year, month - 1, day);
  d.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d.getTime() > today.getTime();
}

function formatHour(hour: number) {
  return `${hour < 12 ? '오전' : '오후'} ${hour % 12 || 12}시`;
}

/** 온보딩1 — 내 사주 입력 (달력 종류 → 생년월일 → 태어난 시간). 날짜/시간은 휠 드롭다운. */
export default function OnboardingPage1() {
  const navigate = useNavigate();

  const [calendarType, setCalendarType] = useState<CalendarType | null>(null);
  const [date, setDate] = useState<DateValue | null>(null);
  const [time, setTime] = useState<TimeValue | null>(null);
  const [unknownTime, setUnknownTime] = useState(false);
  const [openField, setOpenField] = useState<OpenField>(null);
  const [skipSheetOpen, setSkipSheetOpen] = useState(false);

  const dateError = date !== null && isFutureDate(date);
  const canSubmit =
    calendarType !== null && date !== null && !dateError && (unknownTime || time !== null);

  const toggleDate = () => {
    if (date === null) setDate(DEFAULT_DATE);
    setOpenField((f) => (f === 'date' ? null : 'date'));
  };

  const toggleTime = () => {
    if (time === null) setTime(DEFAULT_TIME);
    setUnknownTime(false);
    setOpenField((f) => (f === 'time' ? null : 'time'));
  };

  const patchDate = (patch: Partial<DateValue>) => {
    setDate((prev) => {
      const next = { ...(prev ?? DEFAULT_DATE), ...patch };
      return { ...next, day: Math.min(next.day, daysInMonth(next.year, next.month)) };
    });
  };

  /** '시간 모름' → 출생시간 없이 진행 안내 바텀시트. */
  const openSkipSheet = () => {
    setUnknownTime(true);
    setTime(null);
    setOpenField(null);
    setSkipSheetOpen(true);
  };
  const cancelSkip = () => {
    setUnknownTime(false);
    setSkipSheetOpen(false);
  };
  const confirmSkip = () => {
    setSkipSheetOpen(false);
    // TODO: 사주 정보(간이) 저장 후 분석(온보딩2)으로 이동
    navigate('/onboarding/step-2');
  };

  const dateColumns: WheelColumnSpec[] = date
    ? [
        { options: YEARS, value: date.year, format: (v) => `${v}년`, onChange: (v) => patchDate({ year: v }) },
        { options: MONTHS, value: date.month, format: (v) => `${v}월`, onChange: (v) => patchDate({ month: v }) },
        {
          options: Array.from({ length: daysInMonth(date.year, date.month) }, (_, i) => i + 1),
          value: date.day,
          format: (v) => `${v}일`,
          onChange: (v) => patchDate({ day: v }),
        },
      ]
    : [];

  const timeColumns: WheelColumnSpec[] = time
    ? [
        {
          options: HOURS,
          value: time.hour,
          format: formatHour,
          onChange: (v) => setTime((p) => ({ ...(p ?? DEFAULT_TIME), hour: v })),
        },
        {
          options: MINUTES,
          value: time.minute,
          format: (v) => `${v}분`,
          onChange: (v) => setTime((p) => ({ ...(p ?? DEFAULT_TIME), minute: v })),
        },
      ]
    : [];

  return (
    <div className="flex min-h-screen w-full flex-col px-5 pb-8 pt-4">
      {/* 상단 진행바 — 3분할 세그먼트, 1/3 (Figma Component 5/베리언트4) */}
      <div className="flex gap-1">
        <span className="h-1 flex-1 rounded-full bg-primary" />
        <span className="h-1 flex-1 rounded-full bg-gray-disabled" />
        <span className="h-1 flex-1 rounded-full bg-gray-disabled" />
      </div>

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
          <WheelSelect
            label="생년월일"
            display={date ? `${date.year}년 ${pad(date.month)}월 ${pad(date.day)}일` : '0000년 00월 00일'}
            filled={date !== null}
            open={openField === 'date'}
            onToggle={toggleDate}
            columns={dateColumns}
            error={dateError ? '지금보다 미래의 날짜는 선택할 수 없어요.' : undefined}
            shake={dateError}
          />
        )}

        {/* 태어난 시간 — 유효한 생년월일 입력 후 노출 */}
        {date !== null && !dateError && (
          <WheelSelect
            label="태어난 시간"
            display={unknownTime ? '시간 모름' : time ? `${pad(time.hour)}:${pad(time.minute)}` : '00:00'}
            filled={time !== null || unknownTime}
            open={openField === 'time'}
            onToggle={toggleTime}
            columns={timeColumns}
            trailing={
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
            }
          />
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
