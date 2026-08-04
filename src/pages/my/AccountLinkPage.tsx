import PageHeader from '../../components/PageHeader';
import { ChevronRightIcon } from '../../components/icons';
import { useSocialConnections } from '../../hooks/my/useMy';

const PROVIDER_LABELS: Record<string, string> = {
  KAKAO: '카카오',
  NAVER: '네이버',
  APPLE: '애플',
};

const FALLBACK_CONNECTION = {
  provider: 'KAKAO',
  linkedEmail: 'kakao@email.com',
};

export default function AccountLinkPage() {
  const connectionsQuery = useSocialConnections();
  const linkedConnection = connectionsQuery.data
    ? connectionsQuery.data.connections.find((connection) => connection.isLinked)
    : FALLBACK_CONNECTION;

  return (
    <div className="min-h-dvh w-full bg-gray-1">
      <PageHeader title="계정 연동 관리" backTo="/my" />

      <main className="px-5 pt-5">
        <section className="rounded-btn border border-gray-2 bg-white p-5 shadow-card-soft">
          <h2 className="typo-body-3 text-primary">현재 연결된 계정</h2>
          {linkedConnection ? (
            <p className="typo-sub-2 mt-3 flex items-center gap-2 text-gray-5">
              <span className="font-bold">
                {PROVIDER_LABELS[linkedConnection.provider] ?? linkedConnection.provider}
              </span>
              {linkedConnection.linkedEmail ?? '이메일 정보 없음'}
            </p>
          ) : (
            <p className="typo-sub-2 mt-3 text-gray-5">연결된 계정이 없습니다.</p>
          )}
        </section>

        <section className="mt-3 space-y-3">
          {['다른 계정으로 연동하기', '연동 정책 보기'].map((label) => (
            <button
              key={label}
              type="button"
              onClick={
                label === '연동 정책 보기' && connectionsQuery.data?.policyUrl
                  ? () => window.open(connectionsQuery.data.policyUrl, '_blank', 'noopener,noreferrer')
                  : undefined
              }
              className="typo-body-3 flex h-[52px] w-full items-center justify-between rounded-btn bg-white px-5 text-left text-gray-5 shadow-card-soft"
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
