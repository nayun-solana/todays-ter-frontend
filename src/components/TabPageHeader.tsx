import { cn } from '../lib/cn';

interface TabPageHeaderProps {
  title: string;
  /** 스크롤 고정·그림자처럼 화면마다 다른 것만 넘긴다 (탐색 화면). */
  className?: string;
}

/**
 * 하단 탭 화면(내 터·마이·탐색)의 제목 헤더.
 *
 * `PageHeader`와 다르다 — 그쪽은 뒤로가기가 있는 하위 화면용이고 아래 테두리가 있다.
 * 탭 화면은 뒤로 갈 곳이 없어 제목만 놓는다.
 */
export default function TabPageHeader({ title, className }: TabPageHeaderProps) {
  return (
    <header className={cn('bg-white px-5 pb-4 pt-safe-5', className)}>
      <h1 className="typo-head-1 text-primary">{title}</h1>
    </header>
  );
}
