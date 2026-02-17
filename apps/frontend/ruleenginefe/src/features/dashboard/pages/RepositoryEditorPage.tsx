import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { getUser } from "../../auth/services/auth";
import {
  getRepository,
  getBlob,
  isApiError,
} from "../services/api";
import { getDecisionsMapForSimulation } from "../utils/simulationState";
import { useBranchTree, type FileTreeNode } from "../hooks/useBranchTree";
import { usePendingChanges } from "../hooks/usePendingChanges";
import { mergeTreeWithPending, getPendingContent } from "../utils/mergeTreeWithPending";
import { commitPendingChanges } from "../utils/commitPendingChanges";
import { FileTreeSidebar } from "../components/FileTreeSidebar";
import { EditorArea } from "../components/EditorArea";
import { BranchFooter } from "../components/BranchFooter";
import { CommitMessageModal } from "../components/CommitMessageModal";
import { NameInputModal } from "../components/NameInputModal";
import { ThemePicker } from "../../../components/ThemePicker";
import "./RepositoryEditorPage.css";

export function RepositoryEditorPage() {
  const { repositoryId } = useParams<{ repositoryId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = getUser();
  const branchName = searchParams.get("branch") || "main";

  const [repo, setRepo] = useState<{ id: string; name: string } | null>(null);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState("");
  const [editorDirty, setEditorDirty] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [createModal, setCreateModal] = useState<
    { type: "file" | "folder"; parentFolder: FileTreeNode | null } | null
  >(null);
  const [commitModalOpen, setCommitModalOpen] = useState(false);
  const [commitError, setCommitError] = useState<string | null>(null);
  const [isCommitting, setIsCommitting] = useState(false);

  const sidebarStorageKey = "repo-editor-sidebar-open";
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const stored = localStorage.getItem(sidebarStorageKey);
    return stored === null ? true : stored === "true";
  });
  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem(sidebarStorageKey, String(next));
      return next;
    });
  }, []);

  const { tree, loading, error, reloadFromCommitId } = useBranchTree(
    repositoryId ?? null,
    branchName
  );
  const {
    pending,
    addPending,
    replacePending,
    clearPending,
    hasPending,
    storageQuotaExceeded,
    clearStorageQuotaError,
  } = usePendingChanges(repositoryId ?? null, branchName);

  const displayTree = useMemo(
    () => mergeTreeWithPending(tree, pending),
    [tree, pending]
  );

  useEffect(() => {
    if (!repositoryId) return;
    getRepository(repositoryId).then((res) => {
      if (isApiError(res)) return;
      if (res.data) setRepo({ id: res.data.id, name: res.data.name });
    });
  }, [repositoryId]);

  const loadFile = useCallback(
    async (
      path: string,
      blobId: string | null,
      _entryId?: string,
      _parentTreeId?: string,
      contentOverride?: unknown
    ) => {
      setSelectedPath(path);
      setEditorDirty(false);
      setEditorContent("");
      const pendingContent = getPendingContent(path, pending);
      const content = contentOverride ?? pendingContent;
      if (content !== undefined) {
        setEditorContent(
          typeof content === "string" ? content : JSON.stringify(content, null, 2)
        );
        return;
      }
      if (!blobId) {
        setEditorContent("");
        return;
      }
      const res = await getBlob(blobId);
      if (isApiError(res) || !res.data) {
        setEditorContent("");
        return;
      }
      const blobContent = res.data.content;
      setEditorContent(
        typeof blobContent === "string"
          ? blobContent
          : JSON.stringify(blobContent, null, 2)
      );
    },
    [pending]
  );

  function handleSelectFile(path: string, blobId: string | null) {
    const node = findNodeByPath(displayTree, path);
    loadFile(path, blobId, node?.id, node?.parentTreeId);
  }

  function findNodeByPath(
    nodes: FileTreeNode[],
    path: string
  ): { id: string; parentTreeId?: string } | null {
    for (const n of nodes) {
      if (n.path === path) return { id: n.id, parentTreeId: n.parentTreeId };
      if (n.children?.length) {
        const found = findNodeByPath(n.children, path);
        if (found) return found;
      }
    }
    return null;
  }

  function handleSave() {
    if (!selectedPath) return;
    setSaveError(null);
    let content: unknown;
    try {
      content = JSON.parse(editorContent);
    } catch {
      content = editorContent;
    }
    const filtered = pending.filter(
      (c) =>
        !(c.op === "add" && c.path === selectedPath) &&
        !(c.op === "edit" && c.path === selectedPath)
    );
    const isNewFile = pending.some(
      (c) => c.op === "add" && c.type === "file" && c.path === selectedPath
    );
    const newChange =
      isNewFile
        ? { op: "add" as const, path: selectedPath, type: "file" as const, content }
        : { op: "edit" as const, path: selectedPath, content };
    replacePending([...filtered, newChange]);
    setEditorDirty(false);
    setSaveError(null);
  }

  async function handleCommit(message: string) {
    if (!repositoryId || !user?.id) return;
    if (!hasPending) {
      setCommitError("No changes to commit");
      return;
    }
    setCommitError(null);
    setIsCommitting(true);
    try {
      const result = await commitPendingChanges(
        repositoryId,
        branchName,
        user.id,
        message,
        tree,
        pending
      );
      if (!result.success) {
        setCommitError(result.message);
        return;
      }
      setCommitModalOpen(false);
      clearPending();
      await reloadFromCommitId(result.commitId);
    } finally {
      setIsCommitting(false);
    }
  }

  /** Unique initial content so each new file gets its own blob (backend deduplicates by content hash). */
  function getInitialContentForNewFile(fileName: string): unknown {
    if (fileName.toLowerCase().endsWith(".json")) {
      return { nodes: [], edges: [], __newFileId: crypto.randomUUID() };
    }
    return "";
  }

  function handleCreateFileWithName(name: string, parentFolder: FileTreeNode | null) {
    if (!repositoryId) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    const path = parentFolder ? `${parentFolder.path}/${trimmed}` : trimmed;
    const initialContent = getInitialContentForNewFile(trimmed);
    addPending({ op: "add", path, type: "file", content: initialContent });
    loadFile(path, null, undefined, undefined, initialContent);
  }

  function handleCreateFolderWithName(name: string, parentFolder: FileTreeNode | null) {
    if (!repositoryId) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    const path = parentFolder ? `${parentFolder.path}/${trimmed}` : trimmed;
    addPending({ op: "add", path, type: "folder" });
  }

  function handleBranchChange(newBranch: string) {
    setSearchParams({ branch: newBranch });
    setSelectedPath(null);
    setEditorContent("");
    setEditorDirty(false);
  }

  function handleDeleteNode(node: FileTreeNode) {
    addPending({ op: "delete", path: node.path });
    if (
      selectedPath === node.path ||
      (node.type === "folder" && selectedPath?.startsWith(node.path + "/"))
    ) {
      setSelectedPath(null);
      setEditorContent("");
      setEditorDirty(false);
    }
  }

  function handleMoveNode(draggedNode: FileTreeNode, targetFolder: FileTreeNode) {
    const newPath = targetFolder.path
      ? `${targetFolder.path}/${draggedNode.name}`
      : draggedNode.name;
    if (newPath === draggedNode.path) return;
    addPending({ op: "move", path: draggedNode.path, newPath });
  }

  const language = selectedPath?.endsWith(".json") ? "json" : "plaintext";

  const getDecisionsForSimulation = useCallback(async () => {
    return getDecisionsMapForSimulation(displayTree, pending, getBlob);
  }, [displayTree, pending]);

  const decisionKeyOptions = useMemo(() => {
    function collectJsonPaths(nodes: FileTreeNode[], excludePath: string | null): string[] {
      const paths: string[] = [];
      for (const n of nodes) {
        if (n.type === "file" && n.name.toLowerCase().endsWith(".json") && n.path !== excludePath) {
          paths.push(n.path);
        }
        if (n.children?.length) {
          paths.push(...collectJsonPaths(n.children, excludePath));
        }
      }
      return paths.sort((a, b) => a.localeCompare(b));
    }
    return collectJsonPaths(displayTree, selectedPath);
  }, [displayTree, selectedPath]);

  if (!repo) {
    return (
      <div className="repo-editor-page">
        <div className="repo-editor-loading">Loading repository…</div>
      </div>
    );
  }

  return (
    <div className="repo-editor-page">
      <header className="repo-editor-header">
        <button
          type="button"
          className="repo-editor-back"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>
        <button
          type="button"
          className="repo-editor-sidebar-toggle"
          onClick={toggleSidebar}
          title={sidebarOpen ? "Hide file explorer" : "Show file explorer"}
          aria-label={sidebarOpen ? "Hide file explorer" : "Show file explorer"}
        >
          {sidebarOpen ? "◀" : "▶"}
        </button>
        <h1 className="repo-editor-title">{repo.name}</h1>
        <ThemePicker />
      </header>

      <div className={`repo-editor-body ${sidebarOpen ? "" : "repo-editor-sidebar-hidden"}`}>
        <div className="repo-editor-sidebar-wrap">
          <FileTreeSidebar
            nodes={displayTree}
            loading={loading}
            selectedPath={selectedPath}
            onSelectFile={handleSelectFile}
            onDeleteNode={handleDeleteNode}
            onMoveNode={handleMoveNode}
            onNewFile={(parentFolder) => setCreateModal({ type: "file", parentFolder })}
            onNewFolder={(parentFolder) => setCreateModal({ type: "folder", parentFolder })}
            repoName={repo.name}
          />
        </div>
        {!sidebarOpen && (
          <button
            type="button"
            className="repo-editor-sidebar-show-btn"
            onClick={toggleSidebar}
            title="Show file explorer"
            aria-label="Show file explorer"
          >
            ▶
          </button>
        )}
        <EditorArea
          key={selectedPath ?? "none"}
          fileName={selectedPath ? selectedPath.split("/").pop() ?? null : null}
          content={editorContent}
          language={language}
          onChange={(v) => {
            setEditorContent(v);
            setEditorDirty(true);
          }}
          onSave={handleSave}
          dirty={editorDirty}
          decisionKeyOptions={decisionKeyOptions}
          repositoryId={repo.id}
          branch={branchName}
          getDecisionsForSimulation={getDecisionsForSimulation}
        />
      </div>

      <footer className="repo-editor-footer">
        <div className="repo-editor-footer-actions">
          <button type="button" className="footer-btn" onClick={() => setCreateModal({ type: "file", parentFolder: null })}>
            New file
          </button>
          <button type="button" className="footer-btn" onClick={() => setCreateModal({ type: "folder", parentFolder: null })}>
            New folder
          </button>
          <button
            type="button"
            className="footer-btn footer-btn-commit"
            onClick={() => {
              setCommitError(null);
              setCommitModalOpen(true);
            }}
            disabled={!hasPending}
            title={!hasPending ? "No changes to commit" : "Commit all changes"}
          >
            Commit
          </button>
          <button
            type="button"
            className="footer-btn"
            onClick={() => navigate(`/dashboard/repo/${repo.id}/branches?branch=${encodeURIComponent(branchName)}`)}
          >
            Branches
          </button>
        </div>
        <BranchFooter
          repositoryId={repo.id}
          currentBranchName={branchName}
          onBranchChange={handleBranchChange}
          userId={user?.id ?? ""}
        />
      </footer>

      {createModal && (
        <NameInputModal
          title={createModal.type === "file" ? "New file" : "New folder"}
          placeholder={createModal.type === "file" ? "e.g. rules.json" : "Folder name"}
          submitLabel="Create"
          onConfirm={(name) => {
            if (createModal.type === "file") {
              handleCreateFileWithName(name, createModal.parentFolder);
            } else {
              handleCreateFolderWithName(name, createModal.parentFolder);
            }
            setCreateModal(null);
          }}
          onClose={() => setCreateModal(null)}
        />
      )}

      {commitModalOpen && (
        <CommitMessageModal
          onConfirm={handleCommit}
          onClose={() => {
            setCommitModalOpen(false);
            setCommitError(null);
          }}
          isCommitting={isCommitting}
          hasUnsavedChanges={editorDirty}
        />
      )}

      {error && <div className="repo-editor-error">{error}</div>}
      {saveError && <div className="repo-editor-error">{saveError}</div>}
      {commitError && <div className="repo-editor-error">{commitError}</div>}
      {storageQuotaExceeded && (
        <div className="repo-editor-error repo-editor-error-warning" role="alert">
          Storage limit reached. Your changes are kept in memory only—commit soon or they will be lost on refresh.
          <button
            type="button"
            className="repo-editor-error-dismiss"
            onClick={clearStorageQuotaError}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
