import { useNavigate } from 'react-router';

import iconChevronLeft from '../../assets/icon-chevron-left.svg';

function ChevronRight() {
  return (
    <svg aria-hidden="true" viewBox="0 0 9 16" className="h-2.5 w-[5px]">
      <path
        d="M8 1L1 8L8 15"
        transform="translate(9) scale(-1 1)"
        fill="none"
        stroke="#3f3f46"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg aria-label="공유" viewBox="0 0 24 24" className="size-6">
      <path
        d="M14.7381 6.67369C15.0417 7.2012 15.6051 7.55556 16.25 7.55556C17.2165 7.55556 18 6.75962 18 5.77778C18 4.79594 17.2165 4 16.25 4C15.2835 4 14.5 4.79594 14.5 5.77778C14.5 6.10449 14.5868 6.41062 14.7381 6.67369ZM14.7381 6.67369L7.26186 11.1041M7.26186 11.1041C6.9583 10.5766 6.39489 10.2222 5.75 10.2222C4.7835 10.2222 4 11.0182 4 12C4 12.9818 4.7835 13.7778 5.75 13.7778C6.39489 13.7778 6.9583 13.4234 7.26186 12.8959M7.26186 11.1041C7.41324 11.3672 7.5 11.6733 7.5 12C7.5 12.3267 7.41324 12.6328 7.26186 12.8959M7.26186 12.8959L14.7381 17.3263M14.7381 17.3263C15.0417 16.7988 15.6051 16.4444 16.25 16.4444C17.2165 16.4444 18 17.2404 18 18.2222C18 19.2041 17.2165 20 16.25 20C15.2835 20 14.5 19.2041 14.5 18.2222C14.5 17.8955 14.5868 17.5894 14.7381 17.3263Z"
        fill="none"
        stroke="#71717a"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AccountLinkPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto min-h-screen max-w-[390px] bg-gray-1">
      <header className="flex h-[99px] items-end justify-between border-b border-gray-3 bg-white px-5 pb-3">
        <button
          type="button"
          onClick={() => navigate('/my')}
          aria-label="뒤로 가기"
          className="flex size-6 items-center justify-center"
        >
          <img src={iconChevronLeft} alt="" className="h-3.5 w-[7px]" />
        </button>
        <h1 className="text-sm font-bold text-gray-6">계정 연동 관리</h1>
        <span className="size-6" aria-hidden="true">
          <ShareIcon />
        </span>
      </header>

      <main className="px-5 pt-5">
        <section className="rounded-btn border border-gray-2 bg-white p-5 shadow-[0_2px_2px_rgba(0,0,0,0.05)]">
          <h2 className="text-sm font-bold text-primary">현재 연결된 계정</h2>
          <p className="mt-3 text-xs font-bold text-gray-5">카카오</p>
          <p className="mt-1 text-xs text-gray-5">kakao@email.com</p>
        </section>

        <section className="mt-3 space-y-3">
          {['다른 계정으로 연동하기', '연동 정책 보기'].map((label) => (
            <div
              key={label}
              className="flex h-[52px] items-center justify-between rounded-btn bg-white px-5 text-sm text-gray-5 shadow-[0_2px_2px_rgba(0,0,0,0.05)]"
            >
              {label}
              <ChevronRight />
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
