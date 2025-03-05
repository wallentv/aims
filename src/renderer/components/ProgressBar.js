import React from 'react';
import styled from 'styled-components';

const ProgressContainer = styled.div`
  width: 100%;
  height: 20px;
  background-color: ${props => props.theme.colors.surface};
  border-radius: 10px;
  margin-top: ${props => props.theme.spacing.large};
  overflow: hidden;
`;

const Progress = styled.div`
  height: 100%;
  background-color: ${props => props.theme.colors.primary};
  width: ${props => props.percent}%;
  transition: width 0.3s ease;
`;

function ProgressBar({ progress = 0 }) {
  return (
    <ProgressContainer>
      <Progress percent={progress} />
    </ProgressContainer>
  );
}

export default ProgressBar;