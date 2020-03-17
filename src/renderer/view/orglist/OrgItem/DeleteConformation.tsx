import React from 'react';
import { Alert, Intent } from '@blueprintjs/core';

export default function DeleteConformation(props: {
  displayName: string,
  isOpen: boolean,
  onClose: () => void,
  onConfirm: () => void
}) {
  return (
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
}