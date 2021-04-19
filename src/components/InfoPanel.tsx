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
  const setStepForward = useStoreActions((state) => state.debugState.setStepForward);
  const changeDebugState = useStoreActions((state) => state.debugState.changeDebugged);
  const changeAreBreakpointsMuted = useStoreActions((state) => state.debugState.changeAreBreakpointsMuted);

  const addBroadcastBreakpoint = useStoreActions((state) => state.debugState.addBroadcastBreakpoint);
  const removeBroadcastBreakpoint = useStoreActions((state) => state.debugState.removeBroadcastBreakpoint);
  const addKeypressBreakpoint = useStoreActions((state) => state.debugState.addKeypressBreakpoint);
  const removeKeypressBreakpoint = useStoreActions((state) => state.debugState.removeKeypressBreakpoint);
  const changeIsClickBreakpointEnabled = useStoreActions((state) => state.debugState.changeIsClickBreakpointEnabled);

  const isPaused = useStoreState((state) => state.debugState.isDebugged);
  const pauseMessage = useStoreState((state) => state.debugState.pauseMessage);

  const areBreakpointsMuted = useStoreState((state) => state.debugState.areBreakpointsMuted);
  const broadcastBreakpoints = useStoreState((state) => state.debugState.broadcastBreakpoints);
  const keypressBreakpoints = useStoreState((state) => state.debugState.keypressBreakpoints);
  const isClickBreakpointEnabled = useStoreState((state) => state.debugState.isClickBreakpointEnabled);

  const playButtonName = (isPaused)? 'Play' : 'Pause';
  const muteButtonName = (areBreakpointsMuted)? 'Unmute' : 'Mute';

  var project = useStoreState((state) => state.debugState.projectVariables);
  const setProjectVars = useStoreActions((state) => state.debugState.setProjectVariables);
  var shouldDebuggerUpdate = useStoreState((state) => state.debugState.shouldDebuggerUpdate);
  const updateDebugger = useStoreActions((state) => state.debugState.updateDebugger);

  let projectDisplay = (pauseMessage === '')? [] : [ <p className="DebuggerItem">
                                                      Reason for pause: {pauseMessage}
                                                    </p>
                                                  ];
  const updateProjectVars = (p : any) => {setProjectVars(p); updateDebugger();};
  if(project != null)
    projectDisplay.push(project.display(updateProjectVars));
    
  let breakpointMessage = ""; 
  let breakpointType = "broadcast"; 
  
  const createBreakpoint = (type: string, message: string) => {
    console.log(breakpointType);
    switch(type) {
      case 'broadcast':
        addBroadcastBreakpoint(message);
        break;
      case 'keypress':
        addKeypressBreakpoint(message);
        break;
      case 'onClick':
        changeIsClickBreakpointEnabled(true);
        break;
    }
  };

  const currentBreakpoints = [];
  for(var bb of broadcastBreakpoints) {
    currentBreakpoints.push(<div className="DebuggerItem">
                              <div className="DebuggerBreakpointName"><p>Broadcast: {bb}</p></div>
                              <div className="DebuggerBreakpointButton"><button type="button" onClick={() => removeBroadcastBreakpoint(bb)}>X</button></div>
                            </div>);
  }
  for(var kb of keypressBreakpoints) {
    currentBreakpoints.push(<div className="DebuggerItem">
                              <div className="DebuggerBreakpointName"><p>Keypress: {kb}</p></div>
                              <div className="DebuggerBreakpointButton"><button type="button" onClick={() => removeKeypressBreakpoint(kb)}>X</button></div>
                            </div>);
  }
  if(isClickBreakpointEnabled) {
    currentBreakpoints.push(<div className="DebuggerItem">
                              <div className="DebuggerBreakpointName"><p>On Click</p></div>
                              <div className="DebuggerBreakpointButton"><button type="button" onClick={() => changeIsClickBreakpointEnabled(false)}>X</button></div>
                            </div>);
  }
  
  const inner = [
    <div className="DebuggerController">
      <button className="DebuggerItem" type="button" onClick={() => changeDebugState()}>{playButtonName}</button>
      <button className="DebuggerItem" type="button" onClick={() => setStepForward(1)}>Step Forward</button>
      <button className="DebuggerItem" type="button" onClick={() => changeAreBreakpointsMuted()}>{muteButtonName} Breakpoints</button>
      <form>
        <div className="field">
          <input
            className="DebuggerItem"
            type="text"
            id="message"
            name="message"
            onChange={(text) => breakpointMessage = text.target.value}
          />
        </div>
      </form>
      <div className="DebuggerItem">
        <p className="DebuggerInlineItem">
          Add 
        </p>
        <form className="DebuggerInlineItem">
          <select onChange={(e) => breakpointType = e.target.value}>
            <option selected value="broadcast">Broadcast</option>
            <option value="keypress">Keypress</option>
            <option value="onClick">On Click</option>
          </select>
        </form>
        <button className="DebuggerInlineItem" type="button" onClick={() => createBreakpoint(breakpointType, breakpointMessage)}>Breakpoint</button>
      </div>
      {(currentBreakpoints.length > 0)?
        <div className="DebuggerBox">
          <p className="DebuggerItem">
            Current Breakpoints: 
          </p>
          {currentBreakpoints}
        </div>
      : null}
      {shouldDebuggerUpdate}
    </div>,
  ];
  if(project != null)
    inner.push(<div className="DebuggerOutput"> {projectDisplay} </div>);

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

