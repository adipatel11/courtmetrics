"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function ServePointsWon({
  data,
}: {
  data: Array<{ date: string; first: number; second: number }>;
}) {
  return (
    <div className="rounded-2xl p-4 bg-neutral-900 mb-4">
      <h2 className="text-lg font-medium mb-2">Serve Points Won %</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Bar dataKey="first" name="1st Serve %" />
          <Bar dataKey="second" name="2nd Serve %" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
