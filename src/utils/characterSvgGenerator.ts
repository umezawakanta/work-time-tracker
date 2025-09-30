import type { Character } from '../types/character';

/**
 * キャラクター用のSVG生成ユーティリティ
 */
export class CharacterSvgGenerator {
  /**
   * デフォルトのロゴキャラクターSVGを生成
   */
  static generateDefaultLogoCharacter(): string {
    return `
      <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
        <!-- 天使の輪っか -->
        <ellipse cx="40" cy="15" rx="25" ry="8" fill="none" stroke="#ffd700" stroke-width="2" opacity="0.8"/>
        
        <!-- 翼 -->
        <path d="M 20 25 Q 15 20 10 25 Q 15 30 20 25" fill="#ffffff" stroke="#e0e0e0" stroke-width="1"/>
        <path d="M 60 25 Q 65 20 70 25 Q 65 30 60 25" fill="#ffffff" stroke="#e0e0e0" stroke-width="1"/>
        
        <!-- 顔 -->
        <circle cx="40" cy="35" r="15" fill="#ffd1dc" stroke="#ffb6c1" stroke-width="2"/>
        
        <!-- 目 -->
        <circle cx="35" cy="32" r="2" fill="#000000"/>
        <circle cx="45" cy="32" r="2" fill="#000000"/>
        
        <!-- 口 -->
        <path d="M 35 40 Q 40 45 45 40" fill="none" stroke="#000000" stroke-width="2"/>
        
        <!-- 体 -->
        <ellipse cx="40" cy="55" rx="12" ry="15" fill="#ffd1dc" stroke="#ffb6c1" stroke-width="2"/>
        
        <!-- キラキラエフェクト -->
        <g opacity="0.8">
          <circle cx="25" cy="20" r="1" fill="#ffd700">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle cx="55" cy="25" r="1" fill="#ffd700">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" begin="0.5s"/>
          </circle>
          <circle cx="30" cy="45" r="1" fill="#ffd700">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" begin="1s"/>
          </circle>
          <circle cx="50" cy="50" r="1" fill="#ffd700">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" begin="1.5s"/>
          </circle>
        </g>
      </svg>
    `;
  }

  /**
   * キャラクターのSVGを生成
   */
  static generateCharacterSvg(character: Character): string {
    const baseColor = this.getCharacterBaseColor(character.type);
    const eyeColor = this.getCharacterEyeColor(character.type);
    const accentColor = this.getCharacterAccentColor(character.type);

    return `
      <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
        <!-- 背景エフェクト -->
        ${this.generateBackgroundEffects(character)}
        
        <!-- 装飾要素 -->
        ${this.generateDecorations(character)}
        
        <!-- メインキャラクター -->
        ${this.generateMainCharacter(character, baseColor, eyeColor, accentColor)}
        
        <!-- レベル表示 -->
        ${this.generateLevelDisplay(character)}
        
        <!-- バッジ表示 -->
        ${this.generateBadgeDisplay(character)}
      </svg>
    `;
  }

  /**
   * 背景エフェクトを生成
   */
  private static generateBackgroundEffects(character: Character): string {
    if (character.level >= 10) {
      return `
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style="stop-color:${this.getCharacterAccentColor(character.type)};stop-opacity:0.3"/>
            <stop offset="100%" style="stop-color:${this.getCharacterAccentColor(character.type)};stop-opacity:0"/>
          </radialGradient>
        </defs>
        <circle cx="40" cy="40" r="35" fill="url(#glow)"/>
      `;
    }
    return '';
  }

  /**
   * 装飾要素を生成
   */
  private static generateDecorations(character: Character): string {
    let decorations = '';
    
    // レベルに応じた装飾
    if (character.level >= 5) {
      decorations += `
        <circle cx="40" cy="15" r="3" fill="#ffd700" opacity="0.8">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
        </circle>
      `;
    }
    
    if (character.level >= 10) {
      decorations += `
        <circle cx="30" cy="20" r="2" fill="#ffd700" opacity="0.6">
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="50" cy="20" r="2" fill="#ffd700" opacity="0.6">
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.5s" repeatCount="indefinite" begin="0.5s"/>
        </circle>
      `;
    }

    return decorations;
  }

