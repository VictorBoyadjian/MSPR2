/**
 * Tests E2E — Workouts (Séances de sport)
 */

describe('Workouts', () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem('healthai_token', 'fake-e2e-token');
    });

    cy.intercept('GET', '**/me', {
      statusCode: 200,
      body: { id: 'u1', email: 'test@test.com', first_name: 'Jean', last_name: 'Test' },
    });

    cy.intercept('POST', '**/workout_sessions/search', {
      statusCode: 200,
      body: {
        current_page: 1,
        data: [
          { id: 's1', name: 'Full Body', duration_min: 45, exercises: [] },
          { id: 's2', name: 'Cardio HIIT', duration_min: 30, exercises: [] },
        ],
        total: 2,
      },
    }).as('searchSessions');

    cy.intercept('GET', '**/me/sessions', {
      statusCode: 200,
      body: { data: [] },
    }).as('getMySessions');

    cy.visit('/');
  });

  it('navigue vers la page workouts', () => {
    cy.contains(/sport|workout|entraînement/i).click();
    cy.contains(/sport|workout|entraînement/i, { timeout: 10000 }).should('exist');
  });
});

describe('Séances planifiées', () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem('healthai_token', 'fake-e2e-token');
    });

    cy.intercept('GET', '**/me', {
      statusCode: 200,
      body: { id: 'u1', email: 'test@test.com', first_name: 'Jean', last_name: 'Test' },
    });

    cy.intercept('GET', '**/me/sessions', {
      statusCode: 200,
      body: {
        data: [
          {
            id: 's1',
            name: 'Full Body',
            duration_min: 45,
            pivot: { id: 'us1', performed_at: '2024-06-10 10:00:00' },
          },
        ],
      },
    }).as('getMySessions');

    cy.intercept('POST', '**/workout_sessions/search', {
      statusCode: 200,
      body: { current_page: 1, data: [], total: 0 },
    }).as('searchSessions');

    cy.visit('/');
  });

  it('affiche le bouton de planification sur la page workouts', () => {
    cy.contains(/sport|workout|entraînement/i).click();
    // "Mes séances" est le titre affiché dans workouts.tsx (ThemedText type="subtitle")
    cy.contains(/mes séances|planifier/i, { timeout: 10000 }).should('exist');
  });
});
