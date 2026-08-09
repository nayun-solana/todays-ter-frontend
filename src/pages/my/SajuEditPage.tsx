import { type RefObject, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import Button from '../../components/Button';
import PageHeader from '../../components/PageHeader';
import { ChevronDownIcon } from '../../components/icons';

type DateField = 'year' | 'month' | 'day';

const INITIAL_DATE = { year: 1995, month: 6, day: 15 };
const YEARS = Array.from(
  { length: new Date().getFullYear() - 1900 + 1 },
  (_, index) => new Date().getFullYear() - index,
);
const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);
const HOURS = Array.from({ length: 24 }, (_, index) => index);
const MINUTES = Array.from({ length: 60 }, (_, index) => index);
const WHEEL_ROW_HEIGHT = 48;

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function formatHour(hour: number) {
  return `${hour < 12 ? '오전' : '오후'} ${hour % 12 || 12}시`;
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!open) {
      initialized.current = false;
      return;
    }
    if (initialized.current) return;

    initialized.current = true;
    const index = options.indexOf(value);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: Math.max(index, 0) * WHEEL_ROW_HEIGHT });
    });
  }, [open, options, value]);

  return (
    <div>
      <p className="typo-head-4 mb-2 text-gray-6">{label}</p>
      <div className="relative h-[52px]">
        {open ? (
          <div className="absolute inset-x-0 top-0 z-10 overflow-hidden rounded-btn border border-primary-light bg-gray-1 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <button
              type="button"
              aria-expanded
              onClick={onToggle}
              className="typo-body-3 flex h-[52px] w-full items-center justify-between bg-white px-5 text-gray-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
            >
              {value}
              <ChevronDownIcon className="text-gray-5" />
            </button>
            <div className="relative">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-[7px] top-12 h-12 rounded-btn bg-gray-2"
              />
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
                className="no-scrollbar relative z-10 h-36 snap-y snap-mandatory overflow-y-auto py-12 text-center"
              >
                {options.map((option) => (
                  <div
                    key={option}
                    aria-selected={option === value}
                    role="option"
                    className="typo-body-3 flex h-12 snap-center items-center px-5 text-gray-5"
                  >
                    {option}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            aria-expanded={false}
            onClick={onToggle}
            className="typo-body-3 flex h-[52px] w-full items-center justify-between rounded-btn bg-white px-5 text-gray-5 shadow-card"
          >
            {value}
            <ChevronDownIcon className="text-gray-5" />
          </button>
        )}
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
      className="no-scrollbar relative z-10 h-36 snap-y snap-mandatory overflow-y-auto py-12 text-center"
    >
      {options.map((option) => (
        <div
          key={option}
          className="typo-body-3 flex h-12 snap-center items-center justify-center text-gray-5"
        >
          {format(option)}
        </div>
      ))}
    </div>
  );
}

/** 완료 화면 공통 체크 배지 (Figma 그라데이션 원 + 흰 체크). 고민유형 수정 완료 화면도 재사용한다. */
export function CheckIcon() {
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
  const days = Array.from({ length: daysInMonth(date.year, date.month) }, (_, index) => index + 1);
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
  };

  return (
    <div className="min-h-dvh w-full bg-gray-1 pb-28">
      <PageHeader title="사주 정보 수정" backTo="/my" />

      <main className="px-5 pt-5">
        <section className="rounded-btn border border-gray-2 bg-white p-5 shadow-card-soft">
          <p className="typo-body-3 text-primary">현재 사주 정보</p>
          <dl className="typo-sub-2 mt-3 space-y-2 text-gray-5">
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
        <p className="typo-sub-3 mt-2.5 px-2.5 text-danger">
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
            <p className="typo-head-4 mb-2 text-gray-6">시</p>
            <div className="relative">
              <button
                type="button"
                aria-expanded={timePickerOpen}
                onClick={() => {
                  setOpenField(null);
                  setTimePickerOpen(!timePickerOpen);
                }}
                className="typo-body-3 flex h-[52px] w-full items-center justify-between rounded-btn bg-white px-5 text-gray-5 shadow-card"
              >
                {hasSelectedTime ? `${formatHour(pickerTime.hour)} ${pickerTime.minute}분` : '모름'}
                <ChevronDownIcon className="text-gray-5" />
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

      <Button
        disabled={!changed}
        onClick={() => navigate('/my/saju/complete')}
        className="fixed bottom-8 left-1/2 w-[calc(100%-40px)] max-w-[350px] -translate-x-1/2"
      >
        저장하고 리포트 재생성
      </Button>
    </div>
  );
}

export function SajuReportCompletePage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-dvh w-full flex-col bg-white">
      <main className="flex flex-1 -translate-y-6 flex-col items-center justify-center gap-8 text-center text-gray-6">
        <CheckIcon />
        <div>
          <h1 className="typo-head-2">리포트 재생성 완료</h1>
          <p className="typo-sub-2 mt-3">
            수정된 사주를 바탕으로
            <br />
            리포트가 재생성되었어요!
          </p>
        </div>
      </main>
      <div className="px-5 pb-8">
        <Button onClick={() => navigate('/report/1?from=my', { replace: true })}>
          생성된 리포트 보러가기
        </Button>
      </div>
    </div>
  );
}
