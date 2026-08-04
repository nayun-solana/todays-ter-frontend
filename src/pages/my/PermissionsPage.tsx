import PageHeader from '../../components/PageHeader';
import Toggle from '../../components/Toggle';
import { usePermissionSettings, useUpdatePermissionSettings } from '../../hooks/my/useMy';

const PERMISSIONS = [
  {
    key: 'camera',
    title: '카메라 권한',
    description: '후기 사진을 바로 촬영할 때만 사용합니다.',
  },
  {
    key: 'location',
    title: '위치 권한',
    description: '내 주변 터 거리와 지도 탐색 정확도를 높이기 위해 사용합니다.',
  },
  {
    key: 'photo',
    title: '사진 권한',
    description: '후기 사진 첨부와 공유 이미지 저장에만 사용합니다.',
  },
] as const;

export default function PermissionsPage() {
  const permissionSettingsQuery = usePermissionSettings();
  const updatePermissionSettings = useUpdatePermissionSettings();
  const permissionSettings = permissionSettingsQuery.data;
  const permissions = {
    camera: permissionSettings?.isCameraAllowed ?? false,
    location: permissionSettings?.isLocationAllowed ?? false,
    photo: permissionSettings?.isPhotoLibraryAllowed ?? false,
  };

  const togglePermission = (key: keyof typeof permissions) => {
    const current = permissionSettings;
    if (!current) return;

    const next = !permissions[key];
    updatePermissionSettings.mutate({
      ...current,
      ...(key === 'camera'
        ? { isCameraAllowed: next }
        : key === 'location'
          ? { isLocationAllowed: next }
          : { isPhotoLibraryAllowed: next }),
    });
  };

  return (
    <div className="min-h-dvh w-full bg-gray-1">
      <PageHeader title="권한 안내" backTo="/my" />

      <main className="space-y-5 px-5 pt-[17px]">
        {permissionSettingsQuery.isPending ? (
          <p className="typo-sub-2 text-gray-4">권한 설정을 불러오는 중입니다.</p>
        ) : null}
        {permissionSettingsQuery.isError ? (
          <p className="typo-sub-2 text-gray-4">권한 설정을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</p>
        ) : null}
        {PERMISSIONS.map((permission) => {
          const enabled = permissions[permission.key];

          return (
            <section key={permission.key}>
              <div className="flex h-[30px] items-center justify-between">
                <h2 className="typo-body-3 text-gray-5">{permission.title}</h2>
                <Toggle
                  checked={enabled}
                  label={permission.title}
                  onChange={() => togglePermission(permission.key)}
                  disabled={!permissionSettings || updatePermissionSettings.isPending}
                />
              </div>
              <p className="typo-sub-2 mt-3 text-gray-4">{permission.description}</p>
            </section>
          );
        })}
      </main>
    </div>
  );
}
