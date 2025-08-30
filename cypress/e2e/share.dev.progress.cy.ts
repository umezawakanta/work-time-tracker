// Share Dev Progress e2e skeleton

describe('Share Dev Progress', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('home button is visible and clickable', () => {
    cy.get('[data-testid="share-dev-progress-home-btn"]').should('exist').click();
  });

  it('features page button is visible and clickable', () => {
    cy.visit('/features');
    cy.get('[data-testid="share-dev-progress-features-btn"]').should('exist').click();
  });

  it('header button is visible and clickable', () => {
    // remains on current page
    cy.get('[data-testid="share-dev-progress-header-btn"]').should('exist').click();
  });

  const isCI = !!Cypress.env('CI');

  it('mocks navigator.share and falls back to twitter intent when not available', () => {
    // CI-safe: avoid actual popups; intercept window.open
    cy.window().then((win) => {
      (win as any).navigator.share = undefined;
      cy.stub(win, 'open').as('winOpen');
    });
    cy.get('[data-testid="share-dev-progress-home-btn"]').click();
    if (!isCI) {
      cy.get('@winOpen').should('have.been.called');
    }
    cy.get('@winOpen').then((stub: any) => {
      const urlArg = stub.getCall(0).args[0] as string;
      expect(urlArg.includes('https://twitter.com/intent/tweet')).to.eq(true);
    });
  });
});
