import { useNavigate } from 'react-router';

import iconChevronRight from '../../assets/icon-chevron-right.svg';
import { ChevronRightIcon } from '../../components/icons';
import { useLogout } from '../../hooks/auth/useAuth';
import { useAuthStatus } from '../../hooks/auth/useAuthStatus';
import { useMyPage } from '../../hooks/my/useMy';
import { loadFailureMessage } from '../../lib/messages';
import TabPageHeader from '../../components/TabPageHeader';

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

export default function MyPage() {
  const navigate = useNavigate();
  const { isMember, isPending: isAuthPending } = useAuthStatus();
  const myPageQuery = useMyPage(isMember);
  const logoutMutation = useLogout();
  const profile = myPageQuery.data;

  // 부팅 복원 전의 isMember=false는 "게스트"가 아니라 "아직 모름"이다.
  // 게스트는 여기까지 오지 않는다 — 라우트가 RequireMemberTab 아래라 가드가 잠금 화면(GuestTabGate)을
  // 대신 렌더한다. 예전에는 이 파일에도 같은 시안의 잠금 화면이 따로 있었지만 도달할 수 없는 코드였고,
  // 두 벌이 이미 서로 어긋나 있었다(가드 쪽은 GuestLoginPrompt를 쓴다).
  if (isAuthPending) {
    return <div className="w-full flex-1 bg-gray-1" aria-busy="true" aria-label="불러오는 중" />;
  }

  return (
    <div className="w-full flex-1 bg-gray-1">
      <TabPageHeader title="마이페이지" />

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
          <p className="typo-sub-2 mt-2 text-gray-4">{loadFailureMessage('마이페이지 정보')}</p>
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
