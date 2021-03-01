import React from "react";
import { useStoreState, useStoreActions } from "../store";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import Tutorial from "./Tutorial";
import ErrorReportList from "./ErrorReportList";
import ProjectAssetList from "./ProjectAssetList";
import EditorWebSocketInfo from "./EditorWebSocketInfo";
import { liveReloadEnabled } from "../constants";
import { LayoutChooser } from "./LayoutChooser";
import {DebuggerItem, StringItem, NumberItem, ListItem} from "./DebugItems"

const StandardOutput = () => {
  const text = useStoreState((state) => state.standardOutputPane.text);

  const inner =
    text === "" ? (
      <p className="placeholder">
        Anything your program prints will appear here.
      </p>
    ) : (
      <pre className="SkulptStdout">{text}</pre>
    );

  return <div className="StandardOutputPane">{inner}</div>;
};

const Errors = () => {
  const errorList = useStoreState((state) => state.errorReportList.errors);
  const inner =
    errorList.length === 0 ? (
      <p className="placeholder">
        Any errors your project encounters will appear here.
      </p>
    ) : (
      <ErrorReportList />
    );
  return <div className="ErrorsPane">{inner}</div>;
};

const Debuger = () => {
  const variables : DebuggerItem[] = [
    new StringItem("hi"),
    new NumberItem(0),
    new ListItem([0,1,2])
  ];
  const setStepForward = useStoreActions((state) => state.debugState.setStepForward);
  const changeDebugState = useStoreActions((state) => state.debugState.changeDebugged);
  const changeAreBreakpointsMuted = useStoreActions((state) => state.debugState.changeAreBreakpointsMuted);
  const addBreakpointMessage = useStoreActions((state) => state.debugState.addMessageBreakpoint);
  const isPaused = useStoreState((state) => state.debugState.isDebugged);
  const areBreakpointsMuted = useStoreState((state) => state.debugState.areBreakpointsMuted);
  const breakpointMessages = useStoreState((state) => state.debugState.messageBreakpoints);
  const playButtonName = (isPaused)? 'Play' : 'Pause';
  const muteButtonName = (areBreakpointsMuted)? 'Unmute' : 'Mute';

  let tmpMessage = "";

  const inner = [
    <button type="button">Rerun</button>,
    <button type="button" onClick={() => changeDebugState()}>{playButtonName}</button>,
    <button type="button" onClick={() => setStepForward(1)}>Step Forward</button>,
    <button type="button" onClick={() => changeAreBreakpointsMuted()}>{muteButtonName} Breakpoints</button>,
    <form>
      <div className="field">
        <label htmlFor="message">Message: </label>
        <input
          type="text"
          id="message"
          name="message"
          onChange={(text) => tmpMessage = text.target.value}
        />
      </div>
    </form>,
    <button type="button" onClick={() => addBreakpointMessage(tmpMessage)}>Add Breakpoint</button>,
    <p>
      Message Breakpoints: {breakpointMessages}
    </p>,
    <p className="tmp">
      Debugger WIP
    </p>
  ];
  let i = 0;
  variables.forEach((a) => inner.push(<div><p> {i++} </p> {a.display()} </div>))

  return <div className="StandardOutputPane">{inner}</div>;
};


const InfoPanel = () => {
  const isSyncingFromBackEnd = useStoreState(
    (state) => state.activeProject.syncState.loadState === "pending"
  );
  const isTrackingTutorial = useStoreState(
    (state) => state.activeProject.project?.trackedTutorial != null
  );
  const activeKey = useStoreState((state) => state.infoPanel.activeTabKey);
  const setActiveKey = useStoreActions(
    (state) => state.infoPanel.setActiveTabKey
  );
  const layoutKind = useStoreState((state) => state.ideLayout.kind);

  if (isSyncingFromBackEnd) {
    return null;
  }

  return (
    <div className="InfoPanel-container">
      <LayoutChooser />
      <Tabs
        className={`InfoPanel ${layoutKind}`}
        transition={false}
        activeKey={activeKey}
        onSelect={(k) => setActiveKey(k as string)}
      >
        {isTrackingTutorial && (
          <Tab className="InfoPane" eventKey="tutorial" title="Tutorial">
            <Tutorial />
          </Tab>
        )}
        <Tab className="InfoPane" eventKey="assets" title="Images and sounds">
          <ProjectAssetList />
        </Tab>
        <Tab className="InfoPane" eventKey="output" title="Output">
          <StandardOutput />
        </Tab>
        <Tab className="InfoPane" eventKey="errors" title="Errors">
          <Errors />
        </Tab>
        <Tab className="InfoPane" eventKey="debug" title="Debug">
          <Debuger />
        </Tab>
        {liveReloadEnabled ? (
          <Tab
            className="InfoPane"
            eventKey="websocket-log"
            title="Editor WebSocket"
          >
            <EditorWebSocketInfo />
          </Tab>
        ) : null}
      </Tabs>
    </div>
  );
};

export default InfoPanel;

