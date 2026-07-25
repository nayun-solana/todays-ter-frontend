import PageHeader from '../../components/PageHeader';
import { ChevronRightIcon } from '../../components/icons';

export default function AccountLinkPage() {
  return (
    <div className="mx-auto min-h-dvh max-w-[375px] bg-gray-1">
      <PageHeader title="계정 연동 관리" backTo="/my" />

      <main className="px-5 pt-5">
        <section className="rounded-btn border border-gray-2 bg-white p-5 shadow-card-soft">
          <h2 className="text-sm font-bold text-primary">현재 연결된 계정</h2>
          {/* Figma: 제공자와 이메일이 한 줄 */}
          <p className="mt-3 flex items-center gap-2 text-xs text-gray-5">
            <span className="font-bold">카카오</span>
            kakao@email.com
          </p>
        </section>

        <section className="mt-3 space-y-3">
          {['다른 계정으로 연동하기', '연동 정책 보기'].map((label) => (
            <button
              key={label}
              type="button"
              className="flex h-[52px] w-full items-center justify-between rounded-btn bg-white px-5 text-left text-sm text-gray-5 shadow-card-soft"
            >
              {label}
              <ChevronRightIcon />
            </button>
          ))}
        </section>
      </main>
    </div>
  );
}
