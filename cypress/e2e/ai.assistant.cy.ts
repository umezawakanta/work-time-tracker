/// <reference types="cypress" />
/* eslint-env cypress */

describe('AI Assistant smoke', () => {
  it('sends real request and handles error UI (no stubbing)', () => {
    // Spy only, let the real backend handle the request
    cy.intercept('POST', '/api/ai/anthropic').as('ask');

    cy.visit('/ai-assistant');
    // Use data-cy selector instead of testing-library command
    cy.get('input[placeholder="メッセージを入力..."]').type('テストメッセージ{enter}');

    cy.wait('@ask');
    // In CI (no API key), we expect error toast to appear
    cy.contains('メッセージの送信に失敗しました').should('be.visible');
  });
});
