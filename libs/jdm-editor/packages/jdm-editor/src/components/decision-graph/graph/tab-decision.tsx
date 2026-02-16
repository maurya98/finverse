import { Collapse, Form, Input, Select, Switch } from 'antd';
import type { DragDropManager } from 'dnd-core';
import React, { useCallback, useState } from 'react';

import { useDecisionGraphActions, useDecisionGraphState } from '../context/dg-store.context';
import type { NodeDecisionData } from '../nodes/specifications/decision.specification';

export type TabDecisionProps = {
  id: string;
  manager?: DragDropManager;
};

const EXECUTION_MODES = [
  { value: 'single', label: 'Single' },
  { value: 'loop', label: 'Loop' },
];

export const TabDecision: React.FC<TabDecisionProps> = ({ id }) => {
  const graphActions = useDecisionGraphActions();
  const { disabled, content } = useDecisionGraphState(({ disabled, decisionGraph }) => ({
    disabled,
    content: (decisionGraph?.nodes ?? []).find((node) => node.id === id)?.content as NodeDecisionData | undefined,
  }));

  const updateContent = useCallback(
    (updates: Partial<NodeDecisionData>) => {
      graphActions.updateNode(id, (draft) => {
        Object.assign(draft.content, updates);
        return draft;
      });
    },
    [graphActions, id],
  );

  const [showOtherJson, setShowOtherJson] = useState(false);
  const otherJson = content ? JSON.stringify(content, null, 2) : '{}';

  const handleOtherJsonChange = (value: string) => {
    try {
      const parsed = JSON.parse(value || '{}') as NodeDecisionData;
      graphActions.updateNode(id, (draft) => {
        draft.content = {
          key: parsed.key ?? '',
          passThrough: parsed.passThrough ?? true,
          inputField: parsed.inputField && String(parsed.inputField).trim() ? parsed.inputField : null,
          outputPath: parsed.outputPath && String(parsed.outputPath).trim() ? parsed.outputPath : null,
          executionMode: parsed.executionMode === 'loop' ? 'loop' : 'single',
        };
        return draft;
      });
    } catch {
      // ignore invalid JSON while typing
    }
  };

  if (!content) {
    return null;
  }

  return (
    <div className='grl-node-content' style={{ height: '100%', overflowY: 'auto', padding: 16 }}>
      <Form layout='vertical' size='small'>
        <Form.Item
          label='Key'
          tooltip='Path to the referenced decision (e.g. pricing/calculate-discount). References another decision JSON in your repository.'
        >
          <Input
            value={content.key ?? ''}
            disabled={disabled}
            placeholder='e.g. pricing/calculate-discount'
            onChange={(e) => updateContent({ key: e.target.value })}
          />
        </Form.Item>
        <Form.Item label='Pass through' tooltip='Include input data in the output'>
          <Switch
            checked={content.passThrough ?? true}
            disabled={disabled}
            onChange={(checked) => updateContent({ passThrough: checked })}
          />
        </Form.Item>
        <Form.Item
          label='Input field'
          tooltip='Array field to iterate over (for loop execution mode). Leave empty for single execution.'
        >
          <Input
            value={content.inputField ?? ''}
            disabled={disabled}
            placeholder='Leave empty for single'
            allowClear
            onChange={(e) =>
              updateContent({
                inputField: e.target.value?.trim() ? e.target.value : null,
              })
            }
          />
        </Form.Item>
        <Form.Item label='Output path' tooltip='Path where the sub-decision result will be stored'>
          <Input
            value={content.outputPath ?? ''}
            disabled={disabled}
            placeholder='Leave empty for root'
            allowClear
            onChange={(e) =>
              updateContent({
                outputPath: e.target.value?.trim() ? e.target.value : null,
              })
            }
          />
        </Form.Item>
        <Form.Item label='Execution mode' tooltip='Single: run once. Loop: iterate over input field array.'>
          <Select
            value={content.executionMode ?? 'single'}
            disabled={disabled}
            options={EXECUTION_MODES}
            onChange={(value) => updateContent({ executionMode: value })}
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Form>
      <Collapse
        ghost
        items={[
          {
            key: 'other-json',
            label: 'Other (JSON)',
            children: (
              <Input.TextArea
                rows={10}
                value={otherJson}
                disabled={disabled}
                onChange={(e) => handleOtherJsonChange(e.target.value)}
                style={{ fontFamily: 'var(--mono-font-family)', fontSize: 12 }}
              />
            ),
          },
        ]}
        activeKey={showOtherJson ? ['other-json'] : []}
        onChange={(keys) => setShowOtherJson(keys.includes('other-json'))}
      />
    </div>
  );
};
