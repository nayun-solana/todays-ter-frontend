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
import Love from '../../assets/onboarding/3-1.svg';
import Career from '../../assets/onboarding/3-2.svg';
import Wealth from '../../assets/onboarding/3-3.svg';
import Relationship from '../../assets/onboarding/3-4.svg';
import Health from '../../assets/onboarding/3-5.svg';

// components
import NavBtn from './components/NavBtn';
import ContentBox from './components/ContentBox';
import OhaengIcon from './components/OhaengIcon';
import Button from '../../components/Button';

const STATUS_BAR_COLOR = '#5a81fa';

export default function ReportDetailPage() {
  const navigate = useNavigate();

  const btnList = [
    { label: '종합', value: 'GENERAL', icon: '', bg: '' },
    { label: '연애', value: 'LOVE', icon: Love, bg: 'bg-category-love' },
    { label: '커리어', value: 'CAREER', icon: Career, bg: 'bg-category-career' },
    { label: '재물', value: 'WEALTH', icon: Wealth, bg: 'bg-category-wealth' },
    {
      label: '인간관계',
      value: 'RELATIONSHIP',
      icon: Relationship,
      bg: 'bg-category-relationship',
    },
    { label: '건강', value: 'HEALTH', icon: Health, bg: 'bg-category-health' },
  ];
  type SelectEnum = (typeof btnList)[number]['value'];

  const oheangList = [
    {
      label: '화',
      eng: 'FIRE',
      Hanja: '火',
      text: 'text-ohaeng-fire',
      bg: 'bg-ohaeng-fire',
      bgGrad: 'bg-ohaeng-fire/20',
      border: 'border-ohaeng-fire',
    },
    {
      label: '토',
      eng: 'EARTH',
      Hanja: '土',
      text: 'text-ohaeng-earth',
      bg: 'bg-ohaeng-earth',
      bgGrad: 'bg-ohaeng-earth/20',
      border: 'border-ohaeng-earth',
    },
    {
      label: '금',
      eng: 'METAL',
      Hanja: '金',
      text: 'text-ohaeng-metal',
      bg: 'bg-ohaeng-metal',
      bgGrad: 'bg-ohaeng-metal/20',
      border: 'border-ohaeng-metal',
    },
    {
      label: '수',
      eng: 'WATER',
      Hanja: '水',
      text: 'text-ohaeng-water',
      bg: 'bg-ohaeng-water',
      bgGrad: 'bg-ohaeng-water/20',
      border: 'border-ohaeng-water',
    },
    {
      label: '목',
      eng: 'WOOD',
      Hanja: '木',
      text: 'text-ohaeng-wood',
      bg: 'bg-ohaeng-wood',
      bgGrad: 'bg-ohaeng-wood/20',
      border: 'border-ohaeng-wood',
    },
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

  const categoryReportData = {
    reportId: 1,
    category: 'LOVE',
    detail: {
      code: 'LOVE',
      title: '연애',
      coreSummary: '연애에서는 감정의 깊이를 중요시하며, 상대방의 반응을 예민하게 감지합니다.',
      contentBlocks: [
        {
          title: '사랑을 시작하는 방식',
          content:
            '매력적인 순간이나 호감을 느끼는 요소에 적극적으로 반응합니다. 감정의 순간을 놓치고 싶지 않아 관찰 후 행동하는 경향이 있습니다.',
        },
        {
          title: '반복되는 연애 패턴',
          content:
            '관계가 깊어지면 불안을 느끼며, 이를 극복하기 위해 헌신하려 합니다. 때로는 지나친 집착이나 상대에 대한 이상화를 경험합니다.',
        },
        {
          title: '잘 맞는 사람과 피해야 할 사람',
          content:
            '신뢰를 바탕으로 안정적인 관계를 유지할 수 있습니다. 반면, 신뢰를 잃게 만든다면 갈등이 커질 수 있습니다.',
        },
      ],
      keyPoints: [
        {
          label: '강점',
          text: '깊은 감정적 연결을 원합니다.',
        },
        {
          label: '주의점',
          text: '불안정한 상대와의 갈등이 초래됩니다.',
        },
        {
          label: '반복 문제',
          text: '헌신에 따른 상처가 생깁니다.',
        },
      ],
    },
  };

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
              ohang={oheangList.find((o) => o.eng === detailReportData.complementaryElement)?.eng}
            >
              <div className="flex flex-col gap-2">
                <p
                  className={`typo-head-4 ${oheangList.find((o) => o.eng === detailReportData.complementaryElement)?.text} `}
                >
                  부족한
                  {oheangList.find((o) => o.eng === detailReportData.complementaryElement)?.label}(
                  {oheangList.find((o) => o.eng === detailReportData.complementaryElement)?.Hanja}
                  )를 채우기 위해
                </p>
                <OhaengIcon
                  element={detailReportData.complementaryElement}
                  type="complementary"
                  textColor={
                    oheangList.find((o) => o.eng === detailReportData.complementaryElement)?.text
                  }
                  border={
                    oheangList.find((o) => o.eng === detailReportData.complementaryElement)?.border
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                {detailReportData.recommendations.map((recommendation, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-2.5 rounded-2xl ${oheangList.find((o) => o.eng === detailReportData.complementaryElement)?.bgGrad} `}
                  >
                    <div
                      className={`flex-shrink-0 w-6 h-6 rounded-2xl ${oheangList.find((o) => o.eng === detailReportData.complementaryElement)?.bg} text-white flex items-center justify-center typo-head-4`}
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
        ) : (
          <div className="flex flex-col gap-3">
            <ContentBox
              type="ICON"
              icon={btnList.find((btn) => btn.value === selectedCategory)?.icon}
              title={categoryReportData.detail.coreSummary}
            />
            {categoryReportData.detail.contentBlocks.map((block, index) => (
              <ContentBox key={index} type="TEXT" title={block.title}>
                <p className="typo-sub-2 text-gray-4">{block.content}</p>
              </ContentBox>
            ))}
            <ContentBox type="CATEGORY" category={selectedCategory}>
              <div className="flex flex-col gap-3">
                {categoryReportData.detail.keyPoints.map((point, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <p
                      className={`typo-caption ${btnList.find((btn) => btn.value === selectedCategory)?.bg} text-white w-15 h-7 rounded-btn flex items-center justify-center`}
                    >
                      {point.label}
                    </p>
                    <p className="typo-sub-3 text-gray-4">{point.text}</p>
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
        )}
      </div>
    </div>
  );
}
