import { useState, useEffect, useRef } from "react";
import {
  listBranches,
  createBranch,
  isApiError,
  type Branch,
} from "../services/api";
import "./BranchFooter.css";

const DROPDOWN_MAX_HEIGHT = 320;
const VIEWPORT_PADDING = 8;

type BranchFooterProps = {
  repositoryId: string;
  currentBranchName: string;
  onBranchChange: (branchName: string) => void;
  userId: string;
  disabled?: boolean;
};

export function BranchFooter({
  repositoryId,
  currentBranchName,
  onBranchChange,
  userId,
  disabled,
}: BranchFooterProps) {
  const [open, setOpen] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [newBranchName, setNewBranchName] = useState("");
  const [sourceBranchId, setSourceBranchId] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    listBranches(repositoryId)
      .then((res) => {
        if (isApiError(res)) {
          setError(res.message);
          setBranches([]);
        } else {
          const list = res.data ?? [];
          setBranches(list);
          const current = list.find((b) => b.name === currentBranchName);
          setSourceBranchId(current?.id ?? list[0]?.id ?? "");
        }
      })
      .finally(() => setLoading(false));
  }, [open, repositoryId, currentBranchName]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const run = () => {
      const triggerEl = triggerRef.current;
      const dropdownEl = dropdownRef.current;
      if (!triggerEl || !dropdownEl) return;
      const trigger = triggerEl.getBoundingClientRect();
      const dropdownHeight = Math.min(dropdownEl.offsetHeight || DROPDOWN_MAX_HEIGHT, DROPDOWN_MAX_HEIGHT);
      const spaceAbove = trigger.top;
      const openAbove = spaceAbove >= dropdownHeight + VIEWPORT_PADDING;
      let left = trigger.left;
      const minWidth = 220;
      if (left + minWidth > window.innerWidth - VIEWPORT_PADDING) {
        left = window.innerWidth - minWidth - VIEWPORT_PADDING;
      }
      if (left < VIEWPORT_PADDING) left = VIEWPORT_PADDING;

      if (openAbove) {
        setDropdownStyle({
          position: "fixed",
          bottom: window.innerHeight - trigger.top + 6,
          left,
          minWidth: trigger.width,
          maxHeight: DROPDOWN_MAX_HEIGHT,
        });
      } else {
        setDropdownStyle({
          position: "fixed",
          top: trigger.bottom + 6,
          left,
          minWidth: trigger.width,
          maxHeight: Math.min(DROPDOWN_MAX_HEIGHT, window.innerHeight - trigger.bottom - VIEWPORT_PADDING),
        });
      }
    };
    const id = requestAnimationFrame(run);
    return () => cancelAnimationFrame(id);
  }, [open, branches.length, loading]);

  async function handleCreateBranch(e: React.FormEvent) {
    e.preventDefault();
    if (!newBranchName.trim() || creating) return;
    const sourceBranch = branches.find((b) => b.id === sourceBranchId);
    const headCommitId = sourceBranch?.headCommitId ?? undefined;
    setCreating(true);
    setError(null);
    const res = await createBranch(repositoryId, newBranchName.trim(), userId, headCommitId);
    setCreating(false);
    if (isApiError(res)) {
      setError(res.message);
      return;
    }
    setBranches((prev) => [...prev, res.data!]);
    setNewBranchName("");
    onBranchChange(res.data!.name);
    setOpen(false);
  }

  return (
    <div className="branch-footer" ref={ref}>
      <button
        ref={triggerRef}
        type="button"
        className="branch-trigger"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        title="Click to view branches"
      >
        <span className="branch-icon">⎇</span>
        <span className="branch-name">{currentBranchName || "main"}</span>
        <span className="branch-chevron">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div ref={dropdownRef} className="branch-dropdown branch-dropdown-fixed" style={dropdownStyle}>
          <div className="branch-dropdown-header">Branches</div>
          {loading ? (
            <div className="branch-dropdown-loading">Loading…</div>
          ) : (
            <ul className="branch-list">
              {branches.map((b) => (
                <li key={b.id}>
                  <button
                    type="button"
                    className={`branch-option ${b.name === currentBranchName ? "current" : ""}`}
                    onClick={() => {
                      onBranchChange(b.name);
                      setOpen(false);
                    }}
                  >
                    {b.name}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleCreateBranch} className="branch-create-form">
            <label className="branch-create-label">Source branch</label>
            <select
              className="branch-create-select"
              value={sourceBranchId}
              onChange={(e) => setSourceBranchId(e.target.value)}
              disabled={creating}
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <label className="branch-create-label">New branch name</label>
            <input
              type="text"
              placeholder="e.g. feature/my-feature"
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              disabled={creating}
            />
            <button type="submit" disabled={creating || !newBranchName.trim()}>
              {creating ? "Creating…" : "Create branch"}
            </button>
          </form>

          {error && <div className="branch-dropdown-error">{error}</div>}
        </div>
      )}
    </div>
  );
}
