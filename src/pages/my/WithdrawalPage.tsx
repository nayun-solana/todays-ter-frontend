import { useState } from 'react';
import { useNavigate } from 'react-router';

import withdrawComplete from '../../assets/my/withdraw-complete.svg';
import withdrawWarning from '../../assets/my/withdraw-warning.svg';
import Button from '../../components/Button';
import PageHeader from '../../components/PageHeader';
import { ChevronDownIcon, CloseIcon } from '../../components/icons';
import { useWithdrawMember } from '../../hooks/my/useMy';
import { cn } from '../../lib/cn';
import { useAuthStore } from '../../stores/authStore';
import type { WithdrawReason } from '../../types/my/my';

const REASONS = [
  '사용 빈도가 낮아요',
  '추천이 잘 맞지 않아요',
  '개인정보가 걱정돼요',
  '원하는 기능이 부족해요',
  '앱 사용이 불편해요',
  '기타',
] as const;

const REASON_CODES: Record<(typeof REASONS)[number], WithdrawReason> = {
  '사용 빈도가 낮아요': 'LOW_USAGE',
  '추천이 잘 맞지 않아요': 'POOR_RECOMMENDATION',
  '개인정보가 걱정돼요': 'PRIVACY_CONCERN',
  '원하는 기능이 부족해요': 'MISSING_FEATURES',
  '앱 사용이 불편해요': 'INCONVENIENT_APP',
  기타: 'OTHER',
};

const DELETED_ITEMS = [
  '소셜 로그인 연동 정보',
  '생년월일시 및 사주 기본 정보',
  '생성한 사주 리포트, 저장한 터, 방문 기록',
  '작성한 후기 원문, 알림 및 계정 설정',
] as const;

const ANONYMIZED_ITEMS = [
  '장소별 후기 수와 평균 평점',
  '추천 정확도 개선을 위한 익명 이용 기록',
] as const;

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item} className="typo-sub-3 flex items-center gap-2 text-gray-5">
          <span className="size-0.5 shrink-0 rounded-full bg-gray-5" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function ConfirmDialog({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-[25px]">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="withdraw-confirm-title"
        className="w-full max-w-[324px] rounded-btn bg-white px-5 pt-[30px] pb-5 shadow-dialog"
      >
        <div className="text-center">
          <h2 id="withdraw-confirm-title" className="typo-head-2 text-gray-6">
            정말 탈퇴하시겠어요?
          </h2>
          <p className="typo-sub-2 mt-3 text-gray-6">
            삭제된 사주 리포트, 저장한 터, 방문 기록,
            <br />
            후기는 복구할 수 없습니다.
          </p>
        </div>
        <div className="mt-10 space-y-2">
          {/* Figma 2398:3610 — 돌아가기는 gray-3 채움 + 흰 글자(테두리 없음) */}
          <Button variant="neutral" onClick={onClose}>
            아니요, 돌아갈게요
          </Button>
          <Button onClick={onConfirm}>네, 탈퇴할게요</Button>
        </div>
      </section>
    </div>
  );
}

function WithdrawalCompletePage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-dvh w-full bg-white">
      <button
        type="button"
        onClick={() => navigate('/login')}
        aria-label="닫기"
        className="absolute top-[calc(1.25rem+env(safe-area-inset-top))] right-5 flex size-6 items-center justify-center text-gray-5"
      >
        <CloseIcon />
      </button>

      <main className="flex min-h-dvh -translate-y-[46px] flex-col items-center justify-center gap-8 text-center">
        <img src={withdrawComplete} alt="" className="size-10" />
        <div>
          <h1 className="typo-head-2 text-gray-6">탈퇴 신청이 완료됐어요</h1>
          <p className="typo-sub-2 mt-3 text-gray-6">
            오늘의 터를 이용해주셔서 감사합니다.
            <br />
            언제든 다시 돌아오실 수 있어요.
          </p>
          <p className="typo-sub-3 mt-2 text-primary">계정은 즉시 로그아웃됩니다.</p>
        </div>
      </main>

      <Button
        onClick={() => navigate('/login')}
        className="fixed bottom-[calc(1.875rem+env(safe-area-inset-bottom))] left-1/2 w-[calc(100%-40px)] max-w-[350px] -translate-x-1/2"
      >
        시작 화면으로 돌아가기
      </Button>
    </div>
  );
}

