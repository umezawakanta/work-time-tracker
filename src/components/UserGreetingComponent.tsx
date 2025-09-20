import React from 'react';
import './UserGreetingComponent.css';
import type { User, Character } from '../types';

interface UserGreetingComponentProps {
  user: User | null;
  currentCharacter: Character | null;
}

const UserGreetingComponent: React.FC<UserGreetingComponentProps> = ({
  user,
  currentCharacter,
}) => {
  return (
    <div className="user-greeting">
      <div className="header-character">
        {currentCharacter ? (
          <div
            className="current-character-svg"
            dangerouslySetInnerHTML={{ __html: currentCharacter.svg }}
          />
        ) : (
          <div className="default-character">👋</div>
        )}
      </div>
      <span>
        こんにちは、{user?.displayName || user?.email || "User"}さん！
      </span>
    </div>
  );
};

export default UserGreetingComponent;
