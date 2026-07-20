// libraries
import { useEffect, useState } from 'react';
// components
import AnalysisProgress from './components/CircularProgress';
import StatusBox from './components/StatusBox';
import Modal from './components/Modal';
// assets

const STATUS_BAR_COLOR = '#5a81fa';

export default function OnboardingStep2Page() {
  // state
  const [progress, setProgress] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // progress 내용
  const progressContent = [
    { title: '사주 정보 관리', description: '생년월일시 기반 데이터 구조화' },
    { title: '일간/일지 해석', description: '천간·지지 오행 분석' },
    { title: '오행 분포 계산', description: '목·화·토·금·수 비율 산출' },
    { title: '고민 유형별 분석 생성', description: '연애·커리어·재물·인간관계 흐름 정리' },
    { title: '리포트 정리', description: '기본 터 리포트 완성' },
  ];

  return (
    <main
      className="
         min-h-screen bg-primary px-5 pb-[env(safe-area-inset-bottom)] pt-[calc(1.25rem+env(safe-area-inset-top))] flex flex-col gap-12 justify-center
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
            onClick={() => {
              setProgress((prev) => (prev < progressContent.length ? prev + 1 : prev));
              if (progress + 1 === progressContent.length) {
                setIsModalOpen(true);
              }
            }}
          />
        ))}
      </div>
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClick={() => setIsModalOpen(false)} isSuccess={true} />
      )}
    </main>
  );
}
