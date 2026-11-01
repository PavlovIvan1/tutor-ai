"use client";

import { useEffect, useState } from "react";

interface UserRow {
  id: number; email: string; name: string; created_at: string;
  students: number; lessons: number; viaYandex: boolean;
}

interface Confirm {
  row: UserRow | null;
}

/** Таблица пользователей + удаление (SQL-admin style, daisyUI table). */
export function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<Confirm>({ row: null });

  const load = () =>
    fetch("/api/admin/users")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setUsers(Array.isArray(d) ? d : []))
      .catch(() => {});
  useEffect(() => { load(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, []);

  const remove = async (u: UserRow) => {
    setConfirm({ row: null });
    const res = await fetch(`/api/admin/users?id=${u.id}`, { method: "DELETE" });
    setMsg(res.ok ? `Удалено: ${u.email}` : "Не удалось удалить");
    load();
  };

  return (
    <div className="grid gap-4">
      {msg && <div className="alert alert-success py-2 text-sm"><span>{msg}</span></div>}
      <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100 shadow-sm">
        <table className="table table-sm">
          <thead>
            <tr>
              <th>#</th><th>Имя</th><th>Email</th><th>Ученики</th><th>Уроки</th><th>Создан</th><th>Источник</th><th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-base-200">
                <td>{u.id}</td>
                <td className="font-medium">{u.name}</td>
                <td className="text-base-content/70">{u.email}</td>
                <td>{u.students}</td>
                <td>{u.lessons}</td>
                <td className="text-base-content/60">{u.created_at.slice(0, 10)}</td>
                <td>{u.viaYandex ? <span className="badge badge-info badge-sm">Яндекс</span> : <span className="badge badge-ghost badge-sm">Email</span>}</td>
                <td className="text-right">
                  <button className="btn btn-error btn-xs" onClick={() => setConfirm({ row: u })}>Удалить</button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={8} className="py-6 text-center text-base-content/60">Пока нет пользователей</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {confirm.row && (
        <div className="sm:max-w-md">
          <div className="alert alert-error text-sm">
            <span>Удалить {confirm.row.email} со всеми учениками и уроками?</span>
            <div className="flex gap-2">
              <button className="btn btn-xs" onClick={() => setConfirm({ row: null })}>Отмена</button>
              <button className="btn btn-error btn-xs" onClick={() => remove(confirm.row!)}>Да, удалить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
