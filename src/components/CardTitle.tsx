import React from 'react';
import styled from 'styled-components';
import MagicIcon from './MagicIcon';

interface CardTitleProps {
  isDarkMode?: boolean;
}

const CardTitleWrapper = styled.div<{ $isDarkMode?: boolean }>`
  display: flex;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid ${props => props.$isDarkMode ? '#444' : '#e8e8e8'};
  background-color: ${props => props.$isDarkMode ? '#1f1f1f' : '#ffffff'};
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
`;

const StyledMagicIcon = styled(MagicIcon)`
  width: 24px;
  height: 24px;
  margin-right: 8px;
`;

const CardTitleText = styled.span`
  font-size: 18px;
  font-weight: 500;
`;

const CardTitle: React.FC<CardTitleProps> = ({ isDarkMode }) => (
  <CardTitleWrapper $isDarkMode={isDarkMode}>
    <StyledMagicIcon />
    <CardTitleText>AI Magic Response</CardTitleText>
  </CardTitleWrapper>
);

export default CardTitle;