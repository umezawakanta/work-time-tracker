// cypress/e2e/sitemap.cy.ts
describe('Sitemap', () => {
  it('renders and filters', () => {
    cy.visit('/sitemap');
    cy.findByRole('heading', { name: /サイトマップ/ }).should('exist');
    cy.findByPlaceholderText(/検索/).type('勤怠');
    cy.contains('勤怠').should('exist');
    cy.contains('完成のみ表示').click();
    cy.get('li').each(($li) => {
      cy.wrap($li).contains(/完成|complete/gi);
    });
  });

  it('navigates to a feature', () => {
    cy.visit('/sitemap');
    cy.contains('管理者ダッシュボード').click();
    cy.location('pathname').should('match', /\/admin/);
  });
});
