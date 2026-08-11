import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';

import Button from '../../components/Button';
import { useGetCategorySajuReport } from '../../hooks/onboarding/useGetReport';
import type {
  ComplementActionGuide,
  ElementCode,
  SajuReportCategory,
  SajuReportDetail,
} from '../../types/onboarding/report';
import lefe_arrow from '../../assets/onboarding/left-arrow.svg';
import share from '../../assets/onboarding/share.svg';
import RightIcon from '../../assets/onboarding/right.svg';
import Love from '../../assets/onboarding/3-1.svg';
import Career from '../../assets/onboarding/3-2.svg';
import Wealth from '../../assets/onboarding/3-3.svg';
import Relationship from '../../assets/onboarding/3-4.svg';
import Health from '../../assets/onboarding/3-5.svg';
import ContentBox from './components/ContentBox';
import NavBtn from './components/NavBtn';
import OhaengIcon from './components/OhaengIcon';

const STATUS_BAR_COLOR = '#5a81fa';

const CATEGORY_BUTTONS: ReadonlyArray<{
  label: string;
  value: SajuReportCategory;
  icon?: string;
  bg: string;
}> = [
  { label: '종합', value: 'GENERAL', bg: '' },
  { label: '연애', value: 'LOVE', icon: Love, bg: 'bg-category-love' },
  { label: '커리어', value: 'CAREER', icon: Career, bg: 'bg-category-career' },
  { label: '재물', value: 'WEALTH', icon: Wealth, bg: 'bg-category-wealth' },
  { label: '인간관계', value: 'RELATIONSHIP', icon: Relationship, bg: 'bg-category-relationship' },
  { label: '건강', value: 'HEALTH', icon: Health, bg: 'bg-category-health' },
];

const ELEMENT_META: Record<
  ElementCode,
  { label: string; hanja: string; text: string; bg: string; bgGrad: string; border: string }
> = {
  WOOD: {
    label: '목',
    hanja: '木',
    text: 'text-ohaeng-wood',
    bg: 'bg-ohaeng-wood',
    bgGrad: 'bg-ohaeng-wood/20',
    border: 'border-ohaeng-wood',
  },
  FIRE: {
    label: '화',
    hanja: '火',
    text: 'text-ohaeng-fire',
    bg: 'bg-ohaeng-fire',
    bgGrad: 'bg-ohaeng-fire/20',
    border: 'border-ohaeng-fire',
  },
  EARTH: {
    label: '토',
    hanja: '土',
    text: 'text-ohaeng-earth',
    bg: 'bg-ohaeng-earth',
    bgGrad: 'bg-ohaeng-earth/20',
    border: 'border-ohaeng-earth',
  },
  METAL: {
    label: '금',
    hanja: '金',
    text: 'text-ohaeng-metal',
    bg: 'bg-ohaeng-metal',
    bgGrad: 'bg-ohaeng-metal/20',
    border: 'border-ohaeng-metal',
  },
  WATER: {
    label: '수',
    hanja: '水',
    text: 'text-ohaeng-water',
    bg: 'bg-ohaeng-water',
    bgGrad: 'bg-ohaeng-water/20',
    border: 'border-ohaeng-water',
  },
};

function getContextQuery(searchParams: URLSearchParams) {
  const context = new URLSearchParams();
  const from = searchParams.get('from');
  const source = searchParams.get('source');

  if (from) context.set('from', from);
  if (source) context.set('source', source);

  const query = context.toString();
  return query ? `?${query}` : '';
}

function ReportNotice({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-primary-bg px-5 text-center">
      <h1 className="typo-head-3 text-gray-6">{title}</h1>
      {description ? <p className="typo-sub-2 text-gray-4">{description}</p> : null}
      {action ? <div className="w-full max-w-[350px]">{action}</div> : null}
    </main>
  );
}

