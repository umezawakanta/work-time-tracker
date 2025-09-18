import React from 'react';
import './HetamaCharacterComponent.css';

const HetamaCharacterComponent: React.FC = () => {
  return (
    <div className="bottom-right-character">
      <div className="hetama-character">
        <div className="hetama-halo"></div>
        <div className="hetama-wings">
          <div className="hetama-wing left-hetama-wing"></div>
          <div className="hetama-wing right-hetama-wing"></div>
        </div>
        <div className="hetama-face">
          <div className="hetama-eyes">
            <div className="hetama-eye left-hetama-eye"></div>
            <div className="hetama-eye right-hetama-eye"></div>
          </div>
          <div className="hetama-mouth"></div>
        </div>
        <div className="hetama-body"></div>
        <div className="hetama-arms">
          <div className="hetama-arm left-hetama-arm"></div>
          <div className="hetama-arm right-hetama-arm"></div>
        </div>
        <div className="hetama-legs">
          <div className="hetama-leg left-hetama-leg"></div>
          <div className="hetama-leg right-hetama-leg"></div>
        </div>
        <div className="hetama-sparkles">
          <div className="hetama-sparkle sparkle-1">✨</div>
          <div className="hetama-sparkle sparkle-2">⭐</div>
          <div className="hetama-sparkle sparkle-3">💫</div>
        </div>
      </div>
    </div>
  );
};

export default HetamaCharacterComponent;
