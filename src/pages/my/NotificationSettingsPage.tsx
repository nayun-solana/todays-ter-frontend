import { useEffect, useState } from 'react';

import Button from '../../components/Button';
import PageHeader from '../../components/PageHeader';
import Toggle from '../../components/Toggle';
import { ChevronRightIcon } from '../../components/icons';
import { cn } from '../../lib/cn';

type Sheet = 'frequency' | 'time' | null;
type TimeOption = (typeof TIME_OPTIONS)[number];

const FREQUENCIES = ['매일', '2일마다', '3일마다', '매주'] as const;
const TIME_OPTIONS = [
  { label: '오전 9시', summary: '오전 9:00' },
  { label: '오후 12시', summary: '오후 12:00' },
  { label: '오후 6시', summary: '오후 6:00' },
  { label: '오후 9시', summary: '오후 9:00' },
] as const;

function NotificationToggleCard({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex min-h-[56px] items-center justify-between rounded-btn bg-white px-5 py-4 shadow-card">
      <div>
        <p className="typo-body-3 text-gray-6">{title}</p>
        {description ? <p className="typo-caption mt-2 text-primary">{description}</p> : null}
      </div>
      <Toggle checked={checked} label={title} onChange={onChange} showState />
    </div>
  );
}

function RadioOption({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <input type="radio" checked={checked} onChange={onChange} className="sr-only" />
      <span className="flex size-[18px] items-center justify-center rounded-full border border-primary bg-white">
        {checked ? <span className="size-3 rounded-full bg-primary" /> : null}
      </span>
      <span className="typo-body-3 text-gray-4">{label}</span>
    </label>
  );
}

function SelectionSheet({
  type,
  frequency,
  time,
  onFrequencyChange,
  onTimeChange,
  onClose,
  onSave,
}: {
  type: Exclude<Sheet, null>;
  frequency: (typeof FREQUENCIES)[number];
  time: TimeOption;
  onFrequencyChange: (value: (typeof FREQUENCIES)[number]) => void;
  onTimeChange: (value: TimeOption) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const isFrequency = type === 'frequency';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="선택창 닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />
      <section className="relative h-[348px] w-full max-w-[375px] rounded-t-btn bg-white px-5 pt-8 pb-8">
        <span className="absolute top-4 left-1/2 h-1 w-10 -translate-x-1/2 rounded-lg bg-gray-3" />
        <h2 className="typo-head-2 text-gray-6">{isFrequency ? '알림 주기' : '알림 시간'}</h2>
        <p className="typo-sub-2 mt-2 text-gray-6">
          {isFrequency ? '원하는 주기를 골라주세요.' : '원하는 시간에 오늘의 터를 보내드릴게요.'}
        </p>

        <div className="mt-7 flex flex-col gap-4">
          {isFrequency
            ? FREQUENCIES.map((option) => (
                <RadioOption
                  key={option}
                  label={option}
                  checked={frequency === option}
                  onChange={() => onFrequencyChange(option)}
                />
              ))
            : TIME_OPTIONS.map((option) => (
                <RadioOption
                  key={option.label}
                  label={option.label}
                  checked={time.label === option.label}
                  onChange={() => onTimeChange(option)}
                />
              ))}
        </div>

        <Button onClick={onSave} className="absolute right-5 bottom-8 left-5 w-auto">
          {isFrequency ? '선택 완료' : '시간 저장'}
        </Button>
      </section>
    </div>
  );
}

