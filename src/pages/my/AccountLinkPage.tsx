import PageHeader from '../../components/PageHeader';
import SectionError from '../../components/SectionError';
import { useSocialConnections } from '../../hooks/my/useMy';
import { loadFailureMessage, loadingMessage } from '../../lib/messages';
import { viewStateOf } from '../../lib/queryState';

const PROVIDER_LABELS: Record<string, string> = {
  KAKAO: '카카오',
  GOOGLE: '구글',
  APPLE: '애플',
};

export default function AccountLinkPage() {
  const connectionsQuery = useSocialConnections();
  const state = viewStateOf(connectionsQuery);
  const linkedConnection = connectionsQuery.data?.socialAccounts[0];

  return (
    <div className="min-h-dvh w-full bg-gray-1">
      <PageHeader title="계정 연동 관리" backTo="/my" />

      <main className="px-5 pt-5">
        <section className="rounded-btn border border-gray-2 bg-white p-5 shadow-card-soft">
          <h2 className="typo-body-3 text-primary">현재 연결된 계정</h2>

          {/*
            로딩·실패를 "연결된 계정이 없습니다"와 구분한다.
            예전에는 세 상태가 모두 같은 문구로 떨어져서, 카카오로 로그인한 사용자가
            응답을 기다리는 동안에도 조회에 실패했을 때도 **연결된 계정이 없다**는
            잘못된 안내를 봤다.
          */}
          {state === 'loading' && (
            <p className="typo-sub-2 mt-3 text-gray-4" role="status">
              {loadingMessage('연결된 계정')}
            </p>
          )}

          {state === 'failed' && (
            <SectionError
              className="mt-3"
              message={loadFailureMessage('연결된 계정')}
              onRetry={() => void connectionsQuery.refetch()}
            />
          )}

          {state === 'ready' &&
            (linkedConnection ? (
              <p className="typo-sub-2 mt-3 flex items-center gap-2 text-gray-5">
                <span className="font-bold">
                  {PROVIDER_LABELS[linkedConnection.provider] ?? linkedConnection.provider}
                </span>
                {linkedConnection.email}
              </p>
            ) : (
              <p className="typo-sub-2 mt-3 text-gray-5">연결된 계정이 없습니다.</p>
            ))}
        </section>
      </main>
    </div>
  );
}
