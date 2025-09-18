import React from 'react';
import './CharacterComponent.css';

interface CharacterComponentProps {
  isTimeTrackingActive: boolean;
}

const CharacterComponent: React.FC<CharacterComponentProps> = ({ isTimeTrackingActive }) => {
  return (
    <div className="character-container">
      <div className={`character ${isTimeTrackingActive ? 'running' : ''}`}>
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
        {/* 走っている時のエフェクト */}
        {isTimeTrackingActive && (
          <div className="running-effects">
            <div className="running-dust dust-1"></div>
            <div className="running-dust dust-2"></div>
            <div className="running-dust dust-3"></div>
            <div className="running-dust dust-4"></div>
            <div className="running-dust dust-5"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterComponent;
