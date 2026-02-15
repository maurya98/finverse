import { BookOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Modal, Typography } from 'antd';
import { produce } from 'immer';
import _ from 'lodash';
import { GitBranch } from 'lucide-react';
import React from 'react';
import type { z } from 'zod';

import { platform } from '../../../../helpers/platform';
import type { decisionNodeSchema } from '../../../../helpers/schema';
import { SpacedText } from '../../../spaced-text';
import { useDecisionGraphActions, useDecisionGraphState } from '../../context/dg-store.context';
import type { Diff, DiffMetadata } from '../../dg-types';
import { TabDecision } from '../../graph/tab-decision';
import { GraphNode } from '../graph-node';
import { NodeColor } from './colors';
import type { NodeSpecification } from './specification-types';
import { NodeKind } from './specification-types';

type InferredContent = z.infer<typeof decisionNodeSchema>['content'];

export type NodeDecisionData = InferredContent & Diff;

export const decisionSpecification: NodeSpecification<NodeDecisionData> = {
  type: NodeKind.Decision,
  icon: <GitBranch size={16} style={{ verticalAlign: 'middle' }} />,
  displayName: 'Decision',
  color: NodeColor.Purple,
  documentationUrl: 'https://docs.gorules.io/developers/jdm/node-types#decision-node',
  shortDescription: 'Reference another decision (sub-decision / JSON file)',
  generateNode: ({ index }) => ({
    name: `Decision ${index + 1}`,
    content: {
      key: '',
      passThrough: true,
      inputField: null,
      outputPath: null,
      executionMode: 'single',
    },
  }),
  renderTab: ({ id, manager }) => <TabDecision id={id} manager={manager} />,
  renderNode: ({ id, data, selected, specification }) => {
    const graphActions = useDecisionGraphActions();
    const { disabled } = useDecisionGraphState(({ disabled }) => ({
      disabled,
    }));

    return (
      <GraphNode
        id={id}
        specification={specification}
        name={data.name}
        isSelected={selected}
        actions={[
          <Button key="configure" type="text" onClick={() => graphActions.openTab(id)}>
            Configure
          </Button>,
        ]}
        menuItems={[
          {
            key: 'documentation',
            icon: <BookOutlined />,
            label: 'Documentation',
            onClick: () => window.open(specification.documentationUrl, '_blank'),
          },
          {
            key: 'delete',
            icon: <DeleteOutlined />,
            danger: true,
            label: <SpacedText left="Delete" right={platform.shortcut('Backspace')} />,
            disabled,
            onClick: () =>
              Modal.confirm({
                icon: null,
                title: 'Delete node',
                content: (
                  <Typography.Text>
                    Are you sure you want to delete <Typography.Text strong>{data.name}</Typography.Text> node?
                  </Typography.Text>
                ),
                okButtonProps: { danger: true },
                onOk: () => graphActions.removeNodes([id]),
              }),
          },
        ]}
      />
    );
  },
  getDiffContent: (current, previous) => {
    const fields: DiffMetadata['fields'] = {};
    return produce(current || {}, (draft) => {
      if ((current?.key || '') !== (previous?.key || '')) {
        _.set(fields, 'key', { previousValue: previous?.key ?? '', status: 'modified' });
      }
      if ((current?.passThrough ?? true) !== (previous?.passThrough ?? true)) {
        _.set(fields, 'passThrough', { previousValue: previous?.passThrough ?? true, status: 'modified' });
      }
      if ((current?.executionMode ?? 'single') !== (previous?.executionMode ?? 'single')) {
        _.set(fields, 'executionMode', { previousValue: previous?.executionMode ?? 'single', status: 'modified' });
      }
      if ((current?.inputField ?? null) !== (previous?.inputField ?? null)) {
        _.set(fields, 'inputField', { previousValue: previous?.inputField ?? null, status: 'modified' });
      }
      if ((current?.outputPath ?? null) !== (previous?.outputPath ?? null)) {
        _.set(fields, 'outputPath', { previousValue: previous?.outputPath ?? null, status: 'modified' });
      }
      if (Object.keys(fields).length > 0) {
        draft._diff = { status: 'modified', fields };
      }
      return draft;
    });
  },
};
