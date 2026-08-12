import { useNavigate, useParams } from 'react-router';

import { ohaengByKey } from '../../lib/ohaeng';
import { viewStateOf } from '../../lib/queryState';
import Button from '../../components/Button';
import {
  useBookmarkToggle,
  useRecommendationDetail,
  useShareLink,
  useSharedRecommendation,
} from '../../hooks/recommendation/useRecommendation';
import { useShareAction } from '../../hooks/recommendation/useShareAction';
import { useAuthStatus } from '../../hooks/auth/useAuthStatus';
import { toOhaengKey } from '../../lib/ohaeng';
import type { RecommendationDetail } from '../../types/recommendation/recommendationDetail';
import ActionSuggestionCard from './components/ActionSuggestionCard';
import ImageCarousel from './components/ImageCarousel';
import MatchChips from './components/MatchChips';
import MatchedTerAppBar from './components/MatchedTerAppBar';
import WhyMatchCard from './components/WhyMatchCard';

/** 사주 리포트가 없으면 맞춤 필드가 비어서 온다 — 그 자리를 채울 안내 문구. */
const NO_MATCH_REASON =
  '아직 사주 리포트가 없어 맞춤 해석을 보여드릴 수 없어요.\n사주 정보를 입력하면 이 터가 나와 어떻게 맞는지 알려드릴게요.';
const NO_MATCH_SUGGESTION = '사주 리포트를 만들면 오늘의 행동 제안을 받아볼 수 있어요.';

type MatchedTerPageProps = {
  /** 공유 링크로 들어온 화면. 데이터 출처가 공유 스냅샷이고 공유·북마크 액션이 없다. */
  variant?: 'default' | 'shared';
};

/**
 * 나와 어울리는 터(추천 상세).
 * - 기본: 홈 "오늘 가장 잘 맞는 터"에서 진입 → GET /recommendations/places/{placeId}
 * - shared: 공유 링크 진입 → GET /recommendations/places/shared/{shareToken} (인증 불필요)
 */
