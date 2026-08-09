import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Check } from 'lucide-react';

import Button from '../../components/Button';
import { cn } from '../../lib/cn';
import { useInitGuestSession, useSaveGuestSaju } from '../../hooks/onboarding/useGuestOnboarding';
import type { Gender, GuestSajuRequest } from '../../types/onboarding/guestOnboarding';
import BirthTimeSkipSheet from './components/BirthTimeSkipSheet';
import SelectField from './components/SelectField';
import WheelPickerSheet, { type WheelColumnSpec } from './components/WheelPickerSheet';

type CalendarType = 'solar' | 'lunar';
type OpenSheet = 'date' | 'time' | null;
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
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const DEFAULT_DATE: DateValue = { year: 2000, month: 1, day: 1 };
const DEFAULT_TIME: TimeValue = { hour: 0, minute: 0 };

const CALENDAR_OPTIONS = [
  { value: 'solar', label: '양력' },
  { value: 'lunar', label: '음력' },
] as const;
const GENDER_OPTIONS = [
  { value: 'MALE', label: '남자' },
  { value: 'FEMALE', label: '여자' },
] as const;

const pad = (n: number) => String(n).padStart(2, '0');
const range = (length: number) => Array.from({ length }, (_, i) => i + 1);

/**
 * 미래 날짜는 휠에 아예 올리지 않는다 — 고른 뒤 막는 게 아니라 고를 수 없게 하는 게 시안이다.
 * 올해를 고르면 이번 달까지, 이번 달을 고르면 오늘까지만 옵션이 생긴다.
 */
function maxMonth(year: number) {
  const now = new Date();
  return year === now.getFullYear() ? now.getMonth() + 1 : 12;
}

function maxDay(year: number, month: number) {
  const now = new Date();
  if (year === now.getFullYear() && month === now.getMonth() + 1) return now.getDate();
  // month는 1-based, Date의 day 0 = 전달 마지막 날 → 해당 월의 일수
  return new Date(year, month, 0).getDate();
}

/** 연·월이 바뀌어 옵션이 줄면 월·일을 남은 범위 안으로 당긴다. */
function clampDate({ year, month, day }: DateValue): DateValue {
  const clampedMonth = Math.min(month, maxMonth(year));
  return { year, month: clampedMonth, day: Math.min(day, maxDay(year, clampedMonth)) };
}

function formatHour(hour: number) {
  return `${hour < 12 ? '오전' : '오후'} ${hour % 12 || 12}시`;
}

