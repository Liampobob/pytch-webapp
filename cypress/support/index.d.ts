type ContentMatch = string | RegExp;

/** Almost all errors should be "user-space" errors, i.e., something the
 * user has done wrong.  There are a few places where "internal" errors
 * can crop up, i.e., "this shouldn't happen".  Distinguish between
 * these for tests. */
type PytchErrorKind = "user-space" | "internal";

interface IFixtureAsset {
  name: string;
  mimeType: string;
}

declare namespace Cypress {
  interface Chainable {
    /** Reset the "pytch" storage database to be empty apart from one
     * project, which by default has one sample image asset and one
     * sample sound asset.  Additional assets can be passed in if
     * required. */
    pytchResetDatabase(extraAssets?: Array<IFixtureAsset>): Chainable<Element>;

    /** Reset the "pytch" storage database, then navigate to the sole
     * project created as part of the seeding.  Extra assets to be
     * loaded into the seed project can be passed in if required. */
    pytchExactlyOneProject(
      extraAssets?: Array<IFixtureAsset>
    ): Chainable<Element>;

    /** Open the project matching the given name. */
    pytchOpenProject(name: string): Chainable<Element>;

    /** Reset the "pytch" storage database, then create and navigate to
     * a project following a sample tutorial. */
    pytchProjectFollowingTutorial(): Chainable<Element>;

    /** Assert that the IDE currently displays the "Images and sounds"
     * tab in the info pane, and that the listed assets have the given
     * names, in the given order. */
    pytchShouldShowAssets(expectedNames: Array<string>): Chainable<Element>;

    /** Build the current state of the project via the BUILD button. */
    pytchBuild(): Chainable<Element>;

    /** Set the code-editor's content to the given code (after
     * de-indenting it), and then build the project.  This may result in
     * build errors, or in a successfully-built project. */
    pytchBuildCode(rawCode: string): Chainable<Element>;

    /** Assert that the code editor of the IDE contains code satisfying
     * the given match. */
    pytchCodeTextShouldContain(match: ContentMatch): Chainable<Element>;

    /** Assert that the "Output" pane satisfies the given match. */
    pytchStdoutShouldContain(match: ContentMatch): Chainable<Element>;

    /** Assert that the "Errors" pane is not active, and that it is
     * devoid of error reports. */
    pytchShouldHaveBuiltWithoutErrors(): Chainable<Element>;

    /** Assert that the "Errors" pane is active and contains
     * introductory (i.e., context-setting) text satisfying the
     * given match. */
    pytchShouldShowErrorContext(match: ContentMatch): Chainable<Element>;

    /** Assert that the "Errors" pane is active and contains an error
     * card satisfying the given match, of the given kind (user-space or
     * Pytch-internal). */
    pytchShouldShowErrorCard(
      match: ContentMatch,
      kind: PytchErrorKind
    ): Chainable<Element>;

    /** Assert that the "Errors" pane is active and contains a stack
     * trace having the given number of frame summaries. */
    pytchShouldHaveErrorStackTraceOfLength(nFrames: number): Chainable<Element>;

    /** Click the green flag. */
    pytchGreenFlag(): Chainable<Element>;

    /** Click the red stop. */
    pytchRedStop(): Chainable<Element>;

    /** Send keypresses to the running project. */
    pytchSendKeysToProject(keys: string): Chainable<Element>;

    /** Send keypresses to the currently-focussed element of the web-app. */
    pytchSendKeysToApp(keys: string): Chainable<Element>;
  }
}
