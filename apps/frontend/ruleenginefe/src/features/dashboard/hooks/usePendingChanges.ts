import { useState, useCallback, useEffect } from "react";
import {
  getPendingChanges,
  setPendingChanges,
  clearPendingChanges as clearPendingStorage,
  addPendingChange as addPendingChangeStorage,
  type PendingChange,
} from "../utils/pendingChanges";

export function usePendingChanges(
  repositoryId: string | null,
  branchName: string | null
) {
  const [pending, setPending] = useState<PendingChange[]>([]);
  const [storageQuotaExceeded, setStorageQuotaExceeded] = useState(false);

  useEffect(() => {
    if (!repositoryId || !branchName) {
      setPending([]);
      setStorageQuotaExceeded(false);
      return;
    }
    setPending(getPendingChanges(repositoryId, branchName));
    setStorageQuotaExceeded(false);
  }, [repositoryId, branchName]);

  const addPending = useCallback(
    (change: PendingChange) => {
      if (!repositoryId || !branchName) return;
      const [next, ok] = addPendingChangeStorage(repositoryId, branchName, change);
      setPending(next);
      setStorageQuotaExceeded(!ok);
    },
    [repositoryId, branchName]
  );

  const replacePending = useCallback(
    (changes: PendingChange[]) => {
      if (!repositoryId || !branchName) return;
      const ok = setPendingChanges(repositoryId, branchName, changes);
      setPending(changes);
      setStorageQuotaExceeded(!ok);
    },
    [repositoryId, branchName]
  );

  const clearPending = useCallback(() => {
    if (!repositoryId || !branchName) return;
    clearPendingStorage(repositoryId, branchName);
    setPending([]);
    setStorageQuotaExceeded(false);
  }, [repositoryId, branchName]);

  const clearStorageQuotaError = useCallback(() => {
    setStorageQuotaExceeded(false);
  }, []);

  const hasPending = pending.length > 0;

  return {
    pending,
    addPending,
    replacePending,
    clearPending,
    hasPending,
    storageQuotaExceeded,
    clearStorageQuotaError,
  };
}
