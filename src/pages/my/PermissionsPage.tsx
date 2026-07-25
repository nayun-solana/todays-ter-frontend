import { useState } from 'react';

import PageHeader from '../../components/PageHeader';
import Toggle from '../../components/Toggle';

const PERMISSIONS = [
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
  const [permissions, setPermissions] = useState({ location: true, photo: true });

  return (
    <div className="min-h-dvh w-full bg-gray-1">
      <PageHeader title="권한 안내" backTo="/my" />

      <main className="space-y-5 px-5 pt-[17px]">
        {PERMISSIONS.map((permission) => {
          const enabled = permissions[permission.key];

          return (
            <section key={permission.key}>
              <div className="flex h-[30px] items-center justify-between">
                <h2 className="typo-body-3 text-gray-5">{permission.title}</h2>
                <Toggle
                  checked={enabled}
                  label={permission.title}
                  onChange={() =>
                    setPermissions((current) => ({
                      ...current,
                      [permission.key]: !current[permission.key],
                    }))
                  }
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
