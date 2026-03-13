import * as dagre from "dagre";
import type { DecisionEdge, DecisionNode } from "@finverse/jdm-editor";

const NODE_WIDTH = 220;
const NODE_HEIGHT = 80;

export type LayoutDirection = "LR" | "TB" | "RL" | "BT";

/**
 * Computes node positions from the graph structure (edges) using dagre.
 * Returns a new array of nodes with updated positions; does not mutate inputs.
 */
export function getLayoutedNodes(
  nodes: DecisionNode[],
  edges: DecisionEdge[],
  direction: LayoutDirection = "LR",
  align: 'UL' | 'UR' | 'DL' | 'DR' = 'UL',
  nodesep: number = 60,
  ranksep: number = 80
): DecisionNode[] {
  if (nodes.length === 0) return [];

  const g = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep, ranksep, align });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    if (edge.sourceId && edge.targetId) {
      g.setEdge(edge.sourceId, edge.targetId);
    }
  });

  dagre.layout(g);

  return nodes.map((node) => {
    const nodeWithPosition = g.node(node.id);
    if (!nodeWithPosition) return node;
    // Dagre uses center anchor; React Flow uses top-left
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };
  });
}
