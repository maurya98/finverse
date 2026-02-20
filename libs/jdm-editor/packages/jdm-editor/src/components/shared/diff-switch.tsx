import { Space, Switch, type SwitchProps } from 'antd';
import React from 'react';

import { ArrowDiffIcon } from '../arrow-diff-icon';

export type DiffSwitchProps = {
  previousChecked?: boolean;
  displayDiff?: boolean;
} & SwitchProps;

export const DiffSwitch: React.FC<DiffSwitchProps> = ({ displayDiff, previousChecked, ...rest }) => {
  return (
    // @ts-ignore - Ant Design v5 React 19 compatibility issue
    <Space size={4}>
      {displayDiff && (
        <>
          {/* @ts-ignore - Ant Design v5 React 19 compatibility issue */}
          <Switch disabled={rest.disabled} size={'small'} checked={previousChecked} />
          <ArrowDiffIcon />
        </>
      )}
      {/* @ts-ignore - Ant Design v5 React 19 compatibility issue */}
      <Switch size={'small'} {...rest} />
    </Space>
  );
};