export default function NotificationSettingsPage() {
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [savedPlaceEnabled, setSavedPlaceEnabled] = useState(true);
  const [serviceEnabled, setServiceEnabled] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(true);
  const [frequency, setFrequency] = useState<(typeof FREQUENCIES)[number]>('2일마다');
  const [time, setTime] = useState<TimeOption>(TIME_OPTIONS[2]);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [draftFrequency, setDraftFrequency] = useState(frequency);
  const [draftTime, setDraftTime] = useState(time);

  useEffect(() => {
    if (!sheet) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSheet(null);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [sheet]);

  const openSheet = (nextSheet: Exclude<Sheet, null>) => {
    setDraftFrequency(frequency);
    setDraftTime(time);
    setSheet(nextSheet);
  };

  const saveSheet = () => {
    if (sheet === 'frequency') setFrequency(draftFrequency);
    if (sheet === 'time') setTime(draftTime);
    setSheet(null);
  };

  return (
    <div className="mx-auto min-h-dvh max-w-[375px] bg-gray-1">
      <PageHeader title="알림 설정" backTo="/my" />

      <main className="space-y-5 px-5 pt-5 pb-8">
        <section>
          <h2 className="typo-head-4 text-gray-6">추천 알림</h2>
          <div className="mt-3 space-y-2">
            <div className="flex h-[156px] flex-col justify-center gap-3 rounded-btn bg-white px-5 py-4 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="typo-body-3 text-gray-6">오늘의 터 리마인드</p>
                  <p className="typo-caption mt-2 text-primary">
                    설정한 간격과 시간에 맞춰 알려드려요.
                  </p>
                </div>
                <Toggle
                  checked={reminderEnabled}
                  label="오늘의 터 리마인드"
                  onChange={() => setReminderEnabled((enabled) => !enabled)}
                  showState
                />
              </div>

              <div className="border-t border-gray-2" />
              <button
                type="button"
                disabled={!reminderEnabled}
                onClick={() => openSheet('frequency')}
                className={cn(
                  'typo-body-3 flex w-full items-center justify-between',
                  reminderEnabled ? 'text-gray-5' : 'cursor-not-allowed text-gray-3',
                )}
              >
                알림 주기
                <span className="flex items-center gap-1">
                  {reminderEnabled ? (
                    <span className="typo-body-4 text-gray-4">{frequency}</span>
                  ) : null}
                  <ChevronRightIcon className={reminderEnabled ? "text-gray-5" : "text-gray-3"} />
                </span>
              </button>

              <div className="border-t border-gray-2" />
              <button
                type="button"
                disabled={!reminderEnabled}
                onClick={() => openSheet('time')}
                className={cn(
                  'typo-body-3 flex w-full items-center justify-between',
                  reminderEnabled ? 'text-gray-5' : 'cursor-not-allowed text-gray-3',
                )}
              >
                알림 시간
                <span className="flex items-center gap-1">
                  {reminderEnabled ? (
                    <span className="typo-body-4 text-gray-4">{time.summary}</span>
                  ) : null}
                  <ChevronRightIcon className={reminderEnabled ? "text-gray-5" : "text-gray-3"} />
                </span>
              </button>
            </div>

            <NotificationToggleCard
              title="저장한 터 알림"
              description="저장한 장소가 오늘과 잘 맞을 때 알려드려요."
              checked={savedPlaceEnabled}
              onChange={() => setSavedPlaceEnabled((enabled) => !enabled)}
            />
          </div>
        </section>

        <section>
          <h2 className="typo-head-4 text-gray-6">서비스 알림</h2>
          <div className="mt-3">
            <NotificationToggleCard
              title="서비스 중요 알림"
              description="계정·약관·개인정보 관련 안내예요."
              checked={serviceEnabled}
              onChange={() => setServiceEnabled((enabled) => !enabled)}
            />
          </div>
        </section>

        <section>
          <h2 className="typo-head-4 text-gray-6">혜택 및 소식</h2>
          <div className="mt-3">
            <NotificationToggleCard
              title="마케팅 정보 수신"
              checked={marketingEnabled}
              onChange={() => setMarketingEnabled((enabled) => !enabled)}
            />
          </div>
        </section>
      </main>

      {sheet ? (
        <SelectionSheet
          type={sheet}
          frequency={draftFrequency}
          time={draftTime}
          onFrequencyChange={setDraftFrequency}
          onTimeChange={setDraftTime}
          onClose={() => setSheet(null)}
          onSave={saveSheet}
        />
      ) : null}
    </div>
  );
}
