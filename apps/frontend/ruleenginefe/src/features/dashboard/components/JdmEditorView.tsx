import { useMemo, useCallback, useState, useEffect, useRef } from "react";
import "@gorules/jdm-editor/dist/style.css";
import {
  DecisionGraph,
  JdmConfigProvider,
  GraphSimulator,
  type DecisionGraphType,
  type DecisionGraphRef,
  type Simulation,
} from "@gorules/jdm-editor";
import { simulate as simulateApi, isApiError } from "../services/api";
import "./JdmEditorView.css";

function usePrefersColorScheme(): "light" | "dark" {
  const [mode, setMode] = useState<"light" | "dark">(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setMode(media.matches ? "dark" : "light");
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  return mode;
}

const emptyGraph: DecisionGraphType = { nodes: [], edges: [] };

function parseGraph(content: string): DecisionGraphType {
  if (!content.trim()) return emptyGraph;
  try {
    const parsed = JSON.parse(content) as unknown;
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
  return emptyGraph;
}

type JdmEditorViewProps = {
  content: string;
  onChange: (value: string) => void;
  /** JSON file paths in the repo (for Decision node key dropdown) */
  decisionKeyOptions?: string[];
  /** When editing in a repo, pass so simulate can resolve Decision node keys (sub-decisions) */
  repositoryId?: string;
  branch?: string;
};

export function JdmEditorView({ content, onChange, decisionKeyOptions, repositoryId, branch }: JdmEditorViewProps) {
  const themeMode = usePrefersColorScheme();
  const graphRef = useRef<DecisionGraphRef>(null);
  const [simulate, setSimulate] = useState<Simulation | undefined>();
  const lastEmittedRef = useRef<string | null>(null);
  const latestGraphRef = useRef<DecisionGraphType | null>(null);
  const [externalKey, setExternalKey] = useState(0);

  // When content changes from outside (new file, raw edit), remount graph so it picks up new data.
  useEffect(() => {
    if (content !== lastEmittedRef.current) {
      const wasAlreadyEmitted = lastEmittedRef.current !== null;
      lastEmittedRef.current = content;
      latestGraphRef.current = null;
      if (wasAlreadyEmitted) setExternalKey((k) => k + 1);
    }
  }, [content]);

  // Use latest graph from library when available (survives remounts e.g. Strict Mode); otherwise parsed content.
  const defaultValue = useMemo(() => {
    const fromRef = latestGraphRef.current;
    if (fromRef != null) return fromRef;
    return parseGraph(content);
  }, [content, externalKey]);

  const handleChange = useCallback(
    (val: DecisionGraphType | undefined) => {
      if (val == null) return;
      latestGraphRef.current = val;
      const json = JSON.stringify(val, null, 2);
      lastEmittedRef.current = json;
      onChange(json);
    },
    [onChange]
  );

  const panels = useMemo(
    () => [
      {
        id: "simulator",
        title: "Simulator",
        icon: <span className="jdm-simulator-icon" aria-hidden>▶</span>,
        hideHeader: true,
        renderPanel: () => (
          <GraphSimulator
            defaultRequest={JSON.stringify({}, null, 2)}
            onRun={async ({ graph, context }) => {
              try {
                const res = await simulateApi({
                  content: graph,
                  context: context ?? {},
                  ...(repositoryId && branch ? { repositoryId, branch } : {}),
                });
                if (isApiError(res)) {
                  setSimulate({
                    error: {
                      message: res.message,
                      data: { nodeId: (res as { nodeId?: string }).nodeId },
                    },
                  });
                  return;
                }
                const data = res.data;
                if (!data) {
                  setSimulate({
                    error: { message: "No response from simulator", data: {} },
                  });
                  return;
                }
                setSimulate({
                  result: {
                    performance: data.performance ?? "0ms",
                    result: data.result,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- API trace shape matches simulator expectation
                    trace: (data.trace ?? {}) as any,
                    snapshot: graph,
                  },
                });
              } catch (err) {
                setSimulate({
                  error: {
                    message: err instanceof Error ? err.message : "Simulation failed",
                    data: {},
                  },
                });
              }
            }}
            onClear={() => setSimulate(undefined)}
          />
        ),
      },
    ],
    [repositoryId, branch]
  );

  const openSimulator = useCallback(() => {
    graphRef.current?.setActivePanel("simulator");
  }, []);

  const handleReactFlowInit = useCallback((instance: { fitView?: (opts?: { padding?: number; duration?: number }) => void }) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        instance.fitView?.({ padding: 0.2, duration: 300 });
      });
    });
  }, []);

  return (
    <div className="jdm-editor-view">
      {/* <div className="jdm-editor-view-toolbar">
        <button type="button" className="jdm-simulator-btn" onClick={openSimulator} title="Open Simulator">
          <span className="jdm-simulator-btn-icon" aria-hidden>▶</span>
          Simulator
        </button>
      </div> */}
      <JdmConfigProvider theme={{ mode: themeMode }}>
        <DecisionGraph
          key={externalKey}
          ref={graphRef}
          defaultValue={defaultValue}
          onChange={handleChange}
          panels={panels}
          simulate={simulate}
          onReactFlowInit={handleReactFlowInit}
          decisionKeyOptions={decisionKeyOptions}
        />
      </JdmConfigProvider>
    </div>
  );
}
