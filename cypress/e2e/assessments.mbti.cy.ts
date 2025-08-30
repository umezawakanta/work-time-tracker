/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />
/// <reference types="cypress-real-events" />

describe('Assessments navigation smoke', () => {
  it('navigates from /assessments to MBTI test', () => {
    cy.visit('/assessments');
    cy.findByRole('button', { name: 'MBTIテストを開始' }).click();
    cy.url().should('include', '/mbti-test');
    // Accept either the sr-only H1 or the visible CardTitle
    cy.findAllByRole('heading', { name: /MBTI テスト/ })
      .its('length')
      .should('be.greaterThan', 0);
  });
});
