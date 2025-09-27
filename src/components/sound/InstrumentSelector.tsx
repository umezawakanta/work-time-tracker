import React from 'react';
import { InstrumentType } from './SimpleAudioEngine';

interface InstrumentSelectorProps {
  selectedInstrument: InstrumentType;
  onInstrumentChange: (instrument: InstrumentType) => void;
  disabled?: boolean;
}

const InstrumentSelector: React.FC<InstrumentSelectorProps> = ({
  selectedInstrument,
  onInstrumentChange,
  disabled = false
}) => {
  const instruments = [
    { type: InstrumentType.MEIWA, name: '明和電機', description: '8bit風の電子音' },
    { type: InstrumentType.PIANO, name: 'ピアノ', description: 'クラシックな音色' },
    { type: InstrumentType.GUITAR, name: 'ギター', description: 'ロック・ポップス向け' },
    { type: InstrumentType.DRUM, name: 'ドラム', description: 'リズム楽器' },
    { type: InstrumentType.BASS, name: 'ベース', description: '低音域の音色' },
    { type: InstrumentType.SYNTH, name: 'シンセ', description: '電子音楽向け' }
  ];

  return (
    <div className="instrument-selector">
      <h3>楽器選択</h3>
      <div className="instrument-grid">
        {instruments.map((instrument) => (
          <button
            key={instrument.type}
            className={`instrument-button ${selectedInstrument === instrument.type ? 'selected' : ''}`}
            onClick={() => onInstrumentChange(instrument.type)}
            disabled={disabled}
            title={instrument.description}
          >
            <div className="instrument-name">{instrument.name}</div>
            <div className="instrument-description">{instrument.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default InstrumentSelector;
