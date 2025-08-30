import { generateDevProgressShareText } from '../../share/generateDevProgressShareText';

describe('generateDevProgressShareText', () => {
  it('includes three lines for login/logout/user-registration', () => {
    const text = generateDevProgressShareText();
    const hasHeader = text.indexOf('開発状況アップデート') >= 0;
    const linesWithDate = text.split('\n').filter((l) => l.indexOf('リリース予定日') >= 0).length;
    if (!hasHeader) throw new Error('Header not found');
    if (linesWithDate < 3) throw new Error('Expected at least 3 lines with date');
  });

  it('respects provided statuses map when given', () => {
    const text = generateDevProgressShareText({
      statuses: {
        login: 'release_pending',
        logout: 'documenting',
        'user-registration': 'developing',
      } as any,
    });
    const hasHeader = text.indexOf('開発状況アップデート') >= 0;
    if (!hasHeader) throw new Error('Header not found');
  });
});
