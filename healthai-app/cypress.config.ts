import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    // URL de l'app web Expo lancée via `expo start --web`
    baseUrl: "http://localhost:8081",
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",
    video: false,
    screenshotOnRunFailure: true,
    viewportWidth: 390,
    viewportHeight: 844,
    defaultCommandTimeout: 10000,
  },

});
