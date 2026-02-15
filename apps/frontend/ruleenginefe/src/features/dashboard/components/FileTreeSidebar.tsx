import { useState, useEffect, useRef } from "react";
import type { FileTreeNode } from "../hooks/useBranchTree";
import { TrashIcon } from "./icons/TrashIcon";
import "./FileTreeSidebar.css";

function FolderIcon() {
  return (
    <span className="tree-icon-svg tree-icon-folder" aria-hidden>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    </span>
  );
}

function FileIcon() {
  return (
    <span className="tree-icon-svg tree-icon-file" aria-hidden>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    </span>
  );
}

type FileTreeSidebarProps = {
  nodes: FileTreeNode[];
  loading: boolean;
  selectedPath: string | null;
  onSelectFile: (path: string, blobId: string) => void;
  onSelectFolder?: (path: string, treeId: string) => void;
  onDeleteNode?: (node: FileTreeNode) => void;
  onMoveNode?: (draggedNode: FileTreeNode, targetFolder: FileTreeNode) => void;
  onNewFile?: (parentFolder: FileTreeNode | null) => void;
  onNewFolder?: (parentFolder: FileTreeNode | null) => void;
  repoName: string;
};

function findParentFolder(nodes: FileTreeNode[], node: FileTreeNode): FileTreeNode | null {
  for (const n of nodes) {
    if (n.type === "folder" && n.childTreeId === node.parentTreeId) return n;
    if (n.children?.length) {
      const found = findParentFolder(n.children, node);
      if (found) return found;
    }
  }
  return null;
}

function findNodeById(nodes: FileTreeNode[], id: string): FileTreeNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children?.length) {
      const found = findNodeById(n.children, id);
      if (found) return found;
    }
  }
  return null;
}

type ContextMenuState = { x: number; y: number; node: FileTreeNode | null } | null;

function TreeContextMenu({
  state,
  nodes,
  onClose,
  onDelete,
  onNewFile,
  onNewFolder,
}: {
  state: ContextMenuState;
  nodes: FileTreeNode[];
  onClose: () => void;
  onDelete: (node: FileTreeNode) => void;
  onNewFile?: (parentFolder: FileTreeNode | null) => void;
  onNewFolder?: (parentFolder: FileTreeNode | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!state) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [state, onClose]);

  if (!state) return null;

  const parentFolder: FileTreeNode | null =
    state.node === null
      ? null
      : state.node.type === "folder"
        ? state.node
        : findParentFolder(nodes, state.node);

  return (
    <div
      ref={ref}
      className="file-tree-context-menu"
      style={{ left: state.x, top: state.y }}
    >
      {onNewFile && (
        <button
          type="button"
          className="file-tree-context-menu-item"
          onClick={() => {
            onClose();
            onNewFile(parentFolder);
          }}
        >
          New file
        </button>
      )}
      {onNewFolder && (
        <button
          type="button"
          className="file-tree-context-menu-item"
          onClick={() => {
            onClose();
            onNewFolder(parentFolder);
          }}
        >
          New folder
        </button>
      )}
      {state.node && onDelete && (
        <>
          {(onNewFile || onNewFolder) && <div className="file-tree-context-menu-divider" />}
          <button
            type="button"
            className="file-tree-context-menu-item danger"
            onClick={() => {
              onClose();
              onDelete(state.node!);
            }}
          >
            <TrashIcon size={14} className="file-tree-context-menu-icon" />
            Delete {state.node.type === "folder" ? "folder" : "file"}
          </button>
        </>
      )}
    </div>
  );
}

export function FileTreeSidebar({
  nodes,
  loading,
  selectedPath,
  onSelectFile,
  onSelectFolder,
  onDeleteNode,
  onMoveNode,
  onNewFile,
  onNewFolder,
  repoName,
}: FileTreeSidebarProps) {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

  const showContextMenu = onDeleteNode || onNewFile || onNewFolder;

  const handleContextMenuOnNode = (e: React.MouseEvent, node: FileTreeNode) => {
    e.preventDefault();
    e.stopPropagation();
    if (!showContextMenu) return;
    setContextMenu({ x: e.clientX, y: e.clientY, node });
  };

  const handleContextMenuOnList = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".tree-item")) return;
    e.preventDefault();
    e.stopPropagation();
    if (!showContextMenu) return;
    setContextMenu({ x: e.clientX, y: e.clientY, node: null });
  };

  const handleCloseContextMenu = () => setContextMenu(null);

  const handleContextMenuOnSidebar = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".tree-item")) return;
    e.preventDefault();
    e.stopPropagation();
    if (!showContextMenu) return;
    setContextMenu({ x: e.clientX, y: e.clientY, node: null });
  };

  return (
    <aside className="file-tree-sidebar" onContextMenu={handleContextMenuOnSidebar}>
      <div className="file-tree-header" onContextMenu={handleContextMenuOnSidebar}>
        <span className="file-tree-title">Explorer</span>
        <span className="file-tree-repo">{repoName}</span>
      </div>
      <div className="file-tree-content">
        {loading ? (
          <div className="file-tree-loading">Loading…</div>
        ) : nodes.length === 0 ? (
          <div
            className="file-tree-empty"
            onContextMenu={showContextMenu ? handleContextMenuOnList : undefined}
          >
            No files yet
          </div>
        ) : (
          <div className="file-tree-list" onContextMenu={handleContextMenuOnList}>
            {nodes.map((node) => (
              <TreeNodeWithContextMenu
                key={node.id}
                node={node}
                level={0}
                selectedPath={selectedPath}
                onSelectFile={onSelectFile}
                onSelectFolder={onSelectFolder}
                onContextMenu={showContextMenu ? handleContextMenuOnNode : undefined}
                onMoveNode={onMoveNode}
                nodes={nodes}
                findNodeById={findNodeById}
                dragOverFolderId={dragOverFolderId}
                setDragOverFolderId={setDragOverFolderId}
              />
            ))}
          </div>
        )}
      </div>
      <TreeContextMenu
        state={contextMenu}
        nodes={nodes}
        onClose={handleCloseContextMenu}
        onDelete={onDeleteNode ?? (() => {})}
        onNewFile={onNewFile}
        onNewFolder={onNewFolder}
      />
    </aside>
  );
}

