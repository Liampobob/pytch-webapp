import React from "react";
import Button from "react-bootstrap/Button";
import { useStoreState, useStoreActions } from "../store";

const BuildButton = () => {
  const haveCode = useStoreState((state) => state.activeProject.haveProject);
  const build = useStoreActions((actions) => actions.activeProject.build);
  const isPaused = useStoreState((state) => state.debugState.isDebugged);
  const setDebugState = useStoreActions((state) => state.debugState.setDebugged);

  const onBuild = () => {
    console.log("BUILD click");
    build();
    if(isPaused)
      setDebugState(false);
  };

  return (
    <Button disabled={!haveCode} onClick={onBuild}>
      BUILD
    </Button>
  );
};

export default BuildButton;
