import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Check } from 'lucide-react';

import Button from '../../components/Button';
import PageHeader from '../../components/PageHeader';
import SelectField from '../../components/SelectField';
import WheelPickerSheet, { type WheelColumnSpec } from '../../components/WheelPickerSheet';
import { cn } from '../../lib/cn';
import { useMemberSaju, useUpdateMemberSaju } from '../../hooks/my/useMy';
import {
  useCreateFortuneReport,
  useMyFortuneReport,
  useReportStatus,
} from '../../hooks/onboarding/useGetReport';
import {
  HOURS,
  MINUTES,
  birthYearsDescending,
  clampDate,
  dayOptions,
  formatBirthDate,
  formatHour,
  monthOptions,
  pad,
} from '../../lib/birthDate';
import { loadFailureMessage, loadingMessage } from '../../lib/messages';

type OpenSheet = 'date' | 'time' | null;
type DateValue = { year: number; month: number; day: number };
type TimeValue = { hour: number; minute: number };
type SajuForm = {
  date: DateValue;
  calendarType: 'SOLAR' | 'LUNAR';
  time: TimeValue;
  hasTime: boolean;
};

const INITIAL_DATE = { year: 1995, month: 6, day: 15 };
const INITIAL_TIME = { hour: 10, minute: 1 };
const DEFAULT_SAJU_FORM: SajuForm = {
  date: INITIAL_DATE,
  calendarType: 'SOLAR',
  time: INITIAL_TIME,
  hasTime: false,
};
/** 최근 해부터 내려온다 — 온보딩 휠과 정렬이 반대다(`lib/birthDate` 주석 참고). */
const YEARS = birthYearsDescending();

