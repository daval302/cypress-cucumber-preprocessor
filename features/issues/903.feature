# https://github.com/badeball/cypress-cucumber-preprocessor/issues/903

Feature: async function handlers
  Scenario: async step definition
    Given a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
      """
    And a file named "cypress/e2e/a.js" with:
      """
      const { Given } = require("@badeball/cypress-cucumber-preprocessor");
      Given("a step", async () => {})
      """
    When I run cypress
    Then it fails
    And the output should contain
      """
      Cucumber preprocessor detected that you returned a native promise from a function handler, this is not supported. Using async / await is generally speaking not supported when using Cypress, period, preprocessor or not.
      """

  Scenario: async Before
    Given a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
      """
    And a file named "cypress/e2e/a.js" with:
      """
      const { Before, Given } = require("@badeball/cypress-cucumber-preprocessor");
      Before(async () => {});
      Given("a step", () => {})
      """
    When I run cypress
    Then it fails
    And the output should contain
      """
      Cucumber preprocessor detected that you returned a native promise from a function handler, this is not supported. Using async / await is generally speaking not supported when using Cypress, period, preprocessor or not.
      """

  Scenario: async After
    Given a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
      """
    And a file named "cypress/e2e/a.js" with:
      """
      const { After, Given } = require("@badeball/cypress-cucumber-preprocessor");
      After(async () => {});
      Given("a step", () => {})
      """
    When I run cypress
    Then it fails
    And the output should contain
      """
      Cucumber preprocessor detected that you returned a native promise from a function handler, this is not supported. Using async / await is generally speaking not supported when using Cypress, period, preprocessor or not.
      """
