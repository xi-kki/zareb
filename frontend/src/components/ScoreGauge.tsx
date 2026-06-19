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

  const color = score >= 80 ? "#059669" : score >= 50 ? "#d97706" : "#dc2626";
  const bgCircle = "#e7e5e4";
  const label = score >= 80 ? "Good" : score >= 50 ? "Needs Work" : "At Risk";
  const badgeBg = score >= 80 ? "#ecfdf5" : score >= 50 ? "#fffbeb" : "#fef2f2";

  return (
    <div className="flex flex-col items-center justify-center py-2">
      <div className="relative">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          <circle
            stroke={bgCircle}
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
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-display font-bold ${size === "lg" ? "text-4xl" : "text-2xl"}`} style={{ color }}>
            {score}
          </span>
          <span className="text-xs text-stone-400">/100</span>
        </div>
      </div>
      <div className="mt-3 text-center">
        <span
          className="inline-block px-3 py-1 rounded-pill text-xs font-semibold"
          style={{ backgroundColor: badgeBg, color }}
        >
          {label}
        </span>
        <p className="text-[10px] text-stone-400 mt-1">Compliance Score</p>
      </div>
    </div>
  );
}
