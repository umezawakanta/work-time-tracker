import React, { useState, useEffect } from 'react';
import { Character, CharacterForm, EvolutionEvent } from '../types/character';
import { characterEvolutionManager } from '../utils/characterEvolutionManager';
import './CharacterEvolution.css';

interface CharacterEvolutionProps {
  character: Character;
  onEvolutionComplete?: (newCharacter: Character) => void;
  onClose?: () => void;
}

const CharacterEvolution: React.FC<CharacterEvolutionProps> = ({
  character,
  onEvolutionComplete,
  onClose
}) => {
  const [availableForms, setAvailableForms] = useState<CharacterForm[]>([]);
  const [evolutionHistory, setEvolutionHistory] = useState<EvolutionEvent[]>([]);
  const [selectedForm, setSelectedForm] = useState<CharacterForm | null>(null);
  const [isEvolving, setIsEvolving] = useState(false);
  const [evolutionProgress, setEvolutionProgress] = useState(0);

  useEffect(() => {
    loadEvolutionData();
  }, [character]);

  const loadEvolutionData = () => {
    const forms = characterEvolutionManager.getAvailableForms(character);
    const history = characterEvolutionManager.getEvolutionHistory(character);
    
    setAvailableForms(forms);
    setEvolutionHistory(history);
  };

  const handleEvolution = async (targetForm: CharacterForm) => {
    if (isEvolving) return;

    setIsEvolving(true);
    setSelectedForm(targetForm);
    setEvolutionProgress(0);

    // 進化アニメーション
    const animationDuration = 3000;
    const progressInterval = setInterval(() => {
      setEvolutionProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          completeEvolution(targetForm);
          return 100;
        }
        return prev + 2;
      });
    }, animationDuration / 50);

    // 進化を実行
    const evolvedCharacter = characterEvolutionManager.evolveCharacter(character, targetForm.id);
    
    setTimeout(() => {
      onEvolutionComplete?.(evolvedCharacter);
      setIsEvolving(false);
      setEvolutionProgress(0);
      setSelectedForm(null);
    }, animationDuration);
  };

  const completeEvolution = (targetForm: CharacterForm) => {
    const evolvedCharacter = characterEvolutionManager.evolveCharacter(character, targetForm.id);
    onEvolutionComplete?.(evolvedCharacter);
  };

  const canEvolveTo = (form: CharacterForm): boolean => {
    return characterEvolutionManager.checkEvolutionRequirements(character, form);
  };

  const getFormStatus = (form: CharacterForm): 'current' | 'available' | 'locked' => {
    if (form.id === character.currentForm) return 'current';
    if (canEvolveTo(form)) return 'available';
    return 'locked';
  };

  const getRequirementText = (form: CharacterForm): string => {
    const { requirements } = form;
    const conditions: string[] = [];

    if (requirements.level) {
      conditions.push(`レベル ${requirements.level}`);
    }
    if (requirements.experience) {
      conditions.push(`経験値 ${requirements.experience.toLocaleString()}`);
    }
    if (requirements.badges) {
      conditions.push(`バッジ ${requirements.badges.length}個`);
    }
    if (requirements.stats) {
      const statText = Object.entries(requirements.stats)
        .map(([stat, value]) => `${stat}: ${value}`)
        .join(', ');
      conditions.push(`ステータス ${statText}`);
    }

    return conditions.join(' / ');
  };

  return (
    <div className="character-evolution">
      <div className="evolution-header">
        <h3>{character.name}の進化</h3>
        {onClose && (
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        )}
      </div>

      {/* 現在のフォーム */}
      <div className="current-form-section">
        <h4>現在のフォーム</h4>
        <div className="current-form">
          <div className="form-icon">
            {characterEvolutionManager.getCurrentForm(character)?.appearance.svg}
          </div>
          <div className="form-info">
            <h5>{characterEvolutionManager.getCurrentForm(character)?.name}</h5>
            <p>{characterEvolutionManager.getCurrentForm(character)?.description}</p>
            <div className="form-level">
              レベル {character.level} / 経験値 {character.totalExperience.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* 進化可能なフォーム */}
      <div className="available-forms-section">
        <h4>進化可能なフォーム</h4>
        <div className="forms-grid">
          {availableForms.map(form => {
            const status = getFormStatus(form);
            const canEvolve = canEvolveTo(form);
            
            return (
              <div 
                key={form.id} 
                className={`form-card ${status} ${canEvolve ? 'evolvable' : ''}`}
                onClick={() => canEvolve && handleEvolution(form)}
              >
                <div className="form-icon">
                  {form.appearance.svg}
                </div>
                <div className="form-info">
                  <h5>{form.name}</h5>
                  <p>{form.description}</p>
                  <div className="form-requirements">
                    {getRequirementText(form)}
                  </div>
                  {status === 'current' && (
                    <div className="current-badge">現在</div>
                  )}
                  {canEvolve && status !== 'current' && (
                    <div className="evolve-button">進化する</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 進化履歴 */}
      {evolutionHistory.length > 0 && (
        <div className="evolution-history-section">
          <h4>進化履歴</h4>
          <div className="history-list">
            {evolutionHistory.map(event => (
              <div key={event.id} className="history-item">
                <div className="history-icon">✨</div>
                <div className="history-info">
                  <div className="history-text">
                    {event.fromForm} → {event.toForm}
                  </div>
                  <div className="history-date">
                    {event.timestamp.toLocaleDateString()} レベル {event.level}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 進化アニメーション */}
      {isEvolving && selectedForm && (
        <div className="evolution-animation">
          <div className="evolution-overlay">
            <div className="evolution-content">
              <h3>進化中...</h3>
              <div className="evolution-progress">
                <div 
                  className="progress-bar"
                  style={{ width: `${evolutionProgress}%` }}
                />
              </div>
              <div className="evolution-forms">
                <div className="from-form">
                  <div className="form-icon">
                    {characterEvolutionManager.getCurrentForm(character)?.appearance.svg}
                  </div>
                  <div className="form-name">
                    {characterEvolutionManager.getCurrentForm(character)?.name}
                  </div>
                </div>
                <div className="evolution-arrow">→</div>
                <div className="to-form">
                  <div className="form-icon">
                    {selectedForm.appearance.svg}
                  </div>
                  <div className="form-name">
                    {selectedForm.name}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterEvolution;
