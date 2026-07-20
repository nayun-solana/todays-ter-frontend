import { useState } from 'react';
import { useNavigate } from 'react-router';

import iconChevronLeft from '../../assets/icon-chevron-left.svg';

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
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState({ location: true, photo: true });

  return (
    <div className="mx-auto min-h-screen max-w-[390px] bg-gray-1">
      <header className="flex h-[99px] items-end justify-between border-b border-gray-3 bg-white px-5 pb-3">
        <button
          type="button"
          onClick={() => navigate('/my')}
          aria-label="뒤로 가기"
          className="flex size-6 items-center justify-center"
        >
          <img src={iconChevronLeft} alt="" className="h-3.5 w-[7px]" />
        </button>
        <h1 className="text-sm font-bold text-gray-6">권한 안내</h1>
        <span className="size-6" aria-hidden="true" />
      </header>

      <main className="space-y-5 px-5 pt-[17px]">
        {PERMISSIONS.map((permission) => {
          const enabled = permissions[permission.key];

          return (
            <section key={permission.key}>
              <div className="flex h-[30px] items-center justify-between">
                <h2 className="text-sm font-bold text-gray-5">{permission.title}</h2>
                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  aria-label={`${permission.title} ${enabled ? '허용됨' : '허용 안 됨'}`}
                  onClick={() =>
                    setPermissions((current) => ({
                      ...current,
                      [permission.key]: !current[permission.key],
                    }))
                  }
                  className={`flex h-[30px] w-[50px] items-center rounded-full p-[3px] ${
                    enabled ? 'justify-end bg-primary' : 'justify-start bg-gray-3'
                  }`}
                >
                  <span className="size-6 rounded-full bg-white" />
                </button>
              </div>
              <p className="mt-3 text-xs leading-4 text-gray-4">{permission.description}</p>
            </section>
          );
        })}
      </main>
    </div>
  );
}
