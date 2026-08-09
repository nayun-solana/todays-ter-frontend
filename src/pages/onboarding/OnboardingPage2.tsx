// libraries
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
// hooks
import { useCreateFortuneReport, useReportStatus } from '../../hooks/onboarding/useGetReport';
// components
import AnalysisProgress from './components/CircularProgress';
import StatusBox from './components/StatusBox';
import Modal from './components/Modal';
// assets

const STATUS_BAR_COLOR = '#5a81fa';

export default function OnboardingStep2Page() {
  const navigate = useNavigate();
  // state
  const [reportId, setReportId] = useState<number | null>(null);
  const [isModalDismissed, setIsModalDismissed] = useState(false);
  const [createFailed, setCreateFailed] = useState(false);

  // progress 내용
  const progressContent = [
    { title: '사주 정보 관리', description: '생년월일시 기반 데이터 구조화' },
    { title: '일간/일지 해석', description: '천간·지지 오행 분석' },
    { title: '오행 분포 계산', description: '목·화·토·금·수 비율 산출' },
    { title: '고민 유형별 분석 생성', description: '연애·커리어·재물·인간관계 흐름 정리' },
    { title: '리포트 정리', description: '기본 터 리포트 완성' },
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
  /**
   * 리포트 생성 시작 — 이 화면의 존재 이유다.
   *
   * 예전에는 API 호출이 하나도 없이 setTimeout으로 진행률만 흉내내고 `/report/1`(하드코딩)로
   * 넘어갔다. 그래서 사주 리포트가 실제로는 만들어지지 않았고, 홈 3개 API가 계속
   * 404 HOME404_2로 떨어져 추천이 비어 있었다.
   *
   * StrictMode는 이펙트를 두 번 돌린다 — 가드가 없으면 리포트가 두 개 생긴다.
   * 이 컴포넌트는 완전히 언마운트됐다 다시 마운트되면 새로 만드는 게 맞으므로
   * (모듈 스코프가 아니라) ref로 막는다.
   */
  const createReport = useCreateFortuneReport();
  const hasRequested = useRef(false);

  useEffect(() => {
    if (hasRequested.current) return;
    hasRequested.current = true;

    createReport
      .mutateAsync()
      .then((result) => setReportId(result.reportId))
      .catch(() => setCreateFailed(true));
    // 마운트 시 1회.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 생성이 끝날 때까지 상태를 폴링한다(완료·실패면 훅이 알아서 멈춘다).
  const statusQuery = useReportStatus(reportId ?? undefined);
  const status = statusQuery.data?.status;

  // 서버 진행률(0~100)을 화면의 5단계로 환산한다.
  const progress = Math.min(
    Math.floor(((statusQuery.data?.progress ?? 0) / 100) * progressContent.length),
    progressContent.length,
  );

  // 최종 실패로 볼 것은 **생성 요청 자체가 거절됐거나 서버가 failed라고 말한 경우**뿐이다.
  // 상태 조회가 한 번 실패했다고 실패로 단정하면, 잘 만들어진 리포트를 두고 온보딩1로
  // 돌려보내 사주를 다시 입력하게 만든다. 폴링은 계속 도니 다음 응답에서 회복된다.
  const failed = createFailed || status === 'failed';

  // 완료·실패 어느 쪽이든 모달로 알린다. 예전에는 isSuccess가 true로 하드코딩돼 있어
  // 실패 분기가 렌더될 수 없었다.
  // 이펙트+setState가 아니라 파생값이다 — 상태에서 바로 계산되므로 굳이 동기화할 이유가 없다.
  const isModalOpen = (status === 'completed' || failed) && !isModalDismissed;

  return (
    <main
      className="
         min-h-screen bg-primary px-5 pb-safe pt-safe-5 flex flex-col gap-12 justify-center
      "
    >
      <div className="flex flex-col gap-7.5 items-center justify-center">
        <div className="flex flex-col gap-3 items-center justify-center">
          <p className="text-primary-light text-[10px] font-bold">분석 중...</p>
          <p className="text-white text-sm font-extrabold">기본 리포트 생성</p>
        </div>
        <AnalysisProgress currentStep={progress} />
        <div className="flex flex-col gap-2 items-center justify-center">
          <p className="text-white text-lg font-extrabold ">당신의 기운을 분석하고 있어요</p>
          <p className="text-white text-[10px] font-normal text-center">
            일간, 일지, 일주와 오행 분포를 바탕으로 <br />
            나의 기본 성향과 고민별 흐름을 정리하고 있어요
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2 items-center justify-center w-full">
        {progressContent.map((content, index) => (
          <StatusBox
            key={index}
            isSuccess={progress > index}
            title={content.title}
            description={content.description}
          />
        ))}
      </div>
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClick={() => {
            setIsModalDismissed(true);
            // 실패면 사주를 다시 입력할 수 있게 온보딩1로 돌려보낸다.
            navigate(failed ? '/onboarding/step-1' : `/report/${reportId}`);
          }}
          isSuccess={!failed}
        />
      )}
    </main>
  );
}
