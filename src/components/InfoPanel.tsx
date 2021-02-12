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

enum DataType {
  string,
  number,
  list
}

class DebugerItem {
  type: DataType;

  constructor(type:DataType) {
    this.type = type;
  }

  display() {
    return <p className="variable">  </p>;
  };
}

class StringItem extends DebugerItem {
  value: string;

  constructor(val: string) {
    super(DataType.string);
    this.value = val;
  }

  display() {
    return <p className="variable"> {this.value} </p>;
  }
}

class NumberItem extends DebugerItem {
  value: number;

  constructor(val: number) {
    super(DataType.number);
    this.value = val;
  }

  display() {
    return <p className="variable"> {this.value} </p>;
  }
}

class ListItem extends DebugerItem {
  value: any[];

  constructor(val: any[]) {
    super(DataType.list);
    this.value = val;
  }

  display() {
    return <p className="variable"> {this.value} </p>;
  }
}

const Debuger = () => {
  const variables : DebugerItem[] = [
    new StringItem("hi"),
    new NumberItem(0),
    new ListItem([0,1,2])
  ];
  const inner =[
    <button type="button">Rerun</button>,
    <button type="button">Play</button>,
    <button type="button">Pause</button>,
    <button type="button">Step Forward</button>,
    <button type="button">Step Out</button>,
    <button type="button">Step Back</button>,
    <button type="button">Terminate</button>,
    <button type="button">Mute Breakpoints</button>,
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

