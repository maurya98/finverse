import { decisionSpecification } from './decision.specification';
import { decisionTableSpecification } from './decision-table.specification';
import { expressionSpecification } from './expression.specification';
import { functionSpecification } from './function.specification';
import { inputSpecification } from './input.specification';
import { outputSpecification } from './output.specification';
import { NodeKind } from './specification-types';
import type { NodeSpecification } from './specification-types';
import { switchSpecification } from './switch.specification';

function makeNodeSpecification<T extends Record<NodeKind, V>, V extends NodeSpecification>(o: T): Readonly<T> {
  return o;
}

export const nodeSpecification = makeNodeSpecification({
  [NodeKind.Input]: inputSpecification,
  [NodeKind.Output]: outputSpecification,
  [NodeKind.DecisionTable]: decisionTableSpecification,
  [NodeKind.Expression]: expressionSpecification,
  [NodeKind.Function]: functionSpecification,
  [NodeKind.Switch]: switchSpecification,
  [NodeKind.Decision]: decisionSpecification,
});

/** Explicit order for the components sidebar: Decision is last. */
export const CORE_NODE_ORDER: NodeKind[] = [
  NodeKind.Input,
  NodeKind.Output,
  NodeKind.DecisionTable,
  NodeKind.Expression,
  NodeKind.Function,
  NodeKind.Switch,
  NodeKind.Decision,
];

export const coreNodeSpecificationsInOrder = CORE_NODE_ORDER.map((kind) => nodeSpecification[kind]);
