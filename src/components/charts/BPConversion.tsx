"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function BPConversion({
  data,
}: {
  data: Array<{ date: string; bpPct: number | null }>;
}) {
  const cleaned = data.filter((d) => d.bpPct !== null) as Array<{
    date: string;
    bpPct: number;
  }>;
  return (
    <div className="rounded-2xl p-4 bg-neutral-900 mb-4">
      <h2 className="text-lg font-medium mb-2">Break-Point Conversion %</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={cleaned}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Bar dataKey="bpPct" name="BP %" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