function toSajuForm(saju: {
  calendarType: 'SOLAR' | 'LUNAR';
  birthDate: string;
  birthTime: string;
  birthTimeUnknown: boolean;
}): SajuForm {
  const [year, month, day] = saju.birthDate.split('-').map(Number);
  const [hour = INITIAL_TIME.hour, minute = INITIAL_TIME.minute] = saju.birthTime
    .split(':')
    .map(Number);

  return {
    date: { year, month, day },
    calendarType: saju.calendarType,
    time: { hour, minute },
    hasTime: !saju.birthTimeUnknown,
  };
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
  const sajuQuery = useMemberSaju();
  const updateSajuMutation = useUpdateMemberSaju();
  const createReportMutation = useCreateFortuneReport();
  const [regeneratingReportId, setRegeneratingReportId] = useState<number | null>(null);
  const reportStatusQuery = useReportStatus(regeneratingReportId ?? undefined);
  const [draft, setDraft] = useState<SajuForm | null>(null);
  // 시트를 돌리는 동안의 값. '확인'을 눌러야 draft로 옮겨온다 — 온보딩1과 같은 구조다.
  const [openSheet, setOpenSheet] = useState<OpenSheet>(null);
  const [draftDate, setDraftDate] = useState<DateValue>(INITIAL_DATE);
  const [draftTime, setDraftTime] = useState<TimeValue>(INITIAL_TIME);
  const serverForm = sajuQuery.data ? toSajuForm(sajuQuery.data) : null;
  const form = draft ?? serverForm ?? DEFAULT_SAJU_FORM;
  const { date, calendarType, time: pickerTime, hasTime: hasSelectedTime } = form;
  const changed =
    Boolean(serverForm) &&
    (formatBirthDate(date) !== formatBirthDate(serverForm!.date) ||
      hasSelectedTime !== serverForm!.hasTime ||
      pickerTime.hour !== serverForm!.time.hour ||
      pickerTime.minute !== serverForm!.time.minute);
  const regenerationFailed =
    createReportMutation.isError ||
    reportStatusQuery.isError ||
    reportStatusQuery.data?.status === 'failed';
  const isRegenerating =
    updateSajuMutation.isPending ||
    createReportMutation.isPending ||
    (!!regeneratingReportId &&
      !regenerationFailed &&
      reportStatusQuery.data?.status !== 'completed');

  useEffect(() => {
    if (regeneratingReportId && reportStatusQuery.data?.status === 'completed') {
      navigate('/my/saju/complete', {
        replace: true,
        state: { reportId: regeneratingReportId },
      });
    }
  }, [navigate, regeneratingReportId, reportStatusQuery.data?.status]);

  /** 서버 값을 기준으로 편집을 시작한다 — 아직 아무것도 안 고쳤으면 draft가 null이다. */
  const updateForm = (update: (current: SajuForm) => SajuForm) => {
    setDraft((current) => update(current ?? serverForm ?? DEFAULT_SAJU_FORM));
  };

  /**
   * 서버 값이 오기 전에는 편집을 막는다.
   *
   * ⚠️ 잠그지 않으면 **달력 종류가 조용히 양력으로 덮인다.** 응답 전에 시트를 열어 확정하면
   * `updateForm`이 `serverForm`이 아직 null이라 `DEFAULT_SAJU_FORM`을 집는다. 그 순간 draft가
   * 생겨 뒤늦게 온 서버 값이 화면에 영영 안 나오고, 그 상태로 저장하면 draft의
   * `calendarType: 'SOLAR'`와 `hasTime: false`가 그대로 나간다 — 음력 사용자의 설정과
   * 태어난 시간이 사라진다. **이 화면에는 달력 종류를 고치는 UI가 없어 되돌릴 방법도 없다.**
   *
   * 저장 버튼만으로는 못 막는다. `changed`가 `serverForm`을 요구해 로딩 중엔 잠기지만,
   * 응답이 도착하는 순간 draft ≠ serverForm이라 열린다.
   *
   * `OnboardingPage3`의 고민 유형 프리필과 같은 문제이고 같은 방식으로 막는다.
   */
  const isPrefilling = sajuQuery.isPending;

  const openDateSheet = () => {
    if (isPrefilling) return;
    setDraftDate(date);
    setOpenSheet('date');
  };
  const confirmDate = () => {
    updateForm((current) => ({ ...current, date: draftDate }));
    setOpenSheet(null);
  };

  const openTimeSheet = () => {
    if (isPrefilling) return;
    setDraftTime(pickerTime);
    setOpenSheet('time');
  };
  const confirmTime = () => {
    // 시간을 확정했으면 '모름'이 아니다.
    updateForm((current) => ({ ...current, time: draftTime, hasTime: true }));
    setOpenSheet(null);
  };

  /**
   * '태어난 시간을 몰라요' 토글.
   *
   * 온보딩1은 여기서 안내 시트를 띄우고 곧바로 제출하지만, 이 화면은 저장 버튼이 따로 있어
   * 표시만 바꾼다. 시간값 자체는 남겨둔다 — 다시 체크를 풀면 고르던 값이 돌아온다.
   */
  const toggleUnknownTime = () => {
    if (isPrefilling) return;
    updateForm((current) => ({ ...current, hasTime: !current.hasTime }));
  };

  /**
   * 연·월이 바뀌면 남은 범위 밖으로 나간 월·일을 당긴다.
   *
   * 예전에는 일수만 맞췄고 미래 차단이 없어서 **올해 12월 31일 같은 미래 생년월일을 저장할 수
   * 있었다.** 온보딩1은 같은 입력을 미래는 휠에 올리지 않는 방식으로 막고 있었다 —
   * 같은 값을 고르는 화면이 서로 다른 답을 허용하고 있었던 것이라 온보딩 쪽으로 맞춘다(#163).
   */
  const dateColumns: WheelColumnSpec[] = [
    {
      options: YEARS,
      value: draftDate.year,
      format: (value) => `${value}년`,
      onChange: (year) => setDraftDate((prev) => clampDate({ ...prev, year })),
    },
    {
      options: monthOptions(draftDate.year),
      value: draftDate.month,
      format: (value) => `${value}월`,
      onChange: (month) => setDraftDate((prev) => clampDate({ ...prev, month })),
    },
    {
      options: dayOptions(draftDate.year, draftDate.month),
      value: draftDate.day,
      format: (value) => `${value}일`,
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
      format: (value) => `${value}분`,
      onChange: (minute) => setDraftTime((prev) => ({ ...prev, minute })),
    },
  ];

  const submit = async () => {
    if ((!changed && !regenerationFailed) || isRegenerating) return;

    setRegeneratingReportId(null);

    try {
      await updateSajuMutation.mutateAsync({
        calendarType,
        birthDate: formatBirthDate(date),
        birthTime: hasSelectedTime ? `${pad(pickerTime.hour)}:${pad(pickerTime.minute)}` : '',
        birthTimeUnknown: !hasSelectedTime,
      });

      // 사주 저장이 끝난 뒤 새 리포트 생성을 시작하고, 완료될 때까지 상태를 폴링한다.
      const report = await createReportMutation.mutateAsync();
      setRegeneratingReportId(report.reportId);
    } catch {
      // mutation의 isError를 화면의 재시도 안내에 사용한다.
    }
  };

  return (
    <div className="min-h-dvh w-full bg-gray-1 pb-28">
      <PageHeader title="사주 정보 수정" backTo="/my" />

      <main className="px-5 pt-5">
        {sajuQuery.isPending ? (
          <p className="typo-sub-2 text-gray-4">{loadingMessage('현재 사주 정보')}</p>
        ) : null}
        {sajuQuery.isError ? (
          <p className="typo-sub-2 text-gray-4">{loadFailureMessage('사주 정보')}</p>
        ) : null}
        <section className="rounded-btn border border-gray-2 bg-white p-5 shadow-card-soft">
          <p className="typo-body-3 text-primary">현재 사주 정보</p>
          <dl className="typo-sub-2 mt-3 space-y-2 text-gray-5">
            <div className="flex gap-1.5">
              <dt className="w-20 font-bold">생년월일</dt>
              <dd>
                {calendarType === 'SOLAR' ? '양력' : '음력'} {date.year}.{pad(date.month)}.
                {pad(date.day)}
              </dd>
            </div>
            <div className="flex gap-1.5">
              <dt className="w-20 font-bold">태어난 시간</dt>
              <dd>
                {hasSelectedTime
                  ? `${formatHour(pickerTime.hour)} ${pickerTime.minute}분`
                  : '출생시간 모름'}
              </dd>
            </div>
          </dl>
        </section>
        <p className="typo-sub-3 mt-2.5 px-2.5 text-danger">
          사주 수정 시 기존 방문 기록은 유지되며,
          <br />새 추천 결과부터 변경된 사주 정보가 적용됩니다.
        </p>

        {/* 온보딩1과 같은 입력 방식 — 눌러서 바텀시트 휠을 열고 '확인'으로 확정한다. */}
        {/* 불러오는 동안은 누를 수 없다 — 먼저 확정하면 서버 값을 못 본 채 덮어쓴다. */}
        <section
          aria-busy={isPrefilling}
          className={cn('mt-4 flex flex-col gap-9', isPrefilling && 'pointer-events-none')}
        >
          <SelectField
            label="생년월일"
            // 불러오기 전에는 기본값(1995-06-15)이 진짜 저장값인 척 보인다. 자리표시자를 쓴다.
            value={isPrefilling ? null : `${date.year}년 ${pad(date.month)}월 ${pad(date.day)}일`}
            placeholder="불러오는 중…"
            onClick={openDateSheet}
          />
          <SelectField
            label="태어난 시간"
            value={
              isPrefilling || !hasSelectedTime
                ? null
                : `${formatHour(pickerTime.hour)} ${pickerTime.minute}분`
            }
            placeholder={isPrefilling ? '불러오는 중…' : '시간을 선택해주세요'}
            onClick={openTimeSheet}
            footer={
              <button
                type="button"
                aria-pressed={!hasSelectedTime}
                onClick={toggleUnknownTime}
                className={cn(
                  'flex items-center gap-1 self-start text-xs font-bold',
                  hasSelectedTime ? 'text-gray-3' : 'text-primary',
                )}
              >
                <span
                  className={cn(
                    'flex size-5 items-center justify-center rounded-full border',
                    hasSelectedTime
                      ? 'border-gray-disabled text-transparent'
                      : 'border-primary bg-primary text-white',
                  )}
                >
                  <Check size={12} strokeWidth={3} />
                </span>
                태어난 시간을 몰라요
              </button>
            }
          />
        </section>
      </main>

      <Button
        disabled={(!changed && !regenerationFailed) || isRegenerating}
        onClick={() => void submit()}
        className="fixed-app-x-5 fixed bottom-[calc(2rem+env(safe-area-inset-bottom))]"
      >
        {isRegenerating ? '리포트 재생성 중...' : '저장하고 리포트 재생성'}
      </Button>
      {updateSajuMutation.isError ? (
        <p className="fixed-app-x-5 fixed bottom-2 text-center text-xs text-danger">
          사주 정보 수정에 실패했습니다. 잠시 후 다시 시도해주세요.
        </p>
      ) : regenerationFailed ? (
        <p className="fixed-app-x-5 fixed bottom-2 text-center text-xs text-danger">
          리포트 재생성에 실패했습니다. 다시 시도해주세요.
        </p>
      ) : null}

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
    </div>
  );
}

export function SajuReportCompletePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { reportId?: unknown } | null;
  const reportIdFromState =
    typeof locationState?.reportId === 'number' &&
    Number.isInteger(locationState.reportId) &&
    locationState.reportId > 0
      ? locationState.reportId
      : undefined;
  // 라우터 state가 없을 때(새로고침 등)의 폴백. 내 최신 완료 리포트를 직접 묻는다.
  const myReportQuery = useMyFortuneReport(!reportIdFromState);
  const reportId = reportIdFromState ?? myReportQuery.data?.reportId;

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
      <div className="flex flex-col gap-2 px-5 pb-[calc(2rem+env(safe-area-inset-bottom))]">
        <Button
          disabled={!reportId}
          onClick={() => {
            if (reportId) {
              navigate(`/report/${reportId}?from=my&source=saju-edit`, { replace: true });
            }
          }}
        >
          {reportId ? '재생성된 리포트 보러가기' : '리포트 불러오는 중'}
        </Button>
        <Button
          variant="secondary"
          className="border-primary-light bg-primary-bg"
          onClick={() => navigate('/my', { replace: true })}
        >
          마이페이지로 돌아가기
        </Button>
      </div>
    </div>
  );
}
