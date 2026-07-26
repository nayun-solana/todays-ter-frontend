// libraries
import { useNavigate } from 'react-router';
// hooks
import { useGetSajuReport } from '../../hooks/onboarding/useGetReport';
// asstets
import RightIcon from '../../assets/onboarding/right.svg';
// components
import Button from '../../components/Button';
import ContentBox from './components/ContentBox';
import OhaengIcon from './components/OhaengIcon';
import ElementRadarChart from './components/ElementRadarChart';
//types
import type { ElementCode, SajuReportResponse } from '../../types/onboarding/report';

export default function ReportPage() {
  const navigate = useNavigate();

  const { data: sajuReportData, isPending, isError, error } = useGetSajuReport(1);

  if (isPending) {
    return <div>리포트를 불러오는 중입니다.</div>;
  }

  if (isError) {
    console.error('사주 리포트 조회 실패:', error);

    return <div>리포트를 불러오지 못했습니다.</div>;
  }

  // const sajuReportData = {
  //   reportId: 'report_12345',
  //   reportType: 'BASIC',
  //   headline: '깊게 느끼고 천천히 움직이는',
  //   sajuTypeName: '수목형',
  //   elementAnalysis: {
  //     summary: '당신은 수와 목의 조합이 강하고, 화가 부족한 편이에요.',
  //     primaryElements: ['WATER', 'WOOD'],
  //     complementaryElements: ['FIRE'],
  //     distribution: [
  //       { code: 'WOOD', percentage: 28 },
  //       { code: 'FIRE', percentage: 12 },
  //       { code: 'EARTH', percentage: 18 },
  //       { code: 'METAL', percentage: 17 },
  //       { code: 'WATER', percentage: 25 },
  //     ],
  //   },
  //   overallTendency: {
  //     title: '전반적인 성향',
  //     items: [
  //       {
  //         code: 'EMOTION_THOUGHT',
  //         title: '감정과 생각의 흐름',
  //         description:
  //           '생각을 오래 하고 감정을 깊게 처리하는 타입이에요. 혼자만의 시간이 에너지를 회복시켜 줍니다.',
  //         displayOrder: 1,
  //       },
  //       {
  //         code: 'CHOICE_ACTION',
  //         title: '선택과 행동 방식',
  //         description:
  //           '새로운 시작에는 신중하지만, 실행 직전 망설임이 생길 수 있어요. 신뢰할 수 있는 공간에서 강점을 나타내는 편이에요.',
  //         displayOrder: 2,
  //       },
  //       {
  //         code: 'RECOVERY',
  //         title: '회복 방식',
  //         description:
  //           '자연이나 물이 있는 조용한 공간에서 에너지를 빠르게 충전해요. 편안한 곳보다 여유로운 공간을 선호합니다.',
  //         displayOrder: 3,
  //       },
  //     ],
  //   },
  // } satisfies SajuReportResponse;

  const parseElementCodeandColor = (code: ElementCode) => {
    switch (code) {
      case 'WOOD':
        return { label: '목', color: 'bg-ohaeng-wood' };
      case 'FIRE':
        return { label: '화', color: 'bg-ohaeng-fire' };
      case 'EARTH':
        return { label: '토', color: 'bg-ohaeng-earth' };
      case 'METAL':
        return { label: '금', color: 'bg-ohaeng-metal' };
      case 'WATER':
        return { label: '수', color: 'bg-ohaeng-water' };
      default:
        return { label: '', color: '' };
    }
  };

  return (
    <div className="bg-primary-bg max-w-[390px] mx-auto relative">
      <div className="absolute inset-x-0 top-0 z-0 h-53 rounded-b-[30px] bg-primary" />
      <div className="relative z-10 flex flex-col gap-5 px-5 pt-5.5 pb-10">
        <div className="flex flex-col gap-3">
          {/* 부가설명폰트 */}
          <p className="text-[10px]font-bold text-primary-light ">기본 리포트</p>
          <div className="flex flex-col gap-1">
            {/* Body 2 */}
            <p className="text-base font-bold text-white">{sajuReportData!.headline}</p>
            {/* Head 1 */}
            <p className="text-2xl font-extrabold text-white">{sajuReportData!.sajuTypeName}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <ContentBox>
            {/* 부가설명폰트 */}
            <p className="text-[10px] font-bold text-gray-5">
              {sajuReportData!.elementAnalysis.summary}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {sajuReportData!.elementAnalysis.primaryElements.map((element: ElementCode) => (
                <OhaengIcon key={element} element={element} type="primary" />
              ))}
              {sajuReportData!.elementAnalysis.complementaryElements.map((element: ElementCode) => (
                <OhaengIcon key={element} element={element} type="complementary" />
              ))}
            </div>
          </ContentBox>
          <ContentBox title="오행 분포">
            <div className="flex items-center gap-4">
              {/* 왼쪽 차트 */}
              <div className="min-w-0 flex-1">
                <ElementRadarChart elementAnalysis={sajuReportData!.elementAnalysis} />
              </div>

              {/* 오른쪽 오행 분포 */}
              <div className="flex w-[160px] shrink-0 flex-col gap-3">
                {sajuReportData!.elementAnalysis.distribution.map((item) => {
                  const { label, color } = parseElementCodeandColor(item.code);

                  const percentage = Math.min(Math.max(item.percentage, 0), 100);

                  return (
                    <div
                      key={item.code}
                      className="grid w-full grid-cols-[16px_minmax(0,1fr)_36px] items-center gap-1.5"
                    >
                      {/* 오행 */}
                      <p className="text-[10px] font-bold text-gray-5">{label}</p>

                      {/* 진행 바 */}
                      <div
                        role="progressbar"
                        aria-label={`${label} 비율`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={percentage}
                        className="h-3 w-full overflow-hidden rounded-full bg-gray-2"
                      >
                        <div
                          className={`h-full rounded-full transition-[width] duration-500 ease-out ${color}`}
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>

                      {/* 퍼센트 */}
                      <p className="text-right text-[10px] font-bold text-gray-3">{percentage}%</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </ContentBox>
          <ContentBox title="전반적인 성향">
            <div className="flex flex-col gap-3">
              {sajuReportData!.overallTendency.items.map((item) => (
                <div key={item.code} className="flex flex-col gap-1">
                  {/* 부가설명폰트 */}
                  <p className="text-[10px] font-bold text-primary">{item.title}</p>
                  {/* Sub 3 */}
                  <p className="text-[10px] font-normal text-gray-5">{item.description}</p>
                </div>
              ))}
            </div>
          </ContentBox>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            variant="primary"
            fullWidth
            onClick={() => {}}
            className="flex items-center justify-center gap-3"
          >
            <p>상세 분석 보기</p>

            <img src={RightIcon} alt="right" className="" />
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => {
              navigate('/onboarding/step-3');
            }}
          >
            상세 분석 없이 고민유형 선택하기
          </Button>
        </div>
      </div>
    </div>
  );
}
