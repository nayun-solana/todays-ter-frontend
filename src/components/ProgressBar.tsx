interface ProgressBarProps {
  step: number;
  total: number;
}

export default function ProgressBar({ step, total }: ProgressBarProps) {
  const percent = total > 0 ? Math.min(100, Math.max(0, (step / total) * 100)) : 0;

  return (
    <div className="h-1.5 w-full rounded-full bg-gray-3">
      <div
        className="h-full rounded-full bg-primary transition-[width]"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
