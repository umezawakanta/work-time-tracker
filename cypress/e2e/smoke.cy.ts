describe('Smoke', () => {
	it('loads home page', () => {
		cy.visit('/');
		cy.contains(/work|time|tracker/i);
	});
});


