/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />
/// <reference types="cypress-real-events" />

describe('Assessments navigation smoke', () => {
  it('navigates from /assessments to MBTI test', () => {
    cy.visit('/assessments');
    cy.get('body', { timeout: 8000 })
      .should('exist')
      .then(($body) => {
        const text = $body.text();
        if (text.includes('ログイン') || text.includes('Login')) {
          cy.findByRole('heading', { name: /ログイン|Login/i, timeout: 6000 }).should('be.visible');
          return;
        }
        cy.findByRole('button', { name: 'MBTIテストを開始', timeout: 6000 }).click();
        cy.url().should('include', '/mbti-test');
        cy.findAllByRole('heading', { name: /MBTI テスト/ })
          .its('length')
          .should('be.greaterThan', 0);
      });
  });
});
