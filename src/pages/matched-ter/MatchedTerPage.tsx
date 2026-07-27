import { useNavigate, useParams } from 'react-router';

import { ohaengByKey } from '../../lib/ohaeng';
import Button from '../../components/Button';
import { useRecommendationDetail } from '../../hooks/recommendation/useRecommendation';
import { toOhaengKey } from '../../types/home/homeEnergy';
import ActionSuggestionCard from './components/ActionSuggestionCard';
import ImageCarousel from './components/ImageCarousel';
import MatchChips from './components/MatchChips';
import MatchedTerAppBar from './components/MatchedTerAppBar';
import WhyMatchCard from './components/WhyMatchCard';

// 나와 어울리는 터(추천상세) — 홈 "오늘 가장 잘 맞는 터"에서 진입. BE 미배포라 GET /recommendations/:id = mock.
export default function MatchedTerPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data } = useRecommendationDetail(id);

  // 로드 전 fallback = 물(水) 시안 샘플.
  const meta = ohaengByKey(data ? toOhaengKey(data.element) : 'water')!;

  return (
    <div className="flex min-h-screen flex-col bg-white pb-28">
      <MatchedTerAppBar title="나와 어울리는 터" />

      <div className="flex flex-col gap-5 px-5 pt-4">
        <ImageCarousel />
        <h2 className="text-xl font-extrabold text-gray-6">{data?.placeName ?? '청계천 모전교'}</h2>
        {/* 매칭칩·왜맞나요·행동제안은 12px 간격 (Figma) */}
        <div className="flex flex-col gap-3">
          <MatchChips
            meta={meta}
            matchRate={data?.matchRate ?? 87}
            hashtag={data?.hashtag ?? '감정 회복'}
          />
          <WhyMatchCard
            meta={meta}
            reason={
              data?.reason ??
              '계수님은 수(水)와 목(木)의 흐름이 강하고,\n오늘은 감정 정리와 회복이 필요한 날이에요.\n이 터는 수기(水氣)가 강해 현재 흐름과 잘 맞습니다.'
            }
            points={data?.points ?? ['주 오행 水', '오늘 흐름 안정', '연애운 회복']}
          />
          <ActionSuggestionCard
            meta={meta}
            suggestion={
              data?.suggestion ?? '오늘은 30분 정도 물길을 따라 걸으며\n마음을 정리해보세요.'
            }
          />
        </div>
      </div>

      {/* 하단 고정 액션바 */}
      <div className="fixed bottom-0 left-1/2 z-10 flex w-full max-w-[390px] -translate-x-1/2 gap-[7px] bg-white px-5 py-4">
        <Button
          variant="primary"
          onClick={() => navigate(`/matched-ter/${id}/review`)}
        >
          다녀왔어요
        </Button>
        <Button variant="secondary">
          길찾기
        </Button>
      </div>
    </div>
  );
}
