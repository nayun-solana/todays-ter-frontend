import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router';

import placeSample from '../../assets/home/place-sample.jpg';
import type { OhaengKey } from '../../lib/ohaeng';
import EnergyCard from './components/EnergyCard';
import RecommendedPlaceCard from './components/RecommendedPlaceCard';
import RoutineChips from './components/RoutineChips';
import { OHAENG_HOME } from './ohaeng';

// TODO: 오행/인사말/추천 터는 사주·서버 데이터 연동 예정. 현재 물(水) variant 고정.
const HOME_OHAENG: OhaengKey = 'water';
// TODO: 실제 로그인 상태 연동. true면 첫 카드 이후를 블러+로그인 게이트로 가린다(로그인 전 홈).
const IS_GUEST = false;

const RECOMMENDED_DESC =
  '왕궁의 터는 수백 년 동안 토기를 축적해왔습니다.\n안정과 중심을 잡아주는 기운이 강해\n재물과 사업에 큰 도움이 됩니다.';

/** 추천 터 목록 (현재 시안 샘플). TODO: 서버 추천 데이터 연동. */
const RECOMMENDED_PLACES = [
  {
    image: placeSample,
    badge: '최고 궁합',
    name: '경복궁',
    subtitle: '안정과 번영의 기운, 토기 충전',
    description: RECOMMENDED_DESC,
    distance: '3.5km',
    rating: 4.7,
  },
  {
    image: placeSample,
    badge: '최고 궁합',
    name: '경복궁',
    subtitle: '안정과 번영의 기운, 토기 충전',
    description: RECOMMENDED_DESC,
    distance: '3.5km',
    rating: 4.7,
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const theme = OHAENG_HOME[HOME_OHAENG];

  return (
    <div className="relative min-h-screen bg-gray-1">
      {/* 오행별 배경 그라데이션 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[530px] rounded-b-[30px]"
        style={{ background: theme.bgGradient }}
      />

      <div className="relative flex flex-col gap-8 px-5 pb-8 pt-[70px]">
        {/* 인사말 */}
        <header className="flex flex-col gap-5 text-white">
          <p className="text-base font-bold">2026년 6월 11일 목요일</p>
          <div className="flex flex-col gap-2">
            <p className="text-2xl font-extrabold">안녕하세요 윤진님 !</p>
            <p className="text-[17px] font-bold">오늘도 좋은 기운 충전해요</p>
          </div>
        </header>

        <EnergyCard element={theme.key} label={theme.label} desc={theme.energyDesc} />
        <RoutineChips title={theme.routineTitle} routines={theme.routines} />

        {/* 오늘 가장 잘 맞는 터 */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-extrabold text-gray-6">오늘 가장 잘 맞는 터</h2>
          <div className="flex flex-col gap-3">
            <RecommendedPlaceCard {...RECOMMENDED_PLACES[0]} />
            {IS_GUEST ? (
              // 로그인 전: 둘째 카드를 흰색 그라데이션으로 가리고 로그인 게이트를 얹는다.
              <div className="relative">
                <RecommendedPlaceCard {...RECOMMENDED_PLACES[1]} />
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-[20px]"
                  style={{
                    background:
                      'linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.75) 10%, #ffffff 53%)',
                  }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-[22px]">
                  <div className="flex flex-col items-center gap-3">
                    <Lock className="size-6 text-primary" strokeWidth={2.2} />
                    <p className="text-base font-bold text-gray-6">
                      로그인 후 더 많은 터를 탐색해보세요
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="h-12 w-full rounded-[20px] bg-primary text-sm font-bold text-white"
                  >
                    로그인/회원가입 하러가기
                  </button>
                </div>
              </div>
            ) : (
              <RecommendedPlaceCard {...RECOMMENDED_PLACES[1]} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
