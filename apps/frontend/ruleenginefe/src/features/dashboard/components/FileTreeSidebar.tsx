import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { FileTreeNode } from "../hooks/useBranchTree";
import { pathParent } from "../utils/pendingChanges";
import { TrashIcon } from "./icons/TrashIcon";
import "./FileTreeSidebar.css";

function FolderIcon() {
  return (
    <span className="tree-icon-svg tree-icon-folder" aria-hidden>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="16px" height="16px"><path fill="#FFA000" d="M40,12H22l-4-4H8c-2.2,0-4,1.8-4,4v8h40v-4C44,13.8,42.2,12,40,12z" /><path fill="#FFCA28" d="M40,12H8c-2.2,0-4,1.8-4,4v20c0,2.2,1.8,4,4,4h32c2.2,0,4-1.8,4-4V16C44,13.8,42.2,12,40,12z" /></svg>
    </span>
  );
}

function FileIcon() {
  return (
    <span className="tree-icon-svg tree-icon-file" aria-hidden>
      <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="16px" height="16px" viewBox="0 0 48 48">
        <path fill="#90caf9" d="M33.2,10H17c-1.7,0-3,1.3-3,3v31c0,1.7,1.3,3,3,3h23c1.7,0,3-1.3,3-3V19.8c0-0.5-0.2-1-0.6-1.4l-7.8-7.8	C34.2,10.2,33.7,10,33.2,10z"></path><path fill="none" stroke="#18193f" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="3" d="M22.1,42.5h13.4c1.7,0,3-1.3,3-3v-25h-7c-1.1,0-2-0.9-2-2v-7"></path><path fill="none" stroke="#18193f" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="3" d="M24,5.5H12.5c-1.7,0-3,1.3-3,3v31c0,1.7,1.3,3,3,3h3.9"></path><line x1="38.5" x2="29.5" y1="14.5" y2="5.5" fill="none" stroke="#18193f" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="3"></line>
      </svg>
    </span>
  );
}

/** Set by sidebar when context menu is open; used by page's document listener to run delete on Delete button click. */
export type ContextMenuStateRef = React.MutableRefObject<{
  node: FileTreeNode;
  onClose: () => void;
} | null>;

