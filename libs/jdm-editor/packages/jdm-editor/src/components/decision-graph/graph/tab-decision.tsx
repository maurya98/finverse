import { Collapse, Form, Input, Select, Switch } from 'antd';
import type { DragDropManager } from 'dnd-core';
import React, { useCallback, useMemo, useState } from 'react';

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
  const { disabled, content, decisionKeyOptions } = useDecisionGraphState(
    ({ disabled, decisionGraph, decisionKeyOptions }) => ({
      disabled,
      content: (decisionGraph?.nodes ?? []).find((node) => node.id === id)?.content as NodeDecisionData | undefined,
      decisionKeyOptions,
    }),
  );

  const keyOptions = useMemo(() => {
    const paths = decisionKeyOptions ?? [];
    const opts = paths.map((path) => ({ value: path, label: path }));
    const current = content?.key?.trim();
    if (current && !opts.some((o) => o.value === current)) {
      opts.unshift({ value: current, label: `${current} (current)` });
    }
    return opts;
  }, [decisionKeyOptions, content?.key]);

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
          tooltip='Path to the referenced decision. Select a JSON file from your repository or enter a path.'
        >
          {keyOptions.length > 0 ? (
            <Select
              value={content.key ?? undefined}
              disabled={disabled}
              placeholder='Select decision JSON or enter path'
              options={keyOptions}
              onChange={(value) => updateContent({ key: value ?? '' })}
              onClear={() => updateContent({ key: '' })}
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
              }
              optionFilterProp='label'
              style={{ width: '100%' }}
              notFoundContent={null}
            />
          ) : (
            <Input
              value={content.key ?? ''}
              disabled={disabled}
              placeholder='e.g. folder/decision.json'
              onChange={(e) => updateContent({ key: e.target.value })}
            />
          )}
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
