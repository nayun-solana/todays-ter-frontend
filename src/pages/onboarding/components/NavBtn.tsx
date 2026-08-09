type Props = {
  isActive: boolean;
  onClick: () => void;
  title: string;
};

export default function NavBtn({ isActive, onClick, title }: Props) {
  return (
    <button
      className={`px-4 py-2 rounded-btn w-max shrink-0 border ${isActive ? 'border-primary bg-primary text-white typo-body-4' : 'border-gray-2 bg-white text-gray-4 typo-sub-2'}`}
      onClick={onClick}
    >
      {title}
    </button>
  );
}
