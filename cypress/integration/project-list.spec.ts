/// <reference types="cypress" />

context("Management of project list", () => {
  beforeEach(() => {
    cy.pytchResetDatabase();
    cy.contains("My projects").click();
    cy.location("pathname").should("include", "projects");
  });

  const createProject = (name: string, invocation: "button" | "enter") => {
    cy.contains("Create a new project").click();
    cy.get("input[type=text]").type(name);
    if (invocation === "button") {
      cy.get("button").contains("Create project").click();
    } else {
      cy.get("input[type=text]").type("{enter}");
    }
    cy.contains("My projects");
    cy.contains(name);
  };

  const projectNames = () =>
    cy
      .get(".project-name")
      .then(($spans) => $spans.toArray().map((span) => span.innerText));

  it("can create a project", () => {
    createProject("Bananas");
    projectNames().should("deep.equal", ["Test seed project", "Bananas"]);
  });

  it("can create multiple projects", () => {
    createProject("Bananas");
    createProject("Space Invaders");
    projectNames().should("deep.equal", [
      "Test seed project",
      "Bananas",
      "Space Invaders",
    ]);
  });

  it("can delete a project", () => {
    createProject("Apples");
    createProject("Bananas");
    projectNames().should("deep.equal", [
      "Test seed project",
      "Apples",
      "Bananas",
    ]);
    cy.get(".project-name")
      .contains("Apples")
      .parent()
      .parent()
      .within(() => {
        cy.get(".dropdown").click();
        cy.contains("DELETE").click();
      });
    cy.contains("Are you sure");
    cy.get("button").contains("DELETE").click();
    projectNames().should("deep.equal", ["Test seed project", "Bananas"]);
  });

  it("can cancel project deletion", () => {
    createProject("Apples");
    createProject("Bananas");
    cy.get(".project-name")
      .contains("Apples")
      .parent()
      .parent()
      .within(() => {
        cy.get(".dropdown").click();
        cy.contains("DELETE").click();
      });
    cy.contains("Are you sure").type("{esc}");
    cy.contains("Are you sure").should("not.exist");
    projectNames().should("deep.equal", [
      "Test seed project",
      "Apples",
      "Bananas",
    ]);
  });
});
