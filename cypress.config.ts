import { defineConfig } from 'cypress';

export default defineConfig({
	e2e: {
		baseUrl: 'http://localhost:4173',
		specPattern: 'cypress/e2e/**/*.cy.{ts,tsx,js,jsx}',
		supportFile: 'cypress/support/e2e.ts',
		video: false,
		screenshotOnRunFailure: true,
		retries: { runMode: 2, openMode: 0 },
		defaultCommandTimeout: 10000,
	},
});


