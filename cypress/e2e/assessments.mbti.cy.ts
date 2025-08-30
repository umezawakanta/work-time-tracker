/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />
/// <reference types="cypress-real-events" />

describe('Assessments navigation smoke', () => {
  it('navigates from /assessments to MBTI test', () => {
    cy.visit('/assessments');
    cy.get('body').then(($body) => {
      if (/ログイン/.test($body.text())) {
        cy.findByRole('heading', { name: 'ログイン' }).should('be.visible');
        return;
      }
      cy.findByRole('button', { name: 'MBTIテストを開始' }).click();
      cy.url().should('include', '/mbti-test');
      cy.findAllByRole('heading', { name: /MBTI テスト/ })
        .its('length')
        .should('be.greaterThan', 0);
    });
  });
});
