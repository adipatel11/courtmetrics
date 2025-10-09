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

export default function AcesVsDF({
  data,
}: {
  data: Array<{ date: string; aces: number; doubleFaults: number }>;
}) {
  return (
    <div className="rounded-2xl p-4 bg-neutral-900 mb-4">
      <h2 className="text-lg font-medium mb-2">Aces vs Double Faults</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="aces" name="Aces" />
          <Bar dataKey="doubleFaults" name="Double Faults" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
