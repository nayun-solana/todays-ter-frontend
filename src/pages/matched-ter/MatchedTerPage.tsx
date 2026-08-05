import { useNavigate, useParams } from 'react-router';

import { ohaengByKey, ohaengByLabel } from '../../lib/ohaeng';
import Button from '../../components/Button';
import {
  useRecommendationDetail,
  useShareLink,
  useSharedRecommendation,
} from '../../hooks/recommendation/useRecommendation';
import { useShareAction } from '../../hooks/recommendation/useShareAction';
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
  const { data, isError } = isShared ? sharedQuery : detailQuery;

  // 공유 링크는 버튼에 포인터·포커스가 닿을 때 미리 받아둔다 — 클릭 시점에 await가 끼면
  // navigator.share가 사용자 제스처를 잃어 iOS에서 막힌다.
  // 프리페치보다 클릭이 먼저 오면 ensureShareUrl()로 받아온다(그 경우 클립보드로 폴백될 수 있음).
  const {
    shareUrl,
    prefetchShareLink,
    ensureShareUrl,
    isError: shareUnavailable,
  } = useShareLink(id, { enabled: !isShared });
  const { share, result: shareResult } = useShareAction();

  if (isShared && isError) return <SharedNotFound onHome={() => navigate('/home')} />;

  const meta = ohaengByLabel(data?.primaryElement ?? '') ?? ohaengByKey('water')!;
  const canShare = !isShared && !shareUnavailable;

  const handleShare = async () => {
    const url = shareUrl ?? (await ensureShareUrl());
    if (!url) return;

    await share({
      url,
      title: `${data?.placeName ?? '오늘의 터'} — 나와 어울리는 터`,
      text: '오늘의 터에서 받은 추천이에요.',
    });
  };

  return (
    <div className="flex min-h-dvh flex-col bg-white pb-28">
      <MatchedTerAppBar
        title="나와 어울리는 터"
        onShare={canShare ? handleShare : undefined}
        onSharePrefetch={canShare ? prefetchShareLink : undefined}
        showActions={!isShared}
      />

      <div className="flex flex-col gap-5 px-5 pt-4">
        {/* 공유받은 화면임을 알린다 — 매칭 점수·해석은 공유한 사람의 사주 기준이다.
            TODO: 시안 확정 시 교체하고, BE가 공유자 닉네임을 내려주면 이름을 넣는다. */}
        {isShared && (
          <p className="rounded-xl bg-gray-1 px-4 py-3 text-sm font-bold text-gray-5">
            공유받은 추천이에요. 아래 궁합은 공유한 분의 사주를 기준으로 계산됐어요.
          </p>
        )}

        <ImageCarousel />
        <h2 className="text-xl font-extrabold text-gray-6">{data?.placeName ?? ''}</h2>

        {/* 매칭칩·왜맞나요·행동제안은 12px 간격 (Figma) */}
        <div className="flex flex-col gap-3">
          <MatchChips
            meta={meta}
            matchRate={data?.matchingScore ?? 0}
            hashtag={data?.topCategories?.[0] ?? ''}
          />
          <WhyMatchCard
            meta={meta}
            reason={data?.whyItMatches ?? NO_MATCH_REASON}
            points={data?.matchingPoints ?? []}
          />
          <ActionSuggestionCard
            meta={meta}
            suggestion={data?.actionSuggestion ?? NO_MATCH_SUGGESTION}
          />
        </div>
      </div>

      {shareResult && <ShareToast result={shareResult} />}

      {/* 하단 고정 액션바. 공유 화면에서는 후기 작성이 남의 추천에 붙으므로 감춘다. */}
      <div className="fixed bottom-0 left-1/2 z-10 flex w-full max-w-[375px] -translate-x-1/2 gap-[7px] bg-white px-5 py-4">
        {isShared ? (
          <Button variant="primary" onClick={() => navigate('/home')}>
            나도 추천 받기
          </Button>
        ) : (
          <>
            <Button variant="primary" onClick={() => navigate(`/matched-ter/${id}/review`)}>
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

/** 만료·오타 등으로 공유 토큰을 찾을 수 없을 때(PLACE404_2). */
function SharedNotFound({ onHome }: { onHome: () => void }) {
  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <MatchedTerAppBar title="나와 어울리는 터" showActions={false} />
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-5 text-center">
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
      </div>
    </div>
  );
}
