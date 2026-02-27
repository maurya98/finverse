import { useMemo } from "react";
import "@gorules/jdm-editor/dist/style.css";
import {
  DecisionGraph,
  JdmConfigProvider,
  calculateDiffGraph,
  type DecisionGraphType,
} from "@gorules/jdm-editor";
import { useTheme } from "../../../contexts/ThemeContext";
import "./JdmDiffViewer.css";

const emptyGraph: DecisionGraphType = { nodes: [], edges: [] };

function parseGraph(content: unknown): DecisionGraphType | null {
  if (content == null) return emptyGraph;
  let str: string;
  if (typeof content === "string") {
    str = content;
  } else {
    try {
      str = JSON.stringify(content);
    } catch {
      return null;
    }
  }
  if (!str.trim()) return emptyGraph;
  try {
    const parsed = JSON.parse(str) as unknown;
    if (parsed && typeof parsed === "object" && "nodes" in parsed && "edges" in parsed) {
      const nodes = Array.isArray((parsed as DecisionGraphType).nodes)
        ? (parsed as DecisionGraphType).nodes
        : [];
      const edges = Array.isArray((parsed as DecisionGraphType).edges)
        ? (parsed as DecisionGraphType).edges
        : [];
      return { nodes, edges };
    }
  } catch {
    // ignore
  }
  return null;
}

/** Returns true if the file looks like a JDM JSON and both sides parse as decision graphs. */
export function canShowJdmDiff(
  path: string,
  oldContent: unknown,
  newContent: unknown,
  mode: "added" | "removed" | "modified"
): boolean {
  if (!path.toLowerCase().endsWith(".json")) return false;
  const previous = parseGraph(mode === "added" ? undefined : oldContent);
  const current = parseGraph(mode === "removed" ? undefined : newContent);
  return previous !== null && current !== null;
}

export type JdmDiffViewerProps = {
  path: string;
  oldContent: unknown;
  newContent: unknown;
  mode: "added" | "removed" | "modified";
};

/**
 * Renders a JDM (JSON Decision Model) diff view when both old and new content
 * parse as decision graphs. Returns null if not applicable (e.g. non-JDM file).
 */
export function JdmDiffViewer({ path, oldContent, newContent, mode }: JdmDiffViewerProps) {
  const { appliedTheme } = useTheme();

  const diffGraph = useMemo(() => {
    const previous = parseGraph(mode === "added" ? undefined : oldContent);
    const current = parseGraph(mode === "removed" ? undefined : newContent);
    if (previous === null || current === null) return null;
    return calculateDiffGraph(current, previous);
  }, [oldContent, newContent, mode]);

  if (diffGraph === null) return null;

  return (
    <div className="jdm-diff-viewer">
      <div className="jdm-diff-viewer-header">{path}</div>
      <div className="jdm-diff-viewer-graph">
        <JdmConfigProvider theme={{ mode: appliedTheme as "light" | "dark" }}>
          <DecisionGraph
            defaultValue={diffGraph}
            onChange={() => {}}
            hideLeftToolbar
            disabled
            panels={[]}
          />
        </JdmConfigProvider>
      </div>
    </div>
  );
}
