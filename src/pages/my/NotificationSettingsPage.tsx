import PageHeader from '../../components/PageHeader';
import Toggle from '../../components/Toggle';
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
} from '../../hooks/my/useMy';

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
    /* Figma 2615:1593 — 카드 p16/20, 제목 Body3, 설명 캡션(primary, 위 8px), 토글 우측 세로 중앙 */
    <div className="flex min-h-[56px] items-center justify-between gap-4 rounded-btn bg-white px-5 py-4 shadow-card">
      <div className="min-w-0">
        <p className="typo-body-3 text-gray-6">{title}</p>
        {description ? <p className="typo-caption mt-2 text-primary">{description}</p> : null}
      </div>
      <Toggle checked={checked} label={title} onChange={onChange} disabled={disabled} showState />
    </div>
  );
}

export default function NotificationSettingsPage() {
  const notificationSettingsQuery = useNotificationSettings();
  const updateNotificationSettings = useUpdateNotificationSettings();
  const notificationSettings = notificationSettingsQuery.data;
  const isDisabled = !notificationSettings || updateNotificationSettings.isPending;

  const updateSettings = (next: Partial<typeof notificationSettings>) => {
    const current = notificationSettings;
    if (!current) return;

    const body = { ...current, ...next };
    updateNotificationSettings.mutate(body);
  };

  return (
    <div className="min-h-dvh w-full bg-gray-1">
      <PageHeader title="알림 설정" backTo="/my" />

      <main className="space-y-5 px-5 pt-5 pb-8">
        {notificationSettingsQuery.isPending ? (
          <p className="typo-sub-2 text-gray-4">알림 설정을 불러오는 중입니다.</p>
        ) : null}
        {notificationSettingsQuery.isError ? (
          <p className="typo-sub-2 text-gray-4">알림 설정을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</p>
        ) : null}
        <section>
          <h2 className="typo-head-4 text-gray-6">추천 알림</h2>
          <div className="mt-3 space-y-2">
            <NotificationToggleCard
              title="오늘의 터 리마인드"
              description="설정한 간격과 시간에 맞춰 알려드려요."
              checked={notificationSettings?.isPushEnabled ?? false}
              onChange={() => updateSettings({ isPushEnabled: !notificationSettings?.isPushEnabled })}
              disabled={isDisabled}
            />
          </div>
        </section>

        <section>
          <h2 className="typo-head-4 text-gray-6">혜택 및 소식</h2>
          <div className="mt-3 space-y-2">
            <NotificationToggleCard
              title="마케팅 정보 수신"
              checked={notificationSettings?.isMarketingEnabled ?? false}
              onChange={() =>
                updateSettings({ isMarketingEnabled: !notificationSettings?.isMarketingEnabled })
              }
              disabled={isDisabled}
            />
            <NotificationToggleCard
              title="야간 마케팅 정보 수신"
              description="야간 시간대에도 마케팅 정보를 받아볼 수 있어요."
              checked={notificationSettings?.isNightMarketingEnabled ?? false}
              onChange={() =>
                updateSettings({
                  isNightMarketingEnabled: !notificationSettings?.isNightMarketingEnabled,
                })
              }
              disabled={isDisabled}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
