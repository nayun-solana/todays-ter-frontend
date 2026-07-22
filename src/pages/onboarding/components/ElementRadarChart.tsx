import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';

type ElementCode = 'WOOD' | 'FIRE' | 'EARTH' | 'METAL' | 'WATER';

type DistributionItem = {
  code: ElementCode;
  percentage: number;
};

type ElementAnalysis = {
  summary: string;
  primaryElements: ElementCode[];
  complementaryElements: ElementCode[];
  distribution: DistributionItem[];
};

type Props = {
  elementAnalysis: ElementAnalysis;
};

type TickProps = {
  x?: number | string;
  y?: number | string;
  cx?: number | string;
  cy?: number | string;
  payload?: {
    value: string;
  };
};

const ELEMENT_LABEL: Record<ElementCode, string> = {
  WOOD: '목',
  FIRE: '화',
  EARTH: '토',
  METAL: '금',
  WATER: '수',
};

const ELEMENT_ORDER: ElementCode[] = ['WOOD', 'FIRE', 'EARTH', 'METAL', 'WATER'];

function ElementTick({
  x = 0,
  y = 0,
  cx = 0,
  cy = 0,
  payload,
  primaryLabels,
}: TickProps & {
  primaryLabels: Set<string>;
}) {
  if (!payload?.value) return null;

  const numericX = Number(x);
  const numericY = Number(y);
  const numericCx = Number(cx);
  const numericCy = Number(cy);

  const label = payload.value;
  const isPrimary = primaryLabels.has(label);

  // 그래프 중심에서 라벨 방향으로 향하는 벡터
  const directionX = numericX - numericCx;
  const directionY = numericY - numericCy;
  const distance = Math.hypot(directionX, directionY);

  // 그래프 바깥쪽으로 6px 이동
  const labelOffset = 6;

  const labelX = numericX + (distance === 0 ? 0 : (directionX / distance) * labelOffset);

  const labelY = numericY + (distance === 0 ? 0 : (directionY / distance) * labelOffset);

  const textAnchor = directionX > 5 ? 'start' : directionX < -5 ? 'end' : 'middle';

  return (
    <text
      x={labelX}
      y={labelY}
      textAnchor={textAnchor}
      dominantBaseline="middle"
      fill={isPrimary ? '#5A81FA' : '#C4C4C4'}
      fontSize={10}
      fontWeight={700}
    >
      {label}
    </text>
  );
}

export default function ElementRadarChart({ elementAnalysis }: Props) {
  const { distribution, primaryElements } = elementAnalysis;

  const chartData = ELEMENT_ORDER.map((code) => {
    const matchedItem = distribution.find((item) => item.code === code);

    return {
      code,
      label: ELEMENT_LABEL[code],
      value: matchedItem?.percentage ?? 0,
    };
  });

  const primaryLabels = new Set(primaryElements.map((code) => ELEMENT_LABEL[code]));

  return (
    <div className="aspect-square w-full max-w-[180px] shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart
          data={chartData}
          cx="50%"
          cy="50%"
          outerRadius="72%"
          startAngle={90}
          endAngle={-270}
          margin={{
            top: 10,
            right: 14,
            bottom: 10,
            left: 14,
          }}
        >
          <PolarGrid gridType="polygon" stroke="#F1F4FF" strokeWidth={1} />

          <PolarAngleAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={(props) => <ElementTick {...props} primaryLabels={primaryLabels} />}
          />

          <PolarRadiusAxis domain={[0, 30]} tickCount={6} tick={false} axisLine={false} />

          <Radar
            dataKey="value"
            stroke="#5B7FFF"
            strokeWidth={1.5}
            fill="#5B7FFF"
            fillOpacity={0.18}
            dot={false}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
