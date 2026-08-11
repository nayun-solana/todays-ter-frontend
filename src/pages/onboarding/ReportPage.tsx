// libraries
import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
// hooks
import { useGetSajuReport } from '../../hooks/onboarding/useGetReport';
// asstets
import RightIcon from '../../assets/onboarding/right.svg';
// components
import Button from '../../components/Button';
import { CloseIcon } from '../../components/icons';
import ContentBox from './components/ContentBox';
import OhaengIcon from './components/OhaengIcon';
import ElementRadarChart from './components/ElementRadarChart';
//types
import type { ElementCode } from '../../types/onboarding/report';

const STATUS_BAR_COLOR = '#5a81fa';
/**
 * 로딩·실패 자리. 예전에는 목 데이터라 이 상태 자체가 없었고, 실연동 후에는
 * 값이 없을 때 빈 껍데기(제목 없음·0%)가 그려지는 걸 막아야 한다.
 */
function ReportNotice({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-primary-bg px-5 text-center">
      <div className="flex flex-col gap-2">
        <p className="text-lg font-extrabold text-gray-6">{title}</p>
        {description ? <p className="text-sm text-gray-4">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export default function ReportPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isMyReport = searchParams.get('from') === 'my';

  // 예전에는 화면 안에 목 객체가 박혀 있고 훅 호출은 주석 처리돼 있었다 — 실서버 값이 아니었다.
  const reportId = Number(id);
  const isValidId = Number.isFinite(reportId) && reportId > 0;
  const { data: sajuReportData, isPending, isError, refetch } = useGetSajuReport(reportId);
  const report = sajuReportData?.basic;

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

  // 잘못된 id면 쿼리가 disabled라 isPending이 영원히 true다(v5에서 disabled = pending).
  // 먼저 걸러내지 않으면 /report/abc 같은 링크가 로딩 화면에 갇힌다.
  if (!isValidId) {
    return (
      <ReportNotice
        title="리포트를 찾을 수 없어요"
        description="주소가 잘못되었거나 만료된 링크예요."
        action={
          <Button variant="primary" onClick={() => navigate('/home')}>
            홈으로 가기
          </Button>
        }
      />
    );
  }

  if (isPending) {
    return <ReportNotice title="리포트를 불러오는 중이에요" />;
  }

  if (isError || !sajuReportData) {
    return (
      <ReportNotice
        title="리포트를 불러오지 못했어요"
        description="잠시 후 다시 시도해주세요."
        action={
          <Button variant="primary" onClick={() => void refetch()}>
            다시 시도
          </Button>
        }
      />
    );
  }

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
    <div className="relative mx-auto min-h-dvh bg-primary-bg">
      <div className="absolute inset-x-0 top-0 z-0 h-53 rounded-b-[30px] bg-primary" />
      <div className="relative z-10 flex flex-col gap-5 px-5 pt-[calc(1.375rem+env(safe-area-inset-top))] pb-10">
        {/* Figma 3514:5416 — 마이에서 다시 볼 때만 우상단 X로 마이페이지에 복귀한다 */}
        {isMyReport ? (
          <button
            type="button"
            aria-label="마이페이지로 닫기"
            onClick={() => navigate('/my')}
            className="absolute top-[calc(1rem+env(safe-area-inset-top))] right-5 flex size-6 items-center justify-center text-white"
          >
            <CloseIcon />
          </button>
        ) : null}
        <div className="flex flex-col gap-3">
          <p className="typo-caption text-primary-light ">기본 리포트</p>
          <div className="flex flex-col gap-1">
            <p className="typo-body-2 text-white">{report!.typeTitle}</p>

            <p className="typo-head-1 text-white">{report!.typeName}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <ContentBox type="TOP">
            <p className="typo-caption text-gray-5">{report!.elementSummary}</p>
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                {report!.primaryElements.map((element: ElementCode) => (
                  <OhaengIcon key={element} element={element} type="primary" />
                ))}
              </div>
              <OhaengIcon
                key={report!.complementElement}
                element={report!.complementElement!}
                type="complementary"
              />
            </div>
          </ContentBox>
          <ContentBox type="TEXT" title="오행 분포">
            <div className="flex items-center gap-4">
              {/* 왼쪽 차트 */}
              <div className="min-w-0 flex-1">
                <ElementRadarChart
                  distribution={report!.elementDistribution}
                  primaryElements={report!.primaryElements}
                />
              </div>

              {/* 오른쪽 오행 분포 */}
              <div className="flex w-40 shrink-0 flex-col gap-3">
                {report!.elementDistribution.map((item) => {
                  const { color } = parseElementCodeandColor(item.element);
                  // 라벨은 BE가 준 값을 그대로 쓴다.
                  const label = item.label;
                  // 실응답은 소수점이 있다(0.3 / 43.2). 36px 칸에 "43.2%"가 들어가면 넘친다.
                  const percentage = Math.round(Math.min(Math.max(item.percentage, 0), 100));

                  return (
                    <div
                      key={item.element}
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
          <ContentBox type="TEXT" title="전반적인 성향">
            <div className="flex flex-col gap-3">
              {report!.overallTendencies.map((item) => (
                <div key={item.label} className="flex flex-col gap-1">
                  <p className="typo-caption text-primary">{item.label}</p>
                  <p className="typo-sub-3 text-gray-5">{item.text}</p>
                </div>
              ))}
            </div>
          </ContentBox>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            variant="primary"
            onClick={() => {
              navigate(`/report/${id}/detail${isMyReport ? '?from=my' : ''}`);
            }}
            className="flex items-center justify-center gap-3"
          >
            <p>상세 분석 보기</p>

            <img src={RightIcon} alt="right" className="" />
          </Button>
          {/* Figma 3514:5416 — outline CTA는 primary-bg 채움 + primary-light 테두리 */}
          <Button
            variant="secondary"
            className="border-primary-light bg-primary-bg"
            onClick={() => {
              navigate(isMyReport ? '/my/concerns' : '/onboarding/step-3');
            }}
          >
            {isMyReport ? '고민유형 수정하기' : '상세 분석 없이 고민유형 선택하기'}
          </Button>
        </div>
      </div>
    </div>
  );
}
