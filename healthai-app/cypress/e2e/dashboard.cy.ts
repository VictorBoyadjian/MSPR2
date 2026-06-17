/**
 * Tests E2E — Dashboard (page d'accueil)
 */

describe('Dashboard', () => {
  beforeEach(() => {
    // Injecte un token fictif pour simuler un utilisateur connecté
    cy.window().then((win) => {
      win.localStorage.setItem('healthai_token', 'fake-e2e-token');
    });

    // Mock les endpoints principaux pour ne pas dépendre du backend
    cy.intercept('GET', '**/me', {
      statusCode: 200,
      body: {
        id: 'u1',
        email: 'test@test.com',
        first_name: 'Jean',
        last_name: 'Test',
        is_active: true,
        is_premium: false,
      },
    }).as('getMe');

    cy.intercept('POST', '**/dishes/search', {
      statusCode: 200,
      body: { current_page: 1, data: [], total: 0 },
    }).as('searchDishes');

    cy.intercept('POST', '**/workout_sessions/search', {
      statusCode: 200,
      body: { current_page: 1, data: [], total: 0 },
    }).as('searchSessions');

    cy.visit('/');
  });

  it('charge la page d\'accueil', () => {
    cy.get('body').should('exist');
  });

  it('affiche la navigation principale', () => {
    cy.contains(/accueil|home|dashboard/i, { timeout: 10000 }).should('exist');
  });
});
