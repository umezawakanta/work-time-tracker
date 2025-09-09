describe('Focus Session', () => {
  beforeEach(() => {
    cy.visit('/focus');
  });

  it('should start a 25-minute session and complete the flow', () => {
    // ページが読み込まれることを確認
    cy.findByRole('heading', { name: /フォーカス/ }).should('be.visible');

    // 25分セッションを開始
    cy.findByRole('button', { name: /25分で開始/ }).click();

    // タイマーが表示されることを確認
    cy.get('[aria-label*="進捗"]').should('be.visible');
    cy.findByText(/集中中/).should('be.visible');

    // 一時停止ボタンが表示されることを確認
    cy.findByRole('button', { name: /一時停止/ }).should('be.visible');
    cy.findByRole('button', { name: /終了/ }).should('be.visible');

    // 一時停止
    cy.findByRole('button', { name: /一時停止/ }).click();
    cy.findByText(/一時停止中/).should('be.visible');

    // 再開
    cy.findByRole('button', { name: /再開/ }).click();
    cy.findByText(/集中中/).should('be.visible');

    // 分散記録をテスト
    cy.findByText(/気が散ったトリガーを記録/).should('be.visible');
    cy.findByRole('button', { name: /SNSを記録/ }).click();
    cy.findByText(/記録された分散: 1回/).should('be.visible');

    // 終了
    cy.findByRole('button', { name: /終了/ }).click();

    // 終了モーダルが表示されることを確認
    cy.findByRole('heading', { name: /セッション完了/ }).should('be.visible');

    // 評価を選択
    cy.findByRole('button', { name: /評価3/ }).click();

    // メモを入力
    cy.findByPlaceholderText(/今回のセッションの振り返り/).type('テストセッションでした');

    // タグを選択
    cy.findByRole('button', { name: /集中できた/ }).click();
    cy.findByRole('button', { name: /楽しかった/ }).click();

    // 保存
    cy.findByRole('button', { name: /保存/ }).click();

    // 完了画面が表示されることを確認
    cy.findByText(/セッション完了/).should('be.visible');
    cy.findByRole('button', { name: /新しいセッション/ }).should('be.visible');
  });

  it('should be mobile-friendly on iPhone SE width', () => {
    cy.viewport(375, 667); // iPhone SE dimensions

    // ボタンがタップ可能なサイズであることを確認
    cy.findByRole('button', { name: /25分で開始/ }).should('be.visible');
    cy.findByRole('button', { name: /25分で開始/ }).should('have.css', 'min-height', '60px');

    // 分散記録ボタンも適切なサイズ
    cy.findByRole('button', { name: /SNSを記録/ }).should('have.css', 'min-height', '44px');

    // 横スクロールが発生しないことを確認
    cy.get('body').should('not.have.css', 'overflow-x', 'scroll');
  });

  it('should handle keyboard navigation', () => {
    // Tab キーでフォーカス移動
    cy.get('body').tab();
    cy.focused().should('have.attr', 'aria-label', /25分で開始/);

    cy.focused().tab();
    cy.focused().should('have.attr', 'aria-label', /50分で開始/);

    cy.focused().tab();
    cy.focused().should('have.attr', 'aria-label', /90分で開始/);

    // Enter キーで開始
    cy.focused().type('{enter}');
    cy.findByText(/集中中/).should('be.visible');
  });

  it('should reset session correctly', () => {
    // セッション開始
    cy.findByRole('button', { name: /25分で開始/ }).click();
    cy.findByText(/集中中/).should('be.visible');

    // 一時停止
    cy.findByRole('button', { name: /一時停止/ }).click();
    cy.findByText(/一時停止中/).should('be.visible');

    // リセット
    cy.findByRole('button', { name: /リセット/ }).click();

    // 初期状態に戻ることを確認
    cy.findByText(/セッション時間を選択/).should('be.visible');
    cy.findByRole('button', { name: /25分で開始/ }).should('be.visible');
  });
});
