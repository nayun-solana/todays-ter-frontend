import { useNavigate } from 'react-router';

import iconChevronRight from '../../assets/icon-chevron-right.svg';
import OhaengOrb from '../../components/OhaengOrb';
import { ChevronRightIcon } from '../../components/icons';

const SETTINGS: { label: string; path?: string }[] = [
  { label: '사주 정보 수정', path: '/my/saju' },
  { label: '알림 설정', path: '/my/notification-settings' },
  { label: '계정 연동 관리', path: '/my/account-links' },
  { label: '권한 안내', path: '/my/permissions' },
  { label: '개인정보 및 약관' },
  { label: '회원 탈퇴', path: '/my/withdrawal' },
] as const;

/** 프로필 이미지 미설정 시 기본 아바타 (Figma: primary-light 원 + 흰 실루엣) */
function DefaultAvatar() {
  return (
    <span
      aria-hidden="true"
      className="flex size-25 items-center justify-center rounded-full bg-primary-light text-gray-1"
    >
      <svg viewBox="0 0 100 100" className="size-25" fill="currentColor">
        <circle cx="50" cy="38" r="14" />
        <ellipse cx="50" cy="70" rx="24" ry="15" />
      </svg>
    </span>
  );
}

export default function MyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh w-full bg-gray-1">
      <header className="flex h-[111px] items-end bg-white px-5 pb-3">
        <h1 className="typo-head-1 text-primary">마이페이지</h1>
      </header>

      <main className="px-5 pt-3">
        <section className="flex flex-col items-center gap-5 rounded-btn bg-white p-5 shadow-card-lg">
          <div className="flex flex-col items-center gap-2">
            <DefaultAvatar />
            {/* TODO: API 연동 시 사용자 닉네임 */}
            <p className="typo-head-4 text-gray-5">닉네임</p>
          </div>
          <div className="flex gap-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-ohaeng-water px-3 py-2 typo-body-4 text-white">
              주 오행 : 수 <OhaengOrb element="water" size={16} />
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-ohaeng-fire px-3 py-2 typo-body-4 text-white">
              보완 오행 : 화 <OhaengOrb element="fire" size={16} />
            </span>
          </div>
        </section>

        <button
          type="button"
          onClick={() => navigate('/report/1')}
          className="typo-head-4 mt-3 flex h-[50px] w-full items-center justify-between rounded-btn bg-primary px-5 text-white shadow-card-lg"
        >
          계수님의 사주리포트 다시보기
          <img src={iconChevronRight} alt="" className="h-[14px] w-[8px] rotate-180" />
        </button>

        <section className="mt-6">
          <h2 className="typo-head-3 text-gray-6">설정</h2>
          {/* Figma: 카드 p16/20, 행 높이 20px, 행 사이 gap12 + gray-2 구분선 */}
          <ul className="mt-3 flex flex-col gap-3 rounded-btn bg-white px-5 py-4 shadow-card">
            {SETTINGS.map((setting, index) => (
              <li key={setting.label} className="flex flex-col gap-3">
                {index > 0 ? <span className="h-px bg-gray-2" /> : null}
                <button
                  type="button"
                  onClick={setting.path ? () => navigate(setting.path!) : undefined}
                  className="typo-body-3 flex h-5 w-full items-center justify-between text-left text-gray-5"
                >
                  {setting.label}
                  <ChevronRightIcon />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
