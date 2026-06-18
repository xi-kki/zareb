interface ScoreGaugeProps {
  score: number;
  size?: "sm" | "lg";
}

export default function ScoreGauge({ score, size = "lg" }: ScoreGaugeProps) {
  const radius = size === "lg" ? 70 : 50;
  const stroke = size === "lg" ? 12 : 8;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const color = score >= 80 ? "#16A34A" : score >= 50 ? "#D97706" : "#DC2626";
  const label = score >= 80 ? "Good" : score >= 50 ? "Needs Work" : "At Risk";

  return (
    <div className="card flex flex-col items-center justify-center py-4">
      <div className="relative">
      <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
        <circle
          stroke="#F3F4F6"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-bold ${size === "lg" ? "text-4xl" : "text-2xl"}`} style={{ color }}>
          {score}
        </span>
        <span className="text-xs text-[#6B7280]">/100</span>
      </div>
      </div>
      <div className="mt-2 text-center">
        <span
          className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
          style={{
            backgroundColor: score >= 80 ? "#F0FDF4" : score >= 50 ? "#FFFBEB" : "#FEF2F2",
            color,
          }}
        >
          {label}
        </span>
        <p className="text-[10px] text-[#6B7280] mt-1">Compliance Score</p>
      </div>
    </div>
  );
}
