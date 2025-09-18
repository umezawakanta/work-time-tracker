import React from "react";
import "./DogCharacterComponent.css";

const DogCharacterComponent: React.FC = () => {
  return (
    <div className="dog-character-component">
      <div className="dog-character">
        {/* 犬の耳 */}
        <div className="dog-ear dog-ear-left"></div>
        <div className="dog-ear dog-ear-right"></div>
        
        {/* 犬の顔 */}
        <div className="dog-face">
          {/* 犬の目 */}
          <div className="dog-eye dog-eye-left"></div>
          <div className="dog-eye dog-eye-right"></div>
          
          {/* 犬の鼻 */}
          <div className="dog-nose"></div>
          
          {/* 犬の口 */}
          <div className="dog-mouth"></div>
          
          {/* 犬の舌 */}
          <div className="dog-tongue"></div>
        </div>
        
        {/* 犬の体 */}
        <div className="dog-body">
          {/* 犬の前足 */}
          <div className="dog-paw dog-paw-left"></div>
          <div className="dog-paw dog-paw-right"></div>
          
          {/* 犬のしっぽ */}
          <div className="dog-tail"></div>
        </div>
        
        {/* 犬の天使の輪っか */}
        <div className="dog-halo"></div>
        
        {/* 犬のハートエフェクト */}
        <div className="dog-heart dog-heart-1">💕</div>
        <div className="dog-heart dog-heart-2">💖</div>
        <div className="dog-heart dog-heart-3">💝</div>
      </div>
    </div>
  );
};

export default DogCharacterComponent;
