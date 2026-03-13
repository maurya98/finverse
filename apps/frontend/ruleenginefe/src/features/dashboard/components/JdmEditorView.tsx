import { useMemo, useCallback, useState, useEffect, useRef } from "react";
import "@finverse/jdm-editor/dist/style.css";
import {
  DecisionGraph,
  JdmConfigProvider,
  GraphSimulator,
  type DecisionGraphType,
  type DecisionGraphRef,
  type Simulation,
} from "@finverse/jdm-editor";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import FitScreenIcon from "@mui/icons-material/FitScreen";
import { useTheme } from "../../../contexts/ThemeContext";
import { simulate as simulateApi, isApiError } from "../services/api";
import { getLayoutedNodes, type LayoutDirection } from "../utils/graphLayout";
import "./JdmEditorView.css";

/** React Flow instance shape we get from onReactFlowInit (fitView for auto-align) */
type ReactFlowInstanceLike = { fitView?: (opts?: { padding?: number; duration?: number }) => void };

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
  /**
   * When set, simulation uses this map for all sub-decisions instead of loading from backend.
   * Use this so simulation runs against current UI state (including uncommitted changes), not repo state.
   */
  getDecisionsForSimulation?: () => Promise<Record<string, unknown>>;
};

export function JdmEditorView({
  content,
  onChange,
  decisionKeyOptions,
  repositoryId,
  branch,
  getDecisionsForSimulation,
}: JdmEditorViewProps) {
  const { appliedTheme } = useTheme();
  const graphRef = useRef<DecisionGraphRef>(null);
  const reactFlowInstanceRef = useRef<ReactFlowInstanceLike | null>(null);
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
            onRun={async ({ graph, context }: { graph: DecisionGraphType; context: unknown }) => {
              try {
                const decisions =
                  getDecisionsForSimulation != null
                    ? await getDecisionsForSimulation()
                    : undefined;
                const ctx = context ?? {};
                const res = await simulateApi({
                  content: graph,
                  context: ctx,
                  ...(decisions != null
                    ? { decisions }
                    : repositoryId && branch
                      ? { repositoryId, branch }
                      : {}),
                });
                if (isApiError(res)) {
                  setSimulate({
                    error: {
                      message: res.message,
                      data: {
                        nodeId: (res as { nodeId?: string }).nodeId,
                        ...(res.errors?.length ? { errors: res.errors } : {}),
                      },
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
    [repositoryId, branch, getDecisionsForSimulation]
  );

  const handleReactFlowInit = useCallback((instance: ReactFlowInstanceLike) => {
    reactFlowInstanceRef.current = instance;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        instance.fitView?.({ padding: 0.2, duration: 300 });
      });
    });
  }, []);

  const [layoutMenuAnchor, setLayoutMenuAnchor] = useState<null | HTMLElement>(null);
  const [layoutDirection, setLayoutDirection] = useState<LayoutDirection>("LR");
  const [layoutAlign, setLayoutAlign] = useState<'UL' | 'UR' | 'DL' | 'DR'>("UL");

  const applyLayout = useCallback(
    (direction: LayoutDirection, align: 'UL' | 'UR' | 'DL' | 'DR') => {
      const ref = graphRef.current;
      if (!ref?.stateStore) return;
      const { decisionGraph } = ref.stateStore.getState();
      const nodes = decisionGraph?.nodes ?? [];
      const edges = decisionGraph?.edges ?? [];
      if (nodes.length === 0) return;
      const layoutedNodes = getLayoutedNodes(nodes, edges, direction, align);
      ref.setNodes(layoutedNodes);
      if ('setLayoutDirection' in ref && typeof ref.setLayoutDirection === 'function') {
        ref.setLayoutDirection(direction);
      }
      if ('setLayoutAlign' in ref && typeof ref.setLayoutAlign === 'function') {
        ref.setLayoutAlign(align);
      }
      reactFlowInstanceRef.current?.fitView?.({ padding: 0.2, duration: 300 });
      setLayoutMenuAnchor(null);
    },
    []
  );

  const handleApplyLayout = useCallback(() => {
    applyLayout(layoutDirection, layoutAlign);
  }, [applyLayout, layoutDirection, layoutAlign]);

  const handleFitView = useCallback(() => {
    reactFlowInstanceRef.current?.fitView?.({ padding: 0.2, duration: 300 });
    setLayoutMenuAnchor(null);
  }, []);

  const directionOptions: { value: LayoutDirection; label: string }[] = [
    { value: "LR", label: "Left → Right" },
    { value: "TB", label: "Top → Bottom" },
    { value: "RL", label: "Right → Left" },
    { value: "BT", label: "Bottom → Top" },
  ];

  const alignOptions: { value: 'UL' | 'UR' | 'DL' | 'DR'; label: string }[] = [
    { value: "UL", label: "Up-Left" },
    { value: "UR", label: "Up-Right" },
    { value: "DL", label: "Down-Left" },
    { value: "DR", label: "Down-Right" },
  ];

  const tabBarExtraContent = useMemo(
    () => (
      <>
        <Tooltip title="Layout options (direction &amp; align)" placement="bottom">
          <IconButton
            size="small"
            onClick={(e) => setLayoutMenuAnchor(e.currentTarget)}
            aria-label="Layout options"
            aria-haspopup="true"
            aria-expanded={Boolean(layoutMenuAnchor)}
            sx={{ color: "inherit", opacity: 0.85, "&:hover": { opacity: 1 } }}
          >
            <AccountTreeIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={layoutMenuAnchor}
          open={Boolean(layoutMenuAnchor)}
          onClose={() => setLayoutMenuAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            paper: { sx: { minWidth: 220 } },
          }}
          MenuListProps={{
            onClick: (e) => e.stopPropagation(),
            onKeyDown: (e) => e.stopPropagation(),
          }}
        >
          <ListSubheader disableSticky>Direction</ListSubheader>
          {directionOptions.map((opt) => (
            <MenuItem
              key={opt.value}
              selected={layoutDirection === opt.value}
              onClick={() => setLayoutDirection(opt.value)}
            >
              <ListItemText primary={opt.label} />
            </MenuItem>
          ))}
          <ListSubheader disableSticky sx={{ pt: 1 }}>Alignment</ListSubheader>
          {alignOptions.map((opt) => (
            <MenuItem
              key={opt.value}
              selected={layoutAlign === opt.value}
              onClick={() => setLayoutAlign(opt.value)}
            >
              <ListItemText primary={opt.label} />
            </MenuItem>
          ))}
          <Box sx={{ px: 1.5, py: 1, display: "flex", gap: 1, flexDirection: "column" }}>
            <Button
              size="small"
              variant="contained"
              onClick={handleApplyLayout}
              fullWidth
            >
              Apply layout
            </Button>
            <Button
              size="small"
              variant="text"
              startIcon={<FitScreenIcon fontSize="small" />}
              onClick={handleFitView}
              fullWidth
            >
              Fit view only
            </Button>
          </Box>
        </Menu>
      </>
    ),
    [
      layoutMenuAnchor,
      layoutDirection,
      layoutAlign,
      handleApplyLayout,
      handleFitView,
    ]
  );

  return (
    <div className="jdm-editor-view">
      <JdmConfigProvider theme={{ mode: appliedTheme as "light" | "dark" }}>
        <DecisionGraph
          key={externalKey}
          ref={graphRef}  

          defaultValue={defaultValue}
          onChange={handleChange}
          panels={panels}
          simulate={simulate}
          onReactFlowInit={handleReactFlowInit}
          decisionKeyOptions={decisionKeyOptions}
          tabBarExtraContent={tabBarExtraContent}
        />
      </JdmConfigProvider>
    </div>
  );
}
