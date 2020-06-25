import React from "react";
import { Alert, Intent } from "@blueprintjs/core";

interface Props {
  displayName: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConformation = (props: Props) => (
  <Alert
    className="sbt-mh_medium"
    cancelButtonText="Cancel"
    confirmButtonText="Delete"
    icon="delete"
    canEscapeKeyCancel
    canOutsideClickCancel
    intent={Intent.DANGER}
    isOpen={props.isOpen}
    onCancel={props.onClose}
    onConfirm={() => {
      props.onConfirm();
      props.onClose();
    }}
  >
    <p>Are you sure you would like to delete {props.displayName}?</p>
  </Alert>
);
