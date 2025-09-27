// MIDI出力機能
export interface MIDINote {
  note: number; // MIDI note number (0-127)
  velocity: number; // 0-127
  startTime: number; // ticks
  duration: number; // ticks
  channel: number; // 0-15
}

export interface MIDITrack {
  name: string;
  notes: MIDINote[];
  instrument: number; // General MIDI instrument number
  channel: number;
}

export interface MIDIFile {
  format: 0 | 1 | 2; // MIDI format
  tracks: MIDITrack[];
  ticksPerQuarter: number;
  tempo: number; // BPM
}

export class MIDIExporter {
  private static readonly MIDI_HEADER_SIZE = 14;
  private static readonly TRACK_HEADER_SIZE = 8;
  private static readonly DEFAULT_TICKS_PER_QUARTER = 480;

  // 音符名をMIDIノート番号に変換
  static noteNameToMIDI(noteName: string): number {
    const noteMap: { [key: string]: number } = {
      'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5,
      'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
    };

    const match = noteName.match(/^([A-G][#b]?)(\d+)$/);
    if (!match) return 60; // デフォルトは中央C

    const [, note, octave] = match;
    const noteNumber = noteMap[note] || 0;
    const octaveNumber = parseInt(octave, 10);
    
    return noteNumber + (octaveNumber + 1) * 12;
  }

  // 音符の長さをMIDIティックに変換
  static durationToTicks(duration: string, ticksPerQuarter: number): number {
    const durationMap: { [key: string]: number } = {
      'w': 4, 'h': 2, 'q': 1, '8': 0.5, '16': 0.25, '32': 0.125
    };

    const baseDuration = durationMap[duration] || 1;
    return Math.round(baseDuration * ticksPerQuarter);
  }

  // ScoreDataからMIDIファイルを生成
  static generateMIDI(scoreData: any): MIDIFile {
    const ticksPerQuarter = MIDIExporter.DEFAULT_TICKS_PER_QUARTER;
    const tempo = scoreData.tempo || 120;
    
    const track: MIDITrack = {
      name: scoreData.title || 'Generated Music',
      notes: [],
      instrument: 0, // Acoustic Grand Piano
      channel: 0
    };

    // 音符をMIDIノートに変換
    let currentTime = 0;
    scoreData.notes.forEach((note: any) => {
      const midiNote = MIDIExporter.noteNameToMIDI(note.pitch);
      const duration = MIDIExporter.durationToTicks(note.duration, ticksPerQuarter);
      const velocity = 80; // デフォルトのベロシティ

      track.notes.push({
        note: midiNote,
        velocity: velocity,
        startTime: currentTime,
        duration: duration,
        channel: 0
      });

      currentTime += duration;
    });

    return {
      format: 0, // Single track format
      tracks: [track],
      ticksPerQuarter: ticksPerQuarter,
      tempo: tempo
    };
  }

  // MIDIファイルをバイナリデータに変換
  static toBinary(midiFile: MIDIFile): Uint8Array {
    const tracks = midiFile.tracks;
    const ticksPerQuarter = midiFile.ticksPerQuarter;
    
    // ヘッダーチャンク
    const headerChunk = new Uint8Array([
      // "MThd"
      0x4D, 0x54, 0x68, 0x64,
      // Length (6 bytes)
      0x00, 0x00, 0x00, 0x06,
      // Format (0)
      0x00, 0x00,
      // Number of tracks
      0x00, tracks.length,
      // Ticks per quarter note
      (ticksPerQuarter >> 8) & 0xFF, ticksPerQuarter & 0xFF
    ]);

    // トラックチャンクを生成
    const trackChunks = tracks.map(track => {
      const events: Uint8Array[] = [];
      
      // テンポ設定
      const tempoMicroseconds = Math.round(60000000 / midiFile.tempo);
      events.push(new Uint8Array([
        0x00, // Delta time
        0xFF, 0x51, 0x03, // Set tempo
        (tempoMicroseconds >> 16) & 0xFF,
        (tempoMicroseconds >> 8) & 0xFF,
        tempoMicroseconds & 0xFF
      ]));

      // 楽器設定
      events.push(new Uint8Array([
        0x00, // Delta time
        0xC0 | track.channel, // Program change
        track.instrument
      ]));

      // 音符イベント
      track.notes.forEach(note => {
        // Note on
        events.push(new Uint8Array([
          note.startTime & 0xFF, // Delta time (簡略化)
          0x90 | track.channel, // Note on
          note.note,
          note.velocity
        ]));

        // Note off
        events.push(new Uint8Array([
          note.duration & 0xFF, // Delta time (簡略化)
          0x80 | track.channel, // Note off
          note.note,
          0x40 // Release velocity
        ]));
      });

      // End of track
      events.push(new Uint8Array([
        0x00, // Delta time
        0xFF, 0x2F, 0x00 // End of track
      ]));

      // トラックデータを結合
      const trackData = new Uint8Array(
        events.reduce((total, event) => total + event.length, 0)
      );
      let offset = 0;
      events.forEach(event => {
        trackData.set(event, offset);
        offset += event.length;
      });

      // トラックチャンクヘッダー + データ
      const trackChunk = new Uint8Array(8 + trackData.length);
      trackChunk.set([
        0x4D, 0x54, 0x72, 0x6B, // "MTrk"
        (trackData.length >> 24) & 0xFF,
        (trackData.length >> 16) & 0xFF,
        (trackData.length >> 8) & 0xFF,
        trackData.length & 0xFF
      ], 0);
      trackChunk.set(trackData, 8);

      return trackChunk;
    });

    // 全体のMIDIファイルを構築
    const totalLength = headerChunk.length + 
      trackChunks.reduce((total, chunk) => total + chunk.length, 0);
    
    const midiData = new Uint8Array(totalLength);
    let offset = 0;

    // ヘッダーを追加
    midiData.set(headerChunk, offset);
    offset += headerChunk.length;

    // トラックを追加
    trackChunks.forEach(trackChunk => {
      midiData.set(trackChunk, offset);
      offset += trackChunk.length;
    });

    return midiData;
  }

  // MIDIファイルをダウンロード
  static downloadMIDI(midiFile: MIDIFile, filename: string = 'score.mid'): void {
    const binaryData = MIDIExporter.toBinary(midiFile);
    const blob = new Blob([binaryData], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
  }
}