export default function ReportDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const reportId = Number(id);
  const isValidId = Number.isInteger(reportId) && reportId > 0;
  const isMyReport = searchParams.get('from') === 'my';
  const isSajuEditReport = searchParams.get('source') === 'saju-edit';
  const isReadOnlyMyReport = isMyReport && !isSajuEditReport;
  const reportPath = `/report/${id}${getContextQuery(searchParams)}`;
  const [selectedCategory, setSelectedCategory] = useState<SajuReportCategory>('GENERAL');
  const reportQuery = useGetCategorySajuReport(reportId, selectedCategory);

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

  if (!isValidId) {
    return (
      <ReportNotice
        title="리포트를 찾을 수 없어요"
        description="주소가 잘못되었거나 만료된 링크예요."
        action={<Button onClick={() => navigate('/home')}>홈으로 가기</Button>}
      />
    );
  }

  if (reportQuery.isPending) {
    return <ReportNotice title="상세 분석을 불러오는 중이에요" />;
  }

  if (reportQuery.isError || !reportQuery.data) {
    return (
      <ReportNotice
        title="상세 분석을 불러오지 못했어요"
        description="잠시 후 다시 시도해주세요."
        action={<Button onClick={() => void reportQuery.refetch()}>다시 시도</Button>}
      />
    );
  }

  const selectedButton = CATEGORY_BUTTONS.find((button) => button.value === selectedCategory)!;
  const detail = reportQuery.data.detail;

  const handleShare = () => {
    if (!navigator.share) return;
    void navigator.share({ title: '오늘의 터 상세 분석' }).catch(() => undefined);
  };

  return (
    <div>
      <header className="flex h-13 w-full items-center justify-between bg-primary px-5 text-white typo-body-3">
        <button
          type="button"
          aria-label="기본 리포트로 돌아가기"
          onClick={() => navigate(reportPath)}
          className="flex size-6 items-center justify-center"
        >
          <img src={lefe_arrow} alt="" />
        </button>
        <span>상세 분석</span>
        <button
          type="button"
          aria-label="공유하기"
          onClick={handleShare}
          className="flex size-6 items-center justify-center"
        >
          <img src={share} alt="" />
        </button>
      </header>

      <main className="flex flex-col gap-3 bg-primary-bg px-5 py-4">
        <div className="-mr-5 flex gap-1 overflow-x-auto no-scrollbar">
          {CATEGORY_BUTTONS.map(({ label, value }) => (
            <NavBtn
              key={value}
              isActive={selectedCategory === value}
              onClick={() => setSelectedCategory(value)}
              title={label}
            />
          ))}
        </div>

        {selectedCategory === 'GENERAL' ? (
          <GeneralDetail
            detail={detail}
            guide={reportQuery.data.complementActionGuide ?? undefined}
          />
        ) : (
          <CategoryDetail detail={detail} category={selectedCategory} icon={selectedButton.icon} />
        )}

        {!isReadOnlyMyReport ? (
          <Button
            variant="primary"
            onClick={() => navigate(isMyReport ? '/my/concerns' : '/onboarding/step-3')}
            className="mt-1 flex items-center justify-center gap-3"
          >
            <p>{isMyReport ? '고민유형 수정하기' : '고민 유형 선택하기'}</p>
            <img src={RightIcon} alt="" />
          </Button>
        ) : null}
      </main>
    </div>
  );
}

