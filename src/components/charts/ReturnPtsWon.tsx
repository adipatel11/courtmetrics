"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ReturnPtsWon({
  data,
}: {
  data: Array<{ date: string; pct: number | null }>;
}) {
  const cleaned = data.filter((d) => d.pct !== null) as Array<{
    date: string;
    pct: number;
  }>;
  return (
    <div className="rounded-2xl p-4 bg-neutral-900 mb-4">
      <h2 className="text-lg font-medium mb-2">Return Points Won %</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={cleaned}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Line type="monotone" dataKey="pct" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
