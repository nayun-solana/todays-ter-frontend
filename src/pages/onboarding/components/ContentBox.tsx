type Type = 'TOP' | 'COLOR' | 'TEXT' | 'GENETAL' | 'CATEGORY';

type Props = {
  title?: string;
  children?: React.ReactNode;
  type: Type;
  ohangColor?: string;
  categoryColor?: string;
};

export default function ContentBox({ title, children, type, ohangColor, categoryColor }: Props) {
  return (
    <div
      className={`rounded-btn shadow-[0_2px_4px_0_rgba(0,0,0,0.10)] flex flex-col ${type === 'COLOR' ? 'bg-primary gap-3 p-5' : 'bg-white gap-4'} ${type == 'TOP' ? 'p-5' : 'p-4.5'} ${type === 'GENETAL' ? `border border-${ohangColor}` : ''} ${type === 'CATEGORY' ? `border border-${categoryColor}` : ''}`}
    >
      {type === 'TEXT' && (
        <>
          {title && <p className="typo-head-4 text-gray-6">{title}</p>}
          {children}
        </>
      )}
      {type === 'COLOR' && (
        <>
          <p className="typo-caption text-primary-light">핵심 요약</p>
          {children}
        </>
      )}
      {type === 'GENETAL' && <>{children}</>}
      {type === 'CATEGORY' && <>{children}</>}
      {type === 'TOP' && <>{children}</>}
    </div>
  );
}
