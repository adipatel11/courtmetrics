"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

export default function FirstServePct({
  data,
}: {
  data: Array<{ date: string; pct: number }>;
}) {
  const avg = data.length
    ? data.reduce((a, b) => a + b.pct, 0) / data.length
    : 0;
  return (
    <div className="rounded-2xl p-4 bg-neutral-900 mb-4">
      <h2 className="text-lg font-medium mb-2">First-Serve % over time</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <ReferenceLine y={avg} strokeDasharray="4 4" />
          <Line type="monotone" dataKey="pct" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
