import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';

import Button from '../../components/Button';
import {
  useCreateSajuReportShare,
  useGetCategorySajuReport,
  useSharedSajuReportDetail,
} from '../../hooks/onboarding/useGetReport';
import { useShareAction } from '../../hooks/recommendation/useShareAction';
import type {
  ComplementActionGuide,
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
import { ohaengByCode } from '../../lib/ohaeng';

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

/**
 * 상세 분석 로딩 자리.
 *
 * 헤더(h-13)와 카테고리 탭 줄은 데이터와 무관하게 늘 같은 자리에 있으므로 그대로 그리고,
 * 본문만 카드 높이로 잡아둔다. 글자 한 줄만 띄우면 로딩이 끝나는 순간 헤더가 위에서
 * 내려오는 것처럼 보인다.
 */
function ReportDetailSkeleton() {
  return (
    <div aria-busy="true">
      <header className="flex h-13 w-full items-center justify-center bg-primary px-5 text-white typo-body-3">
        상세 분석
      </header>
      <main className="flex flex-col gap-3 bg-primary-bg px-5 py-4">
        <span className="sr-only" role="status">
          상세 분석을 불러오는 중
        </span>
        <div className="-mr-5 flex gap-1 overflow-hidden">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-9 w-20 shrink-0 animate-pulse rounded-full bg-white" />
          ))}
        </div>
        <div className="h-[120px] animate-pulse rounded-btn bg-white" />
        <div className="h-[200px] animate-pulse rounded-btn bg-white" />
        <div className="h-[160px] animate-pulse rounded-btn bg-white" />
      </main>
    </div>
  );
}

type ReportDetailPageProps = {
  /**
   * 공유 링크로 들어온 화면(`/report/shared/:token`).
   * 보는 사람이 리포트 주인이 아니므로 발급·수정 액션이 전부 빠지고, 데이터도 공유 전용
   * 엔드포인트에서 온다(인증 불필요).
   */
  variant?: 'default' | 'shared';
};

export default function ReportDetailPage({ variant = 'default' }: ReportDetailPageProps) {
  const navigate = useNavigate();
  const { id, token } = useParams();
  const [searchParams] = useSearchParams();
  const isShared = variant === 'shared';
  const reportId = Number(id);
  const isValidId = isShared ? !!token : Number.isInteger(reportId) && reportId > 0;
  const isMyReport = searchParams.get('from') === 'my';
  const isSajuEditReport = searchParams.get('source') === 'saju-edit';
  const isReadOnlyMyReport = isMyReport && !isSajuEditReport;
  const reportPath = `/report/${id}${getContextQuery(searchParams)}`;
  const [selectedCategory, setSelectedCategory] = useState<SajuReportCategory>('GENERAL');
  const ownQuery = useGetCategorySajuReport(isShared ? Number.NaN : reportId, selectedCategory);
  const sharedQuery = useSharedSajuReportDetail(isShared ? token : undefined, selectedCategory);
  const reportQuery = isShared ? sharedQuery : ownQuery;

  // 공유 링크는 서버가 발급한다(POST /fortune-reports/{id}/share → shareUrl).
  // 예전에는 `navigator.share({ title })`만 불러서 **링크 없이 제목만** 공유됐고,
  // navigator.share가 없는 환경(데스크톱)에서는 아무 반응도 없었다.
  const shareMutation = useCreateSajuReportShare(reportId);
  const { share: runShare, result: shareResult, notify: notifyShare } = useShareAction();
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  // 버튼에 포인터·포커스가 닿을 때 미리 받아둔다 — 클릭 시점에 await가 끼면
  // iOS에서 navigator.share가 사용자 제스처를 잃어 막힌다.
  const prepareShare = () => {
    // 공유받은 화면에서는 발급할 대상이 없다(내 리포트가 아니다).
    if (isShared || shareUrl !== null || shareMutation.isPending) return;
    shareMutation.mutate(undefined, { onSuccess: (result) => setShareUrl(result.shareUrl) });
  };

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
    return <ReportDetailSkeleton />;
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
  const sharerNickname = isShared ? sharedQuery.data?.sharerNickname : null;

  const handleShare = async () => {
    const url =
      shareUrl ??
      (await shareMutation
        .mutateAsync()
        .then((result) => result.shareUrl)
        .catch(() => null));

    if (url === null) {
      notifyShare('unavailable');
      return;
    }

    setShareUrl(url);
    await runShare({ url, title: '오늘의 터 사주 리포트' });
  };

  return (
    <div>
      <header className="flex h-13 w-full items-center justify-between bg-primary px-5 text-white typo-body-3">
        <button
          type="button"
          aria-label={isShared ? '홈으로' : '기본 리포트로 돌아가기'}
          onClick={() => navigate(isShared ? '/home' : reportPath)}
          className="flex size-6 items-center justify-center"
        >
          <img src={lefe_arrow} alt="" />
        </button>
        <span>상세 분석</span>
        {isShared ? (
          // 남의 리포트라 공유 링크를 발급할 수 없다. 자리는 남겨 제목을 가운데로 유지한다.
          <span className="size-6" aria-hidden />
        ) : (
          <button
            type="button"
            aria-label="공유하기"
            onClick={() => void handleShare()}
            onPointerEnter={prepareShare}
            onFocus={prepareShare}
            className="flex size-6 items-center justify-center"
          >
            <img src={share} alt="" />
          </button>
        )}
      </header>

      <main className="flex flex-col gap-3 bg-primary-bg px-5 py-4">
        {/* 공유받은 화면임을 알린다 — 이 해석은 공유한 사람의 사주 기준이다.
            게스트가 공유하면 닉네임이 없어 null로 온다(실측) → "공유한 분"으로 부른다. */}
        {isShared ? (
          <p className="typo-sub-2 rounded-xl bg-white px-4 py-3 text-gray-5">
            {sharerNickname
              ? `${sharerNickname}님이 공유한 사주 리포트예요.`
              : '공유받은 사주 리포트예요.'}
          </p>
        ) : null}

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

        {isShared ? (
          <Button
            variant="primary"
            onClick={() => navigate('/home')}
            className="mt-1 flex items-center justify-center gap-3"
          >
            <p>나도 사주 리포트 만들기</p>
            <img src={RightIcon} alt="" />
          </Button>
        ) : !isReadOnlyMyReport ? (
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

      {shareResult !== null ? (
        <div
          role="status"
          className="typo-body-3 fixed bottom-10 left-1/2 z-20 -translate-x-1/2 rounded-full bg-gray-6/90 px-4 py-2 text-white"
        >
          {SHARE_TOAST_TEXT[shareResult]}
        </div>
      ) : null}
    </div>
  );
}

const SHARE_TOAST_TEXT = {
  shared: '공유했어요',
  copied: '링크가 복사되었어요',
  failed: '링크 복사에 실패했어요',
  unavailable: '공유 링크를 만들지 못했어요',
} as const;

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
  const guideMeta = guide ? ohaengByCode(guide.element) : undefined;

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
                className={`flex items-center gap-3 rounded-2xl p-2.5 ${guideMeta.bgSoft}`}
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
