// libraries
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
// hooks
// import { useGetCategorySajuReport } from '../../hooks/onboarding/useGetReport';
//type
import type { CategorySajuReportResponse } from '../../types/onboarding/report';
// asstets
import lefe_arrow from '../../assets/onboarding/left-arrow.svg';
import share from '../../assets/onboarding/share.svg';
import RightIcon from '../../assets/onboarding/right.svg';
// components
import NavBtn from './components/NavBtn';
import ContentBox from './components/ContentBox';
import OhaengIcon from './components/OhaengIcon';
import Button from '../../components/Button';

const STATUS_BAR_COLOR = '#5a81fa';

export default function ReportDetailPage() {
  const navigate = useNavigate();

  const btnList = [
    { label: '종합', value: 'GENERAL' },
    { label: '연애', value: 'LOVE' },
    { label: '커리어', value: 'CAREER' },
    { label: '재물', value: 'WEALTH' },
    { label: '인간관계', value: 'RELATIONSHIP' },
    { label: '건강', value: 'HEALTH' },
  ] as const;
  type SelectEnum = (typeof btnList)[number]['value'];

  const oheangList = [
    { label: '화', eng: 'FIRE', Hanja: '火', color: 'ohaeng-fire', bg: 'bg-ohaeng-fire/20' },
    { label: '토', eng: 'EARTH', Hanja: '土', color: 'ohaeng-earth', bg: 'bg-ohaeng-earth/20' },
    { label: '금', eng: 'METAL', Hanja: '金', color: 'ohaeng-metal', bg: 'bg-ohaeng-metal/20' },
    { label: '수', eng: 'WATER', Hanja: '水', color: 'ohaeng-water', bg: 'bg-ohaeng-water/20' },
    { label: '목', eng: 'WOOD', Hanja: '木', color: 'ohaeng-wood', bg: 'bg-ohaeng-wood/20' },
  ];
  // status bar 색상 변경 (iOS Safari, Android Chrome)
  useEffect(() => {
    const existingThemeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');

    const themeColor = existingThemeColor ?? document.createElement('meta');

    const wasThemeColorCreated = !existingThemeColor;
    const previousThemeColor = themeColor.getAttribute('content');

    const previousHtmlBackground = document.documentElement.style.backgroundColor;
    const previousBodyBackground = document.body.style.backgroundColor;

    if (wasThemeColorCreated) {
      themeColor.name = 'theme-color';
      document.head.appendChild(themeColor);
    }

    themeColor.setAttribute('content', STATUS_BAR_COLOR);
    document.documentElement.style.backgroundColor = STATUS_BAR_COLOR;
    document.body.style.backgroundColor = STATUS_BAR_COLOR;

    return () => {
      if (wasThemeColorCreated) {
        themeColor.remove();
      } else if (previousThemeColor !== null) {
        themeColor.setAttribute('content', previousThemeColor);
      } else {
        themeColor.removeAttribute('content');
      }

      document.documentElement.style.backgroundColor = previousHtmlBackground;

      document.body.style.backgroundColor = previousBodyBackground;
    };
  }, []);

  const [selectedCategory, setSelectedCategory] = useState<SelectEnum>('GENERAL');

  const detailReportData = {
    reportId: 1,
    category: 'GENERAL',
    summary: {
      description: '생각은 깊고 감정은 섬세하지만, 실행의 타이밍에서는 망설임이 생기기 쉬워요.',
      primaryElement: 'WATER',
    },
    sajuCore: [
      {
        type: 'DAY_STEM',
        title: '일간',
        value: '계(癸)',
        description: '지혜롭고 유연함',
        displayOrder: 1,
      },
      {
        type: 'DAY_BRANCH',
        title: '일지',
        value: '자(子)',
        description: '감정적이고 내면이 풍부함',
        displayOrder: 2,
      },
      {
        type: 'DAY_PILLAR',
        title: '일주',
        value: '계자',
        description: '흐르는 물처럼 유연한 기운',
        displayOrder: 3,
      },
    ],
    flowAnalysis: [
      {
        type: 'EMOTIONAL_FLOW',
        title: '감정 흐름',
        description: '감정을 깊게 처리하며 혼자만의 시간에 에너지를 얻어요.',
        displayOrder: 1,
      },
      {
        type: 'RELATIONSHIP_PATTERN',
        title: '관계 패턴',
        description: '소수의 깊은 관계를 선호하고, 신뢰가 쌓이면 깊은 유대를 형성해요.',
        displayOrder: 2,
      },
      {
        type: 'ACTION_STYLE',
        title: '행동 스타일',
        description: '충분히 생각한 뒤 움직이며, 결정 후에는 묵묵히 실천해요.',
        displayOrder: 3,
      },
      {
        type: 'RECOVERY_POINT',
        title: '회복 포인트',
        description: '물이나 자연과 가까운 조용한 공간에서 빠르게 에너지를 회복해요.',
        displayOrder: 4,
      },
    ],
    complementaryElement: 'FIRE',
    recommendations: [
      {
        description: '탁 트인 전망 공간 방문하기',
        displayOrder: 1,
      },
      {
        description: '노을이나 야경 보러 가기',
        displayOrder: 2,
      },
      {
        description: '활기 있는 공간에 머물기',
        displayOrder: 3,
      },
    ],
  } satisfies CategorySajuReportResponse;

  return (
    <div className="">
      <div className="flex items-center justify-between bg-primary h-13 w-full text-white typo-body-3 px-5">
        <img src={lefe_arrow} alt="뒤로가기" onClick={() => window.history.back()} />
        상세 분석
        <img src={share} alt="공유하기" />
      </div>
      <div className="flex flex-col gap-3 px-5 py-4">
        <div className="flex gap-1 overflow-x-auto -mr-5 no-scrollbar no-scrollbar::-webkit-scrollbar">
          {btnList.map(({ label, value }) => (
            <NavBtn
              key={value}
              isActive={selectedCategory === value}
              onClick={() => {
                setSelectedCategory(value);
              }}
              title={label}
            />
          ))}
        </div>
        {selectedCategory === 'GENERAL' ? (
          <div className="flex flex-col gap-3">
            <ContentBox type="COLOR">
              <p className="typo-head-4 text-white">"{detailReportData.summary.description}"</p>
              <OhaengIcon element={detailReportData.summary.primaryElement} type="secondary" />
            </ContentBox>
            <ContentBox type="TEXT" title="일간 · 일지 · 일주">
              <div className="flex gap-2 flex-1">
                {detailReportData.sajuCore.map((core) => (
                  <div
                    key={core.type}
                    className="flex flex-col flex-1 gap-3 items-start rounded-2xl bg-gray-2 shadow-[0_2px_4px_0_rgba(0,0,0,0.10)] px-3 py-3.5"
                  >
                    <div className="text-primary-light typo-caption">{core.title}</div>
                    <div className="flex flex-col gap-1.5">
                      <p className="typo-head-4 text-primary">{core.value}</p>
                      <p className="typo-sub-3 text-gray-5">{core.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ContentBox>
            <ContentBox type="TEXT" title="기본 흐름 분석">
              <div className="flex flex-col gap-3">
                {detailReportData.flowAnalysis.map((flow) => (
                  <div key={flow.type} className="flex flex-col items-start gap-1">
                    <p className="typo-caption text-primary">{flow.title}</p>
                    <p className="typo-sub-3 text-gray-5">{flow.description}</p>
                  </div>
                ))}
              </div>
            </ContentBox>
            <ContentBox
              type="GENERAL"
              ohangColor={
                oheangList.find((o) => o.eng === detailReportData.complementaryElement)?.color
              }
            >
              <div className="flex flex-col gap-2">
                <p
                  className={`typo-head-4 text-${oheangList.find((o) => o.eng === detailReportData.complementaryElement)?.color}`}
                >
                  부족한
                  {oheangList.find((o) => o.eng === detailReportData.complementaryElement)?.label}(
                  {oheangList.find((o) => o.eng === detailReportData.complementaryElement)?.Hanja}
                  )를 채우기 위해
                </p>
                <OhaengIcon
                  element={detailReportData.complementaryElement}
                  type="complementary"
                  color={
                    oheangList.find((o) => o.eng === detailReportData.complementaryElement)?.color
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                {detailReportData.recommendations.map((recommendation, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-2.5 rounded-2xl ${oheangList.find((o) => o.eng === detailReportData.complementaryElement)?.bg}`}
                  >
                    <div
                      className={`flex-shrink-0 w-6 h-6 rounded-2xl bg-${oheangList.find((o) => o.eng === detailReportData.complementaryElement)?.color} text-white flex items-center justify-center typo-head-4`}
                    >
                      {index + 1}
                    </div>
                    <p className="typo-body-4 text-gray-6">{recommendation.description}</p>
                  </div>
                ))}
              </div>
            </ContentBox>
            <Button
              variant="primary"
              onClick={() => {
                navigate(`/onboarding/step-3`);
              }}
              className="flex items-center justify-center gap-3"
            >
              <p>고민 유형 선택하기</p>

              <img src={RightIcon} alt="right" className="" />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
