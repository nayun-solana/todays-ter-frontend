import { useParams } from 'react-router';

export default function PlaceDetailPage() {
  const { id } = useParams();
  return <div className="p-5">장소 상세 · id={id} (준비 중)</div>;
}
