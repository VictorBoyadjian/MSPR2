/**
 * Tests E2E — Repas (Meals)
 */

describe('Repas', () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem('healthai_token', 'fake-e2e-token');
    });

    cy.intercept('GET', '**/me', {
      statusCode: 200,
      body: { id: 'u1', email: 'test@test.com', first_name: 'Jean', last_name: 'Test' },
    });

    cy.intercept('POST', '**/dishes/search', {
      statusCode: 200,
      body: {
        current_page: 1,
        data: [
          {
            id: 'd1',
            name: 'Salade César',
            meal_type: 'lunch',
            calories_kcal: 350,
            eated_at: new Date().toISOString().split('T')[0],
          },
        ],
        total: 1,
      },
    }).as('searchDishes');

    cy.visit('/');
  });

  it('navigue vers la page repas', () => {
    cy.contains(/repas|meals|alimentation/i).click();
    cy.contains(/repas|meals|alimentation/i, { timeout: 10000 }).should('exist');
  });
});

describe('Ajout d\'un repas', () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem('healthai_token', 'fake-e2e-token');
    });

    cy.intercept('GET', '**/me', {
      statusCode: 200,
      body: { id: 'u1', email: 'test@test.com', first_name: 'Jean', last_name: 'Test' },
    });

    cy.intercept('POST', '**/dishes/mutate', {
      statusCode: 200,
      body: { created: ['d2'], updated: [] },
    }).as('createDish');

    cy.visit('/');
  });

  it('affiche le bouton d\'ajout de repas', () => {
    cy.contains(/repas|meals/i).click();
    cy.contains(/ajouter|add|\+/i, { timeout: 10000 }).should('exist');
  });
});
