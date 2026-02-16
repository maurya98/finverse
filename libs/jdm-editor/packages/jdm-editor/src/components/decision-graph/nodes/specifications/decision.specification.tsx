import type { VariableType } from '@gorules/zen-engine-wasm';
import { Button } from 'antd';
import clsx from 'clsx';
import { GitBranchIcon } from 'lucide-react';
import React from 'react';

import { useDecisionGraphActions, useDecisionGraphState } from '../../context/dg-store.context';
import { GraphNode } from '../graph-node';
import { NodeColor } from './colors';
import type { MinimalNodeProps, NodeSpecification } from './specification-types';
import { NodeKind } from './specification-types';
import { TabDecision } from '../../graph/tab-decision';

export type NodeDecisionData = {
  key: string;
  passThrough?: boolean;
  inputField?: string | null;
  outputPath?: string | null;
  executionMode?: 'single' | 'loop';
};

export const decisionSpecification: NodeSpecification<NodeDecisionData> = {
  type: NodeKind.Decision,
  icon: <GitBranchIcon size='1em' />,
  displayName: 'Decision',
  documentationUrl: 'https://docs.gorules.io/developers/jdm/node-types#decision-node',
  shortDescription: 'Sub-decision reference',
  color: NodeColor.Violet,
  inferTypes: {
    needsUpdate: () => false,
    determineOutputType: (state) => state.input,
  },
  generateNode: ({ index }) => ({
    name: `decision${index}`,
    content: {
      key: '',
      passThrough: true,
      inputField: null,
      outputPath: null,
      executionMode: 'single',
    },
  }),
  renderNode: ({ specification, ...props }) => <DecisionNode specification={specification} {...props} />,
  renderTab: ({ id, manager }) => <TabDecision id={id} manager={manager} />,
};

const DecisionNode: React.FC<
  MinimalNodeProps & {
    specification: Pick<NodeSpecification, 'displayName' | 'icon' | 'documentationUrl'>;
  }
> = ({ id, data, selected, specification }) => {
  const graphActions = useDecisionGraphActions();
  const { content, disabled } = useDecisionGraphState(({ decisionGraph, disabled }) => ({
    content: (decisionGraph?.nodes || []).find((n) => n?.id === id)?.content as NodeDecisionData | undefined,
    disabled,
  }));

  const keyLabel = content?.key?.trim() || 'No key set';

  return (
    <GraphNode
      id={id}
      className={clsx(['decision'])}
      specification={specification}
      name={data.name}
      handleRight={true}
      noBodyPadding
      isSelected={selected}
      actions={[
        <Button
          key='configure'
          type='text'
          disabled={disabled}
          onClick={() => graphActions.openTab(id)}
        >
          Configure
        </Button>,
      ]}
    >
      <div className='decision-node__body'>
        <div className='decision-node__key' title={keyLabel}>
          {keyLabel}
        </div>
      </div>
    </GraphNode>
  );
};
