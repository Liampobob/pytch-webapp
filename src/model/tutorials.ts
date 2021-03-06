import { Action, action, Thunk, thunk } from "easy-peasy";
import { SyncState } from "./project";
import {
  allTutorialSummaries,
  tutorialAssetURLs,
  tutorialContent,
} from "../database/tutorials";
import {
  createNewProject,
  addRemoteAssetToProject,
} from "../database/indexed-db";
import { IPytchAppModel } from ".";
import { navigate } from "@reach/router";
import { batch } from "react-redux";
import { ITrackedTutorialRef } from "./projects";
import { withinApp } from "../utils";

export interface ITutorialSummary {
  slug: string;
  contentNodes: Array<Node>;
}

export interface ITutorialCollection {
  syncState: SyncState;
  available: Array<ITutorialSummary>;
  maybeSlugCreating: string | undefined;

  setSyncState: Action<ITutorialCollection, SyncState>;
  setAvailable: Action<ITutorialCollection, Array<ITutorialSummary>>;
  setSlugCreating: Action<ITutorialCollection, string>;
  clearSlugCreating: Action<ITutorialCollection>;
  loadSummaries: Thunk<ITutorialCollection>;

  createProjectFromTutorial: Thunk<
    ITutorialCollection,
    string,
    {},
    IPytchAppModel
  >;
}

export const tutorialCollection: ITutorialCollection = {
  syncState: SyncState.SyncNotStarted,
  available: [],
  maybeSlugCreating: undefined,

  setSyncState: action((state, syncState) => {
    state.syncState = syncState;
  }),

  setAvailable: action((state, summaries) => {
    state.available = summaries;
  }),

  setSlugCreating: action((state, slug) => {
    state.maybeSlugCreating = slug;
  }),
  clearSlugCreating: action((state) => {
    state.maybeSlugCreating = undefined;
  }),

  loadSummaries: thunk(async (actions) => {
    actions.setSyncState(SyncState.SyncingFromBackEnd);
    const summaries = await allTutorialSummaries();
    batch(() => {
      actions.setAvailable(summaries);
      actions.setSyncState(SyncState.Syncd);
    });
  }),

  createProjectFromTutorial: thunk(async (actions, tutorialSlug, helpers) => {
    const storeActions = helpers.getStoreActions();
    const addProject = storeActions.projectCollection.addProject;

    // TODO: This is annoying because we're going to request the tutorial content
    // twice.  Once now, and once when we navigate to the IDE and it notices the
    // project is tracking a tutorial.  Change the IDE logic to more 'ensure we
    // have tutorial' rather than 'fetch tutorial'?

    actions.setSlugCreating(tutorialSlug);
    const content = await tutorialContent(tutorialSlug);

    const name = `My "${tutorialSlug}"`;
    const summary = `This project is following the tutorial "${tutorialSlug}"`;
    const trackingRef: ITrackedTutorialRef = {
      slug: tutorialSlug,
      activeChapterIndex: 0,
    };
    const project = await createNewProject(
      name,
      summary,
      trackingRef,
      content.initialCode
    );
    const assetURLs = await tutorialAssetURLs(tutorialSlug);

    // It's enough to make the back-end database know about the assets
    // belonging to the newly-created project, because when we navigate
    // to the new project the front-end will fetch that information
    // afresh.  TODO: Some kind of cache layer so we don't push then
    // fetch the exact same information.
    await Promise.all(
      assetURLs.map((url) => addRemoteAssetToProject(project.id, url))
    );

    addProject(project);

    actions.clearSlugCreating();

    await navigate(withinApp(`/ide/${project.id}`));
  }),
};
