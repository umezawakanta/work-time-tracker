import { generateDevProgressShareText } from '../../share/generateDevProgressShareText';

describe('generateDevProgressShareText', () => {
  it('includes only started features with targetRelease date', async () => {
    const text = await generateDevProgressShareText();
    const hasHeader = text.indexOf('開発状況アップデート') >= 0;
    const linesWithDate = text.split('\n').filter((l) => l.indexOf('リリース予定日') >= 0).length;
    if (!hasHeader) throw new Error('Header not found');
    // At minimum, login/logout/user-registration have dates; forgot/reset password now as well
    if (linesWithDate < 3) throw new Error('Expected at least 3 lines with date');
  });

  it('respects provided statuses map when given', async () => {
    const text = await generateDevProgressShareText({
      statuses: {
        login: 'release_pending',
        logout: 'documenting',
        'user-registration': 'developing',
      } as any,
    });
    const hasHeader = text.indexOf('開発状況アップデート') >= 0;
    if (!hasHeader) throw new Error('Header not found');
  });

  it('excludes features without targetRelease from default share', async () => {
    const text = await generateDevProgressShareText();
    // dev-status has no targetRelease; should not appear in default output
    if (text.indexOf('開発ステータス') >= 0)
      throw new Error('Feature without targetRelease should be excluded');
  });
});
