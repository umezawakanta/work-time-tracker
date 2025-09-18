import React from 'react';
import './HeaderLeftComponent.css';
import CharacterComponent from './CharacterComponent';

const HeaderLeftComponent: React.FC = () => {
  return (
    <div className="header-left">
      <CharacterComponent />
    </div>
  );
};

export default HeaderLeftComponent;
