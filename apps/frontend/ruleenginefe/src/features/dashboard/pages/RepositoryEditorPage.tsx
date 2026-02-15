import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { getUser } from "../../auth/services/auth";
import {
  getRepository,
  getBranchByName,
  getBlob,
  getTree,
  createBlob,
  addTreeEntry,
  createTree,
  createCommit,
  updateBranchHead,
  updateTreeEntry,
  removeTreeEntry,
  isApiError,
} from "../services/api";
import { useBranchTree, type FileTreeNode } from "../hooks/useBranchTree";
import { FileTreeSidebar } from "../components/FileTreeSidebar";
import { EditorArea } from "../components/EditorArea";
import { BranchFooter } from "../components/BranchFooter";
import { CommitMessageModal } from "../components/CommitMessageModal";
import { NameInputModal } from "../components/NameInputModal";
import "./RepositoryEditorPage.css";

export function RepositoryEditorPage() {
  const { repositoryId } = useParams<{ repositoryId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = getUser();
  const branchName = searchParams.get("branch") || "main";

  const [repo, setRepo] = useState<{ id: string; name: string } | null>(null);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [selectedParentTreeId, setSelectedParentTreeId] = useState<string | null>(null);
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

  const { tree, rootTreeId, loading, error, reload, reloadFromCommitId, appendNodeToRoot } = useBranchTree(
    repositoryId ?? null,
    branchName
  );

  useEffect(() => {
    if (!repositoryId) return;
    getRepository(repositoryId).then((res) => {
      if (isApiError(res)) return;
      if (res.data) setRepo({ id: res.data.id, name: res.data.name });
    });
  }, [repositoryId]);

  const loadFile = useCallback(
    async (path: string, blobId: string, entryId?: string, parentTreeId?: string) => {
      setSelectedPath(path);
      setSelectedEntryId(entryId ?? null);
      setSelectedParentTreeId(parentTreeId ?? null);
      setEditorDirty(false);
      setEditorContent(""); // Clear immediately so we don't show previous file's content while loading
      const res = await getBlob(blobId);
      if (isApiError(res) || !res.data) {
        setEditorContent("");
        return;
      }
      const content = res.data.content;
      setEditorContent(
        typeof content === "string" ? content : JSON.stringify(content, null, 2)
      );
    },
    []
  );

  function handleSelectFile(path: string, blobId: string) {
    const node = findNodeByPath(tree, path);
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

  async function handleSave() {
    if (!repositoryId || !user?.id || !selectedPath) return;
    setSaveError(null);

    let content: unknown;
    try {
      content = JSON.parse(editorContent);
    } catch {
      content = editorContent;
    }

    const blobRes = await createBlob(repositoryId, content);
    if (isApiError(blobRes) || !blobRes.data) {
      setSaveError(blobRes.success === false ? (blobRes as { message: string }).message : "Failed to create blob");
      return;
    }
    const newBlobId = blobRes.data.id;

    if (selectedEntryId && selectedParentTreeId) {
      const updateRes = await updateTreeEntry(
        selectedParentTreeId,
        selectedEntryId,
        { blobId: newBlobId }
      );
      if (isApiError(updateRes)) {
        setSaveError(updateRes.message);
        return;
      }
    } else {
      if (!rootTreeId) {
        setSaveError("No tree to add file to");
        return;
      }
      const fileName = selectedPath.split("/").pop() || "file.json";
      const addRes = await addTreeEntry(rootTreeId, {
        name: fileName,
        type: "BLOB",
        blobId: newBlobId,
      });
      if (isApiError(addRes)) {
        setSaveError(addRes.message);
        return;
      }
    }

    setEditorDirty(false);
    setSaveError(null);
    await reload();
  }

  async function handleCommit(message: string) {
    if (!repositoryId || !user?.id || !rootTreeId) return;
    setCommitError(null);
    setIsCommitting(true);
    try {
      const branchRes = await getBranchByName(repositoryId, branchName);
      if (isApiError(branchRes) || !branchRes.data) {
        setCommitError("Branch not found");
        return;
      }
      const branch = branchRes.data;
      const commitRes = await createCommit({
        repositoryId,
        treeId: rootTreeId,
        authorId: user.id,
        message: message.trim() || "Update",
        parentCommitId: branch.headCommitId,
      });
      if (isApiError(commitRes) || !commitRes.data) {
        setCommitError(commitRes.success === false ? (commitRes as { message: string }).message : "Failed to create commit");
        return;
      }
      const headRes = await updateBranchHead(branch.id, commitRes.data.id);
      if (isApiError(headRes)) {
        setCommitError(headRes.message);
        return;
      }
      setCommitModalOpen(false);
      await reloadFromCommitId(commitRes.data.id);
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

  async function handleCreateFileWithName(name: string, parentFolder: FileTreeNode | null) {
    if (!user?.id || !repositoryId) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    const initialContent = getInitialContentForNewFile(trimmed);
    let treeId = parentFolder ? parentFolder.childTreeId : rootTreeId;
    if (!treeId) {
      const branchRes = await getBranchByName(repositoryId, branchName);
      if (isApiError(branchRes) || !branchRes.data) return;
      const blobRes = await createBlob(repositoryId, initialContent);
      if (isApiError(blobRes) || !blobRes.data) return;
      const treeRes = await createTree(repositoryId, [
        { name: trimmed, type: "BLOB", blobId: blobRes.data.id },
      ]);
      if (isApiError(treeRes) || !treeRes.data) return;
      treeId = treeRes.data.id;
      const commitRes = await createCommit({
        repositoryId,
        treeId,
        authorId: user.id,
        message: "Initial commit",
        parentCommitId: null,
      });
      if (isApiError(commitRes) || !commitRes.data) return;
      await updateBranchHead(branchRes.data.id, commitRes.data.id);
      await reloadFromCommitId(commitRes.data.id);
      const firstEntry = treeRes.data.entries?.[0];
      loadFile(trimmed, blobRes.data.id, firstEntry?.id, treeId);
      return;
    }
    const blobRes = await createBlob(repositoryId, initialContent);
    if (isApiError(blobRes) || !blobRes.data) return;
    const addRes = await addTreeEntry(treeId, {
      name: trimmed,
      type: "BLOB",
      blobId: blobRes.data.id,
    });
    if (isApiError(addRes)) return;
    const branchRes = await getBranchByName(repositoryId, branchName);
    if (isApiError(branchRes) || !branchRes.data) return;
    const commitRes = await createCommit({
      repositoryId,
      treeId: rootTreeId!,
      authorId: user.id,
      message: `Add ${trimmed}`,
      parentCommitId: branchRes.data.headCommitId,
    });
    if (isApiError(commitRes) || !commitRes.data) return;
    await updateBranchHead(branchRes.data.id, commitRes.data.id);
    await reloadFromCommitId(commitRes.data.id);
    const path = parentFolder ? `${parentFolder.path}/${trimmed}` : trimmed;
    const newEntry = addRes.data?.entries?.find((e: { name: string }) => e.name === trimmed);
    const entryId = newEntry?.id;
    loadFile(path, blobRes.data.id, entryId, treeId);
  }

  async function handleCreateFolderWithName(name: string, parentFolder: FileTreeNode | null) {
    if (!user?.id || !repositoryId) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    let treeId = parentFolder ? parentFolder.childTreeId : rootTreeId;
    if (!treeId) {
      const branchRes = await getBranchByName(repositoryId, branchName);
      if (isApiError(branchRes) || !branchRes.data) return;
      const treeRes = await createTree(repositoryId, []);
      if (isApiError(treeRes) || !treeRes.data) return;
      treeId = treeRes.data.id;
      const commitRes = await createCommit({
        repositoryId,
        treeId,
        authorId: user.id,
        message: "Initial commit",
        parentCommitId: null,
      });
      if (isApiError(commitRes) || !commitRes.data) return;
      await updateBranchHead(branchRes.data.id, commitRes.data.id);
      await reloadFromCommitId(commitRes.data.id);
      return;
    }
    const childTreeRes = await createTree(repositoryId, []);
    if (isApiError(childTreeRes) || !childTreeRes.data) return;
    const addRes = await addTreeEntry(treeId, {
      name: trimmed,
      type: "TREE",
      childTreeId: childTreeRes.data.id,
    });
    if (isApiError(addRes)) return;
    const newEntry = addRes.data?.entries?.find((e: { name: string }) => e.name === trimmed);
    if (newEntry && !parentFolder) {
      appendNodeToRoot({
        id: newEntry.id,
        name: trimmed,
        type: "folder",
        path: trimmed,
        blobId: null,
        childTreeId: childTreeRes.data.id,
        parentTreeId: treeId,
        children: [],
      });
    }
    const branchRes = await getBranchByName(repositoryId, branchName);
    if (isApiError(branchRes) || !branchRes.data) return;
    const commitRes = await createCommit({
      repositoryId,
      treeId: rootTreeId!,
      authorId: user.id,
      message: `Add folder ${trimmed}`,
      parentCommitId: branchRes.data.headCommitId,
    });
    if (isApiError(commitRes) || !commitRes.data) return;
    await updateBranchHead(branchRes.data.id, commitRes.data.id);
  }

  function handleBranchChange(newBranch: string) {
    setSearchParams({ branch: newBranch });
    setSelectedPath(null);
    setEditorContent("");
    setEditorDirty(false);
  }

  /** Recursively delete a tree entry. For folders, deletes all children first. */
  async function deleteNodeRecursive(
    parentTreeId: string,
    entryId: string,
    isFolder: boolean,
    childTreeId: string | null
  ): Promise<void> {
    if (isFolder && childTreeId) {
      const treeRes = await getTree(childTreeId);
      if (!isApiError(treeRes) && treeRes.data?.entries) {
        for (const entry of treeRes.data.entries) {
          await deleteNodeRecursive(
            childTreeId,
            entry.id,
            entry.type === "TREE",
            entry.childTreeId
          );
        }
      }
    }
    await removeTreeEntry(parentTreeId, entryId);
  }

  async function handleDeleteNode(node: FileTreeNode) {
    if (!repositoryId || !user?.id || !rootTreeId || !node.parentTreeId) return;
    setSaveError(null);
    try {
      await deleteNodeRecursive(
        node.parentTreeId,
        node.id,
        node.type === "folder",
        node.childTreeId
      );
      const branchRes = await getBranchByName(repositoryId, branchName);
      if (isApiError(branchRes) || !branchRes.data) {
        setSaveError("Branch not found");
        return;
      }
      const commitRes = await createCommit({
        repositoryId,
        treeId: rootTreeId,
        authorId: user.id,
        message: `Delete ${node.type === "folder" ? "folder" : "file"} ${node.name}`,
        parentCommitId: branchRes.data.headCommitId,
      });
      if (isApiError(commitRes) || !commitRes.data) {
        setSaveError(commitRes.success === false ? (commitRes as { message: string }).message : "Failed to create commit");
        return;
      }
      await updateBranchHead(branchRes.data.id, commitRes.data.id);
      if (selectedPath === node.path || (node.type === "folder" && selectedPath?.startsWith(node.path + "/"))) {
        setSelectedPath(null);
        setEditorContent("");
        setEditorDirty(false);
      }
      await reloadFromCommitId(commitRes.data.id);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  async function handleMoveNode(draggedNode: FileTreeNode, targetFolder: FileTreeNode) {
    if (!repositoryId || !user?.id || !rootTreeId || !draggedNode.parentTreeId || !targetFolder.childTreeId) return;
    if (draggedNode.parentTreeId === targetFolder.childTreeId) return;
    setSaveError(null);
    try {
      await removeTreeEntry(draggedNode.parentTreeId, draggedNode.id);
      await addTreeEntry(targetFolder.childTreeId, {
        name: draggedNode.name,
        type: draggedNode.type === "file" ? "BLOB" : "TREE",
        ...(draggedNode.type === "file" ? { blobId: draggedNode.blobId! } : { childTreeId: draggedNode.childTreeId! }),
      });
      const branchRes = await getBranchByName(repositoryId, branchName);
      if (isApiError(branchRes) || !branchRes.data) {
        setSaveError("Branch not found");
        return;
      }
      const commitRes = await createCommit({
        repositoryId,
        treeId: rootTreeId,
        authorId: user.id,
        message: `Move ${draggedNode.name} to ${targetFolder.path || "root"}`,
        parentCommitId: branchRes.data.headCommitId,
      });
      if (isApiError(commitRes) || !commitRes.data) {
        setSaveError(commitRes.success === false ? (commitRes as { message: string }).message : "Failed to create commit");
        return;
      }
      await updateBranchHead(branchRes.data.id, commitRes.data.id);
      await reloadFromCommitId(commitRes.data.id);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Move failed");
    }
  }

  const language = selectedPath?.endsWith(".json") ? "json" : "plaintext";

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
    return collectJsonPaths(tree, selectedPath);
  }, [tree, selectedPath]);

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
      </header>

      <div className={`repo-editor-body ${sidebarOpen ? "" : "repo-editor-sidebar-hidden"}`}>
        <div className="repo-editor-sidebar-wrap">
          <FileTreeSidebar
            nodes={tree}
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
            disabled={!rootTreeId}
            title={!rootTreeId ? "No content to commit yet" : "Commit all saved changes"}
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
    </div>
  );
}
