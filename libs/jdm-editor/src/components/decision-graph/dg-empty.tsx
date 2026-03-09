import equal from 'fast-deep-equal/es6/react';
import type React from 'react';
import { useEffect, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import {
  type DecisionGraphStoreType,
  useDecisionGraphActions,
  useDecisionGraphRaw,
  useDecisionGraphState,
} from './context/dg-store.context';
import { type DecisionGraphType } from './dg-types';

export type DecisionGraphEmptyType = {
  id?: string;
  defaultValue?: DecisionGraphType;
  value?: DecisionGraphType;

  disabled?: boolean;

  components?: DecisionGraphStoreType['state']['components'];
  customNodes?: DecisionGraphStoreType['state']['customNodes'];

  hideLeftToolbar?: DecisionGraphStoreType['state']['hideLeftToolbar'];

  name?: DecisionGraphStoreType['state']['name'];

  defaultActivePanel?: string;
  panels?: DecisionGraphStoreType['state']['panels'];
  onPanelsChange?: DecisionGraphStoreType['listeners']['onPanelsChange'];

  simulate?: DecisionGraphStoreType['state']['simulate'];

  /** Paths to JSON decision files in the repo (for Decision node key dropdown) */
  decisionKeyOptions?: string[];

  onChange?: DecisionGraphStoreType['listeners']['onChange'];
  onReactFlowInit?: DecisionGraphStoreType['listeners']['onReactFlowInit'];

  onCodeExtension?: DecisionGraphStoreType['listeners']['onCodeExtension'];
  onFunctionReady?: DecisionGraphStoreType['listeners']['onFunctionReady'];
};

export const DecisionGraphEmpty: React.FC<DecisionGraphEmptyType> = ({
  id,
  defaultValue,
  value,
  name,
  disabled = false,
  onChange,
  components,
  customNodes,
  defaultActivePanel,
  hideLeftToolbar,
  panels,
  simulate,
  decisionKeyOptions,
  onPanelsChange,
  onReactFlowInit,
  onCodeExtension,
  onFunctionReady,
}) => {
  const mountedRef = useRef(false);
  const graphActions = useDecisionGraphActions();
  const { stateStore, listenerStore } = useDecisionGraphRaw();
  const { decisionGraph } = useDecisionGraphState(({ decisionGraph }) => ({ decisionGraph }));

  const innerChange = useDebouncedCallback((graph: DecisionGraphType) => {
    onChange?.(graph);
  }, 100);

  useEffect(() => {
    stateStore.setState({
      id,
      disabled,
      components: Array.isArray(components) ? components : [],
      customNodes: Array.isArray(customNodes) ? customNodes : [],
      panels,
      hideLeftToolbar,
      decisionKeyOptions: Array.isArray(decisionKeyOptions) ? decisionKeyOptions : undefined,
    });
  }, [id, disabled, components, customNodes, panels, hideLeftToolbar, decisionKeyOptions]);

  useEffect(() => {
    stateStore.setState({ name: name ?? 'graph.json' });
  }, [name]);

  useEffect(() => {
    stateStore.setState({ simulate });
  }, [simulate]);

  useEffect(() => {
    listenerStore.setState({
      onReactFlowInit,
      onPanelsChange,
      onCodeExtension,
      onFunctionReady,
    });
  }, [onReactFlowInit, onPanelsChange, onCodeExtension, onFunctionReady]);

  useEffect(() => {
    listenerStore.setState({ onChange: innerChange });
  }, [innerChange]);

  useEffect(() => {
    if (mountedRef.current && value !== undefined && !equal(value, decisionGraph)) {
      graphActions.setDecisionGraph(value);
    }
  }, [value]);

  useEffect(() => {
    if (value !== undefined) {
      graphActions.setDecisionGraph(value);
    } else if (defaultValue !== undefined) {
      graphActions.setDecisionGraph(defaultValue);
    }

    stateStore.setState({
      activePanel: defaultActivePanel,
      hideLeftToolbar,
    });
    mountedRef.current = true;
  }, []);

  return null;
};
