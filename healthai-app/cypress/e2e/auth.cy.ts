/**
 * Tests E2E — Authentification
 * L'application web Expo doit tourner sur http://localhost:8081
 * Lancer avec : expo start --web puis npx cypress run
 */

describe('Authentification', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it("affiche l'écran de login par défaut", () => {
    cy.contains(/connexion|login|se connecter/i, { timeout: 10000 }).should('exist');
  });

  it('affiche une erreur si email invalide', () => {
    cy.get('input[type="email"], input[placeholder*="mail"]').first().type('not-an-email');
    cy.get('input[type="password"], input[placeholder*="mot de passe"]').first().type('testtest');
    // Le bouton submit est "Se connecter" — sélecteur précis pour éviter de cliquer sur le titre "Connexion"
    cy.contains('Se connecter').click();
    cy.contains(/email|invalide|format/i).should('exist');
  });

  it('redirige vers le dashboard après connexion réussie (mock)', () => {
    cy.intercept('POST', '**/login', {
      statusCode: 200,
      body: { bearer_token: 'fake-token-123' },
    }).as('loginRequest');

    // auth-provider appelle GET /me juste après le login pour charger l'utilisateur.
    // Sans ce mock, le vrai serveur renvoie 401 avec un faux token et la nav échoue.
    cy.intercept('GET', '**/me', {
      statusCode: 200,
      body: { id: 'u1', email: 'test@test.com', first_name: 'Jean', last_name: 'Test' },
    }).as('getMe');

    cy.fixture('user').then((user) => {
      cy.get('input[type="email"], input[placeholder*="mail"]').first().type(user.email);
      cy.get('input[type="password"], input[placeholder*="mot de passe"]').first().type(user.password);
    });

    cy.contains('Se connecter').click();
    cy.wait('@loginRequest');
    cy.wait('@getMe');
    cy.url().should('not.include', '/login');
  });

  it("affiche un message d'erreur si identifiants incorrects", () => {
    cy.intercept('POST', '**/login', {
      statusCode: 401,
      body: { message: 'Identifiants incorrects' },
    }).as('loginFail');

    cy.get('input[type="email"], input[placeholder*="mail"]').first().type('bad@test.com');
    cy.get('input[type="password"], input[placeholder*="mot de passe"]').first().type('wrongpassword');
    cy.contains('Se connecter').click();

    cy.wait('@loginFail');
    cy.contains(/incorrect|invalide|erreur/i).should('exist');
  });

  it("navigue vers l'écran d'inscription", () => {
    cy.contains(/inscription|créer un compte|s'inscrire/i).click();
    cy.contains(/inscription|créer|register/i).should('exist');
  });
});
