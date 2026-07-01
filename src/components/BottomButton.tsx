type BottomButtonProps = {
  text: string;
  onClick: () => void;
  isAble?: boolean;
};

export default function BottomButton({ text, onClick, isAble }: BottomButtonProps) {
  return (
    <div className="flex  w-full items-center">
      <button
        type="button"
        onClick={onClick}
        disabled={!isAble}
        className={`w-full rounded-[20px] py-4 text-sm font-bold ${!isAble ? 'bg-[#E4E4E7] cursor-not-allowed text-[#71717A]' : 'bg-[#5A81FA] cursor-pointer text-[#FFFFFF]'}`}
      >
        {text}
      </button>
    </div>
  );
}
