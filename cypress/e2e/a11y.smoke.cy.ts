describe('Accessibility smoke checks', () => {
  it('Home has landmarks and labeled CTAs', () => {
    cy.request('/api/health');
    cy.visit('/');
    cy.get('header').should('be.visible');
    cy.contains('button, a', /AI秘書|AI|Assistant/i, { timeout: 4000 }).should('exist');
    cy.contains('button, a', /(自己診断|診断|Start)/i, { timeout: 4000 }).should('exist');
  });

  it('MBTI page groups questions with legends', () => {
    cy.visit('/mbti-test');
    cy.get('fieldset legend').first().should('be.visible');
    cy.findAllByRole('radiogroup').its('length').should('be.greaterThan', 0);
  });

  it('IQ page has progressbar and radiogroups', () => {
    cy.visit('/iq-test');
    cy.get('[role="progressbar"]').should('exist');
    // Start if necessary
    cy.findByRole('button', { name: '開始' }).then(($btn) => {
      if ($btn.length) {
        cy.wrap($btn).click();
      }
    });
    cy.findAllByRole('radiogroup').its('length').should('be.greaterThan', 0);
  });
});
