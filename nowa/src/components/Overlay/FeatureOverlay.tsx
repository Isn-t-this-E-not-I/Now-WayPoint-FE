// src/components/Overlay/FeatureOverlay.tsx

import React from 'react';
import styled from 'styled-components';
import { FaXmark } from "react-icons/fa6";

const OverlayBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const OverlayContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  max-width: 500px;
  width: 90%;
  text-align: center;
  position: relative;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  position: absolute;
  top: 10px;
  right: 20px;
  cursor: pointer;
  color: lightgray;
`;

interface FeatureOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
}

const FeatureOverlay: React.FC<FeatureOverlayProps> = ({ isOpen, onClose, title, description }) => {
  if (!isOpen) return null;

  return (
    <OverlayBackground onClick={onClose}>
      <OverlayContainer onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <FaXmark />
        </CloseButton>
        <h2>{title}</h2>
        <p>{description}</p>
      </OverlayContainer>
    </OverlayBackground>
  );
};

export default FeatureOverlay;