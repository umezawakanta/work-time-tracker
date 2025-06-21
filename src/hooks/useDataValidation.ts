import { useState, useCallback, useMemo } from 'react';

// データ検証結果の型定義
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

// 検証ルールの型定義
export interface ValidationRule<T = any> {
  field: string;
  validator: (value: T, data: any) => boolean;
  message: string;
  code: string;
  severity?: 'error' | 'warning' | 'info';
}

export interface DataValidationOptions {
  strict?: boolean; // 厳密モード
  stopOnFirstError?: boolean; // 最初のエラーで停止
  includeWarnings?: boolean; // 警告も含める
}

export const useDataValidation = <T extends Record<string, any>>(
  validationRules: ValidationRule[],
  options: DataValidationOptions = {}
) => {
  const [lastValidation, setLastValidation] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const defaultOptions: Required<DataValidationOptions> = {
    strict: false,
    stopOnFirstError: false,
    includeWarnings: true,
    ...options,
  };

  // 基本的な検証ルール
  const builtInValidators = useMemo(
    () => ({
      required: (value: any) => value !== null && value !== undefined && value !== '',
      isString: (value: any) => typeof value === 'string',
      isNumber: (value: any) => typeof value === 'number' && !isNaN(value),
      isArray: (value: any) => Array.isArray(value),
      isObject: (value: any) =>
        value !== null && typeof value === 'object' && !Array.isArray(value),
      isEmail: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      isUrl: (value: string) => {
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      minLength: (min: number) => (value: string) => value.length >= min,
      maxLength: (max: number) => (value: string) => value.length <= max,
      range: (min: number, max: number) => (value: number) => value >= min && value <= max,
      isDate: (value: any) => value instanceof Date || !isNaN(Date.parse(value)),
      isValidId: (value: string) => /^[a-zA-Z0-9_-]+$/.test(value),
      noHtml: (value: string) => !/<[^>]*>/g.test(value),
    }),
    []
  );

  // データ型検証
  const validateDataType = useCallback((data: any, expectedType: string): boolean => {
    switch (expectedType) {
      case 'string':
        return typeof data === 'string';
      case 'number':
        return typeof data === 'number' && !isNaN(data);
      case 'boolean':
        return typeof data === 'boolean';
      case 'array':
        return Array.isArray(data);
      case 'object':
        return data !== null && typeof data === 'object' && !Array.isArray(data);
      case 'date':
        return data instanceof Date || !isNaN(Date.parse(data));
      default:
        return true;
    }
  }, []);

  // APIレスポンス検証
  const validateApiResponse = useCallback(
    (response: any): ValidationResult => {
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      // HTMLレスポンスの検出
      if (typeof response === 'string' && response.includes('<!doctype html>')) {
        errors.push({
          field: 'response',
          message: 'APIからHTMLレスポンスが返されました',
          code: 'HTML_RESPONSE',
          severity: 'error',
        });
      }

      // レスポンス構造の検証
      if (response && typeof response === 'object') {
        // データプロパティの存在確認
        if (
          !Object.prototype.hasOwnProperty.call(response, 'data') &&
          !Object.prototype.hasOwnProperty.call(response, 'error')
        ) {
          warnings.push({
            field: 'response',
            message: 'レスポンスにdataまたはerrorプロパティがありません',
            suggestion: 'APIレスポンス形式を統一してください',
          });
        }

        // エラーレスポンスの処理
        if (response.error) {
          errors.push({
            field: 'api',
            message: response.error.message || 'APIエラーが発生しました',
            code: response.error.code || 'API_ERROR',
            severity: 'error',
          });
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings: defaultOptions.includeWarnings ? warnings : [],
      };
    },
    [defaultOptions.includeWarnings]
  );

  // 配列データの検証
  const validateArrayData = useCallback(
    (
      data: any[],
      itemValidator?: (item: any, index: number) => ValidationResult
    ): ValidationResult => {
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      if (!Array.isArray(data)) {
        errors.push({
          field: 'data',
          message: '配列が期待されましたが、異なる型が提供されました',
          code: 'INVALID_ARRAY',
          severity: 'error',
        });
        return { isValid: false, errors, warnings };
      }

      // 空配列の警告
      if (data.length === 0) {
        warnings.push({
          field: 'data',
          message: '空の配列です',
          suggestion: 'データが存在するか確認してください',
        });
      }

      // 各要素の検証
      if (itemValidator) {
        data.forEach((item, index) => {
          const result = itemValidator(item, index);
          result.errors.forEach((error) => {
            errors.push({
              ...error,
              field: `data[${index}].${error.field}`,
            });
          });
          result.warnings.forEach((warning) => {
            warnings.push({
              ...warning,
              field: `data[${index}].${warning.field}`,
            });
          });
        });
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings: defaultOptions.includeWarnings ? warnings : [],
      };
    },
    [defaultOptions.includeWarnings]
  );

  // メイン検証関数
  const validate = useCallback(
    async (data: T): Promise<ValidationResult> => {
      setIsValidating(true);
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      try {
        for (const rule of validationRules) {
          const fieldValue = data[rule.field];
          const isValid = rule.validator(fieldValue, data);

          if (!isValid) {
            const error: ValidationError = {
              field: rule.field,
              message: rule.message,
              code: rule.code,
              severity: rule.severity || 'error',
            };

            if (error.severity === 'error') {
              errors.push(error);
            } else {
              warnings.push({
                field: error.field,
                message: error.message,
              });
            }

            if (defaultOptions.stopOnFirstError && error.severity === 'error') {
              break;
            }
          }
        }

        const result: ValidationResult = {
          isValid: errors.length === 0,
          errors,
          warnings: defaultOptions.includeWarnings ? warnings : [],
        };

        setLastValidation(result);
        return result;
      } catch (error) {
        const validationError: ValidationError = {
          field: 'validation',
          message: `検証中にエラーが発生しました: ${error instanceof Error ? error.message : 'Unknown error'}`,
          code: 'VALIDATION_ERROR',
          severity: 'error',
        };

        const result: ValidationResult = {
          isValid: false,
          errors: [validationError],
          warnings: [],
        };

        setLastValidation(result);
        return result;
      } finally {
        setIsValidating(false);
      }
    },
    [validationRules, defaultOptions]
  );

  // サニタイズ関数
  const sanitizeData = useCallback((data: any): any => {
    if (typeof data === 'string') {
      return data
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // script除去
        .replace(/<[^>]*>/g, '') // HTMLタグ除去
        .trim();
    }

    if (Array.isArray(data)) {
      return data.map((item) => sanitizeData(item));
    }

    if (data && typeof data === 'object') {
      const sanitized: any = {};
      Object.keys(data).forEach((key) => {
        sanitized[key] = sanitizeData(data[key]);
      });
      return sanitized;
    }

    return data;
  }, []);

  // 検証済みデータの取得
  const getValidatedData = useCallback(
    (data: T): { data: T; validation: ValidationResult } | null => {
      if (!lastValidation) return null;

      return {
        data: lastValidation.isValid ? data : sanitizeData(data),
        validation: lastValidation,
      };
    },
    [lastValidation, sanitizeData]
  );

  return {
    validate,
    validateApiResponse,
    validateArrayData,
    validateDataType,
    sanitizeData,
    getValidatedData,
    lastValidation,
    isValidating,
    builtInValidators,
  };
};
