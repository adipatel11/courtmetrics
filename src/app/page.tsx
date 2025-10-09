// app/page.tsx
"use client";
import Papa from "papaparse";
import { useState } from "react";

export default function Home() {
  const [rows, setRows] = useState<any[]>([]);
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Tennis Stats Visualizer</h1>
      <input
        type="file"
        accept=".csv"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => setRows(results.data as any[]),
          });
        }}
        className="block"
      />
      <pre className="text-xs bg-neutral-900 p-3 rounded">
        {JSON.stringify(rows.slice(0, 3), null, 2)}
      </pre>
    </div>
  );
}
