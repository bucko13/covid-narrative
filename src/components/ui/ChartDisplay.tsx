import { Box } from '@material-ui/core';
import React from 'react';
import AboutThisGraph from '../AboutThisGraph';

interface ChartDisplayProps {
  title: string
  aboutText?: () => React.ReactNode
  children: React.ReactNode | string
}

const ChartDisplay = ({
  title,
  aboutText,
  children
}: ChartDisplayProps) => (
    <Box my={5}>
      <h4>{title}</h4>
      {
        aboutText &&
        <AboutThisGraph name={title}>
          {aboutText()}
        </AboutThisGraph>
      }
      {children}
    </Box>
  );

export default ChartDisplay;