export default function WithdrawalPage() {
  const clearAccessToken = useAuthStore((state) => state.clearAccessToken);
  const withdrawMutation = useWithdrawMember();
  const [reason, setReason] = useState<(typeof REASONS)[number] | null>(null);
  const [reasonOpen, setReasonOpen] = useState(false);
  const [confirmedNotice, setConfirmedNotice] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [completed, setCompleted] = useState(false);

  if (completed) return <WithdrawalCompletePage />;

  return (
    <div className="min-h-dvh w-full bg-gray-1 pb-24">
      <PageHeader title="회원 탈퇴" backTo="/my" />

      <main className="px-5 pt-5">
        <section className="h-[150px] rounded-btn border border-gray-2 bg-white p-5 shadow-card-soft">
          <div className="flex size-6 items-center justify-center">
            <img src={withdrawWarning} alt="" className="h-[16.5px] w-[18.42px]" />
          </div>
          <div className="mt-3 text-gray-5">
            <h2 className="typo-head-4">탈퇴 전 꼭 확인해주세요</h2>
            <p className="typo-sub-2 mt-2">
              회원 탈퇴 시 오늘의 터에서 사용하던 계정 정보와 개인화 추천 기록이 삭제됩니다. 탈퇴
              후에는 기존 사주 리포트, 저장한 터, 방문 기록을 다시 확인할 수 없습니다.
            </p>
          </div>
        </section>

        <section className="mt-3 h-[230px] rounded-btn border border-gray-2 bg-white p-5 shadow-card-soft">
          <h2 className="typo-head-4 text-gray-5">삭제/비식별화 대상</h2>
          <div className="mt-3 space-y-3">
            <div>
              <h3 className="typo-body-4 text-ohaeng-fire">삭제되는 정보</h3>
              <div className="mt-2">
                <BulletList items={DELETED_ITEMS} />
              </div>
            </div>
            <div>
              <h3 className="typo-body-4 text-primary">비식별 처리될 수 있는 정보</h3>
              <div className="mt-2">
                <BulletList items={ANONYMIZED_ITEMS} />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5">
          <h2 className="typo-head-4 text-gray-6">탈퇴 사유</h2>
          <div className="relative mt-2 h-[52px]">
            <button
              type="button"
              aria-expanded={reasonOpen}
              onClick={() => setReasonOpen((open) => !open)}
              className="typo-body-3 flex h-[52px] w-full items-center justify-between rounded-btn bg-white px-5 text-gray-5 shadow-card"
            >
              {reason ?? '선택해주세요.'}
              <ChevronDownIcon className="text-gray-5" />
            </button>
            {reasonOpen ? (
              <div className="absolute inset-x-0 top-0 z-10 overflow-hidden rounded-btn border border-primary-light bg-gray-1 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <button
                  type="button"
                  onClick={() => setReasonOpen(false)}
                  className="typo-body-3 flex h-[52px] w-full items-center justify-between bg-white px-5 text-gray-5"
                >
                  {reason ?? '선택해주세요.'}
                  <ChevronDownIcon className="text-gray-5" />
                </button>
                <div className="max-h-36 overflow-y-auto [scrollbar-width:thin]">
                  {REASONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setReason(option);
                        setConfirmedNotice(false);
                        setReasonOpen(false);
                      }}
                      className={cn(
                        'typo-body-3 flex h-12 w-full items-center justify-center text-gray-5',
                        reason === option && 'mx-[7px] w-[calc(100%-14px)] rounded-btn bg-gray-2',
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {reason ? (
          <label className="typo-body-4 mt-3 flex cursor-pointer items-center gap-2 text-gray-4">
            <input
              type="checkbox"
              checked={confirmedNotice}
              onChange={(event) => setConfirmedNotice(event.target.checked)}
              className="sr-only"
            />
            <span className="flex size-[18px] shrink-0 items-center justify-center rounded-full border border-primary bg-white">
              {confirmedNotice ? <span className="size-3 rounded-full bg-primary" /> : null}
            </span>
            삭제 및 비식별화 대상과 복구 불가 안내를 확인했습니다.
          </label>
        ) : null}
      </main>

      <Button
        disabled={!reason || !confirmedNotice || withdrawMutation.isPending}
        onClick={() => setConfirmOpen(true)}
        className="fixed bottom-[calc(1.875rem+env(safe-area-inset-bottom))] left-1/2 w-[calc(100%-40px)] max-w-[350px] -translate-x-1/2"
      >
        탈퇴 신청하기
      </Button>

      {confirmOpen ? (
        <ConfirmDialog
          onClose={() => setConfirmOpen(false)}
          onConfirm={() => {
            if (!reason) return;

            withdrawMutation.mutate(
              { withdrawReason: REASON_CODES[reason] },
              {
                onSuccess: () => {
                  clearAccessToken();
                  setConfirmOpen(false);
                  setCompleted(true);
                },
              },
            );
          }}
        />
      ) : null}
      {withdrawMutation.isError ? (
        <p className="fixed right-5 bottom-2 left-5 text-center text-xs text-danger">
          탈퇴 처리에 실패했습니다. 잠시 후 다시 시도해주세요.
        </p>
      ) : null}
    </div>
  );
}