/** 달력 종류·성별처럼 2지선다를 pill로 고르는 그룹. (Figma 3099:1684) */
function PillGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
}) {
  return (
    <section className="flex flex-col gap-3">
      <p className="text-sm font-bold text-gray-6">{label}</p>
      <div className="flex gap-2.5">
        {options.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                'flex h-13 flex-1 items-center justify-center rounded-full text-sm transition-colors',
                active
                  ? 'bg-primary font-bold text-white'
                  : 'bg-gray-2 font-normal text-gray-disabled',
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

/** 온보딩1 — 내 사주 입력 (달력 종류 → 성별 → 생년월일 → 태어난 시간). 날짜/시간은 바텀시트 휠. */
export default function OnboardingPage1() {
  const navigate = useNavigate();

  const [calendarType, setCalendarType] = useState<CalendarType | null>(null);
  const [gender, setGender] = useState<Gender | null>(null);
  // 확정값은 null로 시작한다(=아직 입력 안 함). 휠을 돌리는 동안의 값은 draft가 들고 있다가
  // '확인'을 눌러야 이쪽으로 옮겨온다.
  const [date, setDate] = useState<DateValue | null>(null);
  const [draftDate, setDraftDate] = useState<DateValue>(DEFAULT_DATE);
  const [time, setTime] = useState<TimeValue | null>(null);
  const [draftTime, setDraftTime] = useState<TimeValue>(DEFAULT_TIME);
  const [unknownTime, setUnknownTime] = useState(false);
  const [openSheet, setOpenSheet] = useState<OpenSheet>(null);
  const [skipSheetOpen, setSkipSheetOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 게스트 세션 보장(진입 경로 무관 안전망). 서버 idempotent — 쿠키 있으면 재사용.
  const initSession = useInitGuestSession();
  useEffect(() => {
    initSession.mutate();
    // 마운트 시 1회. mutate는 안정 참조.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveSaju = useSaveGuestSaju();

  const canSubmit =
    calendarType !== null && gender !== null && date !== null && (time !== null || unknownTime);

  /** 폼 상태 → 사주 저장 요청. (calendarType 대문자, 날짜/시간 문자열, 시간모름 시 null) */
  const buildSajuRequest = (selectedGender: Gender, birthDate: DateValue): GuestSajuRequest => ({
    gender: selectedGender,
    calendarType: calendarType === 'lunar' ? 'LUNAR' : 'SOLAR',
    birthDate: `${birthDate.year}-${pad(birthDate.month)}-${pad(birthDate.day)}`,
    birthTime: unknownTime || time === null ? null : `${pad(time.hour)}:${pad(time.minute)}`,
    birthTimeUnknown: unknownTime,
  });

  /**
   * 사주 저장 후 다음 온보딩(분석)으로 이동.
   *
   * 예전에는 `onSettled`로 **저장 실패와 무관하게** 넘어갔다. 프로덕션이 cross-site라
   * 게스트 쿠키(SameSite=Lax)가 안 실려 저장이 실패하던 시절의 데모용 우회였고,
   * 주석에도 "실서비스 시 onSuccess로 복원"이라고 적혀 있었다. 그 문제는 #106(same-origin
   * 프록시) + BE의 SameSite=None 전환으로 해결됐다.
   *
   * 그대로 두면 사주가 저장되지 않은 채 step-2로 넘어가 리포트 생성이 400으로 실패한다
   * (예전에는 step-2가 성공을 흉내내서 드러나지 않았다).
   *
   * 마운트에서 세션을 만들고 있지만 그건 비동기라 빠르게 제출하면 쿠키 없이 저장이 나갈 수 있다.
   * 서버가 idempotent하니 제출 시점에 한 번 더 보장하고 순서를 확정한다.
   */
  const submitSaju = async () => {
    if (saveSaju.isPending) return; // 중복 제출 방지
    // 성별·생년월일은 앞 단계라 여기 도달 시 항상 채워져 있다. 타입 좁히기용 가드.
    if (gender === null || date === null) return;

    setSubmitError(null);
    try {
      await initSession.mutateAsync();
      await saveSaju.mutateAsync(buildSajuRequest(gender, date));
      navigate('/onboarding/step-2');
    } catch {
      setSubmitError('사주 정보를 저장하지 못했어요. 잠시 후 다시 시도해주세요.');
    }
  };

  const openDateSheet = () => {
    setDraftDate(date ?? DEFAULT_DATE);
    setOpenSheet('date');
  };
  const confirmDate = () => {
    setDate(draftDate);
    setOpenSheet(null);
  };

  const openTimeSheet = () => {
    setUnknownTime(false);
    setDraftTime(time ?? DEFAULT_TIME);
    setOpenSheet('time');
  };
  const confirmTime = () => {
    setTime(draftTime);
    setOpenSheet(null);
  };

  /** '태어난 시간을 몰라요' → 출생시간 없이 진행 안내 바텀시트. */
  const openSkipSheet = () => {
    setUnknownTime(true);
    setOpenSheet(null);
    setSkipSheetOpen(true);
  };
  const cancelSkip = () => {
    setUnknownTime(false);
    setSkipSheetOpen(false);
  };
  const confirmSkip = () => {
    setSkipSheetOpen(false);
    // 시간 모름(unknownTime=true) 상태로 사주 저장 후 진행.
    void submitSaju();
  };

  const dateColumns: WheelColumnSpec[] = [
    {
      options: YEARS,
      value: draftDate.year,
      format: (v) => `${v}년`,
      onChange: (year) => setDraftDate((prev) => clampDate({ ...prev, year })),
    },
    {
      options: range(maxMonth(draftDate.year)),
      value: draftDate.month,
      format: (v) => `${v}월`,
      onChange: (month) => setDraftDate((prev) => clampDate({ ...prev, month })),
    },
    {
      options: range(maxDay(draftDate.year, draftDate.month)),
      value: draftDate.day,
      format: (v) => `${v}일`,
      onChange: (day) => setDraftDate((prev) => ({ ...prev, day })),
    },
  ];

  const timeColumns: WheelColumnSpec[] = [
    {
      options: HOURS,
      value: draftTime.hour,
      format: formatHour,
      onChange: (hour) => setDraftTime((prev) => ({ ...prev, hour })),
    },
    {
      options: MINUTES,
      value: draftTime.minute,
      format: (v) => `${v}분`,
      onChange: (minute) => setDraftTime((prev) => ({ ...prev, minute })),
    },
  ];

  return (
    <div className="flex min-h-dvh w-full flex-col px-5 pb-8 pt-4">
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
        <PillGroup
          label="달력 종류"
          options={CALENDAR_OPTIONS}
          value={calendarType}
          onChange={setCalendarType}
        />

        {/* 성별 — BE 사주 계산에 필수(빠지면 저장 400) */}
        <PillGroup label="성별" options={GENDER_OPTIONS} value={gender} onChange={setGender} />

        {/* 생년월일 — 달력 종류·성별 선택 후 노출 */}
        {calendarType !== null && gender !== null && (
          <SelectField
            label="생년월일"
            value={date && `${date.year}년 ${pad(date.month)}월 ${pad(date.day)}일`}
            placeholder="날짜를 선택해주세요"
            onClick={openDateSheet}
          />
        )}

        {/* 태어난 시간 — 생년월일을 확정한 뒤에만 노출 */}
        {date !== null && (
          <SelectField
            label="태어난 시간"
            value={time && `${formatHour(time.hour)} ${time.minute}분`}
            placeholder="시간을 선택해주세요"
            onClick={openTimeSheet}
            footer={
              // 시간을 고르고 나면 시안에서 사라진다 — 더 이상 고를 게 없어서다.
              time === null ? (
                <button
                  type="button"
                  onClick={openSkipSheet}
                  className={cn(
                    'flex items-center gap-1 self-start text-xs font-bold',
                    unknownTime ? 'text-primary' : 'text-gray-3',
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
                  태어난 시간을 몰라요
                </button>
              ) : undefined
            }
          />
        )}
      </div>

      <div className="mt-auto flex flex-col gap-2">
        {submitError ? (
          <p role="alert" className="text-center text-xs font-bold text-danger">
            {submitError}
          </p>
        ) : null}
        <Button
          variant="primary"
          disabled={!canSubmit || saveSaju.isPending || initSession.isPending}
          onClick={() => void submitSaju()}
        >
          {saveSaju.isPending ? '저장 중…' : '내 기운 확인하기'}
        </Button>
      </div>

      <WheelPickerSheet
        open={openSheet === 'date'}
        title="생년월일 입력"
        columns={dateColumns}
        onConfirm={confirmDate}
        onClose={() => setOpenSheet(null)}
      />
      <WheelPickerSheet
        open={openSheet === 'time'}
        title="태어난 시간 입력"
        columns={timeColumns}
        onConfirm={confirmTime}
        onClose={() => setOpenSheet(null)}
      />

      <BirthTimeSkipSheet open={skipSheetOpen} onClose={cancelSkip} onConfirm={confirmSkip} />
    </div>
  );
}
