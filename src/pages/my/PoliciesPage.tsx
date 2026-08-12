import PageHeader from '../../components/PageHeader';
import { ChevronRightIcon } from '../../components/icons';
import { usePolicies } from '../../hooks/my/useMy';
import { loadFailureMessage, loadingMessage } from '../../lib/messages';

export default function PoliciesPage() {
  const policiesQuery = usePolicies();
  const policies = policiesQuery.data?.policies ?? [];

  return (
    <div className="min-h-dvh w-full bg-gray-1">
      <PageHeader title="개인정보 및 약관" backTo="/my" />

      <main className="px-5 pt-5">
        {policiesQuery.isPending ? (
          <p className="typo-sub-2 text-gray-4">{loadingMessage('약관')}</p>
        ) : policiesQuery.isError ? (
          <p className="typo-sub-2 text-gray-4">{loadFailureMessage('약관')}</p>
        ) : (
          <ul className="rounded-btn bg-white px-5 py-4 shadow-card">
            {policies.map((policy, index) => (
              <li key={policy.type} className="flex flex-col gap-3">
                {index > 0 ? <span className="h-px bg-gray-2" /> : null}
                <a
                  href={policy.url}
                  target="_blank"
                  rel="noreferrer"
                  className="typo-body-3 flex min-h-5 items-center justify-between text-gray-5"
                >
                  <span>
                    {policy.title}
                    {policy.isRequired ? <span className="ml-1 text-primary">(필수)</span> : null}
                  </span>
                  <ChevronRightIcon />
                </a>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
