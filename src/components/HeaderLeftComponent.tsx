import React from 'react';
import './HeaderLeftComponent.css';
import CharacterComponent from './CharacterComponent';

interface HeaderLeftComponentProps {
  isTimeTrackingActive: boolean;
}

const HeaderLeftComponent: React.FC<HeaderLeftComponentProps> = ({ isTimeTrackingActive }) => {
  return (
    <div className="header-left">
      <CharacterComponent isTimeTrackingActive={isTimeTrackingActive} />
    </div>
  );
};

export default HeaderLeftComponent;
