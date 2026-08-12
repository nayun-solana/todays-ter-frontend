import PageHeader from '../../components/PageHeader';
import { useSocialConnections } from '../../hooks/my/useMy';

const PROVIDER_LABELS: Record<string, string> = {
  KAKAO: '카카오',
  GOOGLE: '구글',
  APPLE: '애플',
};

export default function AccountLinkPage() {
  const connectionsQuery = useSocialConnections();
  const linkedConnection = connectionsQuery.data?.socialAccounts[0];

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
              {linkedConnection.email}
            </p>
          ) : (
            <p className="typo-sub-2 mt-3 text-gray-5">연결된 계정이 없습니다.</p>
          )}
        </section>
      </main>
    </div>
  );
}
