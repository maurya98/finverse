import type { DragDropManager } from 'dnd-core';
import React from 'react';
import type { z } from 'zod';
import { Form, Input, Select, Switch } from 'antd';

import { decisionNodeSchema } from '../../../helpers/schema';
import { useDecisionGraphActions, useDecisionGraphState } from '../context/dg-store.context';

export type TabDecisionProps = {
  id: string;
  manager?: DragDropManager;
};

type DecisionContent = z.infer<typeof decisionNodeSchema>['content'];

export const TabDecision: React.FC<TabDecisionProps> = ({ id }) => {
  const graphActions = useDecisionGraphActions();
  const { disabled, content, decisionKeyOptions } = useDecisionGraphState(
    ({ disabled, decisionGraph, decisionKeyOptions }) => ({
      disabled,
      content: (decisionGraph?.nodes ?? []).find((node) => node.id === id)?.content as DecisionContent | undefined,
      decisionKeyOptions: decisionKeyOptions ?? [],
    }),
  );

  const initialValues: Partial<DecisionContent> = content
    ? {
        key: content.key ?? '',
        passThrough: content.passThrough ?? true,
        inputField: content.inputField ?? undefined,
        outputPath: content.outputPath ?? undefined,
        executionMode: content.executionMode ?? 'single',
      }
    : {
        key: '',
        passThrough: true,
        executionMode: 'single',
      };

  const keyOptions = (decisionKeyOptions || []).map((path) => ({ value: path, label: path }));
  const currentKey = content?.key?.trim() ?? '';
  const hasCurrentKeyInOptions = currentKey && keyOptions.some((o) => o.value === currentKey);
  const keySelectOptions = hasCurrentKeyInOptions
    ? keyOptions
    : currentKey
      ? [{ value: currentKey, label: currentKey }, ...keyOptions]
      : keyOptions;

  return (
    <div style={{ padding: 16 }}>
      <Form
        layout="vertical"
        initialValues={initialValues}
        onValuesChange={(_, values) => {
          graphActions.updateNode(id, (draft) => {
            draft.content = {
              key: values.key ?? '',
              passThrough: values.passThrough ?? true,
              inputField: values.inputField && String(values.inputField).trim() ? values.inputField : null,
              outputPath: values.outputPath && String(values.outputPath).trim() ? values.outputPath : null,
              executionMode: values.executionMode ?? 'single',
            };
            return draft;
          });
        }}
      >
        <Form.Item
          name="key"
          label="Decision path / key"
          rules={[{ required: true, message: 'Path to the referenced decision (e.g. path/to/file.json or module/decision-name)' }]}
          tooltip="Path to the referenced decision. Select a JSON file from the folder or enter a custom path."
        >
          {keySelectOptions.length > 0 ? (
            <Select
              disabled={disabled}
              placeholder="Select a decision file or enter path"
              showSearch
              optionFilterProp="label"
              options={keySelectOptions}
              allowClear
              notFoundContent={null}
            />
          ) : (
            <Input
              placeholder="e.g. pricing/calculate-discount or rules/discount.json"
              disabled={disabled}
            />
          )}
        </Form.Item>
        <Form.Item
          name="passThrough"
          label="Pass through input"
          valuePropName="checked"
          tooltip="When enabled, the input context is merged with the sub-decision result in the output."
        >
          <Switch disabled={disabled} />
        </Form.Item>
        <Form.Item
          name="executionMode"
          label="Execution mode"
          tooltip="Single: run once. Loop: iterate over an array field and run the decision for each item."
        >
          <Select
            disabled={disabled}
            options={[
              { value: 'single', label: 'Single' },
              { value: 'loop', label: 'Loop' },
            ]}
          />
        </Form.Item>
        <Form.Item
          name="inputField"
          label="Input field (for loop)"
          tooltip="When execution mode is Loop, the path to the array field to iterate over (e.g. items)."
        >
          <Input placeholder="e.g. items" disabled={disabled} />
        </Form.Item>
        <Form.Item
          name="outputPath"
          label="Output path"
          tooltip="Optional path where to store the sub-decision result in the output (e.g. result.discount)."
        >
          <Input placeholder="e.g. result.discount" disabled={disabled} />
        </Form.Item>
      </Form>
    </div>
  );
};
