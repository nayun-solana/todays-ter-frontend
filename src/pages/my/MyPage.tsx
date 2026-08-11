import { useNavigate } from 'react-router';

import iconChevronRight from '../../assets/icon-chevron-right.svg';
import Button from '../../components/Button';
import { ChevronRightIcon } from '../../components/icons';
import { useLogout } from '../../hooks/auth/useAuth';
import { useAuthStatus } from '../../hooks/auth/useAuthStatus';
import { useMyPage } from '../../hooks/my/useMy';

const SETTINGS: { label: string; path?: string; action?: 'logout' }[] = [
  { label: '사주 정보 수정', path: '/my/saju' },
  { label: '알림 설정', path: '/my/notification-settings' },
  { label: '계정 연동 관리', path: '/my/account-links' },
  { label: '권한 안내', path: '/my/permissions' },
  { label: '개인정보 및 약관', path: '/private' },
  { label: '로그아웃', action: 'logout' },
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

/** Figma 3509:4591 잠금 아이콘 — 24×24 안에 16×20 자물쇠, primary */
function LockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6 text-primary">
      <path
        d="M8 10V7a4 4 0 0 1 8 0v3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect x="5" y="10" width="14" height="11" rx="2" fill="currentColor" />
      <circle cx="12" cy="15.5" r="1.5" fill="white" />
    </svg>
  );
}

/** 비회원 마이페이지 — 프로필 카드를 흐리게 깔고 로그인 유도를 얹는다 (Figma 3509:4591). */
function GuestMyPage() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full flex-1 bg-gray-1">
      <header className="bg-white px-5 pb-4 pt-safe-5">
        <h1 className="typo-head-1 text-primary">마이페이지</h1>
      </header>

      <div aria-hidden="true" className="px-5 pt-3">
        <section className="flex flex-col items-center gap-5 rounded-btn bg-white p-5 shadow-card-lg">
          <div className="flex flex-col items-center gap-2">
            <DefaultAvatar />
            <p className="typo-head-4 text-gray-5">닉네임</p>
          </div>
        </section>
      </div>

      {/* 헤더 아래 전체를 덮는 흐림 + 흰색 그라데이션 */}
      {/* 그라데이션 끝은 Figma상 #FFF지만, 하단바 여백(레이아웃 pb)과 이어지도록 페이지 톤으로 맞춘다 */}
      <div className="absolute inset-x-0 top-[calc(4.25rem+env(safe-area-inset-top))] bottom-0 flex flex-col items-center justify-center bg-linear-to-b from-white/20 via-white/80 to-gray-1 px-10 pb-4 backdrop-blur-xs">
        <LockIcon />
        <p className="typo-body-2 mt-3 text-center whitespace-pre-line text-gray-6">
          {'로그인하고 나에게 꼭 맞는\n‘오늘의 터’를 찾아보세요'}
        </p>
        <Button onClick={() => navigate('/login')} className="mt-5">
          로그인/회원가입 하러가기
        </Button>
      </div>
    </div>
  );
}

export default function MyPage() {
  const navigate = useNavigate();
  const { isMember, isPending: isAuthPending } = useAuthStatus();
  const myPageQuery = useMyPage(isMember);
  const logoutMutation = useLogout();
  const profile = myPageQuery.data;

  // 부팅 복원 전의 isMember=false는 "게스트"가 아니라 "아직 모름"이다.
  if (isAuthPending) {
    return <div className="w-full flex-1 bg-gray-1" aria-busy="true" aria-label="불러오는 중" />;
  }

  if (!isMember) return <GuestMyPage />;

  return (
    <div className="w-full flex-1 bg-gray-1">
      <header className="bg-white px-5 pb-4 pt-safe-5">
        <h1 className="typo-head-1 text-primary">마이페이지</h1>
      </header>

      <main className="px-5 pt-3">
        <section className="flex flex-col items-center gap-5 rounded-btn bg-white p-5 shadow-card-lg">
          <div className="flex flex-col items-center gap-2">
            {profile?.profileImageUrl ? (
              <img
                src={profile.profileImageUrl}
                alt="프로필 이미지"
                className="size-25 rounded-full object-cover"
              />
            ) : (
              <DefaultAvatar />
            )}
            <p className="typo-head-4 text-gray-5">{profile?.nickname ?? '닉네임'}</p>
          </div>
        </section>

        <button
          type="button"
          disabled={!profile}
          onClick={() => {
            if (!profile) return;
            navigate(`/report/${profile.reportId}?from=my`);
          }}
          className="typo-head-4 mt-3 flex h-[50px] w-full items-center justify-between rounded-btn bg-primary px-5 text-white shadow-card-lg disabled:cursor-not-allowed disabled:bg-gray-3"
        >
          {profile ? '사주 리포트 다시보기' : '회원 정보 불러오는 중'}
          <img src={iconChevronRight} alt="" className="h-[14px] w-[8px] rotate-180" />
        </button>
        {myPageQuery.isError ? (
          <p className="typo-sub-2 mt-2 text-gray-4">
            마이페이지 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
          </p>
        ) : null}
        <section className="mt-6">
          <h2 className="typo-head-3 text-gray-6">설정</h2>
          {/* Figma: 카드 p16/20, 행 높이 20px, 행 사이 gap12 + gray-2 구분선 */}
          <ul className="mt-3 flex flex-col gap-3 rounded-btn bg-white px-5 py-4 shadow-card">
            {SETTINGS.map((setting, index) => (
              <li key={setting.label} className="flex flex-col gap-3">
                {index > 0 ? <span className="h-px bg-gray-2" /> : null}
                <button
                  type="button"
                  disabled={setting.action === 'logout' && logoutMutation.isPending}
                  onClick={
                    setting.path
                      ? () => navigate(setting.path!)
                      : setting.action === 'logout'
                        ? () => logoutMutation.mutate()
                        : undefined
                  }
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
