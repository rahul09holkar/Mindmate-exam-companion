"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { TrendPoint } from "@/lib/utils/analytics";

type WeeklyTrendChartProps = {
  data: TrendPoint[];
  /** Which numeric series to plot. */
  dataKey: "mood" | "stress" | "energy" | "studyPressure";
  title: string;
  /** Y-axis upper bound (mood is 5, the 1–10 levels are 10). */
  max: 5 | 10;
  /** Stroke colour — paired with the title text, never the sole meaning. */
  color: string;
  /** Optional mapper to turn a value into a readable word (e.g. mood labels). */
  formatValue?: (value: number) => string;
};

/**
 * A small, mobile-friendly line chart with an accessible text alternative.
 * The SVG is hidden from assistive tech (aria-hidden); a visually-hidden
 * summary + data list conveys the same information without relying on colour.
 */
export function WeeklyTrendChart({
  data,
  dataKey,
  title,
  max,
  color,
  formatValue,
}: WeeklyTrendChartProps) {
  const describe = (v: number) => (formatValue ? formatValue(v) : `${v}`);
  const last = data[data.length - 1];

  return (
    <figure className="m-0">
      <figcaption className="mb-2 font-medium text-ink">{title}</figcaption>

      {/* Screen-reader alternative to the visual chart */}
      <p className="sr-only">
        {title}. {data.length} data points.{" "}
        {last ? `Most recent: ${describe(last[dataKey])}.` : "No data yet."}
      </p>
      <ul className="sr-only">
        {data.map((p) => (
          <li key={p.date}>
            {p.label}: {describe(p[dataKey])}
          </li>
        ))}
      </ul>

      <div aria-hidden="true" className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
            <CartesianGrid stroke="#e4e7eb" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "#7b8794" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[max === 5 ? 1 : 0, max]}
              tick={{ fontSize: 12, fill: "#7b8794" }}
              tickLine={false}
              axisLine={false}
              width={40}
              allowDecimals={false}
            />
            <Tooltip
              formatter={(value: number) => describe(value)}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e4e7eb",
                fontSize: 13,
              }}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2.5}
              dot={{ r: 3, fill: color }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
