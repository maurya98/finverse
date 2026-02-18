import { useState, useCallback, useEffect } from "react";
import {
  getPendingState,
  setPendingChanges,
  setPendingState,
  clearPendingChanges as clearPendingStorage,
  addPendingChange as addPendingChangeStorage,
  type PendingChange,
} from "../utils/pendingChanges";

export function usePendingChanges(
  repositoryId: string | null,
  branchName: string | null
) {
  const [pending, setPending] = useState<PendingChange[]>([]);
  const [deletedPaths, setDeletedPaths] = useState<string[]>([]);
  const [storageQuotaExceeded, setStorageQuotaExceeded] = useState(false);

  useEffect(() => {
    if (!repositoryId || !branchName) {
      setPending([]);
      setDeletedPaths([]);
      setStorageQuotaExceeded(false);
      return;
    }
    const state = getPendingState(repositoryId, branchName);
    setPending(state.pending);
    setDeletedPaths(state.deletedPaths);
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
      setPending(changes);
      if (!repositoryId || !branchName) return;
      const ok = setPendingState(repositoryId, branchName, { pending: changes, deletedPaths });
      setStorageQuotaExceeded(!ok);
    },
    [repositoryId, branchName, deletedPaths]
  );

  const replacePendingAndDeleted = useCallback(
    (changes: PendingChange[], newDeletedPaths: string[]) => {
      setPending(changes);
      setDeletedPaths(newDeletedPaths);
      if (!repositoryId || !branchName) return;
      const ok = setPendingState(repositoryId, branchName, { pending: changes, deletedPaths: newDeletedPaths });
      setStorageQuotaExceeded(!ok);
    },
    [repositoryId, branchName]
  );

  const clearPending = useCallback(() => {
    if (!repositoryId || !branchName) return;
    clearPendingStorage(repositoryId, branchName);
    setPending([]);
    setDeletedPaths([]);
    setStorageQuotaExceeded(false);
  }, [repositoryId, branchName]);

  const clearStorageQuotaError = useCallback(() => {
    setStorageQuotaExceeded(false);
  }, []);

  const hasPending = pending.length > 0 || deletedPaths.length > 0;

  return {
    pending,
    deletedPaths,
    addPending,
    replacePending,
    replacePendingAndDeleted,
    clearPending,
    hasPending,
    storageQuotaExceeded,
    clearStorageQuotaError,
  };
}
