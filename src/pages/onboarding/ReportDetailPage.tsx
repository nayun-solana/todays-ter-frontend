// libraries
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
// hooks
import { useGetCategorySajuReport } from '../../hooks/onboarding/useGetReport';
//type
import type { SajuReportCategory } from '../../types/onboarding/report';
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
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isMyReport = searchParams.get('from') === 'my';
  const reportPath = `/report/${id}${isMyReport ? '?from=my' : ''}`;

  const handleShare = () => {
    if (!navigator.share) return;
    void navigator.share({ title: '오늘의 터 상세 분석' }).catch(() => undefined);
  };

  const btnList = [
    { label: '종합', value: 'GENERAL' as SajuReportCategory, icon: '', bg: '' },
    { label: '연애', value: 'LOVE' as SajuReportCategory, icon: Love, bg: 'bg-category-love' },
    {
      label: '커리어',
      value: 'CAREER' as SajuReportCategory,
      icon: Career,
      bg: 'bg-category-career',
    },
    {
      label: '재물',
      value: 'WEALTH' as SajuReportCategory,
      icon: Wealth,
      bg: 'bg-category-wealth',
    },
    {
      label: '인간관계',
      value: 'RELATIONSHIP' as SajuReportCategory,
      icon: Relationship,
      bg: 'bg-category-relationship',
    },
    {
      label: '건강',
      value: 'HEALTH' as SajuReportCategory,
      icon: Health,
      bg: 'bg-category-health',
    },
  ];

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

  const [selectedCategory, setSelectedCategory] = useState<SajuReportCategory>('GENERAL');

  const {
    data: detailReportData,
    isLoading,
    isError,
    error,
  } = useGetCategorySajuReport(Number(id), selectedCategory);

  console.log('selectedCategory:', selectedCategory);
  console.log('detailReportData:', detailReportData);
  console.log('query error:', error);

  if (isLoading) {
    return <div>로딩중...</div>;
  }

  if (isError || !detailReportData) {
    console.error(error);
    return <div>데이터를 불러오지 못했습니다.</div>;
  }

  return (
    <div className="">
      <div className="flex items-center justify-between bg-primary h-13 w-full text-white typo-body-3 px-5">
        <img src={lefe_arrow} alt="뒤로가기" onClick={() => navigate(reportPath)} />
        상세 분석
        <img src={share} onClick={handleShare} alt="공유하기" />
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
        {detailReportData.category === 'GENERAL' ? (
          <div className="flex flex-col gap-3">
            <ContentBox type="COLOR">
              <p className="typo-head-4 text-white">"{detailReportData.detail.coreSummary}"</p>
              <div className="flex gap-1.5">
                {detailReportData.detail.primaryElements.map((element, index) => (
                  <OhaengIcon key={index} element={element} type="secondary" />
                ))}
              </div>
            </ContentBox>
            <ContentBox type="TEXT" title="일간 · 일지 · 일주">
              <div className="flex gap-2 flex-1">
                <div className="flex flex-col flex-1 gap-3 items-start rounded-2xl bg-gray-2 shadow-[0_2px_4px_0_rgba(0,0,0,0.10)] px-3 py-3.5">
                  <div className="text-primary-light typo-caption">
                    {detailReportData.detail.dayPillars.dayStem.label}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <p className="typo-head-4 text-primary">
                      {detailReportData.detail.dayPillars.dayStem.displayText}
                    </p>
                    <p className="typo-sub-3 text-gray-5">
                      {detailReportData.detail.dayPillars.dayStem.description}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col flex-1 gap-3 items-start rounded-2xl bg-gray-2 shadow-[0_2px_4px_0_rgba(0,0,0,0.10)] px-3 py-3.5">
                  <div className="text-primary-light typo-caption">
                    {detailReportData.detail.dayPillars.dayBranch.label}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <p className="typo-head-4 text-primary">
                      {detailReportData.detail.dayPillars.dayBranch.displayText}
                    </p>
                    <p className="typo-sub-3 text-gray-5">
                      {detailReportData.detail.dayPillars.dayBranch.description}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col flex-1 gap-3 items-start rounded-2xl bg-gray-2 shadow-[0_2px_4px_0_rgba(0,0,0,0.10)] px-3 py-3.5">
                  <div className="text-primary-light typo-caption">
                    {detailReportData.detail.dayPillars.dayPillar.label}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <p className="typo-head-4 text-primary">
                      {detailReportData.detail.dayPillars.dayPillar.displayText}
                    </p>
                    <p className="typo-sub-3 text-gray-5">
                      {detailReportData.detail.dayPillars.dayPillar.description}
                    </p>
                  </div>
                </div>
              </div>
            </ContentBox>
            <ContentBox type="TEXT" title="기본 흐름 분석">
              <div className="flex flex-col gap-3">
                {detailReportData.detail.flowAnalysis.map((flow) => (
                  <div key={flow.label} className="flex flex-col items-start gap-1">
                    <p className="typo-caption text-primary">{flow.label}</p>
                    <p className="typo-sub-3 text-gray-5">{flow.text}</p>
                  </div>
                ))}
              </div>
            </ContentBox>
            <ContentBox
              type="GENERAL"
              ohang={
                oheangList.find((o) => o.eng === detailReportData.complementActionGuide.element)
                  ?.eng
              }
            >
              <div className="flex flex-col gap-2">
                <p
                  className={`typo-head-4 ${oheangList.find((o) => o.eng === detailReportData.complementActionGuide.element)?.text} `}
                >
                  부족한
                  {
                    oheangList.find((o) => o.eng === detailReportData.complementActionGuide.element)
                      ?.label
                  }
                  (
                  {
                    oheangList.find((o) => o.eng === detailReportData.complementActionGuide.element)
                      ?.Hanja
                  }
                  )를 채우기 위해
                </p>
                <OhaengIcon
                  element={detailReportData.complementActionGuide.element}
                  type="complementary"
                  textColor={
                    oheangList.find((o) => o.eng === detailReportData.complementActionGuide.element)
                      ?.text
                  }
                  border={
                    oheangList.find((o) => o.eng === detailReportData.complementActionGuide.element)
                      ?.border
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                {detailReportData.complementActionGuide.actions.map((recommendation, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-2.5 rounded-2xl ${oheangList.find((o) => o.eng === detailReportData.complementActionGuide.element)?.bgGrad} `}
                  >
                    <div
                      className={`shrink-0 w-6 h-6 rounded-2xl ${oheangList.find((o) => o.eng === detailReportData.complementActionGuide.element)?.bg} text-white flex items-center justify-center typo-head-4`}
                    >
                      {index + 1}
                    </div>
                    <p className="typo-body-4 text-gray-6">{recommendation.text}</p>
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
              title={detailReportData.detail.coreSummary}
            />
            {detailReportData.detail.contentBlocks.map((block, index) => (
              <ContentBox key={index} type="TEXT" title={block.title}>
                <p className="typo-sub-2 text-gray-4">{block.content}</p>
              </ContentBox>
            ))}
            <ContentBox type="CATEGORY" category={selectedCategory}>
              <div className="flex flex-col gap-3">
                {detailReportData.detail.keyPoints.map((point, index) => (
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
