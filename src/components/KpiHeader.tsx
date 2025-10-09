"use client";
import { Kpis } from "@/lib/types";

const Item = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl bg-neutral-900 px-4 py-3">
    <div className="text-xs text-neutral-400">{label}</div>
    <div className="text-xl font-semibold">{value}</div>
  </div>
);

export default function KpiHeader({ k }: { k: Kpis }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 my-4">
      <Item label="First-Serve %" value={`${k.firstServePct.toFixed(1)}%`} />
      <Item
        label="1st-Serve Pts Won %"
        value={`${k.firstServePtsWonPct.toFixed(1)}%`}
      />
      <Item
        label="2nd-Serve Pts Won %"
        value={`${k.secondServePtsWonPct.toFixed(1)}%`}
      />
      <Item
        label="BP Conversion %"
        value={
          k.bpConversionPct !== null ? `${k.bpConversionPct.toFixed(1)}%` : "—"
        }
      />
      <Item
        label="Return Pts Won %"
        value={
          k.returnPtsWonPct !== null ? `${k.returnPtsWonPct.toFixed(1)}%` : "—"
        }
      />
      <Item
        label="W/UE Ratio"
        value={k.wueRatio !== null ? `${k.wueRatio.toFixed(2)}` : "—"}
      />
      <Item
        label="Win Rate"
        value={k.winRatePct !== null ? `${k.winRatePct.toFixed(1)}%` : "—"}
      />
    </div>
  );
}
