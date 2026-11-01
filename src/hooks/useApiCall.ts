"use client";

import { useCallback, useState } from "react";

/**
 * Переиспользуемый обёрточный fetch-хук: единая обработка ошибок
 * и статуса для всех запросов клиента (без дублирования логики).
 */
export function useApiCall<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (...args: TArgs): Promise<TResult | null> => {
      setLoading(true);
      setError(null);
      try {
        return await fn(...args);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Ошибка запроса");
        return null;
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return { run, loading, error, setError };
}
