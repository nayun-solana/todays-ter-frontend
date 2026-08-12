import { useNavigate } from 'react-router';

import iconChevronRight from '../../assets/icon-chevron-right.svg';
import SectionError from '../../components/SectionError';
import { ChevronRightIcon } from '../../components/icons';
import { useLogout } from '../../hooks/auth/useAuth';
import { useAuthStatus } from '../../hooks/auth/useAuthStatus';
import { useMemberInfo } from '../../hooks/my/useMy';
import { useMyFortuneReport } from '../../hooks/onboarding/useGetReport';
import { loadFailureMessageBrief, loadingMessage } from '../../lib/messages';
import TabPageHeader from '../../components/TabPageHeader';

const SETTINGS: { label: string; path?: string; action?: 'logout' }[] = [
  { label: '사주 정보 수정', path: '/my/saju' },
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

/**
 * 프로필 카드 자리표시자. 실제 카드와 같은 높이(아바타 size-25 + 닉네임 한 줄)를 잡는다.
 * 닉네임을 '닉네임'으로 폴백해두면 실패해도 그럴듯한 화면이 남아 사용자가 실패를 모른다.
 */
function ProfileSkeleton() {
  return (
    <section
      role="status"
      aria-label={loadingMessage('회원 정보')}
      className="flex flex-col items-center gap-2 rounded-btn bg-white p-5 shadow-card-lg"
    >
      <div className="size-25 animate-pulse rounded-full bg-gray-2" />
      <div className="h-6 w-24 max-w-full animate-pulse rounded bg-gray-2" />
    </section>
  );
}

export default function MyPage() {
  const navigate = useNavigate();
  const { isMember, isPending: isAuthPending } = useAuthStatus();
  const memberQuery = useMemberInfo(isMember);
  /**
   * `reportId`는 리포트 도메인이 준다.
   *
   * 예전에는 `GET /mypage`가 닉네임·프로필사진·reportId를 한 번에 주는 계약이었는데 그 경로는
   * 서버에 존재한 적이 없어서, 이 버튼이 영원히 "회원 정보 불러오는 중"에 잠겨 있었다.
   */
  const reportQuery = useMyFortuneReport(isMember);
  const logoutMutation = useLogout();
  const nickname = memberQuery.data?.nickname;
  const reportId = reportQuery.data?.reportId;

  // 부팅 복원 전의 isMember=false는 "게스트"가 아니라 "아직 모름"이다.
  // 게스트는 여기까지 오지 않는다 — 라우트가 RequireMemberTab 아래라 가드가 잠금 화면(GuestTabGate)을
  // 대신 렌더한다. 예전에는 이 파일에도 같은 시안의 잠금 화면이 따로 있었지만 도달할 수 없는 코드였고,
  // 두 벌이 이미 서로 어긋나 있었다(가드 쪽은 GuestLoginPrompt를 쓴다).
  // 게스트/회원 분기 전이라 설정 메뉴는 아직 못 보여주지만, 헤더와 프로필 자리는 잡아둔다 —
  // 통짜 빈 배경은 화면이 멈춘 것처럼 보인다.
  if (isAuthPending) {
    return (
      <div className="w-full flex-1 bg-gray-1">
        <header className="bg-white px-5 pb-4 pt-safe-5">
          <h1 className="typo-head-1 text-primary">마이페이지</h1>
        </header>
        <div className="px-5 pt-3">
          <ProfileSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 bg-gray-1">
      <TabPageHeader title="마이페이지" />

      <main className="px-5 pt-3">
        {memberQuery.isPending ? (
          <ProfileSkeleton />
        ) : (
          <section className="flex flex-col items-center gap-5 rounded-btn bg-white p-5 shadow-card-lg">
            <div className="flex flex-col items-center gap-2">
              {/* 프로필 사진을 주는 응답이 아직 없다(#156) — 기본 아바타로 고정한다. */}
              <DefaultAvatar />
              <p className="typo-head-4 text-gray-5">{nickname ?? '닉네임'}</p>
            </div>
          </section>
        )}

        <button
          type="button"
          disabled={!reportId}
          onClick={() => {
            if (!reportId) return;
            navigate(`/report/${reportId}?from=my`);
          }}
          className="typo-head-4 mt-3 flex h-[50px] w-full items-center justify-between rounded-btn bg-primary px-5 text-white shadow-card-lg disabled:cursor-not-allowed disabled:bg-gray-3"
        >
          {reportId
            ? '사주 리포트 다시보기'
            : reportQuery.isError
              ? '리포트를 불러오지 못했어요'
              : '리포트 불러오는 중'}
          <img src={iconChevronRight} alt="" className="h-[14px] w-[8px] rotate-180" />
        </button>
        {memberQuery.isError || reportQuery.isError ? (
          <SectionError
            className="mt-2"
            message={loadFailureMessageBrief('마이페이지 정보')}
            onRetry={() => {
              if (memberQuery.isError) void memberQuery.refetch();
              if (reportQuery.isError) void reportQuery.refetch();
            }}
          />
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
