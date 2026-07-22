type Props = {
  title?: string;
  children?: React.ReactNode;
};

export default function ContentBox({ title, children }: Props) {
  return (
    <div className="rounded-btn bg-white shadow-[0_2px_4px_0_rgba(0,0,0,0.10)] flex flex-col gap-4 p-5">
      {/* Head 4 */}
      {title && <p className="text-sm font-extrabold text-gray-6">{title}</p>}
      {children}
    </div>
  );
}