type FileTreeSidebarProps = {
  nodes: FileTreeNode[];
  loading: boolean;
  selectedPath: string | null;
  onSelectFile: (path: string, blobId: string | null) => void;
  onSelectFolder?: (path: string, treeId: string) => void;
  onDeleteNode?: (node: FileTreeNode) => void;
  onDeleteNodeRef?: React.RefObject<((node: FileTreeNode) => void) | null>;
  /** When provided, page can use this in a document capture listener to handle Delete button clicks. */
  contextMenuStateRef?: ContextMenuStateRef;
  onRenameNode?: (node: FileTreeNode) => void;
  onMoveNode?: (draggedNode: FileTreeNode, targetFolder: FileTreeNode) => void;
  onNewFile?: (parentFolder: FileTreeNode | null) => void;
  onNewFolder?: (parentFolder: FileTreeNode | null) => void;
  /** When provided, shows a collapse button in the header to hide the sidebar. */
  onCollapseClick?: () => void;
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
  onDeleteRef,
  onRename,
  onNewFile,
  onNewFolder,
}: {
  state: ContextMenuState;
  nodes: FileTreeNode[];
  onClose: () => void;
  onDelete: (node: FileTreeNode) => void;
  onDeleteRef?: React.RefObject<((node: FileTreeNode) => void) | null>;
  onRename?: (node: FileTreeNode) => void;
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
      {state.node && (
        <>
          {(onNewFile || onNewFolder) && <div className="file-tree-context-menu-divider" />}
          {onRename && (
            <button
              type="button"
              className="file-tree-context-menu-item"
              onClick={() => {
                onClose();
                onRename(state.node!);
              }}
            >
              Rename {state.node.type === "folder" ? "folder" : "file"}
            </button>
          )}
          <button
            type="button"
            className="file-tree-context-menu-item danger"
            data-tree-delete
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const nodeToDelete = state.node!;
              if (onDeleteRef?.current) {
                onDeleteRef.current(nodeToDelete);
              } else {
                onDelete(nodeToDelete);
              }
              onClose();
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
  onDeleteNodeRef,
  contextMenuStateRef,
  onRenameNode,
  onMoveNode,
  onNewFile,
  onNewFolder,
  onCollapseClick,
  repoName,
}: FileTreeSidebarProps) {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  const showContextMenu = onDeleteNode || onRenameNode || onNewFile || onNewFolder;

  const handleCloseContextMenu = () => setContextMenu(null);

  useEffect(() => {
    if (!contextMenuStateRef) return;
    contextMenuStateRef.current =
      contextMenu?.node != null
        ? { node: contextMenu.node, onClose: handleCloseContextMenu }
        : null;
    return () => {
      contextMenuStateRef.current = null;
    };
  }, [contextMenu, contextMenuStateRef]);

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
        <div className="file-tree-header-main">
          <span className="file-tree-title">Explorer</span>
          <span className="file-tree-repo">{repoName}</span>
        </div>
        {onCollapseClick && (
          <button
            type="button"
            className="file-tree-collapse-btn"
            onClick={onCollapseClick}
            title="Hide file explorer"
            aria-label="Hide file explorer"
          >
            <span className="file-tree-collapse-icon" aria-hidden>◀</span>
          </button>
        )}
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
                draggingNodeId={draggingNodeId}
                setDraggingNodeId={setDraggingNodeId}
              />
            ))}
          </div>
        )}
      </div>
      {contextMenu &&
        createPortal(
          <TreeContextMenu
            state={contextMenu}
            nodes={nodes}
            onClose={handleCloseContextMenu}
            onDelete={onDeleteNode ?? (() => {})}
            onDeleteRef={onDeleteNodeRef}
            onRename={onRenameNode}
            onNewFile={onNewFile}
            onNewFolder={onNewFolder}
          />,
          document.getElementById("root") ?? document.body
        )}
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
  draggingNodeId,
  setDraggingNodeId,
}: {
  node: FileTreeNode;
  level: number;
  selectedPath: string | null;
  onSelectFile: (path: string, blobId: string | null) => void;
  onSelectFolder?: (path: string, treeId: string) => void;
  onContextMenu?: (e: React.MouseEvent, node: FileTreeNode) => void;
  onMoveNode?: (draggedNode: FileTreeNode, targetFolder: FileTreeNode) => void;
  nodes: FileTreeNode[];
  findNodeById: (nodes: FileTreeNode[], id: string) => FileTreeNode | null;
  dragOverFolderId: string | null;
  setDragOverFolderId: React.Dispatch<React.SetStateAction<string | null>>;
  draggingNodeId: string | null;
  setDraggingNodeId: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const [open, setOpen] = useState(true);
  const isSelected = selectedPath === node.path;

  const handleContextMenu = (e: React.MouseEvent) => {
    if (onContextMenu) onContextMenu(e, node);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", node.id);
    e.dataTransfer.effectAllowed = "move";
    setDraggingNodeId(node.id);
  };

  const handleDragEnd = () => {
    setDragOverFolderId(null);
    setDraggingNodeId(null);
  };

  const canDrop = (draggedId: string): boolean => {
    if (!onMoveNode) return false;
    const dragged = findNodeById(nodes, draggedId);
    if (!dragged) return false;
    if (dragged.id === node.id) return false;
    if (node.type !== "folder") return false;
    // Don't drop a folder into itself or into any of its descendants
    if (
      dragged.type === "folder" &&
      (node.path === dragged.path || node.path.startsWith(dragged.path + "/"))
    )
      return false;
    // Already a child of this folder (by path; works for server and pending nodes)
    if (pathParent(dragged.path) === node.path) return false;
    if (dragged.parentTreeId === node.childTreeId) return false;
    return true;
  };

  const handleFolderDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const draggedId = draggingNodeId || e.dataTransfer.getData("text/plain");
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

  const handleTreeItemKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  };

  if (node.type === "file") {
    return (
      <div
        role="button"
        tabIndex={0}
        className={`tree-item file ${isSelected ? "selected" : ""}`}
        style={{ paddingLeft: 12 + level * 16 }}
        onClick={() => onSelectFile(node.path, node.blobId ?? null)}
        onKeyDown={(e) => handleTreeItemKeyDown(e, () => onSelectFile(node.path, node.blobId ?? null))}
        onContextMenu={handleContextMenu}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <FileIcon />
        <span className="tree-label">{node.name}</span>
      </div>
    );
  }

  return (
    <div className="tree-folder-block">
      <div
        role="button"
        tabIndex={0}
        className={`tree-item folder ${isSelected ? "selected" : ""} ${dragOverFolderId === node.id ? "drop-target" : ""}`}
        style={{ paddingLeft: 12 + level * 16 }}
        onClick={() => {
          setOpen((o) => !o);
          if (node.childTreeId) onSelectFolder?.(node.path, node.childTreeId);
        }}
        onKeyDown={(e) =>
          handleTreeItemKeyDown(e, () => {
            setOpen((o) => !o);
            if (node.childTreeId) onSelectFolder?.(node.path, node.childTreeId);
          })
        }
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
      </div>
      {open && node.children && (
        <div
          className="tree-children"
          onDragOver={handleFolderDragOver}
          onDragLeave={handleFolderDragLeave}
          onDrop={handleFolderDrop}
        >
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
              draggingNodeId={draggingNodeId}
              setDraggingNodeId={setDraggingNodeId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