function GeneralDetail({
  detail,
  guide,
}: {
  detail: SajuReportDetail;
  guide?: ComplementActionGuide;
}) {
  const primaryElements = detail.primaryElements;
  const dayPillarCards = detail.dayPillars
    ? [detail.dayPillars.dayStem, detail.dayPillars.dayBranch, detail.dayPillars.dayPillar]
    : [];
  const guideMeta = guide ? ELEMENT_META[guide.element] : null;

  return (
    <div className="flex flex-col gap-3">
      <ContentBox type="COLOR">
        <p className="typo-head-4 text-white">"{detail.coreSummary}"</p>
        <div className="flex flex-wrap gap-2">
          {primaryElements.map((element) => (
            <OhaengIcon key={element} element={element} type="secondary" />
          ))}
        </div>
      </ContentBox>

      {dayPillarCards.length > 0 ? (
        <ContentBox type="TEXT" title="일간 · 일지 · 일주">
          <div className="flex flex-1 gap-2">
            {dayPillarCards.map((pillar) => (
              <div
                key={pillar.label}
                className="flex flex-1 flex-col items-start gap-3 rounded-2xl bg-gray-2 px-3 py-3.5 shadow-[0_2px_4px_0_rgba(0,0,0,0.10)]"
              >
                <div className="typo-caption text-primary-light">{pillar.label}</div>
                <div className="flex flex-col gap-1.5">
                  <p className="typo-head-4 text-primary">{pillar.displayText}</p>
                  <p className="typo-sub-3 text-gray-5">{pillar.description}</p>
                </div>
              </div>
            ))}
          </div>
        </ContentBox>
      ) : null}

      {detail.flowAnalysis.length > 0 ? (
        <ContentBox type="TEXT" title="기본 흐름 분석">
          <div className="flex flex-col gap-3">
            {detail.flowAnalysis.map((flow) => (
              <div key={flow.label} className="flex flex-col items-start gap-1">
                <p className="typo-caption text-primary">{flow.label}</p>
                <p className="typo-sub-3 text-gray-5">{flow.text}</p>
              </div>
            ))}
          </div>
        </ContentBox>
      ) : null}

      {guide && guideMeta ? (
        <ContentBox type="GENERAL" ohang={guide.element}>
          <div className="flex flex-col gap-2">
            <p className={`typo-head-4 ${guideMeta.text}`}>
              부족한 {guide.label}({guideMeta.hanja})를 채우기 위해
            </p>
            <OhaengIcon
              element={guide.element}
              type="complementary"
              textColor={guideMeta.text}
              border={guideMeta.border}
            />
          </div>
          <div className="flex flex-col gap-2">
            {guide.actions.map((action) => (
              <div
                key={action.order}
                className={`flex items-center gap-3 rounded-2xl p-2.5 ${guideMeta.bgGrad}`}
              >
                <div
                  className={`flex size-6 shrink-0 items-center justify-center rounded-2xl text-white typo-head-4 ${guideMeta.bg}`}
                >
                  {action.order}
                </div>
                <p className="typo-body-4 text-gray-6">{action.text}</p>
              </div>
            ))}
          </div>
        </ContentBox>
      ) : null}
    </div>
  );
}

function CategoryDetail({
  detail,
  category,
  icon,
}: {
  detail: SajuReportDetail;
  category: Exclude<SajuReportCategory, 'GENERAL'>;
  icon?: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <ContentBox type="ICON" icon={icon} title={detail.coreSummary} />
      {detail.contentBlocks.map((block) => (
        <ContentBox key={block.title} type="TEXT" title={block.title}>
          <p className="typo-sub-2 text-gray-4">{block.content}</p>
        </ContentBox>
      ))}
      {detail.keyPoints.length > 0 ? (
        <ContentBox type="CATEGORY" category={category}>
          <div className="flex flex-col gap-3">
            {detail.keyPoints.map((point) => (
              <div key={point.label} className="flex items-center gap-3">
                <p
                  className={`flex h-7 w-15 items-center justify-center rounded-btn text-white typo-caption ${CATEGORY_BUTTONS.find((button) => button.value === category)?.bg}`}
                >
                  {point.label}
                </p>
                <p className="typo-sub-3 text-gray-4">{point.text}</p>
              </div>
            ))}
          </div>
        </ContentBox>
      ) : null}
      {detail.flowAnalysis.length > 0 ? (
        <ContentBox type="TEXT" title="분석 흐름">
          <div className="flex flex-col gap-3">
            {detail.flowAnalysis.map((flow) => (
              <div key={flow.label}>
                <p className="typo-caption text-primary">{flow.label}</p>
                <p className="typo-sub-3 text-gray-4">{flow.text}</p>
              </div>
            ))}
          </div>
        </ContentBox>
      ) : null}
    </div>
  );
}
