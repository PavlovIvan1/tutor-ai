"use client";

import { useState } from "react";

interface Result { columns: string[]; rows: Array<Record<string, unknown>>; total: number }

const QUICK = [
  "SELECT * FROM users ORDER BY id DESC LIMIT 20",
  "SELECT * FROM students ORDER BY id DESC LIMIT 20",
  "SELECT * FROM lessons ORDER BY id DESC LIMIT 20",
  "SELECT COUNT(*) users FROM users",
];

/** SQL-консоль (read-only): textarea + daisyUI table результат. */
export function AdminSql() {
  const [sql, setSql] = useState(QUICK[0]);
  const [res, setRes] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async (q?: string) => {
    setLoading(true); setError(null);
    try {
      const r = await fetch("/api/admin/query", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql: q ?? sql }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Ошибка SQL");
      setRes(data);
    } catch (e) { setError(e instanceof Error ? e.message : "Ошибка"); }
    finally { setLoading(false); }
  };

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        {QUICK.map((q) => (
          <button key={q} className="btn btn-xs btn-ghost border border-base-300"
            onClick={() => { setSql(q); run(q); }}>
            {q.slice(14, 48)}
          </button>
        ))}
      </div>
      <textarea
        className="textarea textarea-bordered font-mono text-sm h-24 w-full"
        value={sql}
        onChange={(e) => setSql(e.target.value)}
        placeholder="SELECT * FROM users;"
        onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) run(); }}
      />
      <div className="flex gap-3 items-center">
        <button className="btn btn-primary btn-sm" onClick={() => run()} disabled={loading}>
          {loading ? <span className="loading loading-dots loading-xs" /> : "Выполнить"}
        </button>
        <span className="text-xs text-base-content/50">⌘/Ctrl+Enter · только SELECT / PRAGMA</span>
      </div>
      {error && <div className="alert alert-error py-2 text-sm"><span>{error}</span></div>}
      {res && (
        <SqlTable res={res} />
      )}
    </div>
  );
}

function SqlTable({ res }: { res: Result }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100 shadow-sm">
      <div className="px-4 py-2 text-xs text-base-content/60">Строк: {res.total}</div>
      <table className="table table-xs table-zebra">
        <thead>
          <tr>{res.columns.map((c) => <th key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {res.rows.map((row, i) => (
            <tr key={i}>{res.columns.map((c) => (
              <td key={c} className="font-mono text-xs break-all max-w-64">
                {String(row[c] ?? "NULL")}
              </td>
            ))}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
