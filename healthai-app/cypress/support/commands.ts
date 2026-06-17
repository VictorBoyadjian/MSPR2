// Commandes personnalisées Cypress

/**
 * Connecte un utilisateur via l'API en injectant le token dans localStorage.
 * Contourne l'UI de login pour des tests plus rapides.
 */
Cypress.Commands.add('loginByApi', (email: string, password: string) => {
  cy.request('POST', `${Cypress.env('API_BASE_URL') ?? 'https://mspr2-api-production.up.railway.app/api'}/login`, {
    email,
    password,
  }).then(({ body }) => {
    window.localStorage.setItem('healthai_token', body.bearer_token);
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      loginByApi(email: string, password: string): Chainable<void>;
    }
  }
}
