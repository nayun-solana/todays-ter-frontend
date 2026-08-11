// assets
import waterIcon from '../../../assets/orb-water.png';
import woodIcon from '../../../assets/orb-wood.png';
import fireIcon from '../../../assets/orb-fire.png';
import earthIcon from '../../../assets/orb-earth.png';
import metalIcon from '../../../assets/orb-metal.png';

type Props = {
  element: string;
  type: 'primary' | 'complementary' | 'secondary';
  border?: string;
  textColor?: string;
};

export default function Orb({ element, type, border, textColor }: Props) {
  const getIcon = () => {
    switch (element) {
      case 'WATER':
        return waterIcon;
      case 'WOOD':
        return woodIcon;
      case 'FIRE':
        return fireIcon;
      case 'EARTH':
        return earthIcon;
      case 'METAL':
        return metalIcon;
    }
  };

  const backgroundColor = () => {
    switch (type) {
      case 'primary':
        return 'bg-primary border border-primary';
      case 'complementary':
        return `bg-white border ${border ? `${border}` : 'border-primary'}`;
      case 'secondary':
        return 'bg-primary border border-white ';
    }
  };

  const description = () => {
    switch (element) {
      case 'WATER':
        return '수';
      case 'WOOD':
        return '목';
      case 'FIRE':
        return '화';
      case 'EARTH':
        return '토';
      case 'METAL':
        return '금';
    }
  };
  const text =
    type === 'complementary' ? `${textColor ? `${textColor}` : 'text-primary'}` : 'text-white ';

  const title = type === 'complementary' ? '보완 할 오행' : '주 오행';

  return (
    <div
      className={`flex px-3 py-2 gap-1 rounded-btn w-fit items-center justify-center typo-body-4 ${backgroundColor()} ${text} '`}
    >
      <p>{title}</p>
      <p>:</p>
      <p>{description()}</p>
      <img src={getIcon()} alt={element} className="w-4 h-4" />
    </div>
  );
}
