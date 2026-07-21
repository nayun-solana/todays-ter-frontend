import { useNavigate, useParams } from 'react-router';

import Button from '../../components/Button';
import ActionSuggestionCard from './components/ActionSuggestionCard';
import ImageCarousel from './components/ImageCarousel';
import MatchChips from './components/MatchChips';
import MatchedTerAppBar from './components/MatchedTerAppBar';
import WhyMatchCard from './components/WhyMatchCard';

// 나와 어울리는 터(오늘의터 추천상세) — 홈 "오늘 가장 잘 맞는 터"에서 진입, 사주 매칭 중심.
// TODO: 장소/사주 매칭 데이터 서버 연동 (현재 시안 샘플 = 청계천 모전교, 물)
export default function MatchedTerPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="flex min-h-screen flex-col bg-white pb-28">
      <MatchedTerAppBar title="나와 어울리는 터" />

      <div className="flex flex-col gap-4 px-5 pt-4">
        <ImageCarousel />
        <h2 className="text-xl font-extrabold text-gray-6">청계천 모전교</h2>
        <MatchChips element="수" matchRate={87} hashtag="감정 회복" />
        <WhyMatchCard
          reason={
            '계수님은 수(水)와 목(木)의 흐름이 강하고,\n오늘은 감정 정리와 회복이 필요한 날이에요.\n이 터는 수기(水氣)가 강해 현재 흐름과 잘 맞습니다.'
          }
          points={['주 오행 水', '오늘 흐름 안정', '연애운 회복']}
        />
        <ActionSuggestionCard
          suggestion={'오늘은 30분 정도 물길을 따라 걸으며\n마음을 정리해보세요.'}
        />
      </div>

      {/* 하단 고정 액션바 */}
      <div className="fixed bottom-0 left-1/2 z-10 flex w-full max-w-[390px] -translate-x-1/2 gap-[7px] bg-white px-5 py-4">
        <Button
          variant="primary"
          fullWidth
          onClick={() => navigate(`/matched-ter/${id}/review`)}
        >
          다녀왔어요
        </Button>
        <Button variant="secondary" fullWidth>
          길찾기
        </Button>
      </div>
    </div>
  );
}
