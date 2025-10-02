# Security Policy

[日本語版はこちら](#セキュリティポリシー日本語版) | [English Version](#security-policy)

## Supported Versions

We provide security updates for the following versions:

| Version | Supported          | End of Support |
| ------- | ------------------ | -------------- |
| 1.4.x   | :white_check_mark: | Active         |
| 1.3.x   | :white_check_mark: | 2025-12-31     |
| 1.2.x   | :warning:          | Critical only  |
| < 1.2   | :x:                | Unsupported    |

**Note**: We strongly recommend using the latest version to receive all security updates.

## Reporting a Vulnerability

If you discover a security vulnerability in Work Time Tracker, please report it responsibly through one of the following channels. **Do not create public GitHub issues for security vulnerabilities.**

### How to Report

Choose the method that works best for you:

#### 1. GitHub Security Advisory (Recommended)
Use GitHub's [private vulnerability reporting](https://github.com/kanta13jp1/work-time-tracker/security/advisories/new) feature for secure, encrypted communication.

#### 2. Email
Send encrypted or plain text reports to: [kanta13jp@gmail.com](mailto:kanta13jp@gmail.com)
- Subject line: `[SECURITY] Brief description`
- For sensitive information, consider using PGP encryption

#### 3. Direct Contact
Contact the maintainer [@kanta13jp1](https://github.com/kanta13jp1) directly through GitHub

### Vulnerability Severity Classification

Please help us assess the severity using this classification:

| Severity | Description | Examples |
|----------|-------------|----------|
| **Critical** | Immediate action required | Authentication bypass, RCE, data breach |
| **High** | Significant security impact | XSS, CSRF, SQL injection, privilege escalation |
| **Medium** | Moderate security risk | Information disclosure, denial of service |
| **Low** | Minor security concern | Security misconfigurations, minor information leaks |

### What to Include in Your Report

To help us understand and fix the issue quickly, please include:

- [x] **Vulnerability Type**: (e.g., XSS, CSRF, SQL Injection)
- [x] **Description**: Clear, detailed explanation of the vulnerability
- [x] **Steps to Reproduce**: Step-by-step instructions to reproduce the issue
- [x] **Impact Assessment**: Potential consequences and affected users
- [x] **Affected Versions**: Which versions are vulnerable
- [x] **Environment Details**:
  - Browser & version
  - Operating System
  - Node.js version (if applicable)
- [x] **Proof of Concept**: Code, screenshots, or video demonstration
- [x] **Suggested Fix**: (Optional) Your recommendations for remediation

**Example Report Template:**
```markdown
## Vulnerability Report

**Type**: Cross-Site Scripting (XSS)
**Severity**: High
**Affected Versions**: 1.4.0 - 1.4.5

### Description
[Detailed description of the vulnerability]

### Steps to Reproduce
1. Navigate to [URL]
2. Enter the following payload: [payload]
3. Observe [result]

### Impact
[Explanation of potential damage]

### Suggested Fix
[Your recommendations]
```

### Response Timeline

We are committed to addressing security issues promptly:

| Stage | Timeline | Action |
|-------|----------|--------|
| **Acknowledgment** | Within 24-48 hours | Confirm receipt of your report |
| **Initial Assessment** | Within 3-5 days | Evaluate severity and impact |
| **Status Update** | Within 7 days | Provide detailed response and timeline |
| **Resolution** | Varies by severity | Fix development and testing |
| **Disclosure** | Coordinated | Public disclosure after patch release |

**Resolution Timeframes:**
- Critical: 1-7 days
- High: 7-14 days
- Medium: 14-30 days
- Low: 30-90 days

### What to Expect

When you report a security vulnerability, you can expect:

1. **Confidentiality**: Your report will be kept confidential until disclosure
2. **Communication**: Regular updates throughout the resolution process
3. **Recognition**: Credit in security advisories (if you wish)
4. **Coordination**: We'll work with you on disclosure timing
5. **Transparency**: Clear communication about fixes and patches

### Responsible Disclosure Policy

We follow a coordinated disclosure process:

1. **Private Disclosure**: Report sent privately to maintainers
2. **Acknowledgment**: We confirm receipt and begin investigation
3. **Development**: We develop and test a fix
4. **Patch Release**: Security update is released
5. **Public Disclosure**: Advisory is published 7-14 days after patch
6. **CVE Assignment**: For significant vulnerabilities, we request a CVE ID

**We ask security researchers to:**
- Give us reasonable time to fix the issue before public disclosure
- Not exploit the vulnerability beyond proof of concept
- Not access, modify, or delete user data
- Make a good faith effort to avoid privacy violations

## Security Best Practices for Users

### For Developers

- **Dependencies**: Run `npm audit` or `pnpm audit` regularly
- **Environment Variables**: Never commit sensitive data (API keys, passwords)
- **Code Review**: Review security implications of code changes
- **HTTPS Only**: Always use HTTPS in production
- **Input Validation**: Sanitize all user inputs
- **Authentication**: Implement proper session management

### For End Users

- **Strong Passwords**: Use unique, complex passwords (12+ characters)
- **Two-Factor Authentication**: Enable 2FA wherever available
- **Updates**: Keep your browser and dependencies up to date
- **Suspicious Activity**: Report unusual behavior immediately
- **Data Backup**: Regularly backup your work time data
- **Secure Connection**: Only access the app over HTTPS

### For Administrators

- **Access Control**: Follow principle of least privilege
- **Monitoring**: Monitor logs for suspicious activities
- **Security Headers**: Configure proper security headers
- **Rate Limiting**: Implement API rate limiting
- **Regular Audits**: Conduct periodic security audits

## Known Security Considerations

### Browser Security

- This application stores data in browser localStorage
- Use in trusted environments only
- Clear browser data when using shared computers

### API Security

- API endpoints use authentication where required
- Rate limiting is implemented to prevent abuse
- CORS policies are properly configured

### Data Privacy

- User data is stored locally by default
- No sensitive data is transmitted without encryption
- Review our [Privacy Policy](PRIVACY.md) for details

## Security Updates

Security updates are released as patch versions following [Semantic Versioning](https://semver.org/):

- **Patch**: `1.4.5` → `1.4.6` (Security fixes)
- **Minor**: `1.4.x` → `1.5.0` (New features + security fixes)
- **Major**: `1.x.x` → `2.0.0` (Breaking changes + security improvements)

### Notification Channels

Stay informed about security updates:

- **GitHub Releases**: Watch the repository for release notifications
- **Security Advisories**: Subscribe to [GitHub Security Advisories](https://github.com/kanta13jp1/work-time-tracker/security/advisories)
- **Changelog**: Review [CHANGELOG.md](CHANGELOG.md) for security notes
- **Email**: Critical vulnerabilities will be announced via email

## Bug Bounty Program

Currently, we do not have a formal bug bounty program. However:

- We deeply appreciate responsible security researchers
- Recognition will be provided in security advisories
- We may consider rewards for exceptional discoveries on a case-by-case basis

Interested in supporting our security efforts? Consider:
- Contributing security improvements via pull requests
- Helping with security audits and reviews
- Sponsoring the project to fund security initiatives

## Past Security Advisories

View our security disclosure history:
- [GitHub Security Advisories](https://github.com/kanta13jp1/work-time-tracker/security/advisories)
- [Changelog Security Section](CHANGELOG.md#security)

## Contact

**Security Team**: [kanta13jp@gmail.com](mailto:kanta13jp@gmail.com)  
**Maintainer**: [@kanta13jp1](https://github.com/kanta13jp1)  
**Response Time**: 24-48 hours

---

# セキュリティポリシー（日本語版）

## サポート対象バージョン

以下のバージョンでセキュリティアップデートを提供しています：

| バージョン | サポート状況       | サポート終了日 |
| ---------- | ------------------ | -------------- |
| 1.4.x      | :white_check_mark: | 継続中         |
| 1.3.x      | :white_check_mark: | 2025-12-31     |
| 1.2.x      | :warning:          | 重大な問題のみ |
| < 1.2      | :x:                | サポート終了   |

**注意**: すべてのセキュリティアップデートを受け取るため、最新バージョンの使用を強く推奨します。

## 脆弱性の報告

Work Time Trackerでセキュリティ脆弱性を発見した場合は、以下のいずれかの方法で責任を持って報告してください。**セキュリティ脆弱性について公開のGitHub issueを作成しないでください。**

### 報告方法

#### 1. GitHub Security Advisory（推奨）
GitHubの[非公開脆弱性報告機能](https://github.com/kanta13jp1/work-time-tracker/security/advisories/new)を使用

#### 2. メール
[kanta13jp@gmail.com](mailto:kanta13jp@gmail.com) に報告
- 件名: `[SECURITY] 概要説明`

#### 3. 直接連絡
GitHub上で[@kanta13jp1](https://github.com/kanta13jp1)に直接連絡

### 脆弱性の深刻度分類

| 深刻度       | 説明                   | 例                                         |
| ------------ | ---------------------- | ------------------------------------------ |
| **Critical** | 即時対応が必要         | 認証バイパス、RCE、データ漏洩              |
| **High**     | 重大なセキュリティ影響 | XSS、CSRF、SQLインジェクション、権限昇格  |
| **Medium**   | 中程度のセキュリティ   | 情報漏洩、サービス拒否                     |
| **Low**      | 軽微なセキュリティ懸念 | セキュリティ設定ミス、軽微な情報漏れ       |

### 報告に含めるべき情報

- **脆弱性の種類**: (例: XSS, CSRF, SQLインジェクション)
- **説明**: 脆弱性の明確で詳細な説明
- **再現手順**: 問題を再現するための段階的な手順
- **影響評価**: 潜在的な結果と影響を受けるユーザー
- **影響を受けるバージョン**: どのバージョンが脆弱か
- **環境詳細**: ブラウザ、OS、Node.jsバージョンなど
- **概念実証**: コード、スクリーンショット、またはビデオ
- **修正案**: (任意) 修正に関する推奨事項

### 対応タイムライン

| 段階             | 期限          | 対応内容                             |
| ---------------- | ------------- | ------------------------------------ |
| **受領確認**     | 24-48時間以内 | 報告受領の確認                       |
| **初期評価**     | 3-5日以内     | 深刻度と影響の評価                   |
| **状況更新**     | 7日以内       | 詳細な返答とタイムラインの提供       |
| **解決**         | 深刻度による  | 修正の開発とテスト                   |
| **公開**         | 調整済み      | パッチリリース後の公開               |

**解決までの期間:**
- Critical: 1-7日
- High: 7-14日
- Medium: 14-30日
- Low: 30-90日

## ユーザー向けセキュリティベストプラクティス

### 開発者向け

- `pnpm audit` を定期的に実行
- 機密データ（APIキー、パスワード）をコミットしない
- セキュリティレビューを実施
- 本番環境では必ずHTTPSを使用
- すべてのユーザー入力をサニタイズ

### エンドユーザー向け

- 強力でユニークなパスワードを使用（12文字以上）
- 二要素認証を有効化
- ブラウザと依存関係を最新に保つ
- 不審な動作を即座に報告
- データを定期的にバックアップ

## セキュリティアップデート通知

最新のセキュリティ情報を入手するには:

- **GitHub Releases**: リポジトリをWatch
- **Security Advisories**: [GitHub Security Advisories](https://github.com/kanta13jp1/work-time-tracker/security/advisories)を購読
- **Changelog**: [CHANGELOG.md](CHANGELOG.md)のセキュリティセクションを確認

## 連絡先

**セキュリティチーム**: [kanta13jp@gmail.com](mailto:kanta13jp@gmail.com)  
**メンテナー**: [@kanta13jp1](https://github.com/kanta13jp1)  
**応答時間**: 24-48時間

---

**Thank you for helping keep Work Time Tracker secure!**  
**Work Time Trackerのセキュリティ向上にご協力いただき、ありがとうございます！**