export default function MatchedTerPage({ variant = 'default' }: MatchedTerPageProps) {
  const navigate = useNavigate();
  const { id, token } = useParams();
  const isShared = variant === 'shared';

  const detailQuery = useRecommendationDetail(isShared ? undefined : id);
  const sharedQuery = useSharedRecommendation(isShared ? token : undefined);
  const query = isShared ? sharedQuery : detailQuery;
  const data = query.data;

  // 공유 링크는 버튼에 포인터·포커스가 닿을 때 미리 받아둔다 — 클릭 시점에 await가 끼면
  // navigator.share가 사용자 제스처를 잃어 iOS에서 막힌다.
  // 프리페치보다 클릭이 먼저 오면 ensureShareUrl()로 받아온다(그 경우 클립보드로 폴백될 수 있음).
  const {
    shareUrl,
    prefetchShareLink,
    ensureShareUrl,
    isError: shareUnavailable,
  } = useShareLink(id, { enabled: !isShared });
  const { share, result: shareResult, notify: notifyShare } = useShareAction();

  // 저장은 회원 전용(게스트는 서버가 401). 게스트에겐 버튼을 잠그는 대신 로그인으로 보낸다 —
  // 눌렀는데 아무 일도 안 일어나는 것보다 다음 행동이 분명하다.
  const { isMember } = useAuthStatus();
  const bookmark = useBookmarkToggle(id);

  // 데이터가 없으면 화면을 그리지 않는다. 예전에는 실패해도 `data?.x ?? ''` 폴백으로
  // 빈 껍데기(장소명 없음·매칭 0%·해시태그 '#')가 그대로 그려져서, 사용자는 무슨 일이
  // 일어났는지 알 수도 다시 시도할 수도 없었다. 실제로 BE가 primaryElement를 객체로
  // 바꿨을 때 이 경로로 배포본이 빈 화면이 됐다(#98).
  const state = viewStateOf(query);
  if (state === 'loading') return <MatchedTerSkeleton isShared={isShared} />;
  if (state === 'failed') {
    // 공유 링크는 만료·오타가 흔하고 재시도가 의미 없다 — 홈으로 보낸다.
    return isShared ? (
      <SharedNotFound onHome={() => navigate('/home')} />
    ) : (
      <DetailLoadFailed onRetry={() => void query.refetch()} onBack={() => navigate(-1)} />
    );
  }

  // viewStateOf가 'ready'면 data는 반드시 있다. 타입만 좁혀준다.
  if (!data) return null;

  // 오행은 code로 매핑한다 — 표시명("토")은 BE가 문구를 다듬으면 같이 깨진다.
  const meta = ohaengByKey(data.primaryElement ? toOhaengKey(data.primaryElement.code) : 'water')!;
  // 저장·공유 모두 회원 전용으로 잠근다. 예전에는 저장을 누르면 /login으로 보냈는데,
  // 보던 화면이 끊기고 같은 화면의 '다녀왔어요'(잠금)와 규칙도 어긋났다.
  const canShare = !isShared && !shareUnavailable && isMember;

  const handleShare = async () => {
    const url = shareUrl ?? (await ensureShareUrl());
    // 링크를 못 받는 가장 흔한 경우는 "사주 리포트가 없는 회원"이다(서버 PLACE409_1).
    // 공유 링크에는 공유자의 맞춤 점수·추천 문구 스냅샷이 실리는데 그 원본이 없다.
    // 조용히 return하면 눌러도 아무 일이 없어 사용자가 계속 다시 누른다 — 이유를 알려준다.
    if (!url) {
      notifyShare('unavailable');
      return;
    }

    await share({ url, title: `${data.placeName} — 나와 어울리는 터` });
  };

  return (
    <div className="flex min-h-dvh flex-col bg-white pb-28">
      <MatchedTerAppBar
        title="나와 어울리는 터"
        onShare={canShare ? handleShare : undefined}
        onSharePrefetch={canShare ? prefetchShareLink : undefined}
        isSaved={data.isSaved ?? false}
        // 연타로 PATCH가 겹치지 않게 진행 중에는 잠근다.
        onToggleBookmark={
          isShared || !isMember || bookmark.isPending
            ? undefined
            : () => bookmark.mutate(!(data.isSaved ?? false))
        }
        disabledReason={isMember ? undefined : '로그인 필요'}
        showActions={!isShared}
      />

      <div className="flex flex-col gap-5 px-5 pt-4">
        {/* 공유받은 화면임을 알린다 — 매칭 점수·해석은 공유한 사람의 사주 기준이다.
            닉네임이 없는 공유자(게스트)도 있어 그때는 "공유한 분"으로 부른다. */}
        {isShared && (
          <p className="rounded-xl bg-gray-1 px-4 py-3 text-sm font-bold text-gray-5">
            {data.sharerNickname
              ? `${data.sharerNickname}님이 공유한 추천이에요. 아래 궁합은 ${data.sharerNickname}님의 사주를 기준으로 계산됐어요.`
              : '공유받은 추천이에요. 아래 궁합은 공유한 분의 사주를 기준으로 계산됐어요.'}
          </p>
        )}

        <ImageCarousel />
        <h2 className="text-xl font-extrabold text-gray-6">{data.placeName}</h2>

        {/* 매칭칩·왜맞나요·행동제안은 12px 간격 (Figma) */}
        <div className="flex flex-col gap-3">
          <MatchChips
            meta={meta}
            matchRate={data.matchingScore ?? 0}
            hashtag={data.topCategories[0] ?? ''}
          />
          <WhyMatchCard
            meta={meta}
            reason={data.whyItMatches ?? NO_MATCH_REASON}
            points={data.matchingPoints}
          />
          <ActionSuggestionCard
            meta={meta}
            suggestion={data.actionSuggestion ?? NO_MATCH_SUGGESTION}
          />
        </div>
      </div>

      {shareResult && <ShareToast result={shareResult} />}

      {/* 하단 고정 액션바. 공유 화면에서는 후기 작성이 남의 추천에 붙으므로 감춘다. */}
      <div className="fixed inset-x-0 bottom-0 z-10 flex gap-[7px] bg-white px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        {isShared ? (
          <Button variant="primary" onClick={() => navigate('/home')}>
            나도 추천 받기
          </Button>
        ) : (
          <>
            {/* 장소 상세와 같은 기준 — 후기 작성은 회원 전용이라 게스트에겐 잠근다. */}
            <Button
              variant="primary"
              disabled={!isMember}
              onClick={() => navigate(`/matched-ter/${id}/review`)}
            >
              다녀왔어요
            </Button>
            <MapButton mapUrl={data?.mapUrl} />
          </>
        )}
      </div>
    </div>
  );
}