  /**
   * メインキャラクターを生成
   */
  private static generateMainCharacter(character: Character, baseColor: string, eyeColor: string, accentColor: string): string {
    return `
      <!-- 体 -->
      <ellipse cx="40" cy="50" rx="15" ry="20" fill="${baseColor}" stroke="${accentColor}" stroke-width="2"/>
      
      <!-- 頭 -->
      <circle cx="40" cy="35" r="12" fill="${baseColor}" stroke="${accentColor}" stroke-width="2"/>
      
      <!-- 目 -->
      <circle cx="36" cy="32" r="2" fill="${eyeColor}"/>
      <circle cx="44" cy="32" r="2" fill="${eyeColor}"/>
      
      <!-- 口 -->
      <path d="M 36 38 Q 40 42 44 38" fill="none" stroke="${eyeColor}" stroke-width="2"/>
      
      <!-- 手足 -->
      <ellipse cx="30" cy="60" rx="3" ry="8" fill="${baseColor}" stroke="${accentColor}" stroke-width="1"/>
      <ellipse cx="50" cy="60" rx="3" ry="8" fill="${baseColor}" stroke="${accentColor}" stroke-width="1"/>
      <ellipse cx="25" cy="45" rx="3" ry="6" fill="${baseColor}" stroke="${accentColor}" stroke-width="1"/>
      <ellipse cx="55" cy="45" rx="3" ry="6" fill="${baseColor}" stroke="${accentColor}" stroke-width="1"/>
    `;
  }

  /**
   * レベル表示を生成
   */
  private static generateLevelDisplay(character: Character): string {
    return `
      <g transform="translate(65, 15)">
        <rect x="0" y="0" width="12" height="12" rx="6" fill="#ff6b6b" stroke="#fff" stroke-width="1"/>
        <text x="6" y="8" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="white">${character.level}</text>
      </g>
    `;
  }

  /**
   * バッジ表示を生成
   */
  private static generateBadgeDisplay(character: Character): string {
    if (!character.badges || character.badges.length === 0) return '';
    
    const badgeCount = Math.min(character.badges.length, 3);
    let badges = '';
    
    for (let i = 0; i < badgeCount; i++) {
      const x = 15 + (i * 8);
      badges += `
        <g transform="translate(${x}, 65)">
          <circle cx="0" cy="0" r="4" fill="#ffd700" stroke="#fff" stroke-width="1"/>
          <text x="0" y="1" text-anchor="middle" font-family="Arial, sans-serif" font-size="6" fill="#333">🏆</text>
        </g>
      `;
    }
    
    return badges;
  }

  /**
   * キャラクタータイプに基づくベースカラーを取得
   */
  private static getCharacterBaseColor(type: string): string {
    const colorMap: { [key: string]: string } = {
      'default': '#ffd1dc',
      'pon': '#ffd1dc',
      'hetama': '#ffb6c1',
      'dog': '#d2b48c',
      'cat': '#f0e68c',
      'rabbit': '#f5f5dc'
    };
    return colorMap[type] || colorMap['default'];
  }

  /**
   * キャラクタータイプに基づく目色を取得
   */
  private static getCharacterEyeColor(type: string): string {
    const colorMap: { [key: string]: string } = {
      'default': '#000000',
      'pon': '#000000',
      'hetama': '#ff69b4',
      'dog': '#8b4513',
      'cat': '#ff6347',
      'rabbit': '#ff69b4'
    };
    return colorMap[type] || colorMap['default'];
  }

  /**
   * キャラクタータイプに基づくアクセントカラーを取得
   */
  private static getCharacterAccentColor(type: string): string {
    const colorMap: { [key: string]: string } = {
      'default': '#ffb6c1',
      'pon': '#ffb6c1',
      'hetama': '#ff69b4',
      'dog': '#8b4513',
      'cat': '#ff6347',
      'rabbit': '#ff69b4'
    };
    return colorMap[type] || colorMap['default'];
  }
}