function TreeNodeWithContextMenu({
  node,
  level,
  selectedPath,
  onSelectFile,
  onSelectFolder,
  onContextMenu,
  onMoveNode,
  nodes,
  findNodeById,
  dragOverFolderId,
  setDragOverFolderId,
}: {
  node: FileTreeNode;
  level: number;
  selectedPath: string | null;
  onSelectFile: (path: string, blobId: string) => void;
  onSelectFolder?: (path: string, treeId: string) => void;
  onContextMenu?: (e: React.MouseEvent, node: FileTreeNode) => void;
  onMoveNode?: (draggedNode: FileTreeNode, targetFolder: FileTreeNode) => void;
  nodes: FileTreeNode[];
  findNodeById: (nodes: FileTreeNode[], id: string) => FileTreeNode | null;
  dragOverFolderId: string | null;
  setDragOverFolderId: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(true);
  const isSelected = selectedPath === node.path;

  const handleContextMenu = (e: React.MouseEvent) => {
    if (onContextMenu) onContextMenu(e, node);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", node.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDragOverFolderId(null);
  };

  const canDrop = (draggedId: string): boolean => {
    if (!onMoveNode || !node.childTreeId) return false;
    const dragged = findNodeById(nodes, draggedId);
    if (!dragged || !dragged.parentTreeId) return false;
    if (dragged.id === node.id) return false;
    if (dragged.parentTreeId === node.childTreeId) return false;
    if (dragged.type === "folder" && (node.path === dragged.path || node.path.startsWith(dragged.path + "/"))) return false;
    return true;
  };

  const handleFolderDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const draggedId = e.dataTransfer.getData("text/plain");
    if (draggedId && canDrop(draggedId)) setDragOverFolderId(node.id);
  };

  const handleFolderDragLeave = () => {
    setDragOverFolderId((id) => (id === node.id ? null : id));
  };

  const handleFolderDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverFolderId(null);
    const draggedId = e.dataTransfer.getData("text/plain");
    if (!draggedId || !canDrop(draggedId) || !onMoveNode) return;
    const dragged = findNodeById(nodes, draggedId);
    if (dragged) onMoveNode(dragged, node);
  };

  if (node.type === "file") {
    return (
      <button
        type="button"
        className={`tree-item file ${isSelected ? "selected" : ""}`}
        style={{ paddingLeft: 12 + level * 16 }}
        onClick={() => node.blobId && onSelectFile(node.path, node.blobId)}
        onContextMenu={handleContextMenu}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <FileIcon />
        <span className="tree-label">{node.name}</span>
      </button>
    );
  }

  return (
    <div className="tree-folder-block">
      <button
        type="button"
        className={`tree-item folder ${isSelected ? "selected" : ""} ${dragOverFolderId === node.id ? "drop-target" : ""}`}
        style={{ paddingLeft: 12 + level * 16 }}
        onClick={() => {
          setOpen((o) => !o);
          if (node.childTreeId) onSelectFolder?.(node.path, node.childTreeId);
        }}
        onContextMenu={handleContextMenu}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleFolderDragOver}
        onDragLeave={handleFolderDragLeave}
        onDrop={handleFolderDrop}
      >
        <span className="tree-chevron">{open ? "▼" : "▶"}</span>
        <FolderIcon />
        <span className="tree-label">{node.name}</span>
      </button>
      {open && node.children && (
        <div className="tree-children">
          {node.children.map((child) => (
            <TreeNodeWithContextMenu
              key={child.id}
              node={child}
              level={level + 1}
              selectedPath={selectedPath}
              onSelectFile={onSelectFile}
              onSelectFolder={onSelectFolder}
              onContextMenu={onContextMenu}
              onMoveNode={onMoveNode}
              nodes={nodes}
              findNodeById={findNodeById}
              dragOverFolderId={dragOverFolderId}
              setDragOverFolderId={setDragOverFolderId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
