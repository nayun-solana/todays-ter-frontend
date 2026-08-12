import { ohaengByCode } from '../../../lib/ohaeng';

type Type = 'TOP' | 'COLOR' | 'TEXT' | 'GENERAL' | 'CATEGORY' | 'ICON';

type Props = {
  title?: string;
  children?: React.ReactNode;
  type: Type;
  ohang?: string;
  category?: string;
  icon?: string;
};

export default function ContentBox({ title, children, type, ohang, category, icon }: Props) {
  const categoryColorList = [
    {
      value: 'GENERAL',
      borderColor: '',
      textColor: '',
    },
    {
      value: 'LOVE',
      borderColor: 'border-category-love',
      textColor: 'text-category-love',
    },
    {
      value: 'CAREER',
      borderColor: 'border-category-career',
      textColor: 'text-category-career',
    },
    {
      value: 'WEALTH',
      borderColor: 'border-category-wealth',
      textColor: 'text-category-wealth',
    },
    {
      value: 'RELATIONSHIP',
      borderColor: 'border-category-relationship',
      textColor: 'text-category-relationship',
    },
    {
      value: 'HEALTH',
      borderColor: 'border-category-health',
      textColor: 'text-category-health',
    },
  ] as const;
  const categoryColor = categoryColorList.find((item) => item.value === category);

  const ohangColor = ohaengByCode(ohang);

  return (
    <div
      className={`rounded-btn shadow-[0_2px_4px_0_rgba(0,0,0,0.10)] flex flex-col 
        ${type === 'COLOR' ? 'bg-primary gap-3 p-5' : 'bg-white gap-4'} 
        ${type == 'TOP' || type === 'ICON' ? 'p-5' : 'p-4.5'} 
        ${type === 'GENERAL' ? `border ${ohangColor?.border}` : ''} 
        ${type === 'CATEGORY' ? `border ${categoryColor?.borderColor}` : ''}`}
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
      {type === 'GENERAL' && <div className="flex flex-col gap-2.5">{children}</div>}
      {type === 'CATEGORY' && (
        <div className="flex flex-col gap-4">
          <p className={`typo-head-4 ${categoryColor?.textColor}`}>이 분석에서 드러난 핵심</p>
          {children}
        </div>
      )}
      {type === 'ICON' && (
        <>
          {icon && <img src={icon} alt="icon" className="w-6 h-6" />}
          <div className="flex flex-col gap-3">
            <p className="typo-caption text-gray-4">핵심 요약</p>
            {title && <p className="typo-head-4 text-primary">{title}</p>}
          </div>
        </>
      )}
      {type === 'TOP' && <>{children}</>}
    </div>
  );
}
