/**
 * ハッシュユーティリティ
 * AI機能で使用されるハッシュ関数群
 */

/**
 * 文字列からハッシュを生成（FNV-1a アルゴリズム）
 * @param str ハッシュ化する文字列
 * @returns ハッシュ値
 */
export function stringHash(str: string): string {
    // 64bit FNV-1a
    const FNV_PRIME = 0x00000100000001B3n;
    const OFFSET_BASIS = 0xCBF29CE484222325n;

    let hash = OFFSET_BASIS;

    for (let i = 0; i < str.length; i++) {
        hash ^= BigInt(str.charCodeAt(i));
        hash = (hash * FNV_PRIME) & 0xFFFFFFFFFFFFFFFFn;
    }

    return hash.toString(16);
}

/**
 * オブジェクトからハッシュを生成
 * @param obj ハッシュ化するオブジェクト
 * @returns ハッシュ値
 */
export function objectHash(obj: unknown): string {
    const sortAndSerialize = (value: unknown): string => {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';

        if (typeof value === 'function') {
            return value.toString();
        }

        if (typeof value === 'object') {
            if (Array.isArray(value)) {
                return `[${value.map(sortAndSerialize).join(',')}]`;
            }

            const keys = Object.keys(value).sort();
            const pairs = keys.map(key => `${key}:${sortAndSerialize((value as Record<string, unknown>)[key])}`);
            return `{${pairs.join(',')}}`;
        }

        return JSON.stringify(value);
    };

    // オブジェクトを正規化してハッシュ化
    const serialized = sortAndSerialize(obj);
    return stringHash(serialized);
}

/**
 * Base64エンコード
 * @param str エンコードする文字列
 * @returns Base64形式の文字列
 */
export function base64Encode(str: string): string {
    if (typeof btoa === 'function') {
        return btoa(unescape(encodeURIComponent(str)));
    }

    if (typeof Buffer !== 'undefined') {
        return Buffer.from(str).toString('base64');
    }

    throw new Error('Base64エンコードはサポートされていません');
}

/**
 * Base64デコード
 * @param base64 デコードするBase64文字列
 * @returns デコードされた文字列
 */
export function base64Decode(base64: string): string {
    if (typeof atob === 'function') {
        return decodeURIComponent(escape(atob(base64)));
    }

    if (typeof Buffer !== 'undefined') {
        return Buffer.from(base64, 'base64').toString();
    }

    throw new Error('Base64デコードはサポートされていません');
}

/**
 * シンプルな暗号化（非セキュア）
 * 注: これは簡易的な実装で、本格的なセキュリティには適していません
 * @param text 暗号化するテキスト
 * @param key 暗号化キー
 * @returns 暗号化されたテキスト
 */
export function simpleEncrypt(text: string, key = 'default-key'): string {
    const keyHash = stringHash(key).substring(0, 16);
    let result = '';

    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
        const keyChar = keyHash[i % keyHash.length];
        const keyCode = parseInt(keyChar, 16);
        result += String.fromCharCode(charCode ^ keyCode);
    }

    return base64Encode(result);
}

/**
 * シンプルな復号化（非セキュア）
 * @param encrypted 暗号化されたテキスト
 * @param key 暗号化キー
 * @returns 復号化されたテキスト
 */
export function simpleDecrypt(encrypted: string, key = 'default-key'): string {
    const keyHash = stringHash(key).substring(0, 16);
    const decoded = base64Decode(encrypted);
    let result = '';

    for (let i = 0; i < decoded.length; i++) {
        const charCode = decoded.charCodeAt(i);
        const keyChar = keyHash[i % keyHash.length];
        const keyCode = parseInt(keyChar, 16);
        result += String.fromCharCode(charCode ^ keyCode);
    }

    return result;
}