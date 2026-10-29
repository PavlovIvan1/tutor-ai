"use client";

import { useEffect, useState } from "react";

/** Проверяет админ-сессию статуса /api/admin/stats (401 = не админ). */
export function useAdminSession(): { checked: boolean; isAdmin: boolean; refresh: () => void } {
  const [checked, setChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setChecked(false);
    fetch("/api/admin/stats")
      .then((r) => { setIsAdmin(r.ok); return r.ok; })
      .catch(() => setIsAdmin(false))
      .finally(() => setChecked(true));
  }, [tick]);

  return { checked, isAdmin, refresh: () => setTick((t) => t + 1) };
}
