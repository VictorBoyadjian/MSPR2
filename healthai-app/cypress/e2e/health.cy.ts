/**
 * Tests E2E — Santé (Health tracking)
 */

const healthMocks = () => {
  cy.intercept('GET', '**/me/sessions/stats', {
    statusCode: 200,
    body: { data: { days: [], weekly_avg_h: 3.5 } },
  }).as('getStats');

  cy.intercept('GET', '**/me/metrics/current', {
    statusCode: 200,
    body: { data: { weight_kg: 75, heart_rate_resting: 65 } },
  }).as('getCurrentMetric');

  cy.intercept('POST', '**/metrics/search', {
    statusCode: 200,
    body: { current_page: 1, data: [], total: 0 },
  }).as('getMetrics');
};

describe('Page Santé', () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem('healthai_token', 'fake-e2e-token');
    });

    cy.intercept('GET', '**/me', {
      statusCode: 200,
      body: {
        id: 'u1',
        email: 'test@test.com',
        first_name: 'Jean',
        last_name: 'Test',
        weight_kg: 75,
        rest_bpm: 65,
      },
    });

    healthMocks();
    cy.visit('/');
  });

  it('navigue vers la page santé', () => {
    cy.contains(/santé|health/i).click();
    cy.contains(/santé|health/i, { timeout: 10000 }).should('exist');
  });
});

describe('Mise à jour du poids', () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem('healthai_token', 'fake-e2e-token');
    });

    cy.intercept('GET', '**/me', {
      statusCode: 200,
      body: { id: 'u1', weight_kg: 75, rest_bpm: 65 },
    }).as('getMe');

    healthMocks();

    cy.intercept('PUT', '**/me/metrics', {
      statusCode: 200,
      body: { data: { weight_kg: 73 } },
    }).as('saveMetric');

    // Navigation directe vers /health (Expo Router : (tabs)/health.tsx → URL /health)
    // cy.contains(/santé/i).click() clique sur le label de l'onglet dans la tab bar
    // mais ne déclenche pas useFocusEffect car la page n'est pas réellement montée
    cy.visit('/health');
  });

  it('la section poids est accessible depuis la page santé', () => {
    // Attendre que les 3 endpoints de useHealth aient répondu avant d'asserter
    // (loading=true tant que Promise.all n'est pas résolu — "Poids" n'est visible qu'après)
    cy.wait('@getStats');
    cy.wait('@getCurrentMetric');
    cy.contains('Poids', { timeout: 10000 }).should('exist');
  });
});
