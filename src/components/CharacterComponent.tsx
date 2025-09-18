import React from 'react';
import './CharacterComponent.css';

const CharacterComponent: React.FC = () => {
  return (
    <div className="character-container">
      <div className="character">
        <div className="character-halo"></div>
        <div className="character-wings">
          <div className="wing left-wing"></div>
          <div className="wing right-wing"></div>
        </div>
        <div className="character-face">
          <div className="character-eyes">
            <div className="eye left-eye"></div>
            <div className="eye right-eye"></div>
          </div>
          <div className="character-mouth"></div>
        </div>
        <div className="character-body"></div>
        <div className="character-arms">
          <div className="arm left-arm"></div>
          <div className="arm right-arm"></div>
        </div>
        <div className="sparkles">
          <div className="sparkle sparkle-1"></div>
          <div className="sparkle sparkle-2"></div>
          <div className="sparkle sparkle-3"></div>
          <div className="sparkle sparkle-4"></div>
          <div className="sparkle sparkle-5"></div>
          <div className="sparkle sparkle-6"></div>
        </div>
      </div>
    </div>
  );
};

export default CharacterComponent;
