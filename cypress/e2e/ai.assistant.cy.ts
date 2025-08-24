describe('AI Assistant smoke', () => {
  it('renders mocked reply after input', () => {
    // Mock the /api/ai/anthropic response
    cy.intercept('POST', '/api/ai/anthropic', {
      statusCode: 200,
      body: { text: 'こんにちは、こちらはモックの返答です。' },
    }).as('ask');

    cy.visit('/ai-assistant');
    cy.findByPlaceholderText('AIに相談したい内容を入力...').type('テストメッセージ');
    cy.findByRole('button', { name: '送信' }).click();
    cy.wait('@ask');
    cy.contains('こんにちは、こちらはモックの返答です。').should('be.visible');
  });
});