/** 길찾기 — BE가 준 지도 URL을 새 탭으로 연다. */
function MapButton({ mapUrl }: { mapUrl: RecommendationDetail['mapUrl'] }) {
  return (
    <Button
      variant="secondary"
      disabled={!mapUrl}
      onClick={() => mapUrl && window.open(mapUrl, '_blank', 'noopener,noreferrer')}
    >
      길찾기
    </Button>
  );
}

const SHARE_TOAST_TEXT = {
  shared: '공유했어요',
  copied: '링크가 복사되었어요',
  failed: '링크 복사에 실패했어요',
  unavailable: '사주 리포트를 만들면 공유할 수 있어요',
} as const;

function ShareToast({ result }: { result: keyof typeof SHARE_TOAST_TEXT }) {
  return (
    <div
      role="status"
      className="fixed bottom-24 left-1/2 z-20 -translate-x-1/2 rounded-full bg-gray-6/90 px-4 py-2 text-sm font-bold text-white"
    >
      {SHARE_TOAST_TEXT[result]}
    </div>
  );
}

/** 본문 대신 안내를 채우는 껍데기. 앱바를 유지해 사용자가 갇히지 않게 한다. */
function NoticeShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <MatchedTerAppBar title="나와 어울리는 터" showActions={false} />
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-5 text-center">
        {children}
      </div>
    </div>
  );
}

/** 만료·오타 등으로 공유 토큰을 찾을 수 없을 때(PLACE404_2). */
function SharedNotFound({ onHome }: { onHome: () => void }) {
  return (
    <NoticeShell>
      <div className="flex flex-col gap-2">
        <p className="text-lg font-extrabold text-gray-6">링크를 찾을 수 없어요</p>
        <p className="text-sm text-gray-4">
          공유 링크가 잘못되었거나
          <br />더 이상 유효하지 않아요.
        </p>
      </div>
      <Button variant="primary" onClick={onHome}>
        홈으로 가기
      </Button>
    </NoticeShell>
  );
}

/**
 * 추천 상세를 못 불러왔을 때. 네트워크 실패·서버 오류·응답 계약 불일치가 모두 여기로 온다.
 * 원인이 무엇이든 사용자가 할 수 있는 건 재시도와 되돌아가기뿐이라 둘 다 준다.
 */
function DetailLoadFailed({ onRetry, onBack }: { onRetry: () => void; onBack: () => void }) {
  return (
    <NoticeShell>
      <div className="flex flex-col gap-2">
        <p className="text-lg font-extrabold text-gray-6">터 정보를 불러오지 못했어요</p>
        <p className="text-sm text-gray-4">
          잠시 후 다시 시도해주세요.
          <br />
          문제가 계속되면 잠시 뒤에 들어와 주세요.
        </p>
      </div>
      <div className="flex w-full gap-[7px]">
        <Button variant="primary" onClick={onRetry}>
          다시 시도
        </Button>
        <Button variant="secondary" onClick={onBack}>
          돌아가기
        </Button>
      </div>
    </NoticeShell>
  );
}

/** 로딩 자리표시자. 실제 영역과 같은 높이를 잡아 데이터가 들어올 때 화면이 튀지 않게 한다. */
function MatchedTerSkeleton({ isShared }: { isShared: boolean }) {
  return (
    <div className="flex min-h-dvh flex-col bg-white pb-28" aria-busy="true">
      <MatchedTerAppBar title="나와 어울리는 터" showActions={!isShared} />
      <div className="flex flex-col gap-5 px-5 pt-4">
        <span className="sr-only" role="status">
          터 정보를 불러오는 중
        </span>
        <div className="h-[232px] animate-pulse rounded-[20px] bg-gray-2" />
        <div className="h-7 w-40 animate-pulse rounded-lg bg-gray-2" />
        <div className="flex flex-col gap-3">
          <div className="h-9 animate-pulse rounded-full bg-gray-2" />
          <div className="h-[180px] animate-pulse rounded-[20px] bg-gray-2" />
          <div className="h-[104px] animate-pulse rounded-[20px] bg-gray-2" />
        </div>
      </div>
    </div>
  );
}
