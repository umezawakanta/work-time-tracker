import React from 'react';
import './HeaderLeftComponent.css';
import CharacterComponent from './CharacterComponent';
import type { Character } from '../types/character';

interface HeaderLeftComponentProps {
  isTimeTrackingActive: boolean;
  currentCharacter?: Character | null;
  showCharacterInfo?: boolean;
}

const HeaderLeftComponent: React.FC<HeaderLeftComponentProps> = ({ 
  isTimeTrackingActive, 
  currentCharacter, 
  showCharacterInfo = false 
}) => {
  return (
    <div className="header-left">
      <CharacterComponent 
        isTimeTrackingActive={isTimeTrackingActive}
        currentCharacter={currentCharacter}
        showCharacterInfo={showCharacterInfo}
      />
    </div>
  );
};

export default HeaderLeftComponent;
