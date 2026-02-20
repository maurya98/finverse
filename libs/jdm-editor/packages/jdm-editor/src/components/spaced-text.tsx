import { Typography } from 'antd';
import React from 'react';

import { Stack } from './stack';

export type SpacedTextProps = {
  left: React.ReactNode;
  right?: React.ReactNode;
  gap?: number;
};

export const SpacedText: React.VFC<SpacedTextProps> = ({ left, right, gap = 16 }) => {
  return (
    <Stack gap={gap} horizontal horizontalAlign='space-between'>
      {/* @ts-ignore - Ant Design v5 React 19 compatibility issue */}
      <Typography.Text style={{ color: 'inherit' }}>{left}</Typography.Text>
      {/* @ts-ignore - Ant Design v5 React 19 compatibility issue */}
      {right && <Typography.Text style={{ color: 'inherit' }}>{right}</Typography.Text>}
    </Stack>
  );
};
