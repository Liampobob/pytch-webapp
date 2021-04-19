import React, { useEffect, useRef } from "react";
import { BrowserKeyboard } from "../skulpt-connection/browser-keyboard";
import { BrowserMouse } from "../skulpt-connection/browser-mouse";
import { ProjectEngine, DebuggerConfigurations } from "../skulpt-connection/drive-project";
import { useStoreState, useStoreActions } from "../store";
import { failIfNull } from "../utils";

const Stage = () => {
  console.log("rendering Stage");

  // The build sequence number doesn't actually appear anywhere in
  // the rendered component, but depending on it causes a re-render
  // and a re-set-up of the mouse/keyboard/engine when there's a new
  // Sk.pytch.current_live_project.
  const buildSeqnum = useStoreState((state) => state.activeProject.buildSeqnum);
  const displaySize = useStoreState(
    (state) => state.ideLayout.stageDisplaySize
  );
  const resizeIsActive = useStoreState(
    (state) => state.ideLayout.stageVerticalResizeState != null
  );

  const debuggerState = new DebuggerConfigurations(
    useStoreState((state) => state.debugState.isDebugged), 
    useStoreActions((state) => state.debugState.setDebugged),
    useStoreActions((state) => state.debugState.changePauseMessage),
    useStoreState((state) => state.debugState.stepForward),
    useStoreActions((state) => state.debugState.setStepForward),
    useStoreState((state) => state.debugState.broadcastBreakpoints),
    useStoreState((state) => state.debugState.keypressBreakpoints),
    useStoreState((state) => state.debugState.isClickBreakpointEnabled),
    useStoreState((state) => state.debugState.areBreakpointsMuted),
    useStoreState((state) => state.debugState.projectVariables),
    useStoreActions((state) => state.debugState.setProjectVariables),
    useStoreState((state) => state.debugState.shouldUpdateProjectVariables),
    useStoreActions((state) => state.debugState.changeShouldUpdateProjectVariables),
    );  

  const canvasRef: React.RefObject<HTMLCanvasElement> = React.createRef();
  const bubblesRef: React.RefObject<HTMLDivElement> = React.createRef();

  const browserKeyboardRef = useRef<BrowserKeyboard | null>(null);
  const browserMouseRef = useRef<BrowserMouse | null>(null);
  const projectEngineRef = useRef<ProjectEngine | null>(null);

  useEffect(() => {
    console.log("Stage effect: setting up keyboard/mouse/engine", buildSeqnum);

    const canvas = failIfNull(
      canvasRef.current,
      "Stage effect: canvasRef is null"
    );
    const bubblesDiv = failIfNull(
      bubblesRef.current,
      "Stage effect: bubblesRef is null"
    );

    bubblesDiv.tabIndex = -1;
    bubblesDiv.focus();

    // All these ctors also "activate" the new object.
    browserKeyboardRef.current = new BrowserKeyboard(bubblesDiv);
    browserMouseRef.current = new BrowserMouse(bubblesDiv);
    projectEngineRef.current = new ProjectEngine(canvas, bubblesDiv, debuggerState);

    // projectEngineRef.current!.setIsPaused(isPaused);

    return () => {
      console.log("Stage effect: tearing down keyboard/mouse/engine");
      browserKeyboardRef.current!.deactivate();
      browserMouseRef.current!.deactivate();
      projectEngineRef.current!.requestHalt();
    };
  });

  const sizeStyle = {
    width: `${displaySize.width}px`,
    height: `${displaySize.height}px`,
  };

  // When resizing, the stage rendering flickers with what seems to be a
  // first render before the transformation has been set.  Hide the
  // stage while a drag-resize is in progress.
  //
  // TODO: Work out why flickering happens in the first place, and see
  // if there's a tidier way to do this.
  const resizeClass = resizeIsActive ? "resize-active" : undefined;

  return (
    <div id="pytch-stage-container">
      <div id="pytch-stage-layers">
        <canvas
          ref={canvasRef}
          id="pytch-canvas"
          className={resizeClass}
          width={displaySize.width}
          height={displaySize.height}
        />
        <div
          ref={bubblesRef}
          id="pytch-speech-bubbles"
          className={resizeClass}
          style={sizeStyle}
        />
        <div
          id="stage-resize-indicator"
          className={resizeClass}
          style={sizeStyle}
        />
      </div>
    </div>
  );
};

export default Stage;
