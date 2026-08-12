import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import PageHeader from '../../components/PageHeader';
import Toggle from '../../components/Toggle';
import {
  getBrowserPermissionState,
  requestBrowserPermission,
  type BrowserPermissionKind,
  type BrowserPermissionState,
} from '../../lib/browserPermissions';

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

type PermissionKey = (typeof PERMISSIONS)[number]['key'];
type DevicePermissionKey = Exclude<PermissionKey, 'photo'>;

const INITIAL_PERMISSION_STATES: Record<BrowserPermissionKind, BrowserPermissionState> = {
  camera: 'unavailable',
  location: 'unavailable',
};
const browserPermissionKey = ['browser-permissions'] as const;

export default function PermissionsPage() {
  const [requestingKey, setRequestingKey] = useState<DevicePermissionKey | null>(null);
  const [permissionMessage, setPermissionMessage] = useState<string | null>(null);
  const [isPermissionMessageVisible, setIsPermissionMessageVisible] = useState(false);
  const fadePermissionMessageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const removePermissionMessageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queryClient = useQueryClient();
  const permissionStatesQuery = useQuery({
    queryKey: browserPermissionKey,
    queryFn: async () => {
      const [camera, location] = await Promise.all([
        getBrowserPermissionState('camera'),
        getBrowserPermissionState('location'),
      ]);
      return { camera, location };
    },
    refetchOnWindowFocus: true,
  });
  const permissionStates = permissionStatesQuery.data ?? INITIAL_PERMISSION_STATES;
  const permissions = {
    camera: permissionStates.camera === 'granted',
    location: permissionStates.location === 'granted',
    // 웹의 파일 선택은 별도 영구 권한이 없으므로 항상 사용 가능하다.
    photo: true,
  };

  const clearPermissionMessageTimers = () => {
    if (fadePermissionMessageTimer.current) {
      clearTimeout(fadePermissionMessageTimer.current);
    }
    if (removePermissionMessageTimer.current) {
      clearTimeout(removePermissionMessageTimer.current);
    }
  };

  const showPermissionMessage = () => {
    clearPermissionMessageTimers();
    setPermissionMessage('권한 해제는 브라우저 설정에서 변경할 수 있어요.');
    setIsPermissionMessageVisible(true);
    fadePermissionMessageTimer.current = setTimeout(() => {
      setIsPermissionMessageVisible(false);
    }, 1500);
    removePermissionMessageTimer.current = setTimeout(() => {
      setPermissionMessage(null);
    }, 2000);
  };

  useEffect(() => {
    return () => clearPermissionMessageTimers();
  }, []);

  const togglePermission = async (key: PermissionKey) => {
    if (key === 'photo' || permissionStates[key] === 'granted') {
      showPermissionMessage();
      return;
    }

    clearPermissionMessageTimers();
    setPermissionMessage(null);
    setIsPermissionMessageVisible(false);

    setRequestingKey(key);
    try {
      const result = await requestBrowserPermission(key);
      queryClient.setQueryData(
        browserPermissionKey,
        (current: typeof INITIAL_PERMISSION_STATES | undefined) => ({
          ...(current ?? INITIAL_PERMISSION_STATES),
          [key]: result,
        }),
      );
    } finally {
      setRequestingKey(null);
    }
  };

  return (
    <div className="min-h-dvh w-full bg-gray-1">
      <PageHeader title="권한 안내" backTo="/my" />

      <main className="space-y-5 px-5 pt-[17px]">
        {permissionStatesQuery.isPending ? (
          <p className="typo-sub-2 text-gray-4">권한 설정을 불러오는 중입니다.</p>
        ) : null}
        {permissionStatesQuery.isError ? (
          <p className="typo-sub-2 text-gray-4">
            권한 설정을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
          </p>
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
                  onChange={() => void togglePermission(permission.key)}
                  disabled={permissionStatesQuery.isPending || requestingKey !== null}
                />
              </div>
              <p className="typo-sub-2 mt-3 text-gray-4">{permission.description}</p>
            </section>
          );
        })}
        {permissionMessage ? (
          <p
            role="status"
            className={`typo-caption text-danger transition-opacity duration-500 ${
              isPermissionMessageVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {permissionMessage}
          </p>
        ) : null}
      </main>
    </div>
  );
}
