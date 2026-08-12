import type { ReactNode } from 'react';

import iconChevronLeft from '../../assets/icon-chevron-left.svg';
import PageHeader from '../../components/PageHeader';
import Toggle from '../../components/Toggle';
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
} from '../../hooks/notification/useNotification';
import type { NotificationSettingsResponse } from '../../types/notification/notification';
import { loadFailureMessage, loadingMessage } from '../../lib/messages';

const CYCLE_LABELS: Record<string, string> = {
  EVERY_DAY: '매일',
  EVERY_3_DAYS: '3일마다',
  EVERY_7_DAYS: '7일마다',
};

function NotificationToggleCard({
  title,
  description,
  checked,
  onChange,
  disabled,
}: {
  title: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
  disabled: boolean;
}) {
  return (
    <div className="flex min-h-[68px] items-center justify-between gap-4 rounded-btn bg-white px-5 py-4 shadow-card">
      <div className="min-w-0">
        <p className="typo-body-3 text-gray-6">{title}</p>
        {description ? <p className="typo-caption mt-2 text-primary">{description}</p> : null}
      </div>
      <Toggle checked={checked} label={title} onChange={onChange} disabled={disabled} showState />
    </div>
  );
}

function SettingRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex h-11 items-center justify-between border-t border-gray-2 text-gray-5">
      <span className="typo-body-3">{label}</span>
      <span className="relative flex items-center gap-1">
        {children}
        <img src={iconChevronLeft} alt="" className="size-[9px] rotate-180" />
      </span>
    </label>
  );
}

export default function NotificationSettingsPage() {
  const notificationSettingsQuery = useNotificationSettings();
  const updateNotificationSettings = useUpdateNotificationSettings();
  const notificationSettings = notificationSettingsQuery.data;
  const isDisabled = !notificationSettings || updateNotificationSettings.isPending;

  const updateSettings = (next: Partial<NotificationSettingsResponse>) => {
    if (!notificationSettings) return;
    updateNotificationSettings.mutate({ ...notificationSettings, ...next });
  };

  return (
    <div className="min-h-dvh w-full bg-gray-1">
      <PageHeader title="알림 설정" />

      <main className="space-y-5 px-5 pt-5 pb-8">
        {notificationSettingsQuery.isPending ? (
          <p className="typo-sub-2 text-gray-4">{loadingMessage('알림 설정')}</p>
        ) : null}
        {notificationSettingsQuery.isError ? (
          <p className="typo-sub-2 text-gray-4">{loadFailureMessage('알림 설정')}</p>
        ) : null}

        <section>
          <h2 className="typo-head-4 text-gray-6">추천 알림</h2>
          <div className="mt-3 space-y-2">
            <div className="rounded-btn bg-white px-5 py-4 shadow-card">
              <div className="flex min-h-[36px] items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="typo-body-3 text-gray-6">오늘의 터 리마인드</p>
                  <p className="typo-caption mt-2 text-primary">
                    설정한 간격과 시간에 맞춰 알려드려요.
                  </p>
                </div>
                <Toggle
                  checked={notificationSettings?.isTodayRemind ?? false}
                  label="오늘의 터 리마인드"
                  onChange={() =>
                    updateSettings({ isTodayRemind: !notificationSettings?.isTodayRemind })
                  }
                  disabled={isDisabled}
                  showState
                />
              </div>
              <div className="mt-3">
                <SettingRow label="알림 주기">
                  <select
                    aria-label="알림 주기"
                    value={notificationSettings?.remindCycle ?? ''}
                    onChange={(event) => updateSettings({ remindCycle: event.target.value })}
                    disabled={isDisabled}
                    className="typo-body-4 max-w-[100px] appearance-none bg-transparent pr-1 text-right text-gray-4 outline-none disabled:cursor-not-allowed"
                  >
                    {notificationSettings?.remindCycle &&
                    !CYCLE_LABELS[notificationSettings.remindCycle] ? (
                      <option value={notificationSettings.remindCycle}>
                        {notificationSettings.remindCycle}
                      </option>
                    ) : null}
                    <option value="EVERY_DAY">{CYCLE_LABELS.EVERY_DAY}</option>
                    <option value="EVERY_3_DAYS">{CYCLE_LABELS.EVERY_3_DAYS}</option>
                    <option value="EVERY_7_DAYS">{CYCLE_LABELS.EVERY_7_DAYS}</option>
                  </select>
                </SettingRow>
                <SettingRow label="알림 시간">
                  <input
                    aria-label="알림 시간"
                    type="time"
                    value={notificationSettings?.remindTime ?? ''}
                    onChange={(event) => updateSettings({ remindTime: event.target.value })}
                    disabled={isDisabled}
                    className="typo-body-4 w-[76px] appearance-none bg-transparent text-right text-gray-4 outline-none disabled:cursor-not-allowed"
                  />
                </SettingRow>
              </div>
            </div>

            <NotificationToggleCard
              title="저장한 터 알림"
              description="저장한 장소가 오늘과 잘 맞을 때 알려드려요."
              checked={notificationSettings?.isSavedPlace ?? false}
              onChange={() => updateSettings({ isSavedPlace: !notificationSettings?.isSavedPlace })}
              disabled={isDisabled}
            />
          </div>
        </section>

        <section>
          <h2 className="typo-head-4 text-gray-6">서비스 알림</h2>
          <div className="mt-3">
            <NotificationToggleCard
              title="서비스 중요 알림"
              description="계정·약관·개인정보 관련 안내예요."
              checked={notificationSettings?.isServiceNotice ?? false}
              onChange={() =>
                updateSettings({ isServiceNotice: !notificationSettings?.isServiceNotice })
              }
              disabled={isDisabled}
            />
          </div>
        </section>

        <section>
          <h2 className="typo-head-4 text-gray-6">혜택 및 소식</h2>
          <div className="mt-3">
            <NotificationToggleCard
              title="마케팅 정보 수신"
              checked={notificationSettings?.isMarketing ?? false}
              onChange={() => updateSettings({ isMarketing: !notificationSettings?.isMarketing })}
              disabled={isDisabled}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
