import React from "react";
import { Alert, Intent } from "@blueprintjs/core";

interface Props {
  displayName: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutConformation = (props: Props) => (
  <Alert
    className="sbt-mh_medium"
    cancelButtonText="Cancel"
    confirmButtonText="Logout"
    icon="log-out"
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
    <p>Are you sure you would like to logout of {props.displayName}?</p>
  </Alert>
);
