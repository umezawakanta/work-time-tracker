import React from "react";
import "./HetamaIconComponent.css";

interface HetamaIconComponentProps {
  featureId: string;
  size?: "small" | "medium" | "large";
  className?: string;
}

const HetamaIconComponent: React.FC<HetamaIconComponentProps> = ({
  featureId,
  size = "medium",
  className = "",
}) => {
  return (
    <span className="section-icon">
      <div className="mini-character">
        <div className="mini-character-halo"></div>
        <div className="mini-character-wings">
          <div className="mini-wing left-mini-wing"></div>
          <div className="mini-wing right-mini-wing"></div>
        </div>
        <div className="mini-character-face">
          <div className="mini-character-eyes">
            <div className="mini-eye left-mini-eye"></div>
            <div className="mini-eye right-mini-eye"></div>
          </div>
          <div className="mini-character-mouth"></div>
        </div>
        <div className="mini-character-body"></div>
        <div className="mini-sparkles">
          <div className="mini-sparkle mini-sparkle-1"></div>
          <div className="mini-sparkle mini-sparkle-2"></div>
        </div>
      </div>
    </span>
  );
};

export default HetamaIconComponent;
