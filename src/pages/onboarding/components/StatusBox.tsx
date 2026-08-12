// assets
import CheckIcon from '../../../assets/onboarding/check.svg';

type Props = {
  isSuccess: boolean;
  title: string;
  description: string;
  onClick?: () => void;
};

export default function StatusBox({ isSuccess, title, description, onClick }: Props) {
  const backgroundColor = isSuccess ? 'bg-white' : 'bg-transparent border border-white opacity-40';
  const textColor = isSuccess ? 'text-gray-6' : 'text-white';
  const descriptionColor = isSuccess ? 'text-gray-4' : 'text-white';

  return (
    <div
      className={`flex justify-between py-3 px-5 h-14.5 w-full items-center rounded-btn shadow-[0_1px_10px_0_rgba(0,0,0,0.10)] ${backgroundColor}`}
      onClick={onClick}
    >
      <div className="flex flex-col gap-1">
        <span className={`typo-body-4 ${textColor}`}>{title}</span>
        <span className={`text-[10px] font-normal ${descriptionColor}`}>{description}</span>
      </div>
      {isSuccess && <img src={CheckIcon} alt="check" className="w-5 h-5" />}
    </div>
  );
}
