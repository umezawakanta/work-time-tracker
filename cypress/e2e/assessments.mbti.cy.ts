describe('Assessments navigation smoke', () => {
  it('navigates from /assessments to MBTI test', () => {
    cy.visit('/assessments');
    cy.findByRole('button', { name: 'MBTIテストを開始' }).click();
    cy.url().should('include', '/mbti-test');
    cy.findByRole('heading', { name: /MBTI テスト/ }).should('be.visible');
  });
});
