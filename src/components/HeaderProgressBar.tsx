type HeaderProgressBarProps = {
  step: number;
};

export default function HeaderProgressBar({ step }: HeaderProgressBarProps) {
  const progressPercentage = 100 / 3;

  return (
    <div className="w-full flex gap-0.75 items-center justify-between h-1 mt-3.75">
      {[1, 2, 3].map((currentStep) => (
        <div
          key={currentStep}
          className={`h-2 rounded-full transition-all duration-300 ${
            currentStep <= step - 1 ? 'bg-blue-500' : 'bg-gray-300'
          }`}
          style={{ width: `${progressPercentage}%` }}
        ></div>
      ))}
    </div>
  );
}
