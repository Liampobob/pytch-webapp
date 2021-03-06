import React from "react";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { useStoreActions, useStoreState } from "../store";
import { IAddAssetDescriptor } from "../model/project";
import { MaybeErrorOrSuccessReport } from "./MaybeErrorOrSuccessReport";

// Have to have this logic in the component to keep thunk payload as simple data?
const readArraybuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = reject;
    fr.onload = () => resolve(fr.result as ArrayBuffer);
    fr.readAsArrayBuffer(file);
  });
};

const AddAssetModal = () => {
  const fileInputRef: React.RefObject<HTMLInputElement> = React.createRef();

  const {
    isActive,
    isInteractable,
    attemptSucceeded,
    maybeLastFailureMessage,
    inputsReady,
  } = useStoreState((state) => state.userConfirmations.addAssetInteraction);

  const { attempt, dismiss, setInputsReady } = useStoreActions(
    (actions) => actions.userConfirmations.addAssetInteraction
  );

  const handleAdd = async () => {
    // TODO: Should I check for non-null on these rather than "!"?
    const file = fileInputRef.current!.files![0];
    const fileBuffer = await readArraybuffer(file);

    // Force the user to choose a different file.
    fileInputRef.current!.value = "";
    setInputsReady(false);

    const addDescriptor: IAddAssetDescriptor = {
      name: file.name,
      mimeType: file.type,
      data: fileBuffer,
    };

    attempt(addDescriptor);
  };

  const handleClose = () => dismiss();
  const handleFileSelection = () => setInputsReady(true);

  return (
    <Modal show={isActive} onHide={handleClose} animation={false}>
      <Modal.Header closeButton={isInteractable}>
        <Modal.Title>Add an image or sound</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Choose an image or sound file to add to your project.</p>
        <Form>
          <Form.Group>
            <Form.File ref={fileInputRef} onChange={handleFileSelection} />
          </Form.Group>
        </Form>
        <MaybeErrorOrSuccessReport
          messageWhenSuccess="Added!"
          attemptSucceeded={attemptSucceeded}
          maybeLastFailureMessage={maybeLastFailureMessage}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button
          disabled={!isInteractable}
          variant="secondary"
          onClick={handleClose}
        >
          Cancel
        </Button>
        <Button
          disabled={!(isInteractable && inputsReady)}
          variant="primary"
          onClick={handleAdd}
        >
          Add to project
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddAssetModal;
