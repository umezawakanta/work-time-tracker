/// <reference types="cypress" />
/* eslint-env cypress */

/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />
/// <reference types="cypress-real-events" />

describe('AI Assistant smoke', () => {
  it('sends request and shows result or error UI', () => {
    // Spy only, let the real backend handle the request
    cy.intercept('POST', '/api/ai/anthropic').as('ask');

    cy.visit('/ai-assistant');
    // If redirected to login in CI, assert login visible and skip the rest
    cy.get('body').then(($body) => {
      if (/ログイン/.test($body.text())) {
        cy.findByRole('heading', { name: 'ログイン' }).should('be.visible');
        return;
      }
      // Use stable aria-label from the app
      cy.get('input[aria-label="AIへの質問入力"]').type('テストメッセージ{enter}');
      cy.wait('@ask');
      cy.get('body').then(($b) => {
        const text = $b.text();
        const ok =
          /(計画を生成しました|APIキー未設定|リクエストが多すぎます|タイムアウトしました|AIリクエストに失敗しました)/.test(
            text
          );
        expect(ok).to.equal(true);
      });
    });
  });
});
