import { generateDevProgressShareText } from '@/services/share/generateDevProgressShareText';

describe('generateDevProgressShareText', () => {
  it('includes three lines for login/logout/user-registration', () => {
    const text = generateDevProgressShareText();
    expect(text).toContain('開発状況アップデート');
    expect(
      text.split('\n').filter((l) => l.includes('リリース予定日')).length
    ).toBeGreaterThanOrEqual(3);
  });
});
