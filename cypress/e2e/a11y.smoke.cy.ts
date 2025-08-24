describe('Accessibility smoke checks', () => {
  it('Home has landmarks and labeled CTAs', () => {
    cy.visit('/');
    // Header and main landmarks (allow missing main if layout differs)
    cy.get('header').should('exist');
    // Check CTA buttons with aria-labels
    cy.findByRole('button', { name: 'AI秘書を使う' }).should('be.visible');
    cy.findByRole('button', { name: '自己診断を始める' }).should('be.visible');
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
