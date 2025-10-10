import Papa from "papaparse";
import { MatchRow } from "./types";

export function parseCsv(file: File): Promise<MatchRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<MatchRow>(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (res) => resolve(res.data as MatchRow[]),
      error: (err) => reject(err),
    });
  });
}

export async function parseCsvText<T = MatchRow>(text: string): Promise<T[]> {
  const res = Papa.parse<T>(text, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });
  return res.data as T[];
}
