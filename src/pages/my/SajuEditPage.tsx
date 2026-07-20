import { type RefObject, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import iconChevronLeft from '../../assets/icon-chevron-left.svg';

type DateField = 'year' | 'month' | 'day';

const INITIAL_DATE = { year: 1995, month: 6, day: 15 };
const YEARS = Array.from(
  { length: new Date().getFullYear() - 1900 + 1 },
  (_, index) => new Date().getFullYear() - index,
);
const MONTHS = Array.from({ length: 12 }, (_, index) => 12 - index);
const HOURS = Array.from({ length: 24 }, (_, index) => index);
const MINUTES = Array.from({ length: 60 }, (_, index) => index);
const WHEEL_ROW_HEIGHT = 48;

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function orderedOptions(options: number[], value: number) {
  const selectedIndex = options.indexOf(value);
  return [...options.slice(selectedIndex), ...options.slice(0, selectedIndex)];
}

function formatHour(hour: number) {
  return `${hour < 12 ? '오전' : '오후'} ${hour % 12 || 12}시`;
}

function ChevronDown() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-2.5 w-5">
      <path
        d="M8 1L1 8L8 15"
        transform="translate(0 16) rotate(-90)"
        fill="none"
        stroke="#3f3f46"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg aria-label="공유" viewBox="0 0 24 24" className="size-6">
      <path
        d="M14.7381 6.67369C15.0417 7.2012 15.6051 7.55556 16.25 7.55556C17.2165 7.55556 18 6.75962 18 5.77778C18 4.79594 17.2165 4 16.25 4C15.2835 4 14.5 4.79594 14.5 5.77778C14.5 6.10449 14.5868 6.41062 14.7381 6.67369ZM14.7381 6.67369L7.26186 11.1041M7.26186 11.1041C6.9583 10.5766 6.39489 10.2222 5.75 10.2222C4.7835 10.2222 4 11.0182 4 12C4 12.9818 4.7835 13.7778 5.75 13.7778C6.39489 13.7778 6.9583 13.4234 7.26186 12.8959M7.26186 11.1041C7.41324 11.3672 7.5 11.6733 7.5 12C7.5 12.3267 7.41324 12.6328 7.26186 12.8959M7.26186 12.8959L14.7381 17.3263M14.7381 17.3263C15.0417 16.7988 15.6051 16.4444 16.25 16.4444C17.2165 16.4444 18 17.2404 18 18.2222C18 19.2041 17.2165 20 16.25 20C15.2835 20 14.5 19.2041 14.5 18.2222C14.5 17.8955 14.5868 17.5894 14.7381 17.3263Z"
        fill="none"
        stroke="#71717a"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DateSelect({
  label,
  value,
  options,
  open,
  onToggle,
  onSelect,
}: {
  label: string;
  value: number;
  options: number[];
  open: boolean;
  onToggle: () => void;
  onSelect: (value: number) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm leading-[18px] font-extrabold text-gray-6">{label}</p>
      <div className="relative">
        <button
          type="button"
          aria-expanded={open}
          onClick={onToggle}
          className="flex h-[52px] w-full items-center justify-between rounded-btn bg-white px-5 text-sm font-bold text-gray-5 shadow-[0_2px_1px_rgba(0,0,0,0.05)]"
        >
          {value}
          <ChevronDown />
        </button>
        {open ? (
          <div className="absolute z-10 max-h-[196px] w-full overflow-y-auto rounded-btn border border-primary-light bg-gray-1 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            {orderedOptions(options, value).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onSelect(option)}
                className="flex h-[49px] w-full items-center border-b border-gray-2 px-5 text-left text-sm font-bold text-gray-5 last:border-b-0"
              >
                {option}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function TimeWheel({
  options,
  format,
  scrollRef,
  onSelect,
}: {
  options: number[];
  format: (value: number) => string;
  scrollRef: RefObject<HTMLDivElement | null>;
  onSelect: (value: number) => void;
}) {
  return (
    <div
      ref={scrollRef}
      onScroll={(event) => {
        const index = Math.max(
          0,
          Math.min(
            options.length - 1,
            Math.round(event.currentTarget.scrollTop / WHEEL_ROW_HEIGHT),
          ),
        );
        onSelect(options[index]);
      }}
      className="relative z-10 h-36 snap-y snap-mandatory overflow-y-auto py-12 text-center"
    >
      {options.map((option) => (
        <div
          key={option}
          className="flex h-12 snap-center items-center justify-center text-sm font-bold text-gray-5"
        >
          {format(option)}
        </div>
      ))}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 40 40" fill="none" className="size-10">
      <defs>
        <linearGradient
          id="paint0_linear_1919_2817"
          x1="20"
          y1="0"
          x2="20"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#92acff" />
          <stop offset="1" stopColor="#5a81fa" />
        </linearGradient>
        <linearGradient
          id="paint0_linear_1919_2818"
          x1="7.75"
          y1="13"
          x2="6.25"
          y2="14.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="#cdcdcd" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_1919_2818"
          x1="11.5"
          y1="9.25"
          x2="14.25"
          y2="12"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.65" stopColor="white" />
          <stop offset="0.927885" stopColor="#525252" />
          <stop offset="1" stopColor="#262626" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill="url(#paint0_linear_1919_2817)" />
      <g transform="translate(8.5 11.5)">
        <path
          d="M21.5 1.5L9.25 14.75L1.5 6.75"
          stroke="url(#paint0_linear_1919_2818)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M21.5 1.5L9.25 14.75L1.5 6.75"
          stroke="url(#paint1_linear_1919_2818)"
          strokeOpacity="0.2"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

export default function SajuEditPage() {
  const navigate = useNavigate();
  const [date, setDate] = useState(INITIAL_DATE);
  const [openField, setOpenField] = useState<DateField | null>(null);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [pickerTime, setPickerTime] = useState({ hour: 10, minute: 1 });
  const [hasSelectedTime, setHasSelectedTime] = useState(false);
  const hourWheelRef = useRef<HTMLDivElement>(null);
  const minuteWheelRef = useRef<HTMLDivElement>(null);
  const ignoreInitialTimeScroll = useRef(false);
  const days = Array.from(
    { length: daysInMonth(date.year, date.month) },
    (_, index) => daysInMonth(date.year, date.month) - index,
  );
  const changed =
    date.year !== INITIAL_DATE.year ||
    date.month !== INITIAL_DATE.month ||
    date.day !== INITIAL_DATE.day ||
    hasSelectedTime;

  useEffect(() => {
    if (!timePickerOpen) return;

    ignoreInitialTimeScroll.current = true;
    requestAnimationFrame(() => {
      hourWheelRef.current?.scrollTo({ top: pickerTime.hour * WHEEL_ROW_HEIGHT });
      minuteWheelRef.current?.scrollTo({ top: pickerTime.minute * WHEEL_ROW_HEIGHT });
      requestAnimationFrame(() => {
        ignoreInitialTimeScroll.current = false;
      });
    });
  }, [pickerTime.hour, pickerTime.minute, timePickerOpen]);

  const updateDate = (field: DateField, value: number) => {
    setDate((current) => {
      const next = { ...current, [field]: value };
      return {
        ...next,
        day: Math.min(next.day, daysInMonth(next.year, next.month)),
      };
    });
    setOpenField(null);
  };

  return (
    <div className="mx-auto min-h-screen max-w-[390px] bg-gray-1 pb-28">
      <header className="flex h-[99px] items-end justify-between border-b border-gray-disabled bg-white px-5 pb-3">
        <button
          type="button"
          onClick={() => navigate('/my')}
          aria-label="마이페이지로 돌아가기"
          className="flex size-6 items-center justify-center"
        >
          <img src={iconChevronLeft} alt="" className="h-3.5 w-[7px]" />
        </button>
        <h1 className="text-sm font-bold text-gray-6">사주 정보 수정</h1>
        <ShareIcon />
      </header>

      <main className="px-5 pt-5">
        <section className="rounded-btn border border-gray-2 bg-white p-5 shadow-[0_2px_2px_rgba(0,0,0,0.05)]">
          <p className="text-sm font-bold text-primary">현재 사주 정보</p>
          <dl className="mt-3 space-y-2 text-xs leading-4 text-gray-5">
            <div className="flex gap-1.5">
              <dt className="w-20 font-bold">생년월일</dt>
              <dd>양력 1995.06.15</dd>
            </div>
            <div className="flex gap-1.5">
              <dt className="w-20 font-bold">태어난 시간</dt>
              <dd>출생시간 모름</dd>
            </div>
          </dl>
        </section>
        <p className="mt-2.5 px-2.5 text-[10px] leading-[14px] text-[#ff5353]">
          사주 수정 시 기존 방문 기록은 유지되며,
          <br />새 추천 결과부터 변경된 사주 정보가 적용됩니다.
        </p>

        <section className="mt-4 space-y-3">
          <DateSelect
            label="년"
            value={date.year}
            options={YEARS}
            open={openField === 'year'}
            onToggle={() => {
              setTimePickerOpen(false);
              setOpenField(openField === 'year' ? null : 'year');
            }}
            onSelect={(value) => updateDate('year', value)}
          />
          <DateSelect
            label="월"
            value={date.month}
            options={MONTHS}
            open={openField === 'month'}
            onToggle={() => {
              setTimePickerOpen(false);
              setOpenField(openField === 'month' ? null : 'month');
            }}
            onSelect={(value) => updateDate('month', value)}
          />
          <DateSelect
            label="일"
            value={date.day}
            options={days}
            open={openField === 'day'}
            onToggle={() => {
              setTimePickerOpen(false);
              setOpenField(openField === 'day' ? null : 'day');
            }}
            onSelect={(value) => updateDate('day', value)}
          />
          <div>
            <p className="mb-2 text-sm leading-[18px] font-extrabold text-gray-6">시</p>
            <div className="relative">
              <button
                type="button"
                aria-expanded={timePickerOpen}
                onClick={() => {
                  setOpenField(null);
                  setTimePickerOpen(!timePickerOpen);
                }}
                className="flex h-[52px] w-full items-center justify-between rounded-btn bg-white px-5 text-sm font-bold text-gray-5 shadow-[0_2px_1px_rgba(0,0,0,0.05)]"
              >
                {hasSelectedTime ? `${formatHour(pickerTime.hour)} ${pickerTime.minute}분` : '모름'}
                <ChevronDown />
              </button>
              {timePickerOpen ? (
                <div className="absolute z-10 w-full overflow-hidden rounded-btn border border-primary-light bg-gray-1 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                  <div className="relative grid grid-cols-2">
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-[7px] top-12 h-12 rounded-btn bg-gray-2"
                    />
                    <TimeWheel
                      options={HOURS}
                      format={formatHour}
                      scrollRef={hourWheelRef}
                      onSelect={(hour) => {
                        if (ignoreInitialTimeScroll.current) return;
                        setPickerTime((current) => ({ ...current, hour }));
                        setHasSelectedTime(true);
                      }}
                    />
                    <TimeWheel
                      options={MINUTES}
                      format={(minute) => `${minute}분`}
                      scrollRef={minuteWheelRef}
                      onSelect={(minute) => {
                        if (ignoreInitialTimeScroll.current) return;
                        setPickerTime((current) => ({ ...current, minute }));
                        setHasSelectedTime(true);
                      }}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </main>

      <button
        type="button"
        disabled={!changed}
        onClick={() => navigate('/my/saju/complete')}
        className="fixed bottom-8 left-1/2 h-12 w-[calc(100%-40px)] max-w-[335px] -translate-x-1/2 rounded-btn bg-gray-disabled px-5 text-sm font-bold text-gray-4 disabled:cursor-not-allowed enabled:bg-primary enabled:text-white"
      >
        저장하고 리포트 재생성
      </button>
    </div>
  );
}

export function SajuReportCompletePage() {
  const navigate = useNavigate();

  return (
    <div className="relative mx-auto min-h-screen max-w-[390px] bg-white">
      <button
        type="button"
        onClick={() => navigate('/my')}
        aria-label="닫기"
        className="absolute top-[60px] right-5 flex size-6 items-center justify-center"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6">
          <path
            d="M6 6L18 18M6 18L18 6"
            fill="none"
            stroke="#3f3f46"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <main className="flex min-h-screen -translate-y-[27px] flex-col items-center justify-center gap-8 text-center text-gray-6">
        <CheckIcon />
        <div>
          <h1 className="text-xl font-extrabold">리포트 재생성 완료</h1>
          <p className="mt-3 text-xs leading-4">
            수정된 사주를 바탕으로
            <br />
            리포트가 재생성되었어요!
          </p>
        </div>
      </main>
    </div>
  );
}
