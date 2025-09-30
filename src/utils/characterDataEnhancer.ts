import { CharacterSvgGenerator } from './characterSvgGenerator';
import type { Character } from '../types/character';

/**
 * キャラクターデータを拡張するユーティリティ
 */
export class CharacterDataEnhancer {
  /**
   * キャラクターにSVGデータを追加
   */
  static enhanceCharacterWithSvg(character: Character): Character {
    if (!character.svg) {
      character.svg = CharacterSvgGenerator.generateCharacterSvg(character);
    }
    return character;
  }

  /**
   * キャラクター配列にSVGデータを追加
   */
  static enhanceCharactersWithSvg(characters: Character[]): Character[] {
    return characters.map(character => this.enhanceCharacterWithSvg(character));
  }

  /**
   * デフォルトのロゴキャラクターSVGを取得
   */
  static getDefaultLogoCharacterSvg(): string {
    return CharacterSvgGenerator.generateDefaultLogoCharacter();
  }

  /**
   * キャラクターのSVGを再生成
   */
  static regenerateCharacterSvg(character: Character): Character {
    character.svg = CharacterSvgGenerator.generateCharacterSvg(character);
    return character;
  }
}
