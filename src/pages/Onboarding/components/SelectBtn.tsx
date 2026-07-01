type SelectBtnProps = {
  img: string;
  onClick: () => void;
  isSelected: boolean;
  title: string;
  description: string;
};

export default function SelectBtn({
  img,
  onClick,
  isSelected = false,
  title,
  description,
}: SelectBtnProps) {
  return (
    <div
      className={`flex flex-col items-start gap-3 px-4 py-3 border rounded-[20px] cursor-pointer shadow-[0_2px_2px_0_rgba(0,0,0,0.10)] leading-none ${isSelected ? 'border-[#5A81FA]' : 'border-[#E4E4E7]'}`}
      onClick={onClick}
    >
      <div className="w-7.5 h-7.5 ">
        <img src={img} alt={title} />
      </div>
      <div className="flex flex-col gap-1.5 items-start">
        <p
          className={`text-[15px] font-extrabold ${isSelected ? 'text-[#5A81FA]' : 'text-[#71717A]'}`}
        >
          {title}
        </p>
        <p className="text-[10px] text-[#71717A] font-normal">{description}</p>
      </div>
    </div>
  );
}
