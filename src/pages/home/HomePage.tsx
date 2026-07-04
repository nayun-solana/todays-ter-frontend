import placeSample from '../../assets/home/place-sample.jpg';
import EnergyCard from './components/EnergyCard';
import RecommendedPlaceCard from './components/RecommendedPlaceCard';
import RoutineChips from './components/RoutineChips';
import { OHAENG_HOME } from './ohaeng';

// TODO: 오행/인사말/추천 터는 사주·서버 데이터 연동 예정 (현재 물 variant + 시안 샘플)
const theme = OHAENG_HOME.water;

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-gray-1">
      {/* 오행별 배경 일러스트 */}
      <img
        src={theme.bg}
        alt=""
        className="pointer-events-none absolute inset-x-0 top-0 h-[530px] w-full rounded-b-[30px] object-cover"
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

        <EnergyCard label={theme.label} orb={theme.orb} desc={theme.energyDesc} />
        <RoutineChips title={theme.routineTitle} routines={theme.routines} />
        <RecommendedPlaceCard
          image={placeSample}
          badge="최고 궁합"
          name="경복궁"
          subtitle="안정과 번영의 기운, 토기 충전"
          description={
            '왕궁의 터는 수백 년 동안 토기를 축적해왔습니다.\n안정과 중심을 잡아주는 기운이 강해\n재물과 사업에 큰 도움이 됩니다.'
          }
          distance="3.5km"
          rating={4.7}
        />
      </div>
    </div>
  );
}
