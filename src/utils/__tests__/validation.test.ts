import {
  validateEmail,
  validatePassword,
  validateName,
  calculatePasswordStrength,
  isCommonPassword,
  ValidationResult,
  PasswordStrength,
} from '../validation';

describe('validation', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.com',
        'user+tag@example.org',
        'user123@test-domain.co.jp',
        'simple@example.com',
      ];

      validEmails.forEach((email) => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject empty email', () => {
      const result = validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('メールアドレスを入力してください');
    });

    it('should reject whitespace-only email', () => {
      const result = validateEmail('   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('メールアドレスを入力してください');
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'plainaddress',
        '@missinglocal.com',
        'missing@.com',
        'missing@domain',
        'spaces @example.com',
        'user@',
        'user@@domain.com',
        'user@domain@domain.com',
      ];

      invalidEmails.forEach((email) => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('正しいメールアドレスを入力してください');
      });
    });

    it('should reject email that is too long', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const result = validateEmail(longEmail);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('メールアドレスが長すぎます');
    });

    it('should validate email at maximum length', () => {
      // Create an email that is exactly 254 characters
      const localPart = 'a'.repeat(240);
      const email = `${localPart}@example.com`; // 240 + 1 + 11 + 1 = 253 characters
      const result = validateEmail(email);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong password', () => {
      const result = validatePassword('StrongPass123');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty password', () => {
      const result = validatePassword('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('パスワードを入力してください');
    });

    it('should reject password shorter than 8 characters', () => {
      const result = validatePassword('Pass1');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('パスワードは8文字以上で入力してください');
    });

    it('should reject password longer than 128 characters', () => {
      const longPassword = 'A'.repeat(120) + 'a1' + 'B'.repeat(10);
      const result = validatePassword(longPassword);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('パスワードは128文字以内で入力してください');
    });

    it('should reject password without lowercase', () => {
      const result = validatePassword('PASSWORD123');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('小文字を含める必要があります');
    });

    it('should reject password without uppercase', () => {
      const result = validatePassword('password123');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('大文字を含める必要があります');
    });

    it('should reject password without numbers', () => {
      const result = validatePassword('PasswordABC');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('数字を含める必要があります');
    });

    it('should validate password with all requirements', () => {
      const validPasswords = ['Password123', 'StrongPass1', 'MySecure9Pass', 'Valid1Password'];

      validPasswords.forEach((password) => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });
  });

  describe('validateName', () => {
    it('should validate correct names', () => {
      const validNames = [
        '田中太郎',
        'John Doe',
        'Alice',
        'Bob Smith',
        'マリー・キュリー',
        'José María',
      ];

      validNames.forEach((name) => {
        const result = validateName(name);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject empty name', () => {
      const result = validateName('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('名前を入力してください');
    });

    it('should reject whitespace-only name', () => {
      const result = validateName('   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('名前を入力してください');
    });

    it('should reject name shorter than 2 characters', () => {
      const result = validateName('A');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('名前は2文字以上で入力してください');
    });

    it('should reject name longer than 50 characters', () => {
      const longName = 'A'.repeat(51);
      const result = validateName(longName);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('名前は50文字以内で入力してください');
    });

    it('should handle names with leading/trailing spaces', () => {
      const result = validateName('  Valid Name  ');
      expect(result.isValid).toBe(true);
    });

    it('should validate name at minimum length', () => {
      const result = validateName('AB');
      expect(result.isValid).toBe(true);
    });

    it('should validate name at maximum length', () => {
      const maxName = 'A'.repeat(50);
      const result = validateName(maxName);
      expect(result.isValid).toBe(true);
    });
  });

  describe('calculatePasswordStrength', () => {
    it('should return empty state for empty password', () => {
      const result = calculatePasswordStrength('');
      expect(result.score).toBe(0);
      expect(result.message).toBe('');
      expect(result.color).toBe('bg-gray-200');
    });

    it('should return weak strength for passwords with 1-2 criteria', () => {
      const weakPasswords = [
        'password', // only lowercase
        'PASSWORD', // only uppercase
        '12345678', // only numbers
        'Password', // uppercase + lowercase
      ];

      weakPasswords.forEach((password) => {
        const result = calculatePasswordStrength(password);
        expect(result.score).toBeLessThanOrEqual(40);
        expect(result.message).toBe('弱い');
        expect(result.color).toBe('bg-red-500');
      });
    });

    it('should return normal strength for passwords with 3 criteria', () => {
      const normalPasswords = [
        'Password1', // uppercase + lowercase + number
        'password1!', // lowercase + number + special (but short)
      ];

      normalPasswords.forEach((password) => {
        const result = calculatePasswordStrength(password);
        expect(result.score).toBe(60);
        expect(result.message).toBe('普通');
        expect(result.color).toBe('bg-yellow-500');
      });
    });

    it('should return strong strength for passwords with 4 criteria', () => {
      const strongPasswords = [
        'Password1!', // uppercase + lowercase + number + special
        'MyPass123!', // all criteria
      ];

      strongPasswords.forEach((password) => {
        const result = calculatePasswordStrength(password);
        expect(result.score).toBe(80);
        expect(result.message).toBe('強い');
        expect(result.color).toBe('bg-blue-500');
      });
    });

    it('should return very strong strength for passwords with all 5 criteria', () => {
      const veryStrongPasswords = [
        'MyStrongP@ss1', // length + all character types
        'ComplexPass123!', // length + all character types
      ];

      veryStrongPasswords.forEach((password) => {
        const result = calculatePasswordStrength(password);
        expect(result.score).toBe(100);
        expect(result.message).toBe('非常に強い');
        expect(result.color).toBe('bg-green-500');
      });
    });

    it('should correctly identify special characters', () => {
      const specialChars = '!@#$%^&*(),.?":{}|<>';
      specialChars.split('').forEach((char) => {
        const password = `Password1${char}`;
        const result = calculatePasswordStrength(password);
        expect(result.score).toBeGreaterThanOrEqual(80); // Should have special char bonus
      });
    });
  });

  describe('isCommonPassword', () => {
    it('should identify common passwords', () => {
      const commonPasswords = [
        'password',
        '123456',
        '123456789',
        'qwerty',
        'abc123',
        'password123',
        'admin',
        'letmein',
        'welcome',
        'monkey',
      ];

      commonPasswords.forEach((password) => {
        expect(isCommonPassword(password)).toBe(true);
      });
    });

    it('should identify common passwords regardless of case', () => {
      const commonPasswordsVariations = [
        'PASSWORD',
        'Password',
        'QWERTY',
        'Qwerty',
        'ADMIN',
        'Admin',
      ];

      commonPasswordsVariations.forEach((password) => {
        expect(isCommonPassword(password)).toBe(true);
      });
    });

    it('should not identify secure passwords as common', () => {
      const securePasswords = [
        'MySecurePassword123',
        'ComplexP@ssw0rd',
        'UniquePa$$word789',
        'CustomSecure1!',
      ];

      securePasswords.forEach((password) => {
        expect(isCommonPassword(password)).toBe(false);
      });
    });

    it('should handle empty string', () => {
      expect(isCommonPassword('')).toBe(false);
    });

    it('should handle partial matches that are not common', () => {
      const partialMatches = [
        'password1234', // contains 'password' but longer
        'mypassword', // contains 'password' but with prefix
        '123456789012', // contains '123456789' but longer
      ];

      partialMatches.forEach((password) => {
        expect(isCommonPassword(password)).toBe(false);
      });
    });
  });

  describe('Type definitions', () => {
    it('should have correct ValidationResult interface', () => {
      const validResult: ValidationResult = { isValid: true };
      const invalidResult: ValidationResult = {
        isValid: false,
        error: 'Test error',
      };

      expect(validResult.isValid).toBe(true);
      expect(validResult.error).toBeUndefined();
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.error).toBe('Test error');
    });

    it('should have correct PasswordStrength interface', () => {
      const strength: PasswordStrength = {
        score: 80,
        message: '強い',
        color: 'bg-blue-500',
      };

      expect(strength.score).toBe(80);
      expect(strength.message).toBe('強い');
      expect(strength.color).toBe('bg-blue-500');
    });
  });
});
