import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';

import iconChevronLeft from '../assets/icon-chevron-left.svg';
import { CloseIcon } from './icons';
import { cn } from '../lib/cn';

interface PageHeaderProps {
  title: string;
  /** 좌측 버튼 모양. 뒤로가기(<) 또는 닫기(X) */
  leading?: 'back' | 'close';
  /** 눌렀을 때 이동할 경로. 없으면 history back */
  backTo?: string;
  /** 우측 슬롯. 없으면 24px 자리만 잡아 제목을 중앙에 고정 */
  trailing?: ReactNode;
  className?: string;
}

/**
 * 하위 페이지 공통 헤더.
 * Figma 실측(7화면 동일): 높이 99px, 24×24 버튼이 x=20 / y=60,
 * 하단 구분선 gray-3 1px, 제목 typo-body-3 gray-6 중앙.
 * → pt-[60px] + 24px 행으로 버튼 top을 60px에 정확히 맞춘다.
 */
export default function PageHeader({
  title,
  leading = 'back',
  backTo,
  trailing,
  className,
}: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header
      className={cn('h-[99px] border-b border-gray-3 bg-white px-5 pt-[60px]', className)}
    >
      <div className="flex h-6 items-center justify-between">
        <button
          type="button"
          onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
          aria-label={leading === 'close' ? '닫기' : '뒤로 가기'}
          className="flex size-6 items-center justify-center text-gray-5"
        >
          {leading === 'close' ? (
            <CloseIcon />
          ) : (
            /* 자산 viewBox가 9×16(경로 7×14 + stroke 2px) → 그 크기로 렌더해야 시안과 1:1 */
            <img src={iconChevronLeft} alt="" className="h-4 w-[9px]" />
          )}
        </button>

        <h1 className="typo-body-3 text-gray-6">{title}</h1>

        {trailing ?? <span aria-hidden="true" className="size-6" />}
      </div>
    </header>
  );
}
