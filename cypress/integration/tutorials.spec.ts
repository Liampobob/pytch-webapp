/// <reference types="cypress" />

context("Interact with a tutorial", () => {
  beforeEach(() => {
    cy.pytchProjectFollowingTutorial();
  });

  it("can navigate through tutorial", () => {
    cy.contains("Next:").click();
    cy.get(".ToC > li.active")
      .should("have.length", 1)
      .contains("Make the playing area");
    cy.contains("Back:").click();
    cy.get(".ToC > li.active")
      .should("have.length", 1)
      .contains("Make a Pong-like game");
    cy.contains("Next:").click();
    cy.contains("Next:").click();
    cy.contains("Next:").click();
    cy.get(".ToC > li.active")
      .should("have.length", 1)
      .contains("Add the ball");
  });

  it("gives feedback when Copy button clicked", () => {
    cy.contains("Next:").click();
    cy.contains("Next:").click();
    cy.contains("COPY").click();
    cy.contains("Copied!");
    cy.waitUntil(() => cy.contains("Copied!").should("not.be.visible"));
  });
});
